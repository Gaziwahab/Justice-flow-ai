import { google } from "@ai-sdk/google"
import { generateText } from "ai"

export const maxDuration = 120

// ===================================================================
// STRUCTURE ENGINE — The Core Reasoning Layer
// Takes raw, messy testimony fragments and converts them into
// structured legal-ready data: events, entities, timeline, evidence refs
// ===================================================================

const STRUCTURE_SYSTEM_PROMPT = `You are the JusticeFlow Structure Engine — a forensic-grade AI analyst that converts raw survivor testimony into structured legal intelligence.

YOUR INPUT: Raw testimony fragments (messy, emotional, non-chronological, possibly contradictory).
YOUR OUTPUT: A precisely structured JSON object that can be used in legal proceedings.

## RULES:
1. NEVER invent facts. Only extract what is EXPLICITLY stated or strongly implied.
2. If a date is vague ("last summer", "a few months ago"), mark it as approximate and assign confidence: "low".
3. If the same event is mentioned in multiple fragments, MERGE them into one event with combined details.
4. Track every entity (person, place, organization) with what role they played.
5. Link evidence references to specific events when possible.
6. Maintain the survivor's exact words for key quotes — do NOT paraphrase emotional statements.
7. Flag contradictions (e.g., two different dates for the same event) as "needs_clarification".
8. Assign confidence levels based on specificity:
   - "high": Exact dates, names, locations given
   - "medium": Partial info or vague references
   - "low": Implied or uncertain details

## OUTPUT FORMAT (strict JSON):
{
  "case_summary": "2-3 sentence overview of what happened",
  "incident_type": "assault|harassment|bullying|domestic_violence|stalking|discrimination|other",
  "severity_assessment": "critical|severe|moderate|concerning",
  
  "timeline_events": [
    {
      "id": "evt_001",
      "title": "Short event title",
      "description": "Detailed description of what happened",
      "date_raw": "The exact words the survivor used for timing",
      "date_estimated": "ISO date or approximate like '2025-06' or 'unknown'",
      "time_of_day": "morning|afternoon|evening|night|unknown",
      "location": "Where it happened",
      "location_type": "home|school|workplace|public|online|unknown",
      "people_involved": ["list of people present or involved"],
      "perpetrator_actions": "What the perpetrator specifically did",
      "survivor_response": "How the survivor reacted",
      "witnesses_present": true|false,
      "evidence_referenced": ["any evidence mentioned in connection"],
      "emotional_state_during": "How the survivor felt during this event",
      "confidence": "high|medium|low",
      "source_fragment_indices": [0, 2],
      "key_quotes": ["Important verbatim quotes from the survivor"]
    }
  ],
  
  "entities": {
    "people": [
      {
        "name": "Name or identifier",
        "role": "perpetrator|witness|bystander|authority|supporter|victim",
        "relationship_to_survivor": "e.g. classmate, boss, partner, stranger",
        "description": "Physical or behavioral description if given",
        "mentioned_in_events": ["evt_001"]
      }
    ],
    "locations": [
      {
        "name": "Place name",
        "type": "school|home|workplace|public|online|other",
        "significance": "Why this location matters",
        "events_here": ["evt_001"]
      }
    ],
    "organizations": [
      {
        "name": "Organization name",
        "type": "school|employer|police|hospital|other",
        "role_in_case": "What part they play"
      }
    ]
  },
  
  "evidence_map": [
    {
      "type": "photo|video|audio|document|message|medical|financial|other",
      "description": "What the evidence shows",
      "linked_events": ["evt_001"],
      "status": "uploaded|mentioned|missing",
      "importance": "critical|important|supporting"
    }
  ],
  
  "pattern_analysis": {
    "is_pattern": true|false,
    "frequency": "one-time|occasional|regular|daily|unknown",
    "escalation": "stable|escalating|de-escalating|unknown",
    "pattern_description": "Description of the pattern if any"
  },
  
  "impact_assessment": {
    "emotional": ["list of emotional impacts mentioned"],
    "physical": ["list of physical impacts"],
    "financial": ["list of financial impacts"],
    "social": ["list of social impacts"],
    "professional_academic": ["impacts on work or school"]
  },
  
  "reporting_history": {
    "reported_to_anyone": true|false,
    "reports": [
      {
        "reported_to": "Who they told",
        "when": "When they reported",
        "response": "How the authority responded",
        "outcome": "What happened after reporting"
      }
    ]
  },
  
  "gaps_and_clarifications": [
    {
      "field": "What's missing",
      "question": "A gentle question to ask the survivor to fill this gap",
      "importance": "critical|helpful|optional"
    }
  ],
  
  "legal_strength": {
    "score": 1-10,
    "strengths": ["What makes this case strong"],
    "weaknesses": ["What might need more support"],
    "recommended_evidence": ["Evidence that would strengthen the case"]
  }
}`

interface StructureRequest {
  fragments: Array<{
    id: string
    content: string
    timestamp: string
    type?: string
  }>
  knownData?: Record<string, string | null>
  evidence?: Array<{
    id: string
    name: string
    type: string
    description?: string
  }>
  sessionId: string
}

