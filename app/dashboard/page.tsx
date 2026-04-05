"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, 
  ArrowRight,
  Sparkles,
  History,
  Shield,
  Heart,
  Clock,
  Trash2,
  TrendingUp,
  FileText,
  Mic,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Lock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import type { Tables } from "@/lib/database.types"
import { useRouter } from "next/navigation"

type Session = Tables<"sessions">

const emotionalStateColors: Record<string, string> = {
  calm: "bg-green-500/20 text-green-400",
  unsure: "bg-yellow-500/20 text-yellow-400",
  anxious: "bg-orange-500/20 text-orange-400",
  overwhelmed: "bg-red-500/20 text-red-400"
}

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [userName, setUserName] = useState<string | null>(null)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [showNameModal, setShowNameModal] = useState(false)
  const [testimonyName, setTestimonyName] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) return
        
        setIsAnonymous(user.is_anonymous || false)
        
        // Fetch profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, is_anonymous")
          .eq("id", user.id)
          .single()
        
        if (profile) {
          setUserName(profile.full_name)
          setIsAnonymous(profile.is_anonymous || false)
        }
        
        // Fetch sessions
        const { data: sessionsData } = await supabase
          .from("sessions")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })
        
        if (sessionsData) {
          setSessions(sessionsData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [supabase])

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  const handleCreateSessionClick = () => {
    setTestimonyName("")
    setShowNameModal(true)
  }

  const handleConfirmCreateSession = async () => {
    setShowNameModal(false)
    setIsCreating(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const titleStr = testimonyName.trim() || `Testimony - ${new Date().toLocaleDateString()}`
      
      const { data, error } = await supabase
        .from("sessions")
        .insert({
          user_id: user.id,
          title: titleStr,
          status: "draft"
        })
        .select()
        .single()
      
      if (error) throw error
      
      if (data) {
        router.push(`/dashboard/testimony?session=${data.id}`)
      }
    } catch (error) {
      console.error("Error creating session:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this session? This cannot be undone.")) return
    
    try {
      await supabase
        .from("sessions")
        .delete()
        .eq("id", sessionId)
      
      setSessions(prev => prev.filter(s => s.id !== sessionId))
    } catch (error) {
      console.error("Error deleting session:", error)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Unknown"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 lg:p-12 relative overflow-y-auto w-full" style={{ 
      background: '#0B1021',
      backgroundImage: `radial-gradient(ellipse at top, rgba(13,18,37,0.3) 0%, transparent 70%), linear-gradient(180deg, rgba(8,12,26,1) 0%, #080C1A 100%), url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
    }}>
      <div className="absolute inset-0 z-0 pointer-events-none w-full h-full" style={{ background: 'radial-gradient(circle at 15% 50%, rgba(129,140,248,0.03) 0%, transparent 50%), radial-gradient(circle at 85% 30%, rgba(20,184,166,0.02) 0%, transparent 50%)' }} />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center md:text-left"
        >
          <div className="flex justify-center md:justify-start items-center gap-2 mb-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 w-fit">
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-semibold text-amber-500 uppercase tracking-widest">{isAnonymous ? "Anonymous Mode" : "Secure Mode"}</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-3">
            {isAnonymous ? "Anonymous Session" : userName ? `Welcome, ${userName}` : "Anonymous Session"}
          </h1>
          <p className="text-white/40 text-lg">
            Your privacy is fully protected. {isAnonymous && "No account is required."}
          </p>
        </motion.div>

        {/* Main Large Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <button 
            onClick={handleCreateSessionClick}
            disabled={isCreating}
            className="w-full relative overflow-hidden rounded-[2rem] text-left transition-all duration-500 hover:scale-[1.01] group"
            style={{ 
              background: '#0d1222', 
              border: '1px solid rgba(129,140,248,0.15)',
              boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#818cf8]/5 via-transparent to-teal-500/5 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="p-10 md:p-14 relative z-10 flex flex-col md:flex-row items-center justify-between min-h-[300px]">
              <div className="mb-8 md:mb-0 md:max-w-md h-full flex flex-col justify-center text-center md:text-left">
                <span className="text-[#38bdf8] text-xs font-bold uppercase tracking-[0.2em] mb-4 block">New Session</span>
                <h2 className="text-4xl md:text-5xl font-serif text-white mb-6 leading-tight">
                  Start New<br/>Testimony
                </h2>
                <div className="flex items-center justify-center md:justify-start text-white/50 text-sm group-hover:text-white/80 transition-colors">
                  {isCreating ? "Initializing secure session..." : "Click to begin your safe space"}
                  {!isCreating && <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-2" />}
                </div>
              </div>
              
              <div className="relative w-56 h-56 md:w-[320px] md:h-[320px] flex shrink-0 justify-center items-center -mr-0 md:-mr-12 md:-mt-12 md:-mb-12">
                <div className="absolute inset-0 bg-[#818cf8]/10 blur-[100px] rounded-full" />
                <img src="/iridescent_bubble.png" alt="Safe space orb" className="w-full h-full object-contain relative z-10 opacity-90 drop-shadow-2xl mix-blend-screen mix-blend-lighten pointer-events-none scale-110" />
              </div>
            </div>
          </button>
        </motion.div>

        {/* 4 Stat Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
        >
          {/* Card 1 */}
          <div className="rounded-2xl p-5 relative overflow-hidden group transition-all hover:bg-white/[0.02]" style={{ background: 'transparent', border: '1px solid rgba(129,140,248,0.1)' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <FileText className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 uppercase tracking-wider">Active</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1 font-display">{sessions.length}</p>
            <p className="text-xs text-white/40">Total Sessions</p>
          </div>
          
          {/* Card 2 */}
          <div className="rounded-2xl p-5 relative overflow-hidden group transition-all hover:bg-white/[0.02]" style={{ background: 'transparent', border: '1px solid rgba(129,140,248,0.1)' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                <Mic className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-emerald-400 flex items-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                  <path d="M22 7l-13.5 13.5-8.5-8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-white mb-1 font-display">{sessions.filter(s => s.status === "completed").length}</p>
            <p className="text-xs text-white/40">Completed</p>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl p-5 relative overflow-hidden group transition-all hover:bg-white/[0.02]" style={{ background: 'transparent', border: '1px solid rgba(129,140,248,0.1)' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <Calendar className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
              <Clock className="w-4 h-4 text-white/20 mt-1" />
            </div>
            <p className="text-3xl font-bold text-white mb-1 font-display">{sessions.filter(s => s.status === "in_progress").length}</p>
            <p className="text-xs text-white/40">In Progress</p>
          </div>

          {/* Card 4 */}
          <div className="rounded-2xl p-5 relative overflow-hidden group transition-all hover:bg-white/[0.02]" style={{ background: 'transparent', border: '1px solid rgba(129,140,248,0.1)' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                <Shield className="w-5 h-5 text-teal-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center mt-1 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-1 font-display mt-2">256-bit</p>
            <p className="text-xs text-white/40 mt-1">Encryption</p>
          </div>
        </motion.div>

        {/* Sessions list */}
        {sessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-lg font-semibold mb-6 text-white/90 font-serif">Recent History</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-2xl p-5 flex items-center justify-between transition-all group hover:bg-white/[0.02]"
                  style={{ background: 'rgba(13,18,37,0.4)', border: '1px solid rgba(129,140,248,0.1)' }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#818cf8]/10 flex items-center justify-center shrink-0 border border-[#818cf8]/20 group-hover:bg-[#818cf8]/20 transition-colors">
                      <Clock className="w-5 h-5 text-[#818cf8]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white/90 text-sm">{session.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-white/30">{formatDate(session.updated_at)}</span>
                        <div className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="text-[10px] text-white/40 uppercase tracking-widest">{session.status?.replace("_", " ") || "DRAFT"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSession(session.id)}
                      className="text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Link href={`/dashboard/testimony?session=${session.id}`}>
                      <Button variant="outline" className="border-[#818cf8]/30 hover:bg-[#818cf8]/10 text-white rounded-xl bg-white/5 transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Name Testimony Modal */}
      <AnimatePresence>
        {showNameModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: 'rgba(8,12,26,0.85)', backdropFilter: 'blur(20px)' }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="relative w-full max-w-md p-8 rounded-3xl"
              style={{ background: 'rgba(13,18,37,0.9)', border: '1px solid rgba(129,140,248,0.2)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
            >
              <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(129,140,248,0.15)', border: '1px solid rgba(129,140,248,0.3)' }}>
                  <Plus className="w-6 h-6 text-[#818cf8]" />
                </div>
                <h2 className="text-2xl font-bold text-white/95 mb-2">Name your testimony</h2>
                <p className="text-sm text-white/50 leading-relaxed">
                  Give this testimony a clear name so you can easily find it later. You can always change it.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={testimonyName}
                    onChange={(e) => setTestimonyName(e.target.value)}
                    placeholder="e.g. Incident at work - March 2026"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/90 placeholder:text-white/30 focus:outline-none focus:border-[#818cf8]/50 transition-colors"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleConfirmCreateSession()
                    }}
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowNameModal(false)}
                    className="flex-1 py-3 rounded-xl text-sm font-medium text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors border border-transparent"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmCreateSession}
                    disabled={isCreating}
                    className="flex-1 py-3 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}
                  >
                    {isCreating ? 'Creating...' : 'Create Session'} 
                    {!isCreating && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
