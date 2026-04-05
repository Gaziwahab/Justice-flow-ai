import { google } from "@ai-sdk/google"
import { generateText } from "ai"

export const maxDuration = 60

const REQUIRED_FIELDS = [
  { key: "incident_date", label: "when this happened" },
  { key: "incident_location", label: "where this took place" },
  { key: "perpetrator", label: "who did this" },
  { key: "relationship_to_perpetrator", label: "their relationship to you" },
  { key: "witnesses", label: "whether anyone else witnessed it" },
  { key: "evidence_exists", label: "whether any evidence exists (messages, photos, etc.)" },
  { key: "reported_to_authority", label: "whether it was reported to anyone official" },
  { key: "pattern_or_single", label: "whether this happened more than once" },
  { key: "impact", label: "how this has affected you" },
]

// Build what ARIA should ask about next
function getMissingFields(knownData: Record<string, string | null | undefined>): string[] {
  return REQUIRED_FIELDS
    .filter(f => !knownData[f.key] || knownData[f.key] === null || knownData[f.key] === "null")
    .map(f => f.label)
}

const DISTRESS: Record<number, string[]> = {
  3: ['suicidal', "can't go on", 'end it', 'want to die', 'kill myself', 'end my life'],
  2: ['hopeless', 'helpless', 'worthless', 'trapped', 'unbearable', 'destroyed', 'broken'],
  1: ['scared', 'fear', 'afraid', 'confused', 'lost', 'alone', 'anxious', 'nervous', 'worried', 'overwhelmed', 'pain', 'hurt', 'sad', 'dishearted', 'disheartened', 'bullying', 'bully'],
}

function detectLevel(text: string): number {
  const l = text.toLowerCase()
  for (const level of [3, 2, 1] as const) {
    if (DISTRESS[level].some(k => l.includes(k))) return level
  }
  return 0
}

// Extract structured info from AI response text using a second fast call
async function extractStructuredData(userMessage: string, model: ReturnType<typeof google>): Promise<Record<string, unknown>> {
  try {
    const { text } = await generateText({
      model,
      prompt: `From this message: "${userMessage}"
Extract any facts mentioned. Return ONLY valid JSON:
{
  "incident_date": "date/time mentioned or null",
  "incident_location": "place mentioned or null",
  "perpetrator": "person who did it or null",
  "relationship_to_perpetrator": "relationship like teacher/classmate/boss or null",
  "witnesses": "any witnesses mentioned or null",
  "evidence_exists": "any evidence mentioned or null",
  "reported_to_authority": "reported to anyone or null",
  "pattern_or_single": "one-time or repeated or null",
  "impact": "emotional/physical effects or null",
  "rawPeople": ["list of names mentioned"],
  "rawLocations": ["list of places"],
  "rawDates": ["list of dates/times"],
  "evidenceClues": ["list of evidence types mentioned"]
}
Only include fields that are EXPLICITLY mentioned. Use null for anything not mentioned.`,
      temperature: 0.1,
    })
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return { rawPeople: [], rawLocations: [], rawDates: [], evidenceClues: [] }
  }
}

