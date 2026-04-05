"use client"

import { useEffect, useState, useCallback, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Upload, FileText, Image, Film, Music, File, Trash2, X, Shield,
  Plus, Mic, MicOff, Check, ChevronDown, ChevronUp, AlertCircle, Play, Pause
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

// ===== TYPES =====
type EvidenceCategory = "photo" | "video" | "audio" | "document" | "other"

interface EvidenceItem {
  id: string
  file: File
  localUrl: string
  category: EvidenceCategory
  name: string
  size: number
  description: string
  relevance: string
  uploadedAt: string
  saved: boolean
  isRecording?: boolean
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

// ===== UPLOAD CARD =====
function EvidenceCard({
  item,
  onUpdate,
  onDelete,
  onSave,
}: {
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
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(13,18,37,0.7)', border: `1px solid ${item.saved ? 'rgba(52,211,153,0.25)' : 'rgba(129,140,248,0.2)'}`, backdropFilter: 'blur(12px)' }}
    >
      {/* Card Header */}
      <div className="flex items-center gap-3 p-4">
        {/* Preview thumbnail */}
        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {isImage ? (
            <img src={item.localUrl} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <CategoryIcon className="w-7 h-7 text-[#818cf8]/60" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white/85 truncate">{item.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'rgba(129,140,248,0.12)', color: '#818cf8' }}>
              {CATEGORY_OPTIONS.find(c => c.value === item.category)?.label}
            </span>
            <span className="text-[10px] text-white/30">{formatSize(item.size)}</span>
            {item.saved && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                <Check className="w-3 h-3" /> Saved
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/70 transition-colors">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button onClick={() => onDelete(item.id)}
            className="p-1.5 rounded-lg text-white/20 hover:text-red-400 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded form */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              {/* Audio player */}
              {isAudio && (
                <div className="mt-4 flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.1)' }}>
                  <audio ref={audioRef} src={item.localUrl} onEnded={() => setIsPlaying(false)} className="hidden" />
                  <button onClick={togglePlay}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:opacity-80"
                    style={{ background: 'rgba(129,140,248,0.2)' }}>
                    {isPlaying ? <Pause className="w-4 h-4 text-[#818cf8]" /> : <Play className="w-4 h-4 text-[#818cf8]" />}
                  </button>
                  <div>
                    <p className="text-xs text-white/50">Audio preview</p>
                    <p className="text-[10px] text-white/25">{formatSize(item.size)}</p>
                  </div>
                </div>
              )}

              {/* Video preview */}
              {isVideo && (
                <div className="mt-4 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                  <video src={item.localUrl} controls className="w-full max-h-40 object-contain bg-black" />
                </div>
              )}

              {/* Description */}
              <div className="mt-4">
                <label className="text-xs text-white/40 block mb-1.5">
                  What is this? <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={item.description}
                  onChange={e => onUpdate(item.id, { description: e.target.value })}
                  placeholder="Describe what this file shows or contains…"
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white/80 placeholder:text-white/20 resize-none outline-none focus:ring-1"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
              </div>

              {/* Relevance */}
              <div>
                <label className="text-xs text-white/40 block mb-1.5">
                  Why is this relevant to your case? <span className="text-red-400">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {RELEVANCE_OPTIONS.map(opt => (
                    <button key={opt}
                      onClick={() => onUpdate(item.id, { relevance: opt })}
                      className={`text-xs px-3 py-1.5 rounded-full transition-all ${item.relevance === opt ? "text-[#818cf8]" : "text-white/35 hover:text-white/60"}`}
                      style={{
                        background: item.relevance === opt ? 'rgba(129,140,248,0.15)' : 'rgba(255,255,255,0.04)',
                        border: item.relevance === opt ? '1px solid rgba(129,140,248,0.35)' : '1px solid rgba(255,255,255,0.08)',
                      }}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save button */}
              <div className="flex items-center justify-between pt-1">
                {!canSave && (
                  <p className="text-xs text-amber-400/70 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Add a description and relevance to save
                  </p>
                )}
                <button
                  onClick={() => { onSave(item.id); setExpanded(false) }}
                  disabled={!canSave}
                  className="ml-auto flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-30"
                  style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }}>
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

// ===== LIVE VOICE RECORDER =====
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
    <div className="flex items-center gap-4 p-4 rounded-2xl"
      style={{ background: isRecording ? 'rgba(239,68,68,0.06)' : 'rgba(129,140,248,0.06)', border: `1px solid ${isRecording ? 'rgba(239,68,68,0.2)' : 'rgba(129,140,248,0.15)'}` }}>
      <button onClick={isRecording ? stop : start}
        className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-all ${isRecording ? "bg-red-500/20" : "bg-[#818cf8]/15 hover:bg-[#818cf8]/25"}`}
        style={{ border: `2px solid ${isRecording ? 'rgba(239,68,68,0.4)' : 'rgba(129,140,248,0.35)'}` }}>
        {isRecording
          ? <MicOff className="w-6 h-6 text-red-400" />
          : <Mic className="w-6 h-6 text-[#818cf8]" />}
      </button>

      <div className="flex-1">
        {isRecording ? (
          <>
            <div className="flex items-end gap-0.5 h-8 mb-1">
              {visualizer.map((v, i) => (
                <motion.div key={i} className="w-1.5 rounded-full bg-red-400"
                  animate={{ height: `${Math.max(4, v * 32)}px` }}
                  transition={{ duration: 0.08 }} />
              ))}
            </div>
            <p className="text-xs text-white/50">Recording: <span className="text-red-400 font-mono">{fmt(duration)}</span></p>
            <p className="text-[10px] text-white/25 mt-0.5">Click stop when done — it'll be added to your vault</p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-white/70">Record a voice note</p>
            <p className="text-xs text-white/30 mt-0.5">Describe what happened in your own words — audio is encrypted</p>
          </>
        )}
      </div>
    </div>
  )
}

// ===== MAIN PAGE =====
function EvidenceContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session")
  const supabase = createClient()

  const [items, setItems] = useState<EvidenceItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [activeCategory, setActiveCategory] = useState<EvidenceCategory | "all">("all")
  const [uploadCategory, setUploadCategory] = useState<EvidenceCategory>("photo")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((files: File[]) => {
    const newItems: EvidenceItem[] = files.map(f => ({
      id: crypto.randomUUID(),
      file: f,
      localUrl: URL.createObjectURL(f),
      category: getCategoryFromMime(f.type),
      name: f.name,
      size: f.size,
      description: "",
      relevance: "",
      uploadedAt: new Date().toISOString(),
      saved: false,
    }))
    setItems(prev => [...newItems, ...prev])
  }, [])

  // Load existing evidence from Supabase
  useEffect(() => {
    const fetchData = async () => {
      if (!sessionId) return
      
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        
        const { data, error } = await supabase
          .from("evidence")
          .select("*")
          .eq("session_id", sessionId)
          .eq("user_id", user.id)
          .order("uploaded_at", { ascending: false })
          
        if (data && data.length > 0) {
          const restoredItems: EvidenceItem[] = data.map(row => {
            const parts = (row.description || "").split(" | Relevance: ")
            const desc = parts[0] || ""
            const rel = parts[1] || ""

            return {
              id: row.id,
              // We create a dummy File just so item.file.type is populated correctly for the UI.
              file: new (File as any)([], row.file_name, { type: row.file_type }),
              localUrl: row.file_url,
              category: getCategoryFromMime(row.file_type),
              name: row.file_name,
              size: row.file_size || 0,
              description: desc,
              relevance: rel,
              uploadedAt: row.uploaded_at || new Date().toISOString(),
              saved: true
            }
          })
          
          setItems(restoredItems)
        }
      } catch (error) {
        console.error("Error loading evidence:", error)
      }
    }
    
    fetchData()
  }, [sessionId, supabase])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    addFiles(Array.from(e.dataTransfer.files))
  }, [addFiles])

  const updateItem = useCallback((id: string, updates: Partial<EvidenceItem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i))
  }, [])

  const deleteItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const saveItem = useCallback(async (id: string) => {
    const item = items.find(i => i.id === id)
    if (!item || !sessionId) return
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      let finalUrl = item.localUrl

      // Only attempt upload if it's a real file (not a dummy empty file restoring state)
      if (item.file.size > 0) {
        const filePath = `${user.id}/${sessionId}/${item.id}-${item.file.name}`
        
        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from("evidence")
          .upload(filePath, item.file)
          
        if (uploadError) {
          console.error("Storage upload error:", uploadError)
        } else {
          // Generate a signed URL for immediate viewing and to save safely in the DB
          const { data: signedData } = await supabase.storage
            .from("evidence")
            .createSignedUrl(filePath, 60 * 60 * 24 * 30) // valid for 30 days
            
          if (signedData?.signedUrl) {
            finalUrl = signedData.signedUrl
            // Also update the local state URL so it doesn't break right after saving
            updateItem(id, { localUrl: finalUrl })
          } else {
            // fallback to store the path if signedUrl fails
            finalUrl = filePath
          }
        }
      }

      await supabase.from("evidence").insert({
        id: item.id,
        file_name: item.name,
        file_type: item.file.type,
        file_size: item.size,
        file_url: finalUrl,
        description: `${item.description} | Relevance: ${item.relevance}`,
        session_id: sessionId,
        user_id: user.id,
      })
      updateItem(id, { saved: true })
    } catch (e) {
      console.error("Save error:", e)
    }
  }, [items, sessionId, supabase, updateItem])

  const filtered = activeCategory === "all" ? items : items.filter(i => i.category === activeCategory)
  const savedCount = items.filter(i => i.saved).length

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.25)' }}>
            <Shield className="w-6 h-6 text-[#818cf8]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white/95">Evidence Vault</h1>
            <p className="text-sm text-white/40 mt-0.5">Upload, describe, and securely store supporting evidence</p>
          </div>
        </div>
        {/* Security badge */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl w-fit"
          style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.15)' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <p className="text-xs text-emerald-400/80">All uploads are encrypted and stored only on this device</p>
        </div>
      </motion.div>

      {/* Voice recorder */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-6">
        <VoiceRecorder onRecorded={(f) => addFiles([f])} />
      </motion.div>

      {/* Drop zone */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className={`relative mb-6 p-8 rounded-2xl border-2 border-dashed transition-all duration-200 text-center cursor-pointer ${isDragging ? "scale-[1.02]" : "hover:border-[#818cf8]/40"}`}
        style={{
          background: isDragging ? 'rgba(129,140,248,0.08)' : 'rgba(255,255,255,0.02)',
          borderColor: isDragging ? 'rgba(129,140,248,0.5)' : 'rgba(255,255,255,0.1)',
        }}
        onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          onChange={e => { if (e.target.files) addFiles(Array.from(e.target.files)) }}
        />
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all ${isDragging ? "scale-110" : ""}`}
          style={{ background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.2)' }}>
          <Upload className={`w-7 h-7 ${isDragging ? "text-[#818cf8]" : "text-white/40"}`} />
        </div>
        <p className="text-sm font-medium text-white/70 mb-1">{isDragging ? "Drop files here" : "Drag & drop or click to browse"}</p>
        <p className="text-xs text-white/30">Photos, videos, audio, PDFs, documents — any file up to 50MB</p>

        {/* File type quick buttons */}
        <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
          {CATEGORY_OPTIONS.map(cat => {
            const Icon = cat.icon
            return (
              <span key={cat.value} className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Icon className="w-3 h-3" /> {cat.label}
              </span>
            )
          })}
        </div>
      </motion.div>

      {/* Stats bar */}
      {items.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 mb-5 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/50">{items.length} file{items.length !== 1 ? "s" : ""}</span>
            {savedCount > 0 && <span className="text-xs px-2 py-0.5 rounded-full text-emerald-400" style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>{savedCount} saved</span>}
            {items.length - savedCount > 0 && <span className="text-xs px-2 py-0.5 rounded-full text-amber-400" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>{items.length - savedCount} need description</span>}
          </div>

          {/* Filter tabs */}
          <div className="ml-auto flex gap-1 p-1 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {(["all", ...CATEGORY_OPTIONS.map(c => c.value)] as (EvidenceCategory | "all")[]).map(cat => {
              const count = cat === "all" ? items.length : items.filter(i => i.category === cat).length
              if (cat !== "all" && count === 0) return null
              return (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all capitalize ${activeCategory === cat ? "text-[#818cf8]" : "text-white/30 hover:text-white/60"}`}
                  style={activeCategory === cat ? { background: 'rgba(129,140,248,0.15)' } : {}}>
                  {cat === "all" ? `All (${count})` : `${cat} (${count})`}
                </button>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Evidence list */}
      <AnimatePresence mode="popLayout">
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map(item => (
              <EvidenceCard key={item.id} item={item} onUpdate={updateItem} onDelete={deleteItem} onSave={saveItem} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.12)' }}>
              <Shield className="w-8 h-8 text-white/20" />
            </div>
            <p className="text-white/30 text-sm">Your evidence vault is empty</p>
            <p className="text-white/20 text-xs mt-1">Upload files or record a voice note to get started</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Encryption note */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="mt-8 p-4 rounded-xl flex items-start gap-3"
        style={{ background: 'rgba(129,140,248,0.04)', border: '1px solid rgba(129,140,248,0.1)' }}>
        <Shield className="w-4 h-4 text-[#818cf8]/60 mt-0.5 shrink-0" />
        <p className="text-xs text-white/30 leading-relaxed">
          <span className="text-white/50 font-medium">Evidence is handled with care.</span>{" "}
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
        <div className="w-10 h-10 border-2 border-[#818cf8] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <EvidenceContent />
    </Suspense>
  )
}
