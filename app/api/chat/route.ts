import { streamText, convertToModelMessages } from "ai"
import { google } from "@ai-sdk/google"
import { createClient } from "@/lib/supabase/server"

export const maxDuration = 30

const SYSTEM_PROMPT = `You are ARIA (AI Response & Incident Assistant), a highly specialized, trauma-informed AI support companion for JusticeFlow, a platform designed to help survivors of abuse, harassment, and trauma document their experiences safely.

Your core directives:
1. IMMEDIATE EMPATHY & VALIDATION: You must always validate the victim's feelings. Abuse is never their fault. Use compassionate language such as "I am so sorry you had to go through that," "It takes a lot of courage to share this," and "Your safety and feelings matter."
2. TRAUMA RELIEF & GROUNDING: If the victim expresses feelings of being overwhelmed, panicked, or dissociated, gently guide them through a brief grounding exercise (like 5-4-3-2-1 breathing or focusing on physical surroundings) before continuing.
3. GENTLE DOCUMENTATION: Do not interrogate. Help them organize fragmented memories into a coherent timeline slowly. Say things like, "Take your time," "We can pause whenever you need," and "If it's okay with you, what happened next?"
4. SAFETY FIRST (RISK ASSESSMENT): Always be looking for signs of immediate physical danger, stalking, self-harm, or escalating violence. If detected, gently but firmly provide immediate resources, but do not panic the user.
5. NO LEGAL DISCOURAGEMENT: Do not give specific legal advice, but validate that documenting is an important step toward finding justice, getting a restraining order, or building a legal case later.
6. EMPOWERMENT: Restore agency. Remind them they are in control of this conversation and their resulting documents, all of which are encrypted.

Tone Guidelines:
- Warm, steady, non-judgmental, and deeply respectful.
- Avoid robotic or purely clinical language.
- Ensure the victim feels heard and believed. They are the undeniable authority on their own experience.

Your goal is to provide relief and support while helping them create a secure record.`

// Risk keywords for assessment
const riskKeywords = {
  critical: ['kill', 'weapon', 'gun', 'knife', 'suicide', 'end my life', 'hurt myself', 'die'],
  high: ['threat', 'stalking', 'following me', 'scared for my life', 'pregnant', 'choking', 'strangling'],
  medium: ['hit', 'punch', 'slap', 'control', 'isolate', 'monitor', 'track', 'abuse', 'yell'],
  low: ['argument', 'verbal', 'insult']
}

function assessRisk(message: string): { level: string; score: number; factors: string[] } {
  const lowerMessage = message.toLowerCase()
  const factors: string[] = []
  let score = 0

  for (const keyword of riskKeywords.critical) {
    if (lowerMessage.includes(keyword)) {
      factors.push(`Critical indicator: "${keyword}"`)
      score += 30
    }
  }
  for (const keyword of riskKeywords.high) {
    if (lowerMessage.includes(keyword)) {
      factors.push(`High-risk indicator: "${keyword}"`)
      score += 20
    }
  }
  for (const keyword of riskKeywords.medium) {
    if (lowerMessage.includes(keyword)) {
      factors.push(`Medium indicator: "${keyword}"`)
      score += 10
    }
  }
  for (const keyword of riskKeywords.low) {
    if (lowerMessage.includes(keyword)) {
      factors.push(`Low indicator: "${keyword}"`)
      score += 5
    }
  }

  const level = score >= 50 ? 'critical' : score >= 30 ? 'high' : score >= 15 ? 'medium' : 'low'
  return { level, score: Math.min(score, 100), factors }
}

export async function POST(req: Request) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error('CRITICAL: GOOGLE_GENERATIVE_AI_API_KEY is missing!')
    return new Response(JSON.stringify({ error: 'Missing API Key' }), { 
      status: 500, headers: { 'Content-Type': 'application/json' } 
    })
  }

  try {
    const { messages, sessionId } = await req.json()
    const supabase = await createClient()

    const model = google("gemini-3-flash-preview")
    console.log(`Backend: Received request. Msg count: ${messages.length}`)
    const modelMessages = await convertToModelMessages(messages)

    const result = streamText({
      model,
      system: SYSTEM_PROMPT,
      messages: modelMessages,
      onFinish: async ({ text }) => {
        console.log(`Backend: Finished generation. Content length: ${text.length}`)
      }
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('Chat API Error:', error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}


