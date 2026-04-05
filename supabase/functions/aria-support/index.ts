import "@supabase/functions-js/edge-runtime.d.ts"
import { streamText, convertToModelMessages } from "npm:ai"
import { google } from "npm:@ai-sdk/google"
import { createClient } from "npm:@supabase/supabase-js"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

const riskKeywords = {
  critical: ['kill', 'weapon', 'gun', 'knife', 'suicide', 'end my life', 'hurt myself', 'die', 'murder'],
  high: ['threat', 'stalking', 'following me', 'scared for my life', 'pregnant', 'choking', 'strangling'],
  medium: ['hit', 'punch', 'slap', 'control', 'isolate', 'monitor', 'track', 'abuse', 'yell'],
  low: ['argument', 'verbal', 'insult']
}

function assessRisk(message: string) {
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

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages, sessionId } = await req.json()

    // Setup Supabase Client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get Auth User
    const { data: { user } } = await supabaseClient.auth.getUser()

    // Safely extract text from UI Messages (AI SDK v6 parts format)
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop()
    const getTextFromParts = (msg: any): string => {
      if (msg?.parts) {
        return msg.parts
          .filter((p: any) => p.type === 'text')
          .map((p: any) => p.text || '')
          .join('')
      }
      return msg?.content || ''
    }

    const lastUserText = lastUserMessage ? getTextFromParts(lastUserMessage) : ''
    const riskAssessment = lastUserText ? assessRisk(lastUserText) : { level: 'low', score: 0, factors: [] }

    // Save to database (non-blocking)
    if (user && lastUserMessage) {
      supabaseClient.from('chat_messages').insert({
        session_id: sessionId || null,
        user_id: user.id,
        role: 'user',
        content: lastUserText,
        risk_indicators: riskAssessment
      }).then(({error}) => { if (error) console.error('Failed saving user message', error) })

      if (riskAssessment.level === 'critical' || riskAssessment.level === 'high') {
        supabaseClient.from('risk_assessments').insert({
          session_id: sessionId || null,
          user_id: user.id,
          overall_risk_level: riskAssessment.level,
          risk_score: riskAssessment.score,
          risk_factors: riskAssessment.factors,
          immediate_danger: riskAssessment.level === 'critical'
        }).then(({error}) => { if (error) console.error('Failed saving risk assessment', error) })
      }
    }

    let contextualPrompt = SYSTEM_PROMPT
    if (riskAssessment.level === 'critical') {
      contextualPrompt += `\n\n[SYSTEM ALERT]: CRITICAL RISK IDENTIFIED. The user's input indicates severe danger. You MUST prioritize safety, acknowledge their immediate situation gently, and provide crisis resources embedded naturally in your response.\n- US National Domestic Violence Hotline: 1-800-799-7233 (SMS TEXT "START" to 88788)\n- Crisis Text Line: Text HOME to 741741`
    } else if (riskAssessment.level === 'high') {
      contextualPrompt += `\n\n[SYSTEM ALERT]: HIGH RISK. Proceed with deep empathy and gently offer protective resources if appropriate.`
    }

    const model = google("gemini-3-flash")
    
    const modelMessages = await convertToModelMessages(messages)

    const result = streamText({
      model,
      system: contextualPrompt,
      messages: modelMessages,
      onFinish: async ({ text }) => {
        if (user) {
          try {
            await supabaseClient.from('chat_messages').insert({
              session_id: sessionId || null,
              user_id: user.id,
              role: 'assistant',
              content: text
            })
          } catch (e) {
            console.error('Failed saving assistant response', e)
          }
        }
      }
    })

    // Create stream response and append CORS headers
    const response = result.toUIMessageStreamResponse()
    for (const [key, value] of Object.entries(corsHeaders)) {
      response.headers.set(key, value)
    }

    return response

  } catch (err: any) {
    console.error(err)
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})
