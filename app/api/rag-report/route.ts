import { google } from "@ai-sdk/google"
import { generateText } from "ai"
import { retrieveTemplate, DocumentType } from "@/lib/rag/retrieveTemplate"

export const maxDuration = 60

export async function POST(req: Request) {
  // Use the specific API key for the RAG feature
  const apiKey = process.env.RAG_AI_API || process.env.GOOGLE_GENERATIVE_AI_API_KEY
  
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing API Key for Document Generation" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const body = await req.json()
    const { structuredData, type } = body

    if (!structuredData || !type) {
      return new Response(
        JSON.stringify({ error: "Missing structured data or document type" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // 1. RAG Retrieve Phase: Get the relevant legal template text
    let templateText: string
    try {
      templateText = await retrieveTemplate(type as DocumentType)
    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Template retrieval failed", details: (err as Error).message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    // 2. Generate Phase: Construct prompt and call Gemini
    const model = google("gemini-3-flash-preview")

    const systemPrompt = `You are an expert legal document generator for JusticeFlow, an AI assistant for survivors of trauma.
Your task is to take a specific PDF legal document template and fill it out accurately using structured case data.

CRITICAL RULES:
1. ONLY use facts provided in the structured case data. NEVER invent dates, names, or events.
2. Adhere STRICTLY to the format and sections of the provided template. Do not invent new legal sections.
3. If information required by the template is missing from the data, use "[NOT PROVIDED]" or "[UNKNOWN]".
4. Use a highly formal, objective, and legally sound tone.
5. Emphasize exact names, dates, times, and locations in the output.
6. The final output should read as a complete, ready-to-print legal document.

Do not include markdown code block formatting in the output (like \`\`\`markdown). Just return the raw formatted text.`

    const userPrompt = `## TARGET LEGAL TEMPLATE FORMAT:
${templateText}

## CASE DATA TO INJECT:
${JSON.stringify(structuredData, null, 2)}

## INSTRUCTIONS:
Generate the completely filled out legal document now.`

    const { text } = await generateText({
      model,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.15, // Low temperature for deterministic legal drafting
      experimental_telemetry: { isEnabled: true }, // Add standard Vercel AI SDK options if preferred
    })

    const result = {
      success: true,
      report: text.trim(),
      templateUsed: type,
    }

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    console.error("RAG Document Generation error:", err)
    return new Response(
      JSON.stringify({
        error: "Document generation failed",
        details: err instanceof Error ? err.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