export async function POST(req: Request) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return new Response(JSON.stringify({ error: "Missing API Key" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const body: StructureRequest = await req.json()
    const { fragments, knownData, evidence } = body

    if (!fragments || fragments.length === 0) {
      return new Response(
        JSON.stringify({ error: "No testimony fragments provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const model = google("gemini-3-flash-preview")

    // Build the raw text block from all fragments
    const fragmentsText = fragments
      .map(
        (f, i) =>
          `[Fragment ${i + 1}] (${f.type || "text"} — ${new Date(f.timestamp).toLocaleString()}):\n"${f.content}"`
      )
      .join("\n\n")

    // Build known data context
    const knownDataText = knownData
      ? Object.entries(knownData)
          .filter(([, v]) => v && v !== "null")
          .map(([k, v]) => `- ${k.replace(/_/g, " ")}: ${v}`)
          .join("\n")
      : "(none yet)"

    // Build evidence inventory
    const evidenceText = evidence && evidence.length > 0
      ? evidence
          .map(
            (e, i) =>
              `${i + 1}. ${e.name} (${e.type})${e.description ? ` — "${e.description}"` : ""}`
          )
          .join("\n")
      : "(no evidence uploaded yet)"

    const userPrompt = `Analyze these raw testimony fragments and produce a complete structured intelligence report.

## RAW TESTIMONY FRAGMENTS:
${fragmentsText}

## PREVIOUSLY EXTRACTED FACTS (from conversational AI):
${knownDataText}

## EVIDENCE INVENTORY:
${evidenceText}

## INSTRUCTIONS:
1. Read ALL fragments carefully. Many survivors repeat themselves or add details across messages.
2. Merge overlapping events into single timeline entries.
3. Extract every person, place, date, and piece of evidence mentioned.
4. Assess the pattern (one-time vs. repeated) and escalation.
5. Identify gaps — what crucial information is missing?
6. Rate legal strength honestly.

Return the complete structured JSON as specified in your instructions. Return ONLY valid JSON, no markdown fences.`

    const { text: rawResponse } = await generateText({
      model,
      system: STRUCTURE_SYSTEM_PROMPT,
      prompt: userPrompt,
      temperature: 0.2, // Low temperature for analytical accuracy
    })

    // Clean and parse the JSON response
    const cleaned = rawResponse
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim()

    let structuredData
    try {
      structuredData = JSON.parse(cleaned)
    } catch {
      // If JSON parsing fails, try to extract the JSON object
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        structuredData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("Failed to parse structured data from AI response")
      }
    }

    // Post-process: ensure all required fields exist
    const result = {
      case_summary: structuredData.case_summary || "Analysis pending",
      incident_type: structuredData.incident_type || "other",
      severity_assessment: structuredData.severity_assessment || "concerning",

      timeline_events: (structuredData.timeline_events || []).map(
        (evt: Record<string, unknown>, i: number) => ({
          id: evt.id || `evt_${String(i + 1).padStart(3, "0")}`,
          title: evt.title || `Event ${i + 1}`,
          description: evt.description || "",
          date_raw: evt.date_raw || "unknown",
          date_estimated: evt.date_estimated || "unknown",
          time_of_day: evt.time_of_day || "unknown",
          location: evt.location || "unknown",
          location_type: evt.location_type || "unknown",
          people_involved: evt.people_involved || [],
          perpetrator_actions: evt.perpetrator_actions || "",
          survivor_response: evt.survivor_response || "",
          witnesses_present: evt.witnesses_present ?? false,
          evidence_referenced: evt.evidence_referenced || [],
          emotional_state_during: evt.emotional_state_during || "",
          confidence: evt.confidence || "medium",
          source_fragment_indices: evt.source_fragment_indices || [],
          key_quotes: evt.key_quotes || [],
        })
      ),

      entities: {
        people: structuredData.entities?.people || [],
        locations: structuredData.entities?.locations || [],
        organizations: structuredData.entities?.organizations || [],
      },

      evidence_map: structuredData.evidence_map || [],

      pattern_analysis: {
        is_pattern: structuredData.pattern_analysis?.is_pattern ?? false,
        frequency: structuredData.pattern_analysis?.frequency || "unknown",
        escalation: structuredData.pattern_analysis?.escalation || "unknown",
        pattern_description:
          structuredData.pattern_analysis?.pattern_description || "",
      },

      impact_assessment: {
        emotional: structuredData.impact_assessment?.emotional || [],
        physical: structuredData.impact_assessment?.physical || [],
        financial: structuredData.impact_assessment?.financial || [],
        social: structuredData.impact_assessment?.social || [],
        professional_academic:
          structuredData.impact_assessment?.professional_academic || [],
      },

      reporting_history: {
        reported_to_anyone:
          structuredData.reporting_history?.reported_to_anyone ?? false,
        reports: structuredData.reporting_history?.reports || [],
      },

      gaps_and_clarifications: structuredData.gaps_and_clarifications || [],

      legal_strength: {
        score: structuredData.legal_strength?.score || 0,
        strengths: structuredData.legal_strength?.strengths || [],
        weaknesses: structuredData.legal_strength?.weaknesses || [],
        recommended_evidence:
          structuredData.legal_strength?.recommended_evidence || [],
      },

      metadata: {
        processed_at: new Date().toISOString(),
        fragment_count: fragments.length,
        evidence_count: evidence?.length || 0,
        model: "gemini-1.5-flash",
        engine_version: "1.0.0",
      },
    }

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    console.error("Structure Engine error:", err)
    return new Response(
      JSON.stringify({
        error: "Structure Engine processing failed",
        details: err instanceof Error ? err.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
