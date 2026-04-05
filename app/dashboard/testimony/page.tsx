"use client"

// Web Speech API type declarations
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number
  readonly results: SpeechRecognitionResultList
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean
  readonly length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  readonly transcript: string
  readonly confidence: number
}

interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: Event) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
}

declare global {
  interface Window {
    SpeechRecognition: { new(): SpeechRecognition }
    webkitSpeechRecognition: { new(): SpeechRecognition }
  }
}

import { useEffect, useState, useRef, useCallback, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, Keyboard, Send, ArrowRight, ArrowLeft, Check, User, Clock, Heart, Files, FileCheck, Save, Loader2, Volume2, Paperclip, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Tables, TablesInsert } from "@/lib/database.types"
import { useEmotionalSensing, createVoicePauseDetector } from "@/hooks/use-emotional-sensing"
import {
  AriaAvatar, ThinkingIndicator, MicrocopBadge, EmotionalSupportBanner,
  AriaBubble, UserBubble, EvidenceRadar, WitnessRadar, BreathingExercise,
  SafeStopScreen, EMOTION_STATES, type EmotionStateValue
} from "@/components/testimony/testimony-ui"

type Session = Tables<"sessions">
type Testimony = Tables<"testimonies">

interface ConvoMessage {
  role: "aria" | "user"
  text: string
  inputType?: "text" | "voice"
  microcopy?: string
  attachment?: { name: string; type: string }
  timestamp: string
}

interface ExtractedData {
  dates: string[]
  locations: string[]
  people: string[]
  evidenceClues: string[]
  reportingHistory: string[]
}

const STEPS = [
  { id: 0, label: "Identity", icon: User, description: "Optional personal details" },
  { id: 1, label: "Your Story", icon: Clock, description: "Share what happened" },
  { id: 2, label: "Impact", icon: Heart, description: "How it affected you" },
  { id: 3, label: "Evidence", icon: Files, description: "Supporting documents" },
  { id: 4, label: "Review", icon: FileCheck, description: "Review and submit" },
]

const ARIA_OPENERS: Record<number, string> = {
  0: "Before we begin, I want you to know this is a completely safe space. Everything you share is encrypted. You are in full control.\n\nTo help with your case, could you share a little about yourself? This is entirely optional — share only what feels comfortable. You can skip this step completely.",
  1: "Thank you for being here. I know this takes courage.\n\nWhenever you're ready, please share what happened. Start anywhere — it doesn't have to be in order, and it doesn't have to be perfect. I'm here to listen.",
  2: "You've shared something really important. Thank you.\n\nI'd like to understand the impact this had on you — emotionally, physically, or in your daily life. How has this experience affected you?",
  3: "Evidence can make a real difference to your case. Don't worry if you don't have much — even small things matter.\n\nDo you have any messages, photos, documents, recordings, or medical records related to what happened?",
  4: "You've done something incredibly brave today. Let's take a moment to review everything you've shared.",
}

function TestimonyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  const sessionId = searchParams.get("session")

  const [session, setSession] = useState<Session | null>(null)
  const [testimonies, setTestimonies] = useState<Testimony[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Conversation state
  const [messages, setMessages] = useState<ConvoMessage[]>([])
  const [inputText, setInputText] = useState("")
  const [inputMode, setInputMode] = useState<"text" | "voice">("text")
  const [attachment, setAttachment] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isThinking, setIsThinking] = useState(false)
  const [thinkingMsg, setThinkingMsg] = useState("Thinking…")
  const [microcopy, setMicrocopy] = useState("")
  const [ariaReady, setAriaReady] = useState(false)

  // Extracted intelligence
  const [extractedData, setExtractedData] = useState<ExtractedData>({ dates: [], locations: [], people: [], evidenceClues: [], reportingHistory: [] })
  const [fragments, setFragments] = useState<string[]>([])
  // Accumulated known facts — passed to AI on every turn so it knows what's missing
  const [knownData, setKnownData] = useState<Record<string, string | null>>({})

  // Emotional state
  const [emotionState, setEmotionState] = useState<EmotionStateValue>("calm")
  const [showBreathing, setShowBreathing] = useState(false)
  const [showSafeStop, setShowSafeStop] = useState(false)
  const [pausePrompt, setPausePrompt] = useState("")

  // Voice recording
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [visualizerData, setVisualizerData] = useState<number[]>(new Array(20).fill(0))

  // Identity fields
  const [identityAge, setIdentityAge] = useState("")
  const [identityLocation, setIdentityLocation] = useState("")
  const [identityRelationship, setIdentityRelationship] = useState("")

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const analyzerRef = useRef<AnalyserNode | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const pauseDetectorRef = useRef<ReturnType<typeof createVoicePauseDetector> | null>(null)
  const isRecordingRef = useRef(false)

  // Real-time emotional sensing (Method 1: text keywords)
  const emotionalSense = useEmotionalSensing(inputText)

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isThinking])

  // Fetch session
  useEffect(() => {
    const fetchData = async () => {
      if (!sessionId) { router.push("/dashboard"); return }
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push("/auth"); return }
        const { data: sessionData, error } = await supabase.from("sessions").select("*").eq("id", sessionId).eq("user_id", user.id).single()
        if (error || !sessionData) { router.push("/dashboard"); return }
        
        // Reset state so testimonies don't mix between sessions
        setKnownData({})
        setMessages([])
        setFragments([])
        setExtractedData({ dates: [], locations: [], people: [], evidenceClues: [], reportingHistory: [] })
        setAriaReady(false)
        const [tRes, chatRes] = await Promise.all([
          supabase.from("testimonies").select("*").eq("session_id", sessionId).order("created_at", { ascending: true }),
          supabase.from("chat_messages").select("*").eq("session_id", sessionId).order("created_at", { ascending: true })
        ])
        
        if (tRes.data) {
          setTestimonies(tRes.data)
          // Restore fragments for timeline
          const storyFragments = tRes.data.filter(t => t.step_type === "story").map(t => t.content || "")
          setFragments(storyFragments)
        }

        if (chatRes.data && chatRes.data.length > 0) {
          // Restore saved chat messages so conversation persists
          const restored: ConvoMessage[] = chatRes.data.map(c => ({
            role: c.role === "assistant" ? "aria" : "user",
            text: c.content || "",
            inputType: (c.metadata as any)?.type || "text",
            microcopy: (c.metadata as any)?.microcopy,
            attachment: (c.metadata as any)?.attachment,
            timestamp: c.created_at || new Date().toISOString(),
          }))
          setMessages(restored)
          
          // Restore knownData from the last assistant metadata
          const lastAria = [...chatRes.data].reverse().find(c => c.role === "assistant" && (c.metadata as any)?.knownData)
          if (lastAria && (lastAria.metadata as any)?.knownData) {
            setKnownData((lastAria.metadata as any).knownData)
          }
        } else {
          // First time loading this session, push the ARIA opener
          const step = sessionData.current_step || 0
          const openerText = ARIA_OPENERS[step] || ARIA_OPENERS[1]
          setMessages([{
            role: "aria",
            text: openerText,
            microcopy: "Safe space",
            timestamp: new Date().toISOString(),
          }])
          
          // Persist opener to chat_messages so it survives reload
          try {
            if (user) {
              await supabase.from("chat_messages").insert({
                session_id: sessionId,
                user_id: user.id,
                role: "assistant",
                content: openerText,
                metadata: { step, microcopy: "Safe space", isOpener: true }
              })
            }
          } catch (e) { console.error(e) }
        }

        setAriaReady(true)
        
        // Set session last so it doesn't trigger anything before history is mapped
        setSession(sessionData)
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [sessionId, router, supabase])

  // Emotion state button handler (Method 3)
  const handleEmotionButton = useCallback(async (val: EmotionStateValue, level: number) => {
    setEmotionState(val)
    if (sessionId) {
      await supabase.from("sessions").update({ emotional_state: val }).eq("id", sessionId)
    }
    if (level === 3) {
      setShowSafeStop(true)
    } else if (level === 2) {
      setShowBreathing(true)
    } else if (level >= 1) {
      setMessages(prev => [...prev, {
        role: "aria",
        text: "I hear you. It's okay to feel nervous. We can slow down, take breaks, or stop anytime. You're in complete control here. Would you like to continue at a gentler pace?",
        microcopy: "I'm here with you",
        timestamp: new Date().toISOString(),
      }])
    }
  }, [sessionId, supabase])

  // Send to ARIA AI (Method 1 emotions feed into this)
  const sendToAria = useCallback(async (userText: string, mode: "text" | "voice" = "text") => {
    if (!userText.trim() && !attachment) return

    const currentAttachment = attachment
    let textToSend = userText

    // Save attachment to evidence vault directly
    if (currentAttachment && sessionId) {
      textToSend = `[User uploaded evidence: ${currentAttachment.name}] ${userText}`
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from("evidence").insert({
            id: crypto.randomUUID(),
            file_name: currentAttachment.name,
            file_type: currentAttachment.type,
            file_size: currentAttachment.size,
            file_url: URL.createObjectURL(currentAttachment),
            description: userText.trim().length > 0 ? userText : "Uploaded during testimony chat",
            session_id: sessionId,
            user_id: user.id
          })
        }
      } catch (e) { console.error("Evidence upload error:", e) }
    }

    // Add user message
    const userMsg: ConvoMessage = { 
      role: "user", 
      text: userText, 
      inputType: mode, 
      attachment: currentAttachment ? { name: currentAttachment.name, type: currentAttachment.type } : undefined,
      timestamp: new Date().toISOString() 
    }
    setMessages(prev => [...prev, userMsg])
    setInputText("")
    setAttachment(null)
    setFragments(prev => [...prev, textToSend])

    // Save user message to Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && sessionId) {
        // 1. Save to true chat history table
        await supabase.from("chat_messages").insert({
          session_id: sessionId,
          user_id: user.id,
          role: "user",
          content: userText,
          metadata: {
            type: mode,
            step: session?.current_step || 0,
            emotionalState: emotionState,
            supportLevel: emotionalSense.supportLevel,
            attachment: currentAttachment ? { name: currentAttachment.name, type: currentAttachment.type } : undefined,
          }
        })

        // 2. Add fragment to testimonies table safely
        await supabase.from("testimonies").insert({
          session_id: sessionId,
          user_id: user.id,
          step_type: "story",
          content: textToSend,
          metadata: { isChatContribution: true }
        })
      }
    } catch (e) { console.error("User save error", e) }

    // Show thinking
    setIsThinking(true)
    const thinkMessages = ["Thinking…", "Listening carefully…", "Reflecting on what you shared…", "Reading between the lines…"]
    setThinkingMsg(thinkMessages[Math.floor(Math.random() * thinkMessages.length)])

    try {
      // Build conversation history for AI context
      const chatHistory = messages.concat([{ 
        role: "user", 
        text: userText, 
        inputType: mode, 
        attachment: currentAttachment ? { name: currentAttachment.name, type: currentAttachment.type } : undefined,
        timestamp: new Date().toISOString() 
      }]).map(m => ({
        role: m.role === "aria" ? "assistant" : "user",
        content: m.text === userText ? textToSend : m.text // Add the attachment metadata to the last message for the API
      }))

      const res = await fetch("/api/testimony-ai", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: textToSend, // tell ARIA about the upload explicitly 
          conversationHistory: chatHistory,
          knownData,        // what ARIA already knows — so it doesn't re-ask
          emotionalState: emotionState,
        }),
      })

      if (!res.ok) throw new Error("API error")
      const data = await res.json()

      // Use server-computed updatedKnownData (most reliable)
      if (data.updatedKnownData) {
        setKnownData(data.updatedKnownData)
      }

      // Update display-level extracted arrays
      if (data.extractedData) {
        const d = data.extractedData
        setExtractedData(prev => ({
          dates: [...new Set([...prev.dates, ...(d.rawDates || [])])],
          locations: [...new Set([...prev.locations, ...(d.rawLocations || [])])],
          people: [...new Set([...prev.people, ...(d.rawPeople || [])])],
          evidenceClues: [...new Set([...prev.evidenceClues, ...(d.evidenceClues || [])])],
          reportingHistory: prev.reportingHistory,
        }))
      }

      // Escalate emotional support if AI detected higher level
      const aiSupportLevel = Math.max(data.supportLevel || 0, emotionalSense.supportLevel)
      if (aiSupportLevel === 3) setShowSafeStop(true)
      else if (aiSupportLevel === 2 && emotionState !== "anxious") setShowBreathing(true)

      setIsThinking(false)
      setMicrocopy(data.microcopy || "")
      const ariaMsg: ConvoMessage = {
        role: "aria",
        text: data.response || "Can you tell me a bit more about that?",
        microcopy: data.microcopy,
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, ariaMsg])

      // Persist ARIA's reply to chat_messages table
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user && sessionId) {
          await supabase.from("chat_messages").insert({
            session_id: sessionId,
            user_id: user.id,
            role: "assistant",
            content: ariaMsg.text,
            metadata: {
              step: session?.current_step || 0,
              microcopy: data.microcopy,
              supportLevel: data.supportLevel,
              knownData: data.updatedKnownData || knownData,
            }
          })
        }
      } catch (e) { console.error("Save ARIA reply error:", e) }

      setTimeout(() => setMicrocopy(""), 5000)
    } catch (err) {
      console.error("sendToAria error:", err)
      setIsThinking(false)
      setMessages(prev => [...prev, {
        role: "aria",
        text: "Thank you for sharing that. Take all the time you need. Whenever you're ready, please continue.",
        timestamp: new Date().toISOString(),
      }])
    }
  }, [fragments, emotionState, emotionalSense.supportLevel, sessionId, supabase])

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const audioCtx = new AudioContext()
      audioCtxRef.current = audioCtx
      const source = audioCtx.createMediaStreamSource(stream)
      const analyzer = audioCtx.createAnalyser()
      analyzer.fftSize = 256
      source.connect(analyzer)
      analyzerRef.current = analyzer

      // Voice pause detector (Method 2)
      pauseDetectorRef.current = createVoicePauseDetector((ms) => {
        if (ms > 5000) {
          setPausePrompt("Take your time… I'm here whenever you're ready.")
        } else if (ms > 3000) {
          setPausePrompt("It's okay to pause. Take a breath.")
        }
      })
      pauseDetectorRef.current.start(analyzer)

      // Visualizer
      const updateViz = () => {
        if (!analyzerRef.current) return
        const d = new Uint8Array(analyzerRef.current.frequencyBinCount)
        analyzerRef.current.getByteFrequencyData(d)
        const samples = 20
        const size = Math.floor(d.length / samples)
        setVisualizerData(Array.from({ length: samples }, (_, i) => {
          const sum = Array.from(d.slice(i * size, (i + 1) * size)).reduce((a, b) => a + b, 0)
          return (sum / size) / 255
        }))
        animFrameRef.current = requestAnimationFrame(updateViz)
      }
      updateViz()

      // Speech recognition
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SR) {
        const recognition = new SR()
        recognition.continuous = true
        recognition.interimResults = true
        let final = ""
        recognition.onresult = (e: SpeechRecognitionEvent) => {
          let interim = ""
          for (let i = e.resultIndex; i < e.results.length; i++) {
            if (e.results[i].isFinal) final += e.results[i][0].transcript + " "
            else interim += e.results[i][0].transcript
          }
          setInputText(final + interim)
        }
        recognition.onend = () => { if (isRecordingRef.current) try { recognition.start() } catch { } }
        recognitionRef.current = recognition
        try { recognition.start() } catch { }
      }

      // MediaRecorder fallback
      const mr = new MediaRecorder(stream)
      mediaRecorderRef.current = mr
      chunksRef.current = []
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.start(1000)

      isRecordingRef.current = true
      setIsRecording(true)
      setRecordingDuration(0)
      setPausePrompt("")
      timerRef.current = setInterval(() => setRecordingDuration(d => d + 1), 1000)
    } catch {
      setPausePrompt("Microphone access denied. Please type your response instead.")
    }
  }

  const stopRecording = async () => {
    isRecordingRef.current = false
    pauseDetectorRef.current?.stop()
    recognitionRef.current?.stop()
    recognitionRef.current = null
    mediaRecorderRef.current?.stop()
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    if (audioCtxRef.current) audioCtxRef.current.close()
    audioCtxRef.current = null
    if (timerRef.current) clearInterval(timerRef.current)
    setIsRecording(false)
    setVisualizerData(new Array(20).fill(0))
    setPausePrompt("")
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (audioCtxRef.current) audioCtxRef.current.close()
      pauseDetectorRef.current?.stop()
    }
  }, [])

  const saveAndNext = async () => {
    if (!session || !sessionId) return
    setIsSaving(true)
    const newStep = Math.min((session.current_step || 0) + 1, STEPS.length - 1)
    await supabase.from("sessions").update({ current_step: newStep }).eq("id", sessionId)
    setSession(prev => prev ? { ...prev, current_step: newStep } : prev)
    
    // APPEND the opener to existing messages instead of replacing them
    const openerMsg: ConvoMessage = {
      role: "aria",
      text: ARIA_OPENERS[newStep] || "Please continue.",
      microcopy: "New chapter",
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, openerMsg])
    setInputText("")
    setIsSaving(false)

    // Persist the opener to Supabase so it shows on reload
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from("chat_messages").insert({
          session_id: sessionId,
          user_id: user.id,
          role: "assistant",
          content: openerMsg.text,
          metadata: { step: newStep, microcopy: "New chapter", isOpener: true }
        })
      }
    } catch (e) { console.error(e) }
  }

  const goBack = async () => {
    if (!session || !sessionId) return
    const newStep = Math.max((session.current_step || 0) - 1, 0)
    await supabase.from("sessions").update({ current_step: newStep }).eq("id", sessionId)
    setSession(prev => prev ? { ...prev, current_step: newStep } : prev)
    
    // APPEND the opener to existing messages instead of replacing them
    const openerMsg: ConvoMessage = {
      role: "aria",
      text: ARIA_OPENERS[newStep] || "Let's revisit this.",
      microcopy: "Going back",
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, openerMsg])
    setInputText("")

    // Persist the opener to Supabase so it shows on reload
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from("chat_messages").insert({
          session_id: sessionId,
          user_id: user.id,
          role: "assistant",
          content: openerMsg.text,
          metadata: { step: newStep, microcopy: "Going back", isOpener: true }
        })
      }
    } catch (e) { console.error(e) }
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#818cf8] border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!session) return null

  const currentStep = session.current_step || 0

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Safe Stop Overlay */}
      <AnimatePresence>
        {showSafeStop && (
          <SafeStopScreen
            onResume={() => setShowSafeStop(false)}
            onExit={() => router.push("/dashboard")}
          />
        )}
      </AnimatePresence>

      {/* ===== LEFT SIDEBAR ===== */}
      <div className="w-72 shrink-0 flex flex-col border-r hidden lg:flex" style={{ borderColor: 'rgba(30,42,80,0.4)', background: 'rgba(8,12,26,0.6)', backdropFilter: 'blur(20px)' }}>
        {/* Steps */}
        <div className="p-5 flex-1 overflow-y-auto">
          {/* Session Name (editable) */}
          <div className="mb-5 pb-4 border-b" style={{ borderColor: 'rgba(30,42,80,0.3)' }}>
            <p className="text-[10px] text-white/25 uppercase tracking-widest mb-1.5">Testimony Name</p>
            <input 
              type="text"
              defaultValue={session?.title || "Untitled"}
              onBlur={async (e) => {
                const newTitle = e.target.value.trim()
                if (newTitle && sessionId && newTitle !== session?.title) {
                  await supabase.from("sessions").update({ title: newTitle }).eq("id", sessionId)
                  setSession(prev => prev ? { ...prev, title: newTitle } : prev)
                }
              }}
              onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur() }}
              className="w-full bg-transparent text-sm font-semibold text-white/80 outline-none border-b border-transparent hover:border-white/10 focus:border-[#818cf8]/40 transition-colors pb-0.5 placeholder:text-white/20"
              placeholder="Name this testimony…"
            />
          </div>

          <p className="text-xs text-white/30 uppercase tracking-widest mb-4 font-medium">Your Journey</p>
          <div className="space-y-1.5">
            {STEPS.map((step) => {
              const isActive = currentStep === step.id
              const isDone = currentStep > step.id
              return (
                <div key={step.id} className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive ? "bg-[#818cf8]/10 border border-[#818cf8]/20" : "hover:bg-white/5"}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isDone ? "bg-emerald-500/20" : isActive ? "bg-[#818cf8]/20" : "bg-white/5"}`}>
                    {isDone ? <Check className="w-4 h-4 text-emerald-400" /> : <step.icon className={`w-4 h-4 ${isActive ? "text-[#818cf8]" : "text-white/30"}`} />}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isActive ? "text-white/90" : isDone ? "text-white/50" : "text-white/30"}`}>{step.label}</p>
                    <p className="text-xs text-white/20">{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Method 3: Emotion Buttons */}
          <div className="mt-8">
            <p className="text-xs text-white/30 uppercase tracking-widest mb-3 font-medium">How are you feeling?</p>
            <div className="grid grid-cols-2 gap-2">
              {EMOTION_STATES.map((es) => (
                <button key={es.value} onClick={() => handleEmotionButton(es.value, es.level)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${emotionState === es.value ? "bg-[#818cf8]/20 border border-[#818cf8]/30 text-white/90" : "bg-white/5 text-white/40 hover:bg-white/8 hover:text-white/60"}`}>
                  <span>{es.emoji}</span>{es.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-white/20 mt-2 leading-relaxed">ARIA adapts to your emotional state</p>
          </div>

          {/* Evidence Radar */}
          <div className="mt-6 space-y-2">
            <AnimatePresence>
              {extractedData.evidenceClues.length > 0 && (
                <EvidenceRadar key="evidence-radar" clues={extractedData.evidenceClues} onUploadEvidence={() => {
                  saveAndNext()
                }} />
              )}
              {extractedData.people.length > 0 && (
                <WitnessRadar key="witness-radar" people={extractedData.people} onAddWitness={(name) => {
                  setInputText(prev => prev + ` (witness: ${name})`)
                }} />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Save button */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(30,42,80,0.3)' }}>
          <button onClick={() => router.push("/dashboard")}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-white/40 hover:text-white/70 transition-colors hover:bg-white/5">
            <Save className="w-4 h-4" /> Save & exit
          </button>
        </div>
      </div>

      {/* ===== MAIN CONVERSATION AREA ===== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header bar */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(30,42,80,0.3)', background: 'rgba(8,12,26,0.4)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-3">
            <AriaAvatar supportLevel={emotionalSense.supportLevel} />
            <div>
              <p className="text-sm font-semibold text-white/90">ARIA</p>
              <p className="text-xs text-white/30">Trauma-informed AI companion</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Progress */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex gap-1">
                {STEPS.map((s) => (
                  <div key={s.id} className={`h-1.5 rounded-full transition-all ${s.id === currentStep ? "w-6 bg-[#818cf8]" : s.id < currentStep ? "w-3 bg-[#818cf8]/40" : "w-3 bg-white/10"}`} />
                ))}
              </div>
              <span className="text-xs text-white/30">Step {currentStep + 1} of {STEPS.length}</span>
            </div>
            <button onClick={() => setShowSafeStop(true)}
              className="px-3 py-1.5 rounded-full text-xs text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all border border-white/10 hover:border-red-500/20">
              🛑 Stop
            </button>
          </div>
        </div>

        {/* Breathing Exercise overlay */}
        <AnimatePresence>
          {showBreathing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 flex items-center justify-center p-8"
              style={{ background: 'rgba(8,12,26,0.92)', backdropFilter: 'blur(20px)' }}>
              <div className="max-w-sm w-full">
                <BreathingExercise onDone={() => setShowBreathing(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Identity Step (Step 0) */}
        {currentStep === 0 ? (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-xl mx-auto space-y-6">
              <AriaBubble text={ARIA_OPENERS[0]} supportLevel={0} microcopy="Completely optional" />
              <div className="space-y-4 pl-13">
                {[
                  { label: "Age Range", placeholder: "e.g. 25–30", value: identityAge, set: setIdentityAge },
                  { label: "General Location", placeholder: "e.g. City or Region", value: identityLocation, set: setIdentityLocation },
                  { label: "Your Role", placeholder: "e.g. Survivor, Witness", value: identityRelationship, set: setIdentityRelationship },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="text-xs text-white/40 block mb-1.5">{f.label} <span className="text-white/20">(optional)</span></label>
                    <Input value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                      className="bg-white/5 border-white/10 text-white/80 placeholder:text-white/20 focus:border-[#818cf8]/40 rounded-xl" />
                  </div>
                ))}
              </div>
              <button onClick={saveAndNext}
                className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: 'rgba(129,140,248,0.15)', color: '#a5b4fc', border: '1px solid rgba(129,140,248,0.3)' }}>
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : currentStep === 4 ? (
          /* Review Step */
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-xl mx-auto space-y-6">
              <AriaBubble text={ARIA_OPENERS[4]} supportLevel={0} microcopy="You did it" />
              <div className="p-5 rounded-2xl space-y-4" style={{ background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.12)' }}>
                <p className="text-sm font-semibold text-white/70">Story Fragments: <span className="text-[#818cf8]">{fragments.length}</span></p>
                {extractedData.dates.length > 0 && <p className="text-xs text-white/40">📅 Dates: {extractedData.dates.join(", ")}</p>}
                {extractedData.locations.length > 0 && <p className="text-xs text-white/40">📍 Locations: {extractedData.locations.join(", ")}</p>}
                {extractedData.people.length > 0 && <p className="text-xs text-white/40">👤 People: {extractedData.people.join(", ")}</p>}
                {extractedData.evidenceClues.length > 0 && <p className="text-xs text-white/40">🗂 Evidence clues: {extractedData.evidenceClues.join(", ")}</p>}
              </div>
              <div className="flex gap-3">
                <button onClick={goBack} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm text-white/50 hover:text-white/80 transition-colors" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                  <ArrowLeft className="w-4 h-4" /> Go back
                </button>
                <Link href={`/dashboard/report?session=${sessionId}`}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', color: 'white' }}>
                  Generate Report <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Conversational Story/Impact/Evidence Steps */
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-5">
              <div className="max-w-2xl mx-auto space-y-5">
                {/* Method 1: Real-time emotional detection banner */}
                <AnimatePresence>
                  {emotionalSense.supportLevel > 0 && (
                    <EmotionalSupportBanner
                      key="emotional-banner"
                      supportLevel={emotionalSense.supportLevel}
                      bannerConfig={emotionalSense.bannerConfig}
                      onBreak={() => setShowBreathing(true)}
                    />
                  )}
                </AnimatePresence>

                {/* Conversation history */}
                {messages.map((msg, i) => (
                  msg.role === "aria"
                    ? <AriaBubble key={i} text={msg.text} supportLevel={emotionalSense.supportLevel} microcopy={msg.microcopy} />
                    : <UserBubble key={i} text={msg.text} inputType={msg.inputType} attachmentName={msg.attachment?.name} attachmentType={msg.attachment?.type} />
                ))}

                {/* Thinking indicator */}
                <AnimatePresence>
                  {isThinking && <ThinkingIndicator key="thinking-indicator" message={thinkingMsg} />}
                </AnimatePresence>

                {/* Voice pause prompt (Method 2) */}
                <AnimatePresence>
                  {pausePrompt && (
                    <motion.div key="pause-prompt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                      style={{ background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.12)' }}>
                      <span className="text-sm text-[#818cf8]/80 italic">💙 {pausePrompt}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* ===== INPUT AREA ===== */}
            <div className="shrink-0 border-t px-4 sm:px-6 py-4" style={{ borderColor: 'rgba(30,42,80,0.3)', background: 'rgba(8,12,26,0.5)', backdropFilter: 'blur(12px)' }}>
              <div className="max-w-2xl mx-auto space-y-3">
                {/* Input mode toggle */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center p-1 rounded-full gap-1" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {[{ mode: "text" as const, icon: Keyboard, label: "Type" }, { mode: "voice" as const, icon: Mic, label: "Speak" }].map(({ mode, icon: Icon, label }) => (
                      <button key={mode} onClick={() => { setInputMode(mode); if (isRecording) stopRecording() }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${inputMode === mode ? "bg-[#818cf8]/20 text-[#818cf8]" : "text-white/30 hover:text-white/60"}`}>
                        <Icon className="w-3 h-3" />{label}
                      </button>
                    ))}
                  </div>
                  {inputMode === "text" && (
                    <>
                      <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all text-white/40 hover:text-white/70 hover:bg-white/5" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Paperclip className="w-3 h-3" /> Attach Evidence
                      </button>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                        onChange={e => { if (e.target.files?.[0]) setAttachment(e.target.files[0]) }} />
                    </>
                  )}
                  {/* Microcopy badge */}
                  <AnimatePresence>
                    {microcopy && <MicrocopBadge text={microcopy} />}
                  </AnimatePresence>
                  <div className="ml-auto flex gap-2">
                    <button onClick={goBack} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-white/30 hover:text-white/60 transition-colors" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                      <ArrowLeft className="w-3 h-3" /> Back
                    </button>
                    <button onClick={saveAndNext} disabled={isSaving}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all hover:opacity-90"
                      style={{ background: 'rgba(129,140,248,0.15)', color: '#a5b4fc', border: '1px solid rgba(129,140,248,0.25)' }}>
                      {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                      Next step <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Text input */}
                {inputMode === "text" && (
                  <div className="relative">
                    {/* Attachment preview inside input */}
                    <AnimatePresence>
                      {attachment && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                          <div className="flex items-center justify-between pb-3 pl-2 pr-1 mb-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded shrink-0 bg-[#818cf8]/20 flex items-center justify-center">
                                {attachment.type.startsWith("image/") ? <span className="text-sm">🖼️</span> : <span className="text-sm">📄</span>}
                              </div>
                              <div className="min-w-0 pr-4">
                                <p className="text-sm text-white/80 font-medium truncate">{attachment.name}</p>
                                <p className="text-[10px] text-emerald-400">Will be saved to your Evidence Vault</p>
                              </div>
                            </div>
                            <button onClick={() => setAttachment(null)} className="p-1.5 rounded-full text-white/40 hover:bg-red-500/20 hover:text-red-400 transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Textarea
                      ref={textareaRef}
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); sendToAria(inputText, "text") } }}
                      placeholder="Share what's on your mind… Take all the time you need."
                      className="min-h-[100px] pr-14 resize-none rounded-2xl text-sm text-white/80 placeholder:text-white/20"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                    />
                    <button onClick={() => sendToAria(inputText, "text")} disabled={(!inputText.trim() && !attachment) || isThinking}
                      className="absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:opacity-90 disabled:opacity-30"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}>
                      {isThinking ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
                    </button>
                    <p className="text-[10px] text-white/20 mt-1.5 text-center">Press Ctrl+Enter to send</p>
                  </div>
                )}

                {/* Voice input */}
                {inputMode === "voice" && (
                  <div className="space-y-3">
                    {/* Visualizer */}
                    {isRecording && (
                      <div className="flex items-center justify-center gap-1 h-12">
                        {visualizerData.map((v, i) => (
                          <motion.div key={i} className="w-1.5 rounded-full bg-[#818cf8]"
                            animate={{ height: `${Math.max(4, v * 48)}px` }}
                            transition={{ duration: 0.1 }} />
                        ))}
                      </div>
                    )}
                    {/* Live transcript */}
                    {inputText && (
                      <div className="p-3 rounded-xl text-sm text-white/60 italic"
                        style={{ background: 'rgba(129,140,248,0.05)', border: '1px solid rgba(129,140,248,0.1)' }}>
                        {inputText}
                      </div>
                    )}
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={isRecording ? stopRecording : startRecording}
                        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isRecording ? "bg-red-500/20 border-2 border-red-500/50" : "border-2 border-[#818cf8]/40"}`}
                        style={isRecording ? {} : { background: 'rgba(129,140,248,0.15)' }}>
                        {isRecording ? <MicOff className="w-6 h-6 text-red-400" /> : <Mic className="w-6 h-6 text-[#818cf8]" />}
                      </button>
                      {isRecording && (
                        <div>
                          <p className="text-sm text-white/50">{fmt(recordingDuration)}</p>
                          <p className="text-xs text-white/30">Recording…</p>
                        </div>
                      )}
                    </div>
                    {!isRecording && inputText && (
                      <button onClick={() => sendToAria(inputText, "voice")} disabled={isThinking}
                        className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90"
                        style={{ background: 'rgba(129,140,248,0.15)', color: '#a5b4fc', border: '1px solid rgba(129,140,248,0.25)' }}>
                        <Send className="w-4 h-4" /> Send recording
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function TestimonyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-2 border-[#818cf8] border-t-transparent rounded-full animate-spin" /></div>}>
      <TestimonyContent />
    </Suspense>
  )
}