export async function PUT(req: Request) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return new Response(JSON.stringify({ error: 'Missing API Key' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const { userMessage, conversationHistory, knownData, emotionalState } = await req.json()
    const detectedLevel = detectLevel(userMessage || '')
    const missing = getMissingFields(knownData || {})
    const model = google("gemini-3-flash-preview")

    // Run both calls in parallel for speed
    const [extractedData, ariaResponseRaw] = await Promise.all([
      extractStructuredData(userMessage, model),
      (async () => {
        // Build conversation context for ARIA's reply
        const historyText = (conversationHistory || []).slice(-10)
          .map((m: { role: string; content: string }) => `${m.role === 'assistant' ? 'ARIA' : 'User'}: ${m.content}`)
          .join('\n')

        const nextQuestion = missing[0]
          ? `Your next question should naturally ask about: ${missing[0]}`
          : `All key details are collected. Warmly summarize what they've shared and ask: "Is there anything else you'd like to add — any detail, no matter how small?"`

        const prompt = `You are ARIA — a warm, human trauma-support companion on JusticeFlow. You're helping someone document their experience.

CONVERSATION SO FAR:
${historyText || '(First message)'}

USER JUST SAID: "${userMessage}"

WHAT YOU ALREADY KNOW ABOUT THEIR CASE:
${Object.entries(knownData || {}).filter(([,v]) => v && v !== 'null').map(([k,v]) => `- ${k.replace(/_/g,' ')}: ${v}`).join('\n') || '(Nothing confirmed yet)'}

YOUR TASK:
1. First, acknowledge SPECIFICALLY what they just said (not generic "thank you for sharing")
2. Show you understood — reflect back the key emotion or fact they shared
3. Then: ${nextQuestion}

TONE RULES:
- Speak like a caring human friend, NOT a bot or form
- Use contractions: I'm, you've, that's, we'll, don't
- Keep it under 4 sentences total
- If they're distressed (detected level: ${detectedLevel}), be warmer and slower — validate more before asking
- NEVER start with "Certainly!" "Of course!" "I understand!" "Thank you for sharing"
- Be SPECIFIC about what they said, not generic

Reply ONLY with the conversational message text — no JSON, no formatting, just natural words.`

        const { text } = await generateText({
          model,
          prompt,
          temperature: 0.8,
        })
        return text.trim()
      })()
    ])

    // Merge new extractions into known data
    const updatedKnown = { ...knownData }
    const ed = extractedData as Record<string, unknown>
    for (const field of REQUIRED_FIELDS) {
      if (ed[field.key] && ed[field.key] !== 'null' && ed[field.key] !== null) {
        updatedKnown[field.key] = String(ed[field.key])
      }
    }

    const newMissing = getMissingFields(updatedKnown)
    const reviewMode = newMissing.length === 0

    // Generate microcopy based on support level
    const microcopies = {
      0: ["You're doing well", "Keep going", "Every detail helps", "You're safe here"],
      1: ["I hear you", "Take your time", "You're being brave", "I'm right here"],
      2: ["You're so brave", "We can pause anytime", "I believe you", "You matter"],
      3: ["You're not alone", "Your safety first", "I'm here with you", "Help is available"],
    }
    const levelKey = Math.min(detectedLevel, 3) as 0 | 1 | 2 | 3
    const microcopyList = microcopies[levelKey]
    const microcopy = microcopyList[Math.floor(Math.random() * microcopyList.length)]

    return new Response(JSON.stringify({
      response: ariaResponseRaw,
      microcopy,
      supportLevel: detectedLevel,
      reviewMode,
      questionAsked: missing[0] || 'none',
      extractedData: {
        ...ed,
        incident_date: ed.incident_date || null,
        incident_location: ed.incident_location || null,
        perpetrator: ed.perpetrator || null,
        relationship_to_perpetrator: ed.relationship_to_perpetrator || null,
        witnesses: ed.witnesses || null,
        evidence_exists: ed.evidence_exists || null,
        reported_to_authority: ed.reported_to_authority || null,
        pattern_or_single: ed.pattern_or_single || null,
        impact: ed.impact || null,
        rawPeople: (ed.rawPeople as string[]) || [],
        rawLocations: (ed.rawLocations as string[]) || [],
        rawDates: (ed.rawDates as string[]) || [],
        evidenceClues: (ed.evidenceClues as string[]) || [],
      },
      updatedKnownData: updatedKnown,
    }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error('Testimony AI error:', err)
    // Even in error, return something contextual not generic
    return new Response(JSON.stringify({
      response: "I want to make sure I understand what you just shared. Can you tell me a little more about that?",
      microcopy: "I'm listening",
      supportLevel: 0,
      reviewMode: false,
      questionAsked: 'general',
      extractedData: { rawPeople: [], rawLocations: [], rawDates: [], evidenceClues: [] },
      updatedKnownData: {},
    }), { headers: { 'Content-Type': 'application/json' } })
  }
}

export async function POST(req: Request) {
  return PUT(req)
}
