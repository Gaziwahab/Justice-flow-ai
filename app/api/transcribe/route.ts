export const runtime = "edge"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get("audio") as Blob
    
    if (!audioFile) {
      return Response.json({ error: "No audio file provided" }, { status: 400 })
    }

    // Check if OPENAI_API_KEY is available
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      // Return a message indicating transcription isn't available
      // The client will handle this gracefully
      return Response.json({ 
        text: "", 
        message: "Transcription service not configured. Please use browser speech recognition or type your response." 
      }, { status: 200 })
    }

    // Convert blob to file for Whisper API
    const file = new File([audioFile], "audio.webm", { type: audioFile.type })
    
    // Create form data for OpenAI API
    const whisperFormData = new FormData()
    whisperFormData.append("file", file)
    whisperFormData.append("model", "whisper-1")
    whisperFormData.append("language", "en")
    
    // Call OpenAI Whisper API
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: whisperFormData,
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("Whisper API error:", error)
      return Response.json({ text: "", error: "Transcription failed" }, { status: 200 })
    }

    const result = await response.json()
    
    return Response.json({ text: result.text })
  } catch (error) {
    console.error("Transcription error:", error)
    return Response.json({ text: "", error: "Transcription failed" }, { status: 200 })
  }
}
