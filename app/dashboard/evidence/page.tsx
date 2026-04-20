"use client"

import { useEffect, useState, useCallback, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Upload, FileText, Image, Film, Music, File, Trash2, X, Shield,
  Plus, Mic, MicOff, Check, ChevronDown, ChevronUp, AlertCircle, Play, Pause
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type EvidenceCategory = "photo" | "video" | "audio" | "document" | "other"

interface EvidenceItem {
  id: string; file: File; localUrl: string; category: EvidenceCategory
  name: string; size: number; description: string; relevance: string
  uploadedAt: string; saved: boolean; isRecording?: boolean
}

const CATEGORY_OPTIONS: { value: EvidenceCategory; label: string; icon: typeof File; desc: string; accept: string }[] = [
  { value: "photo", label: "Photo / Screenshot", icon: Image, desc: "Screenshots, photos of injuries, locations, or incidents", accept: "image/*" },
  { value: "video", label: "Video Recording", icon: Film, desc: "Video evidence of incidents or surroundings", accept: "video/*" },
  { value: "audio", label: "Voice Recording", icon: Music, desc: "Audio recordings, voicemails, or phone calls", accept: "audio/*" },
  { value: "document", label: "Document / PDF", icon: FileText, desc: "Messages, emails, reports, or medical records", accept: ".pdf,.doc,.docx,.txt,.png,.jpg" },
  { value: "other", label: "Other File", icon: File, desc: "Any other relevant file", accept: "*" },
]

const RELEVANCE_OPTIONS = [
  "This shows the incident itself",
  "This is a communication from the person involved",
  "This documents the impact on me",
  "This shows I reported the incident",
  "This is a witness statement or contact",
  "This is medical evidence",
  "This is a financial record",
  "Other reason",
]

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

function getCategoryFromMime(type: string): EvidenceCategory {
  if (type.startsWith("image/")) return "photo"
  if (type.startsWith("video/")) return "video"
  if (type.startsWith("audio/")) return "audio"
  if (type.includes("pdf") || type.includes("document") || type.includes("text") || type.includes("word")) return "document"
  return "other"
}

function EvidenceCard({ item, onUpdate, onDelete, onSave }: {
  item: EvidenceItem
  onUpdate: (id: string, updates: Partial<EvidenceItem>) => void
  onDelete: (id: string) => void
  onSave: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(!item.saved)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const CategoryIcon = CATEGORY_OPTIONS.find(c => c.value === item.category)?.icon || File
  const isImage = item.category === "photo"
  const isAudio = item.category === "audio"
  const isVideo = item.category === "video"
  const canSave = item.description.trim().length > 5 && item.relevance.length > 0
  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false) }
    else { audioRef.current.play(); setIsPlaying(true) }
  }

  return (
    <motion.div layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl overflow-hidden evidence-card"
      style={{ borderColor: item.saved ? 'color-mix(in srgb, #34d399 25%, transparent)' : undefined }}
    >
      <div className="flex items-center gap-3 p-4">
        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 flex items-center justify-center bg-secondary border border-border">
          {isImage ? (
            <img src={item.localUrl} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <CategoryIcon className="w-7 h-7 text-primary/60" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-primary/10 text-primary">
              {CATEGORY_OPTIONS.find(c => c.value === item.category)?.label}
            </span>
            <span className="text-[10px] text-muted-foreground">{formatSize(item.size)}</span>
            {item.saved && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-500">
                <Check className="w-3 h-3" /> Saved
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button onClick={() => onDelete(item.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-4 border-t border-border/50">
              {isAudio && (
                <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/15">
                  <audio ref={audioRef} src={item.localUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
                  <button onClick={togglePlay} className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/15 hover:bg-primary/25 transition-all">
                    {isPlaying ? <Pause className="w-4 h-4 text-primary" /> : <Play className="w-4 h-4 text-primary" />}
                  </button>
                  <div>
                    <p className="text-xs text-muted-foreground">Audio preview</p>
                    <p className="text-[10px] text-muted-foreground/60">{formatSize(item.size)}</p>
                  </div>
                </div>
              )}
              {isVideo && (
                <div className="mt-4 rounded-xl overflow-hidden border border-border">
                  <video src={item.localUrl} controls className="w-full max-h-40 object-contain bg-black" />
                </div>
              )}
              <div className="mt-4">
                <label className="text-xs text-muted-foreground block mb-1.5">What is this? <span className="text-red-500">*</span></label>
                <textarea value={item.description} onChange={e => onUpdate(item.id, { description: e.target.value })}
                  placeholder="Describe what this file shows or contains…" rows={2}
                  className="w-full px-3 py-2.5 rounded-xl text-sm resize-none outline-none focus:ring-1 focus:ring-primary/50 input-surface" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Why is this relevant to your case? <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-2">
                  {RELEVANCE_OPTIONS.map(opt => (
                    <button key={opt} onClick={() => onUpdate(item.id, { relevance: opt })}
                      className={`text-xs px-3 py-1.5 rounded-full transition-all border ${item.relevance === opt
                        ? "bg-primary/15 border-primary/35 text-primary"
                        : "bg-secondary border-border text-muted-foreground hover:text-foreground"}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                {!canSave && (
                  <p className="text-xs text-amber-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Add a description and relevance to save
                  </p>
                )}
                <button onClick={() => { onSave(item.id); setExpanded(false) }} disabled={!canSave}
                  className="ml-auto flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <Check className="w-4 h-4" /> Add to vault
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function VoiceRecorder({ onRecorded }: { onRecorded: (file: File) => void }) {
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [visualizer, setVisualizer] = useState<number[]>(new Array(16).fill(0))
  const mrRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const animRef = useRef<number | null>(null)
  const analyzerRef = useRef<AnalyserNode | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioCtx = new AudioContext()
      audioCtxRef.current = audioCtx
      const source = audioCtx.createMediaStreamSource(stream)
      const analyzer = audioCtx.createAnalyser()
      analyzer.fftSize = 64
      source.connect(analyzer)
      analyzerRef.current = analyzer
      const animate = () => {
        const d = new Uint8Array(analyzer.frequencyBinCount)
        analyzer.getByteFrequencyData(d)
        setVisualizer(Array.from(d.slice(0, 16)).map(v => v / 255))
        animRef.current = requestAnimationFrame(animate)
      }
      animate()
      chunksRef.current = []
      const mr = new MediaRecorder(stream)
      mrRef.current = mr
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const file = new (File as any)([blob], `voice-recording-${Date.now()}.webm`, { type: 'audio/webm' }) as File
        onRecorded(file)
        stream.getTracks().forEach(t => t.stop())
        if (animRef.current) cancelAnimationFrame(animRef.current)
        audioCtx.close()
        setVisualizer(new Array(16).fill(0))
      }
      mr.start()
      setIsRecording(true)
      setDuration(0)
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000)
    } catch {
      alert("Microphone access is needed to record audio evidence.")
    }
  }

  const stop = () => {
    mrRef.current?.stop()
    if (timerRef.current) clearInterval(timerRef.current)
    setIsRecording(false)
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`

  return (
    <div className={`flex items-center gap-4 p-4 rounded-2xl recorder-bar ${isRecording ? 'recording' : ''}`}>
      <button onClick={isRecording ? stop : start}
        className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-all border-2 ${
          isRecording ? "bg-red-500/20 border-red-500/40" : "bg-primary/15 border-primary/35 hover:bg-primary/25"
        }`}>
        {isRecording ? <MicOff className="w-6 h-6 text-red-500" /> : <Mic className="w-6 h-6 text-primary" />}
      </button>
      <div className="flex-1">
        {isRecording ? (
          <>
            <div className="flex items-end gap-0.5 h-8 mb-1">
              {visualizer.map((v, i) => (
                <motion.div key={i} className="w-1.5 rounded-full bg-red-500"
                  animate={{ height: `${Math.max(4, v * 32)}px` }}
                  transition={{ duration: 0.08 }} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Recording: <span className="text-red-500 font-mono">{fmt(duration)}</span></p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">Click stop when done — it'll be added to your vault</p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-foreground">Record a voice note</p>
            <p className="text-xs text-muted-foreground mt-0.5">Describe what happened in your own words — audio is encrypted</p>
          </>
        )}
      </div>
    </div>
  )
}

function EvidenceContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session")
  const supabase = createClient()
  const [items, setItems] = useState<EvidenceItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [activeCategory, setActiveCategory] = useState<EvidenceCategory | "all">("all")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((files: File[]) => {
    const newItems: EvidenceItem[] = files.map(f => ({
      id: crypto.randomUUID(), file: f, localUrl: URL.createObjectURL(f),
      category: getCategoryFromMime(f.type), name: f.name, size: f.size,
      description: "", relevance: "", uploadedAt: new Date().toISOString(), saved: false,
    }))
    setItems(prev => [...newItems, ...prev])
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      if (!sessionId) return
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data } = await supabase.from("evidence").select("*").eq("session_id", sessionId).eq("user_id", user.id).order("uploaded_at", { ascending: false })
        if (data && data.length > 0) {
          const restoredItems: EvidenceItem[] = data.map(row => {
            const parts = (row.description || "").split(" | Relevance: ")
            return {
              id: row.id, file: new (File as any)([], row.file_name, { type: row.file_type }),
              localUrl: row.file_url, category: getCategoryFromMime(row.file_type),
              name: row.file_name, size: row.file_size || 0, description: parts[0] || "",
              relevance: parts[1] || "", uploadedAt: row.uploaded_at || new Date().toISOString(), saved: true
            }
          })
          setItems(restoredItems)
        }
      } catch (error) { console.error("Error loading evidence:", error) }
    }
    fetchData()
  }, [sessionId, supabase])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false); addFiles(Array.from(e.dataTransfer.files))
  }, [addFiles])

  const updateItem = useCallback((id: string, updates: Partial<EvidenceItem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i))
  }, [])

  const deleteItem = useCallback((id: string) => { setItems(prev => prev.filter(i => i.id !== id)) }, [])

  const saveItem = useCallback(async (id: string) => {
    const item = items.find(i => i.id === id)
    if (!item || !sessionId) return
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      let finalUrl = item.localUrl
      if (item.file.size > 0) {
        const filePath = `${user.id}/${sessionId}/${item.id}-${item.file.name}`
        const { error: uploadError } = await supabase.storage.from("evidence").upload(filePath, item.file)
        if (!uploadError) {
          const { data: signedData } = await supabase.storage.from("evidence").createSignedUrl(filePath, 60 * 60 * 24 * 30)
          if (signedData?.signedUrl) { finalUrl = signedData.signedUrl; updateItem(id, { localUrl: finalUrl }) }
          else finalUrl = filePath
        }
      }
      await supabase.from("evidence").insert({
        id: item.id, file_name: item.name, file_type: item.file.type, file_size: item.size,
        file_url: finalUrl, description: `${item.description} | Relevance: ${item.relevance}`,
        session_id: sessionId, user_id: user.id,
      })
      updateItem(id, { saved: true })
    } catch (e) { console.error("Save error:", e) }
  }, [items, sessionId, supabase, updateItem])

  const filtered = activeCategory === "all" ? items : items.filter(i => i.category === activeCategory)
  const savedCount = items.filter(i => i.saved).length

  return (
    <div className="page-surface p-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary/12 border border-primary/25">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Evidence Vault</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Upload, describe, and securely store supporting evidence</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl w-fit bg-emerald-500/7 border border-emerald-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-xs text-emerald-600 dark:text-emerald-400">All uploads are encrypted and stored only on this device</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-6">
        <VoiceRecorder onRecorded={(f) => addFiles([f])} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className={`relative mb-6 p-8 rounded-2xl text-center cursor-pointer transition-all duration-200 drop-zone ${isDragging ? 'is-dragging scale-[1.02]' : ''}`}
        onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" multiple className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          onChange={e => { if (e.target.files) addFiles(Array.from(e.target.files)) }} />
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all bg-primary/10 border border-primary/20 ${isDragging ? "scale-110" : ""}`}>
          <Upload className={`w-7 h-7 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">{isDragging ? "Drop files here" : "Drag & drop or click to browse"}</p>
        <p className="text-xs text-muted-foreground">Photos, videos, audio, PDFs, documents — any file up to 50MB</p>
        <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
          {CATEGORY_OPTIONS.map(cat => {
            const Icon = cat.icon
            return (
              <span key={cat.value} className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-secondary text-muted-foreground border border-border">
                <Icon className="w-3 h-3" /> {cat.label}
              </span>
            )
          })}
        </div>
      </motion.div>

      {items.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 mb-5 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{items.length} file{items.length !== 1 ? "s" : ""}</span>
            {savedCount > 0 && <span className="text-xs px-2 py-0.5 rounded-full text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">{savedCount} saved</span>}
            {items.length - savedCount > 0 && <span className="text-xs px-2 py-0.5 rounded-full text-amber-600 dark:text-amber-400 bg-amber-500/8 border border-amber-500/20">{items.length - savedCount} need description</span>}
          </div>
          <div className="ml-auto flex gap-1 p-1 rounded-full bg-secondary border border-border">
            {(["all", ...CATEGORY_OPTIONS.map(c => c.value)] as (EvidenceCategory | "all")[]).map(cat => {
              const count = cat === "all" ? items.length : items.filter(i => i.category === cat).length
              if (cat !== "all" && count === 0) return null
              return (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all capitalize ${activeCategory === cat ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                  {cat === "all" ? `All (${count})` : `${cat} (${count})`}
                </button>
              )
            })}
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="popLayout">
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map(item => (
              <EvidenceCard key={item.id} item={item} onUpdate={updateItem} onDelete={deleteItem} onSave={saveItem} />
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-primary/6 border border-primary/12">
              <Shield className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">Your evidence vault is empty</p>
            <p className="text-muted-foreground/60 text-xs mt-1">Upload files or record a voice note to get started</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="mt-8 p-4 rounded-xl flex items-start gap-3 bg-primary/4 border border-primary/10">
        <Shield className="w-4 h-4 text-primary/60 mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="text-foreground font-medium">Evidence is handled with care.</span>{" "}
          Files stay in your browser's local storage and are never sent to external servers without your explicit consent.
          Your description of each file helps create a stronger legal record.
        </p>
      </motion.div>
    </div>
  )
}

export default function EvidencePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <EvidenceContent />
    </Suspense>
  )
}
