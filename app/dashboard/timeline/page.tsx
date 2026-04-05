"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import { 
  Clock, 
  Sparkles, 
  Calendar,
  GripVertical,
  Edit3,
  Trash2,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Plus,
  Wand2,
  RefreshCw,
  Shield
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Tables } from "@/lib/database.types"

type TimelineEvent = {
  id: string
  content: string
  estimatedDate?: string
  confidence: "high" | "medium" | "low"
  linkedEvidence?: string[]
  createdAt: string
}

type Fragment = {
  id: string
  content: string
  timestamp: string
}

const confidenceColors = {
  high: "from-emerald-500 to-teal-400",
  medium: "from-amber-400 to-orange-400",
  low: "from-rose-400 to-red-500"
}

const confidenceIcons = {
  high: CheckCircle,
  medium: HelpCircle,
  low: AlertCircle
}

function TimelineContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session")
  const supabase = createClient()
  
  const [fragments, setFragments] = useState<Fragment[]>([])
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [editingEvent, setEditingEvent] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [editDate, setEditDate] = useState("")
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [newEventContent, setNewEventContent] = useState("")
  const [newEventDate, setNewEventDate] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      if (!sessionId) {
        setIsLoading(false)
        return
      }
      
      try {
        const { data: testimonies } = await supabase
          .from("testimonies")
          .select("*")
          .eq("session_id", sessionId)
          .in("step_type", ["story", "chat_user"])
          .order("created_at", { ascending: true })

        if (testimonies) {
          setFragments(testimonies.map(t => ({
            id: t.id,
            content: t.content || "",
            timestamp: t.created_at || new Date().toISOString()
          })))
        }

        const { data: events } = await supabase
          .from("timeline_events")
          .select("*")
          .eq("session_id", sessionId)
          .order("sort_order", { ascending: true })

        if (events) {
          setTimeline(events.map(e => ({
            id: e.id,
            content: e.description || e.title,
            estimatedDate: e.approximate_date || e.title,
            confidence: (e.confidence_level as "high" | "medium" | "low") || "medium",
            linkedEvidence: [],
            createdAt: e.created_at || new Date().toISOString()
          })))
        }
      } catch (error) {
        console.error("Error fetching timeline data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [sessionId, supabase])

  const saveTimelineEvent = async (event: TimelineEvent, sortOrder: number) => {
    if (!sessionId) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      await supabase.from("timeline_events").upsert({
        id: event.id,
        session_id: sessionId,
        user_id: user.id,
        title: event.estimatedDate || "Untitled",
        description: event.content,
        approximate_date: event.estimatedDate,
        confidence_level: event.confidence,
        sort_order: sortOrder
      })
    } catch (error) {
      console.error("Error saving timeline event:", error)
    }
  }

  const saveAllTimelineEvents = async (events: TimelineEvent[]) => {
    if (!sessionId) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      await supabase.from("timeline_events").delete().eq("session_id", sessionId)
      
      if (events.length > 0) {
        await supabase.from("timeline_events").insert(
          events.map((event, index) => ({
            id: event.id,
            session_id: sessionId,
            user_id: user.id,
            title: event.estimatedDate || "Untitled",
            description: event.content,
            approximate_date: event.estimatedDate,
            confidence_level: event.confidence,
            sort_order: index
          }))
        )
      }
    } catch (error) {
      console.error("Error saving timeline events:", error)
    }
  }

  const generateTimeline = async () => {
    if (fragments.length === 0) return
    setIsGenerating(true)
    
    try {
      const { data: evidenceRows } = await supabase
        .from("evidence")
        .select("id, file_name, file_type, description")
        .eq("session_id", sessionId!)

      const evidence = (evidenceRows || []).map(e => ({
        id: e.id,
        name: e.file_name,
        type: e.file_type,
        description: e.description || undefined,
      }))

      const res = await fetch("/api/structure-engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fragments: fragments.map(f => ({
            id: f.id,
            content: f.content,
            timestamp: f.timestamp,
            type: "text",
          })),
          evidence,
          sessionId,
        }),
      })

      if (!res.ok) throw new Error("Structure Engine failed")
      const structured = await res.json()

      const events: TimelineEvent[] = (structured.timeline_events || []).map(
        (evt: any, i: number) => ({
          id: crypto.randomUUID(),
          content: evt.description || evt.title,
          estimatedDate: evt.date_raw !== "unknown" ? evt.date_raw : (evt.date_estimated !== "unknown" ? evt.date_estimated : `Event ${i + 1}`),
          confidence: evt.confidence || "medium",
          linkedEvidence: evt.evidence_referenced || [],
          createdAt: new Date().toISOString(),
        })
      )

      setTimeline(events)
      await saveAllTimelineEvents(events)

      if (sessionId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from("sessions").update({
            description: JSON.stringify({
              structured_analysis: {
                case_summary: structured.case_summary,
                incident_type: structured.incident_type,
                severity_assessment: structured.severity_assessment,
                entities: structured.entities,
                pattern_analysis: structured.pattern_analysis,
                impact_assessment: structured.impact_assessment,
                reporting_history: structured.reporting_history,
                legal_strength: structured.legal_strength,
                gaps_and_clarifications: structured.gaps_and_clarifications,
                evidence_map: structured.evidence_map,
              },
            }),
          }).eq("id", sessionId)
        }
      }
    } catch (error) {
      console.error("Structure Engine error:", error)
      const events: TimelineEvent[] = fragments.map((fragment, index) => ({
        id: crypto.randomUUID(),
        content: fragment.content,
        estimatedDate: `Event ${index + 1}`,
        confidence: "low" as const,
        createdAt: new Date().toISOString(),
      }))
      setTimeline(events)
      await saveAllTimelineEvents(events)
    } finally {
      setIsGenerating(false)
    }
  }

  const updateEvent = async (eventId: string) => {
    const updatedTimeline = timeline.map(event => 
      event.id === eventId 
        ? { ...event, content: editContent, estimatedDate: editDate }
        : event
    )
    const updatedEvent = updatedTimeline.find(e => e.id === eventId)
    const index = updatedTimeline.findIndex(e => e.id === eventId)
    
    setTimeline(updatedTimeline)
    if (updatedEvent) {
      await saveTimelineEvent(updatedEvent, index)
    }
    setEditingEvent(null)
    setEditContent("")
    setEditDate("")
  }

  const deleteEvent = async (eventId: string) => {
    try {
      await supabase.from("timeline_events").delete().eq("id", eventId)
    } catch (error) {
      console.error("Error deleting timeline event:", error)
    }
    const updatedTimeline = timeline.filter(event => event.id !== eventId)
    setTimeline(updatedTimeline)
  }

  const addEvent = async () => {
    if (!newEventContent.trim()) return
    
    const newEvent: TimelineEvent = {
      id: crypto.randomUUID(),
      content: newEventContent.trim(),
      estimatedDate: newEventDate || "Date unknown",
      confidence: "medium",
      createdAt: new Date().toISOString()
    }
    
    const updatedTimeline = [...timeline, newEvent]
    setTimeline(updatedTimeline)
    await saveTimelineEvent(newEvent, updatedTimeline.length - 1)
    setNewEventContent("")
    setNewEventDate("")
    setShowAddEvent(false)
  }

  const handleReorder = async (newOrder: TimelineEvent[]) => {
    setTimeline(newOrder)
    await saveAllTimelineEvents(newOrder)
  }

  const startEdit = (event: TimelineEvent) => {
    setEditingEvent(event.id)
    setEditContent(event.content)
    setEditDate(event.estimatedDate || "")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#818cf8] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 md:p-8 w-full max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.25)' }}>
            <Clock className="w-6 h-6 text-[#818cf8]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white/95">AI Timeline Builder</h1>
            <p className="text-sm text-white/40 mt-0.5">Organize your memories chronologically</p>
          </div>
        </div>
      </motion.div>

      {/* AI Generation section */}
      {fragments.length > 0 && timeline.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 p-8 rounded-2xl text-center border transition-all"
          style={{ background: 'rgba(13,18,37,0.7)', borderColor: 'rgba(129,140,248,0.2)', backdropFilter: 'blur(20px)' }}
        >
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.25)' }}>
            <Wand2 className="w-8 h-8 text-[#818cf8]" />
          </div>
          <h2 className="text-xl font-bold mb-3 text-white">AI Structure Engine</h2>
          <p className="text-white/50 mb-8 max-w-md mx-auto text-sm leading-relaxed">
            Our AI will analyze your {fragments.length} fragment(s), extract entities, dates, 
            locations, and evidence — then organize everything into a structured legal timeline.
          </p>
          <button 
            onClick={generateTimeline}
            disabled={isGenerating}
            className="flex items-center justify-center mx-auto gap-2 px-8 py-3.5 rounded-full text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50 text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Structuring testimony…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Run Structure Engine
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* Empty state */}
      {fragments.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-12 rounded-2xl text-center"
          style={{ background: 'rgba(13,18,37,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <Clock className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2 text-white/80">No Fragments Yet</h2>
          <p className="text-white/40 text-sm max-w-sm mx-auto">
            Start by sharing your story in the Testimony section. Your fragments will automatically be transformed into a timeline here.
          </p>
        </motion.div>
      )}

      {/* Timeline */}
      {timeline.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white/90">
              Timeline <span className="text-[#818cf8] ml-1">({timeline.length})</span>
            </h2>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowAddEvent(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-[#818cf8] hover:bg-[#818cf8]/10 transition-colors"
                style={{ border: '1px solid rgba(129,140,248,0.3)' }}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Event
              </button>
              <button 
                onClick={generateTimeline}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white/50 hover:text-white/80 transition-colors disabled:opacity-50"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
                Regenerate
              </button>
            </div>
          </div>

          {/* Add event modal */}
          <AnimatePresence>
            {showAddEvent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8 overflow-hidden"
              >
                <div className="p-6 rounded-2xl" style={{ background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.2)' }}>
                  <h3 className="text-sm font-semibold mb-4 text-white/90 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-[#818cf8]" /> Add New Event
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-white/40 block mb-1.5">Date/Time</label>
                      <input
                        placeholder="e.g., Early 2023, Summer, Around noon"
                        value={newEventDate}
                        onChange={(e) => setNewEventDate(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-white/80 placeholder:text-white/20 focus:border-[#818cf8]/40 rounded-xl px-4 py-2.5 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/40 block mb-1.5">What happened?</label>
                      <textarea
                        placeholder="Describe the event..."
                        value={newEventContent}
                        onChange={(e) => setNewEventContent(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-white/80 placeholder:text-white/20 focus:border-[#818cf8]/40 rounded-xl px-4 py-2.5 text-sm outline-none resize-none min-h-[100px]"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <button onClick={addEvent} disabled={!newEventContent.trim()} className="px-5 py-2 rounded-full text-xs font-semibold bg-[#818cf8] text-white disabled:opacity-50">
                        Save to Timeline
                      </button>
                      <button onClick={() => setShowAddEvent(false)} className="px-5 py-2 rounded-full text-xs font-medium text-white/40 hover:text-white/80 border border-transparent">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Timeline events */}
          <div className="relative pl-2">
            {/* Vertical line connecting events */}
            <div className="absolute left-6 top-6 bottom-6 w-px" style={{ background: 'linear-gradient(to bottom, rgba(129,140,248,0.4), rgba(52,211,153,0.2))' }} />

            <Reorder.Group 
              values={timeline} 
              onReorder={handleReorder}
              className="space-y-5"
            >
              {timeline.map((event, index) => {
                const ConfidenceIcon = confidenceIcons[event.confidence]
                return (
                  <Reorder.Item 
                    key={event.id} 
                    value={event}
                    className="relative"
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="ml-12 group"
                    >
                      {/* Animated Pulse Dot */}
                      <div className="absolute left-4 w-4 h-4 rounded-full -translate-x-1/2 mt-5">
                        <div className={`absolute inset-0 rounded-full blur-[6px] bg-gradient-to-br ${confidenceColors[event.confidence]} opacity-40`} />
                        <div className={`absolute inset-0 rounded-full border-[3px] border-[#080C1A] bg-gradient-to-br ${confidenceColors[event.confidence]}`} />
                      </div>

                      {/* Event Card */}
                      <div className="p-5 rounded-2xl transition-all duration-300" 
                        style={{ 
                          background: 'rgba(255,255,255,0.02)', 
                          border: '1px solid rgba(255,255,255,0.06)', 
                          backdropFilter: 'blur(10px)' 
                        }}
                      >
                        {editingEvent === event.id ? (
                          <div className="space-y-3">
                            <input
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              placeholder="Date/Time"
                              className="w-full bg-black/40 border border-white/10 text-white/90 rounded-xl px-3 py-2 text-sm outline-none"
                            />
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 text-white/90 rounded-xl px-3 py-2 text-sm outline-none resize-none min-h-[80px]"
                            />
                            <div className="flex gap-2">
                              <button onClick={() => updateEvent(event.id)} className="px-3 py-1.5 text-xs rounded-full bg-[#818cf8]/20 text-[#818cf8] font-medium">Save Changes</button>
                              <button onClick={() => setEditingEvent(null)} className="px-3 py-1.5 text-xs rounded-full text-white/30 hover:text-white/60">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2.5 text-white/70">
                                <GripVertical className="w-4 h-4 text-white/20 cursor-grab active:cursor-grabbing hover:text-white/50" />
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                  <Calendar className="w-3.5 h-3.5 text-[#818cf8]" />
                                  {event.estimatedDate || "Date unknown"}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => startEdit(event)}
                                  className="p-1.5 rounded-lg text-white/30 hover:bg-white/10 hover:text-white/80 transition-colors"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => deleteEvent(event.id)}
                                  className="p-1.5 rounded-lg text-white/30 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            
                            <p className="text-white/85 text-sm leading-relaxed mb-4 pl-7 pr-2">{event.content}</p>
                            
                            <div className="flex items-center justify-between pl-7 border-t border-white/5 pt-3">
                              <div className="flex items-center gap-2">
                                <ConfidenceIcon className={`w-3.5 h-3.5 ${
                                  event.confidence === "high" ? "text-emerald-400" :
                                  event.confidence === "medium" ? "text-amber-400" :
                                  "text-rose-400"
                                }`} />
                                <span className={`text-[10px] uppercase tracking-wider font-semibold ${
                                  event.confidence === "high" ? "text-emerald-400" :
                                  event.confidence === "medium" ? "text-amber-400" :
                                  "text-rose-400"
                                }`}>
                                  {event.confidence} Match
                                </span>
                              </div>
                              
                              {event.linkedEvidence && event.linkedEvidence.length > 0 && (
                                <div className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(129,140,248,0.1)', color: '#818cf8' }}>
                                  <LinkIcon className="w-3 h-3" />
                                  <span>{event.linkedEvidence.length} linked</span>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  </Reorder.Item>
                )
              })}
            </Reorder.Group>
          </div>

          {/* Legend */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-10 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-4 justify-between"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <p className="text-[11px] uppercase tracking-widest font-semibold text-white/30">AI Confidence System</p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ background: 'rgba(52,211,153,0.05)' }}>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] font-medium text-emerald-400/80">High - Verified</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ background: 'rgba(251,191,36,0.05)' }}>
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] font-medium text-amber-400/80">Medium - Likely</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ background: 'rgba(244,63,94,0.05)' }}>
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-[10px] font-medium text-rose-400/80">Low - Unclear</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default function TimelinePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#818cf8] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <TimelineContent />
    </Suspense>
  )
}
