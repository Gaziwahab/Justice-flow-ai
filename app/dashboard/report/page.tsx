"use client"

import { useEffect, useState, useRef, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  FileText, Download, Printer, Clock, User, Files, Heart, Shield, Check,
  AlertCircle, Copy, CheckCircle, Sparkles, Loader2, MapPin, Users,
  Building, Scale, TrendingUp, HelpCircle, Brain
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface StructuredReport {
  case_summary: string
  incident_type: string
  severity_assessment: string
  timeline_events: Array<{
    id: string
    title: string
    description: string
    date_raw: string
    date_estimated: string
    time_of_day: string
    location: string
    location_type: string
    people_involved: string[]
    perpetrator_actions: string
    survivor_response: string
    witnesses_present: boolean
    evidence_referenced: string[]
    emotional_state_during: string
    confidence: string
    key_quotes: string[]
  }>
  entities: {
    people: Array<{ name: string; role: string; relationship_to_survivor: string; description: string }>
    locations: Array<{ name: string; type: string; significance: string }>
    organizations: Array<{ name: string; type: string; role_in_case: string }>
  }
  evidence_map: Array<{ type: string; description: string; status: string; importance: string }>
  pattern_analysis: { is_pattern: boolean; frequency: string; escalation: string; pattern_description: string }
  impact_assessment: { emotional: string[]; physical: string[]; financial: string[]; social: string[]; professional_academic: string[] }
  reporting_history: { reported_to_anyone: boolean; reports: Array<{ reported_to: string; when: string; response: string; outcome: string }> }
  gaps_and_clarifications: Array<{ field: string; question: string; importance: string }>
  legal_strength: { score: number; strengths: string[]; weaknesses: string[]; recommended_evidence: string[] }
  metadata?: { processed_at: string; fragment_count: number; evidence_count: number }
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-500/15 text-red-400 border-red-500/25",
  severe: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  moderate: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
  concerning: "bg-blue-500/15 text-blue-400 border-blue-500/25",
}

const CONFIDENCE_COLORS: Record<string, string> = {
  high: "text-emerald-400",
  medium: "text-yellow-400",
  low: "text-orange-400",
}

function ReportContent() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionIdFromURL = searchParams.get("session")

  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [report, setReport] = useState<StructuredReport | null>(null)
  const [rawFragments, setRawFragments] = useState<Array<{ id: string; content: string; timestamp: string; type: string }>>([])
  const [evidence, setEvidence] = useState<Array<{ id: string; name: string; type: string; description?: string }>>([])
  const [copied, setCopied] = useState(false)
  const [sessionTitle, setSessionTitle] = useState("")
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "entities" | "legal" | "legaldocs">("overview")
  const [legalDocType, setLegalDocType] = useState<"fir" | "complaint" | "statement" | "summary">("fir")
  const [generatedDoc, setGeneratedDoc] = useState<string | null>(null)
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(sessionIdFromURL)
  const [sessionsList, setSessionsList] = useState<Array<{ id: string; title: string; created_at: string }>>([])
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchSessions = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const { data } = await supabase.from("sessions").select("id, title, created_at").eq("user_id", user.id).order("created_at", { ascending: false })
      if (data) {
        setSessionsList(data)
        if (!activeSessionId && data.length > 0) {
          setActiveSessionId(data[0].id)
        }
      }
    }
    fetchSessions()
  }, [supabase])

  useEffect(() => {
    if (!activeSessionId) return
    
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Reset old report data when switching sessions
        setReport(null)
        setRawFragments([])
        setEvidence([])
        setSessionTitle("")

        // Fetch session
        const { data: session } = await supabase.from("sessions").select("*").eq("id", activeSessionId).single()
        if (session) setSessionTitle(session.title || "Untitled Session")

        // Fetch user chat messages and story fragments
        const [ { data: testimonies }, { data: chatMessages } ] = await Promise.all([
          supabase
            .from("testimonies").select("*").eq("session_id", activeSessionId)
            .eq("step_type", "story")
            .order("created_at", { ascending: true }),
          supabase
            .from("chat_messages").select("*").eq("session_id", activeSessionId)
            .eq("role", "user")
            .order("created_at", { ascending: true })
        ]);

        let fragmentsAssoc: any[] = []

        if (testimonies) {
          fragmentsAssoc = [...fragmentsAssoc, ...testimonies.map(t => ({
            id: t.id,
            content: t.content || "",
            timestamp: t.created_at || new Date().toISOString(),
            type: (t.metadata as any)?.type || "text",
          }))]
        }

        if (chatMessages) {
          fragmentsAssoc = [...fragmentsAssoc, ...chatMessages.map(c => ({
            id: c.id,
            content: c.content || "",
            timestamp: c.created_at || new Date().toISOString(),
            type: (c.metadata as any)?.type || "text",
          }))]
        }

        // Sort chronologically
        fragmentsAssoc.sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        
        // Deduplicate exactly matching strings (since testimony page now inserts to both tables temporarily)
        const uniqueFragments = fragmentsAssoc.filter((v,i,a) => a.findIndex(v2 => v2.content === v.content) === i)

        setRawFragments(uniqueFragments)

        // Fetch evidence
        const { data: evidenceRows } = await supabase
          .from("evidence").select("*").eq("session_id", activeSessionId)
        if (evidenceRows) {
          setEvidence(evidenceRows.map(e => ({
            id: e.id,
            name: e.file_name,
            type: e.file_type,
            description: e.description || undefined,
          })))
        }

        // Check if structured analysis already exists in session description
        if (session?.description) {
          try {
            const parsed = JSON.parse(session.description)
            if (parsed.structured_analysis) {
              setReport(parsed.structured_analysis as StructuredReport)
            }
          } catch { /* not JSON, that's fine */ }
        }
      } catch (error) {
        console.error("Error fetching report data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [activeSessionId, supabase])

  const generateReport = async () => {
    if (rawFragments.length === 0) return
    setIsGenerating(true)

    try {
      const res = await fetch("/api/structure-engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fragments: rawFragments,
          evidence,
          sessionId: activeSessionId,
        }),
      })

      if (!res.ok) throw new Error("Structure Engine failed")
      const structured: StructuredReport = await res.json()
      setReport(structured)

      // Save to session and reports table
      const { data: { user } } = await supabase.auth.getUser()
      if (user && activeSessionId) {
        await supabase.from("sessions").update({
          description: JSON.stringify({ structured_analysis: structured }),
        }).eq("id", activeSessionId)

        await supabase.from("reports").insert({
          session_id: activeSessionId,
          user_id: user.id,
          title: `Structured Report - ${new Date().toLocaleDateString()}`,
          report_type: "structured",
          content: structured as any,
          status: "generated",
        })
      }
    } catch (error) {
      console.error("Report generation error:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateLegalDoc = async () => {
    if (!report) return
    setIsGeneratingDoc(true)
    setGeneratedDoc(null)
    try {
      const res = await fetch("/api/rag-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          structuredData: report,
          type: legalDocType
        })
      })
      if (!res.ok) {
        let errMessage = "Document generation failed"
        try {
          const errorData = await res.json()
          console.error("API Error Response:", errorData)
          errMessage = errorData.error + (errorData.details ? ": " + errorData.details : "")
        } catch(e) {}
        throw new Error(errMessage)
      }
      const data = await res.json()
      setGeneratedDoc(data.report)
    } catch (err: any) {
      console.error(err)
      alert(err.message)
    } finally {
      setIsGeneratingDoc(false)
    }
  }

  const handleDownloadLegalPDF = () => {
    if (!generatedDoc) return
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${legalDocType.toUpperCase().replace('_', ' ')} Document</title>
            <style>
              body { font-family: serif; line-height: 1.6; padding: 40px; max-width: 800px; margin: auto; white-space: pre-wrap; font-size: 14pt; color: black; background: white; }
              @media print { body { padding: 0; } }
            </style>
          </head>
          <body>${generatedDoc.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
      }, 500)
    }
  }

  const handleCopyLegalDoc = async () => {
    if (!generatedDoc) return
    await navigator.clipboard.writeText(generatedDoc)
    alert("Copied to clipboard!")
  }

  const generateTextReport = (): string => {
    if (!report) return ""
    return `
SECURE VOICE — STRUCTURED INTELLIGENCE REPORT
Generated: ${new Date().toLocaleString()}
═══════════════════════════════════════════════

CASE SUMMARY
${report.case_summary}

Incident Type: ${report.incident_type.replace(/_/g, " ").toUpperCase()}
Severity: ${report.severity_assessment.toUpperCase()}
Legal Strength: ${report.legal_strength.score}/10

═══════════════════════════════════════════════
TIMELINE OF EVENTS (${report.timeline_events.length} events)
═══════════════════════════════════════════════
${report.timeline_events.map((evt, i) => `
${i + 1}. ${evt.title}
   Date: ${evt.date_raw} ${evt.date_estimated !== "unknown" ? `(~${evt.date_estimated})` : ""}
   Time: ${evt.time_of_day}
   Location: ${evt.location}
   What happened: ${evt.description}
   Perpetrator actions: ${evt.perpetrator_actions}
   Survivors response: ${evt.survivor_response}
   Witnesses: ${evt.witnesses_present ? "Yes" : "No/Unknown"}
   Confidence: ${evt.confidence}
   ${evt.key_quotes.length > 0 ? `Key quote: "${evt.key_quotes[0]}"` : ""}
`).join("\n")}

═══════════════════════════════════════════════
ENTITIES
═══════════════════════════════════════════════
People: ${report.entities.people.map(p => `${p.name} (${p.role} — ${p.relationship_to_survivor})`).join(", ") || "None identified"}
Locations: ${report.entities.locations.map(l => `${l.name} (${l.type})`).join(", ") || "None identified"}
Organizations: ${report.entities.organizations.map(o => `${o.name} (${o.role_in_case})`).join(", ") || "None identified"}

═══════════════════════════════════════════════
PATTERN ANALYSIS
═══════════════════════════════════════════════
Pattern detected: ${report.pattern_analysis.is_pattern ? "YES" : "No"}
Frequency: ${report.pattern_analysis.frequency}
Escalation: ${report.pattern_analysis.escalation}
${report.pattern_analysis.pattern_description}

═══════════════════════════════════════════════
IMPACT ASSESSMENT
═══════════════════════════════════════════════
Emotional: ${report.impact_assessment.emotional.join(", ") || "Not specified"}
Physical: ${report.impact_assessment.physical.join(", ") || "Not specified"}
Social: ${report.impact_assessment.social.join(", ") || "Not specified"}
Financial: ${report.impact_assessment.financial.join(", ") || "Not specified"}
Professional/Academic: ${report.impact_assessment.professional_academic.join(", ") || "Not specified"}

═══════════════════════════════════════════════
LEGAL STRENGTH: ${report.legal_strength.score}/10
═══════════════════════════════════════════════
Strengths: ${report.legal_strength.strengths.join("; ")}
Weaknesses: ${report.legal_strength.weaknesses.join("; ")}
Recommended evidence: ${report.legal_strength.recommended_evidence.join("; ")}

═══════════════════════════════════════════════
GAPS TO ADDRESS
═══════════════════════════════════════════════
${report.gaps_and_clarifications.map((g, i) => `${i + 1}. [${g.importance.toUpperCase()}] ${g.field}: ${g.question}`).join("\n")}

═══════════════════════════════════════════════
END OF REPORT — SecureVoice Confidential
═══════════════════════════════════════════════
`
  }

  const handleDownload = () => {
    const blob = new Blob([generateTextReport()], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `securevoice-report-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generateTextReport())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#818cf8] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen relative overflow-y-auto w-full" style={{ 
      background: '#0B1021',
      backgroundImage: `radial-gradient(ellipse at top, rgba(13,18,37,0.3) 0%, transparent 70%), linear-gradient(180deg, rgba(8,12,26,1) 0%, #080C1A 100%), url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
    }}>
      <div className="absolute inset-0 z-0 pointer-events-none w-full h-full" style={{ background: 'radial-gradient(circle at 15% 50%, rgba(129,140,248,0.03) 0%, transparent 50%), radial-gradient(circle at 85% 30%, rgba(20,184,166,0.02) 0%, transparent 50%)' }} />
      <div className="relative z-10 p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.25)' }}>
            <Brain className="w-6 h-6 text-[#818cf8]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white/95">Structured Intelligence Report</h1>
            <p className="text-sm text-white/40 mt-0.5">AI-powered analysis of your testimony</p>
          </div>
        </div>

        {/* Session Selector */}
        {sessionsList.length > 1 && (
          <select 
            value={activeSessionId || ""}
            onChange={(e) => setActiveSessionId(e.target.value)}
            className="px-4 py-2 rounded-xl text-sm font-medium outline-none cursor-pointer border transition-colors min-w-[200px]"
            style={{ background: 'rgba(13,18,37,0.8)', color: 'white', borderColor: 'rgba(255,255,255,0.1)' }}
          >
            {sessionsList.map(s => (
              <option key={s.id} value={s.id}>
                {s.title || "Untitled Session"} - {new Date(s.created_at).toLocaleDateString()}
              </option>
            ))}
          </select>
        )}
      </motion.div>

      {/* Data stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-8">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(129,140,248,0.1)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.2)' }}>
            {rawFragments.length} fragments
          </span>
          <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
            {evidence.length} evidence files
          </span>
          {report && (
            <span className={`text-xs px-3 py-1 rounded-full border ${SEVERITY_COLORS[report.severity_assessment] || SEVERITY_COLORS.concerning}`}>
              {report.severity_assessment} severity
            </span>
          )}
        </div>
      </motion.div>

      {/* Generate button (if no report yet) */}
      {!report && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-8 rounded-2xl text-center mb-8"
          style={{ background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.15)' }}>
          <Sparkles className="w-12 h-12 text-[#818cf8]/60 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white/85 mb-2">Generate Structured Report</h2>
          <p className="text-sm text-white/40 max-w-md mx-auto mb-6">
            The AI Structure Engine will analyze all {rawFragments.length} testimony fragments, 
            extract entities, build a timeline, assess legal strength, and identify gaps.
          </p>
          <button onClick={generateReport} disabled={isGenerating || rawFragments.length === 0}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-30"
            style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', color: 'white' }}>
            {isGenerating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing testimony…</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Run Structure Engine</>
            )}
          </button>
          {rawFragments.length === 0 && (
            <p className="text-xs text-amber-400/70 mt-3">Share your story first in the Testimony section</p>
          )}
        </motion.div>
      )}

      {/* Report content */}
      {report && (
        <div ref={reportRef}>
          {/* Tab navigation */}
          <div className="flex gap-1 p-1 rounded-full mb-6 w-fit"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {[
              { key: "overview" as const, label: "Overview", icon: FileText },
              { key: "timeline" as const, label: "Timeline", icon: Clock },
              { key: "entities" as const, label: "Entities", icon: Users },
              { key: "legal" as const, label: "Legal", icon: Scale },
              { key: "legaldocs" as const, label: "Legal Docs", icon: Building },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all ${activeTab === tab.key ? "text-[#818cf8]" : "text-white/30 hover:text-white/60"}`}
                style={activeTab === tab.key ? { background: 'rgba(129,140,248,0.15)' } : {}}>
                <tab.icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            ))}
          </div>

          {/* Actions bar */}
          <div className="flex gap-2 mb-6">
            <button onClick={generateReport} disabled={isGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/70 transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Regenerate
            </button>
            <button onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/70 transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <Download className="w-3 h-3" /> Download
            </button>
            <button onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/70 transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
            </button>
            <button onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/70 transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <Printer className="w-3 h-3" /> Print
            </button>
          </div>

          <AnimatePresence mode="wait">
            {/* ===== OVERVIEW TAB ===== */}
            {activeTab === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                {/* Case Summary */}
                <div className="p-5 rounded-2xl" style={{ background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.12)' }}>
                  <h3 className="text-sm font-semibold text-white/60 mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#818cf8]" /> Case Summary
                  </h3>
                  <p className="text-sm text-white/80 leading-relaxed">{report.case_summary}</p>
                  <div className="flex gap-3 mt-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider"
                      style={{ background: 'rgba(129,140,248,0.12)', color: '#818cf8' }}>
                      {report.incident_type.replace(/_/g, " ")}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider border ${SEVERITY_COLORS[report.severity_assessment] || ""}`}>
                      {report.severity_assessment}
                    </span>
                  </div>
                </div>

                {/* Legal Strength Gauge */}
                <div className="p-5 rounded-2xl" style={{ background: 'rgba(13,18,37,0.7)', border: '1px solid rgba(129,140,248,0.12)' }}>
                  <h3 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#818cf8]" /> Legal Strength
                  </h3>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-4xl font-bold text-[#818cf8]">{report.legal_strength.score}<span className="text-lg text-white/30">/10</span></div>
                    <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${report.legal_strength.score * 10}%`, background: report.legal_strength.score >= 7 ? '#34d399' : report.legal_strength.score >= 4 ? '#fbbf24' : '#ef4444' }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-[10px] text-emerald-400 font-semibold mb-1 uppercase tracking-wider">Strengths</p>
                      {report.legal_strength.strengths.map((s, i) => (
                        <p key={i} className="text-xs text-white/50 flex items-start gap-1.5 mb-1">
                          <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" /> {s}
                        </p>
                      ))}
                    </div>
                    <div>
                      <p className="text-[10px] text-amber-400 font-semibold mb-1 uppercase tracking-wider">Weaknesses</p>
                      {report.legal_strength.weaknesses.map((w, i) => (
                        <p key={i} className="text-xs text-white/50 flex items-start gap-1.5 mb-1">
                          <AlertCircle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" /> {w}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pattern + Impact grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl" style={{ background: 'rgba(13,18,37,0.7)', border: '1px solid rgba(129,140,248,0.12)' }}>
                    <h3 className="text-xs font-semibold text-white/50 mb-2 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-[#818cf8]" /> Pattern Analysis
                    </h3>
                    <p className="text-sm text-white/80 mb-1">
                      {report.pattern_analysis.is_pattern ? "⚠️ Pattern detected" : "Single incident"}
                    </p>
                    <p className="text-xs text-white/40">Frequency: {report.pattern_analysis.frequency}</p>
                    <p className="text-xs text-white/40">Escalation: {report.pattern_analysis.escalation}</p>
                    {report.pattern_analysis.pattern_description && (
                      <p className="text-xs text-white/50 mt-2 italic">{report.pattern_analysis.pattern_description}</p>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl" style={{ background: 'rgba(13,18,37,0.7)', border: '1px solid rgba(129,140,248,0.12)' }}>
                    <h3 className="text-xs font-semibold text-white/50 mb-2 flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-[#818cf8]" /> Impact
                    </h3>
                    {[
                      { label: "Emotional", items: report.impact_assessment.emotional },
                      { label: "Physical", items: report.impact_assessment.physical },
                      { label: "Social", items: report.impact_assessment.social },
                    ].filter(c => c.items.length > 0).map(cat => (
                      <div key={cat.label} className="mb-1.5">
                        <p className="text-[10px] text-white/30 uppercase">{cat.label}</p>
                        <p className="text-xs text-white/60">{cat.items.join(", ")}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gaps */}
                {report.gaps_and_clarifications.length > 0 && (
                  <div className="p-5 rounded-2xl" style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)' }}>
                    <h3 className="text-sm font-semibold text-amber-400/80 mb-3 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" /> Information Gaps ({report.gaps_and_clarifications.length})
                    </h3>
                    <div className="space-y-2">
                      {report.gaps_and_clarifications.map((gap, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold mt-0.5 ${gap.importance === "critical" ? "bg-red-500/20 text-red-400" : gap.importance === "helpful" ? "bg-yellow-500/15 text-yellow-400" : "bg-white/5 text-white/30"}`}>
                            {gap.importance}
                          </span>
                          <p className="text-xs text-white/50">{gap.question}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ===== TIMELINE TAB ===== */}
            {activeTab === "timeline" && (
              <motion.div key="timeline" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="relative pl-8">
                  <div className="absolute left-3 top-0 bottom-0 w-px" style={{ background: 'linear-gradient(to bottom, rgba(129,140,248,0.4), rgba(129,140,248,0.05))' }} />
                  {report.timeline_events.map((evt, i) => (
                    <div key={evt.id} className="relative mb-5">
                      <div className={`absolute left-[-23px] w-3 h-3 rounded-full ${evt.confidence === "high" ? "bg-emerald-400" : evt.confidence === "medium" ? "bg-yellow-400" : "bg-orange-400"}`} />
                      <div className="p-4 rounded-xl" style={{ background: 'rgba(13,18,37,0.7)', border: '1px solid rgba(129,140,248,0.12)' }}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-white/85">{evt.title}</h4>
                          <span className={`text-[10px] ${CONFIDENCE_COLORS[evt.confidence] || ""}`}>{evt.confidence} confidence</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {evt.date_raw !== "unknown" && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: 'rgba(129,140,248,0.1)', color: '#818cf8' }}>
                              <Clock className="w-2.5 h-2.5" /> {evt.date_raw}
                            </span>
                          )}
                          {evt.location !== "unknown" && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399' }}>
                              <MapPin className="w-2.5 h-2.5" /> {evt.location}
                            </span>
                          )}
                          {evt.time_of_day !== "unknown" && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>
                              {evt.time_of_day}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed mb-2">{evt.description}</p>
                        {evt.perpetrator_actions && (
                          <p className="text-xs text-red-400/70 mb-1">⚠️ Perpetrator: {evt.perpetrator_actions}</p>
                        )}
                        {evt.survivor_response && (
                          <p className="text-xs text-white/40 mb-1">→ Response: {evt.survivor_response}</p>
                        )}
                        {evt.key_quotes.length > 0 && (
                          <div className="mt-2 p-2 rounded-lg italic text-xs text-white/50" style={{ background: 'rgba(129,140,248,0.05)' }}>
                            "{evt.key_quotes[0]}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ===== ENTITIES TAB ===== */}
            {activeTab === "entities" && (
              <motion.div key="entities" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                {/* People */}
                <div className="p-5 rounded-2xl" style={{ background: 'rgba(13,18,37,0.7)', border: '1px solid rgba(129,140,248,0.12)' }}>
                  <h3 className="text-sm font-semibold text-white/60 flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-[#818cf8]" /> People ({report.entities.people.length})
                  </h3>
                  <div className="space-y-3">
                    {report.entities.people.map((p, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${p.role === "perpetrator" ? "bg-red-500/20 text-red-400" : p.role === "witness" ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-white/40"}`}>
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm text-white/80 font-medium">{p.name}</p>
                          <p className="text-xs text-white/40">{p.role} — {p.relationship_to_survivor}</p>
                          {p.description && <p className="text-xs text-white/30 mt-0.5">{p.description}</p>}
                        </div>
                      </div>
                    ))}
                    {report.entities.people.length === 0 && <p className="text-xs text-white/30 italic">No people identified</p>}
                  </div>
                </div>

                {/* Locations */}
                <div className="p-5 rounded-2xl" style={{ background: 'rgba(13,18,37,0.7)', border: '1px solid rgba(129,140,248,0.12)' }}>
                  <h3 className="text-sm font-semibold text-white/60 flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-[#818cf8]" /> Locations ({report.entities.locations.length})
                  </h3>
                  <div className="space-y-2">
                    {report.entities.locations.map((l, i) => (
                      <div key={i} className="p-3 rounded-xl flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <MapPin className="w-4 h-4 text-emerald-400/60" />
                        <div>
                          <p className="text-sm text-white/80">{l.name} <span className="text-xs text-white/30">({l.type})</span></p>
                          {l.significance && <p className="text-xs text-white/40">{l.significance}</p>}
                        </div>
                      </div>
                    ))}
                    {report.entities.locations.length === 0 && <p className="text-xs text-white/30 italic">No locations identified</p>}
                  </div>
                </div>

                {/* Evidence Map */}
                {report.evidence_map.length > 0 && (
                  <div className="p-5 rounded-2xl" style={{ background: 'rgba(13,18,37,0.7)', border: '1px solid rgba(129,140,248,0.12)' }}>
                    <h3 className="text-sm font-semibold text-white/60 flex items-center gap-2 mb-3">
                      <Files className="w-4 h-4 text-[#818cf8]" /> Evidence Map
                    </h3>
                    <div className="space-y-2">
                      {report.evidence_map.map((e, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${e.status === "uploaded" ? "bg-emerald-500/15 text-emerald-400" : e.status === "mentioned" ? "bg-yellow-500/15 text-yellow-400" : "bg-red-500/15 text-red-400"}`}>
                            {e.status}
                          </span>
                          <p className="text-xs text-white/60">{e.description}</p>
                          <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded ${e.importance === "critical" ? "bg-red-500/10 text-red-400" : "bg-white/5 text-white/30"}`}>
                            {e.importance}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ===== LEGAL TAB ===== */}
            {activeTab === "legal" && (
              <motion.div key="legal" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                {/* Score */}
                <div className="p-6 rounded-2xl text-center" style={{ background: 'rgba(13,18,37,0.7)', border: '1px solid rgba(129,140,248,0.12)' }}>
                  <div className="text-6xl font-bold text-[#818cf8] mb-2">{report.legal_strength.score}<span className="text-2xl text-white/30">/10</span></div>
                  <p className="text-sm text-white/40">Legal Case Strength Score</p>
                  <div className="w-full max-w-xs mx-auto h-3 rounded-full overflow-hidden mt-4" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${report.legal_strength.score * 10}%`, background: report.legal_strength.score >= 7 ? '#34d399' : report.legal_strength.score >= 4 ? '#fbbf24' : '#ef4444' }} />
                  </div>
                </div>

                {/* Strengths / Weaknesses / Recommended */}
                {[
                  { label: "Case Strengths", items: report.legal_strength.strengths, icon: CheckCircle, color: "text-emerald-400", bg: "rgba(52,211,153,0.06)" },
                  { label: "Case Weaknesses", items: report.legal_strength.weaknesses, icon: AlertCircle, color: "text-amber-400", bg: "rgba(251,191,36,0.06)" },
                  { label: "Recommended Evidence to Collect", items: report.legal_strength.recommended_evidence, icon: Files, color: "text-[#818cf8]", bg: "rgba(129,140,248,0.06)" },
                ].map(section => (
                  <div key={section.label} className="p-5 rounded-2xl" style={{ background: section.bg, border: `1px solid ${section.bg.replace("0.06", "0.15")}` }}>
                    <h3 className={`text-sm font-semibold ${section.color} flex items-center gap-2 mb-3`}>
                      <section.icon className="w-4 h-4" /> {section.label}
                    </h3>
                    <ul className="space-y-1.5">
                      {section.items.map((item, i) => (
                        <li key={i} className="text-xs text-white/60 flex items-start gap-2">
                          <span className="text-white/20 mt-0.5">•</span> {item}
                        </li>
                      ))}
                      {section.items.length === 0 && <li className="text-xs text-white/30 italic">None identified</li>}
                    </ul>
                  </div>
                ))}

                {/* Reporting History */}
                <div className="p-5 rounded-2xl" style={{ background: 'rgba(13,18,37,0.7)', border: '1px solid rgba(129,140,248,0.12)' }}>
                  <h3 className="text-sm font-semibold text-white/60 mb-3">Reporting History</h3>
                  <p className="text-xs text-white/50 mb-2">
                    Reported to authorities: {report.reporting_history.reported_to_anyone ? "Yes" : "Not yet"}
                  </p>
                  {report.reporting_history.reports.map((r, i) => (
                    <div key={i} className="p-3 rounded-xl mb-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <p className="text-xs text-white/70">Reported to: {r.reported_to}</p>
                      <p className="text-xs text-white/40">When: {r.when} → Response: {r.response}</p>
                      {r.outcome && <p className="text-xs text-white/30">Outcome: {r.outcome}</p>}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ===== LEGAL DOCS TAB ===== */}
            {activeTab === "legaldocs" && (
              <motion.div key="legaldocs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                <div className="p-5 rounded-2xl" style={{ background: 'rgba(13,18,37,0.7)', border: '1px solid rgba(129,140,248,0.12)' }}>
                  <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
                    <Building className="w-4 h-4 text-[#818cf8]" /> Official Document Generator
                  </h3>
                  
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <select 
                      value={legalDocType}
                      onChange={(e) => setLegalDocType(e.target.value as any)}
                      className="px-4 py-2.5 rounded-xl text-sm font-medium outline-none cursor-pointer border transition-colors flex-1"
                      style={{ background: 'rgba(0,0,0,0.3)', color: 'white', borderColor: 'rgba(255,255,255,0.1)' }}
                    >
                      <option value="fir">FIR (First Information Report)</option>
                      <option value="complaint">Police Complaint</option>
                      <option value="statement">Legal Statement / Affidavit</option>
                      <option value="summary">Lawyer Case Summary</option>
                    </select>
                    
                    <button 
                      onClick={generateLegalDoc} 
                      disabled={isGeneratingDoc}
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50 min-w-[200px]"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', color: 'white' }}
                    >
                      {isGeneratingDoc ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                      ) : (
                        <><Sparkles className="w-4 h-4" /> Generate Document</>
                      )}
                    </button>
                  </div>
                  
                  {generatedDoc && (
                    <div className="mt-8">
                       <div className="flex justify-between items-center mb-3">
                         <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Generated Output</h4>
                         <div className="flex gap-2">
                           <button onClick={handleCopyLegalDoc} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-white/70 transition flex items-center gap-1.5">
                             <Copy className="w-3 h-3" /> Copy Text
                           </button>
                           <button onClick={handleDownloadLegalPDF} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#818cf8]/10 hover:bg-[#818cf8]/20 text-[#818cf8] transition flex items-center gap-1.5 border border-[#818cf8]/20">
                             <Download className="w-3 h-3" /> Download PDF
                           </button>
                         </div>
                       </div>
                       
                       <div className="p-6 rounded-xl whitespace-pre-wrap text-sm text-white/80 leading-relaxed font-serif" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)', maxHeight: '600px', overflowY: 'auto' }}>
                         {generatedDoc}
                       </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="mt-8 p-4 rounded-xl flex items-start gap-3"
            style={{ background: 'rgba(129,140,248,0.04)', border: '1px solid rgba(129,140,248,0.1)' }}>
            <Shield className="w-4 h-4 text-[#818cf8]/60 mt-0.5 shrink-0" />
            <p className="text-xs text-white/30 leading-relaxed">
              <span className="text-white/50 font-medium">Confidential.</span>{" "}
              This report was generated by JusticeFlow's AI Structure Engine. All data is encrypted. 
              {report.metadata && ` Analyzed ${report.metadata.fragment_count} fragments and ${report.metadata.evidence_count} evidence files.`}
            </p>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#818cf8] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ReportContent />
    </Suspense>
  )
}
