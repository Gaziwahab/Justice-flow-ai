"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  BarChart3,
  TrendingUp,
  FileText,
  Calendar,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Activity,
  Brain,
  Target,
  PieChart,
  Layers
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Analytics {
  totalSessions: number
  completedSessions: number
  totalTestimonies: number
  totalEvidence: number
  totalTimelineEvents: number
  averageCompletion: number
  riskAssessments: {
    low: number
    medium: number
    high: number
    critical: number
  }
  recentActivity: {
    date: string
    action: string
    type: string
  }[]
  weeklyProgress: {
    day: string
    sessions: number
    testimonies: number
  }[]
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    try {
      // Fetch all data
      const [
        { data: sessions },
        { data: testimonies },
        { data: evidence },
        { data: timelineEvents },
        { data: riskAssessments }
      ] = await Promise.all([
        supabase.from('sessions').select('*').eq('user_id', user.id),
        supabase.from('testimonies').select('*').eq('user_id', user.id),
        supabase.from('evidence').select('*').eq('user_id', user.id),
        supabase.from('timeline_events').select('*').eq('user_id', user.id),
        supabase.from('risk_assessments').select('*').eq('user_id', user.id)
      ])

      const totalSessions = sessions?.length || 0
      const completedSessions = sessions?.filter(s => s.status === 'completed').length || 0

      // Calculate risk breakdown
      const riskBreakdown = {
        low: riskAssessments?.filter(r => r.overall_risk_level === 'low').length || 0,
        medium: riskAssessments?.filter(r => r.overall_risk_level === 'medium').length || 0,
        high: riskAssessments?.filter(r => r.overall_risk_level === 'high').length || 0,
        critical: riskAssessments?.filter(r => r.overall_risk_level === 'critical').length || 0
      }

      // Generate weekly progress (last 7 days)
      const weeklyProgress = []
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dayStr = date.toISOString().split('T')[0]
        
        weeklyProgress.push({
          day: days[date.getDay()],
          sessions: sessions?.filter(s => s.created_at?.startsWith(dayStr)).length || 0,
          testimonies: testimonies?.filter(t => t.created_at?.startsWith(dayStr)).length || 0
        })
      }

      // Recent activity
      const recentActivity = [
        ...(sessions?.slice(-3).map(s => ({
          date: new Date(s.created_at).toLocaleDateString(),
          action: s.status === 'completed' ? 'Completed session' : 'Started session',
          type: 'session'
        })) || []),
        ...(testimonies?.slice(-3).map(t => ({
          date: new Date(t.created_at).toLocaleDateString(),
          action: `Added ${t.step_type} testimony`,
          type: 'testimony'
        })) || [])
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

      setAnalytics({
        totalSessions,
        completedSessions,
        totalTestimonies: testimonies?.length || 0,
        totalEvidence: evidence?.length || 0,
        totalTimelineEvents: timelineEvents?.length || 0,
        averageCompletion: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
        riskAssessments: riskBreakdown,
        recentActivity,
        weeklyProgress
      })
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const stats = [
    { 
      label: "Total Sessions", 
      value: analytics?.totalSessions || 0, 
      icon: Layers,
      color: "text-primary",
      bgColor: "bg-primary/20"
    },
    { 
      label: "Completed", 
      value: analytics?.completedSessions || 0, 
      icon: CheckCircle2,
      color: "text-green-500",
      bgColor: "bg-green-500/20"
    },
    { 
      label: "Testimonies", 
      value: analytics?.totalTestimonies || 0, 
      icon: FileText,
      color: "text-accent",
      bgColor: "bg-accent/20"
    },
    { 
      label: "Evidence Files", 
      value: analytics?.totalEvidence || 0, 
      icon: Shield,
      color: "text-amber-500",
      bgColor: "bg-amber-500/20"
    },
    { 
      label: "Timeline Events", 
      value: analytics?.totalTimelineEvents || 0, 
      icon: Calendar,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/20"
    },
    { 
      label: "Completion Rate", 
      value: `${analytics?.averageCompletion || 0}%`, 
      icon: Target,
      color: "text-purple-500",
      bgColor: "bg-purple-500/20"
    },
  ]

  const maxWeeklyValue = Math.max(
    ...(analytics?.weeklyProgress.map(d => Math.max(d.sessions, d.testimonies)) || [1])
  )

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">Case Analytics</h1>
        <p className="text-muted-foreground">
          Track your documentation progress and case insights
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card rounded-2xl p-4 border border-border/50"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Progress Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-6 border border-border/50"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Weekly Activity</h3>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </div>
          </div>

          <div className="flex items-end justify-between gap-2 h-40">
            {analytics?.weeklyProgress.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex gap-1 justify-center h-32">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.sessions / maxWeeklyValue) * 100}%` }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="w-3 bg-primary rounded-t-full"
                    style={{ minHeight: day.sessions > 0 ? '8px' : '0' }}
                  />
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.testimonies / maxWeeklyValue) * 100}%` }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="w-3 bg-accent rounded-t-full"
                    style={{ minHeight: day.testimonies > 0 ? '8px' : '0' }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{day.day}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">Sessions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span className="text-xs text-muted-foreground">Testimonies</span>
            </div>
          </div>
        </motion.div>

        {/* Risk Assessment Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-6 border border-border/50"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold">Risk Assessment</h3>
              <p className="text-xs text-muted-foreground">Based on AI analysis</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { level: 'Critical', count: analytics?.riskAssessments.critical || 0, color: 'bg-red-500', textColor: 'text-red-500' },
              { level: 'High', count: analytics?.riskAssessments.high || 0, color: 'bg-orange-500', textColor: 'text-orange-500' },
              { level: 'Medium', count: analytics?.riskAssessments.medium || 0, color: 'bg-amber-500', textColor: 'text-amber-500' },
              { level: 'Low', count: analytics?.riskAssessments.low || 0, color: 'bg-green-500', textColor: 'text-green-500' },
            ].map((risk) => {
              const total = (analytics?.riskAssessments.low || 0) + 
                           (analytics?.riskAssessments.medium || 0) + 
                           (analytics?.riskAssessments.high || 0) + 
                           (analytics?.riskAssessments.critical || 0)
              const percentage = total > 0 ? (risk.count / total) * 100 : 0

              return (
                <div key={risk.level}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className={risk.textColor}>{risk.level}</span>
                    <span className="text-muted-foreground">{risk.count}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className={`h-full ${risk.color} rounded-full`}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {Object.values(analytics?.riskAssessments || {}).every(v => v === 0) && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No risk assessments yet. Start a conversation with ARIA to get AI-powered insights.
            </div>
          )}
        </motion.div>
      </div>

      {/* Documentation Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card rounded-2xl p-6 border border-border/50 mb-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h3 className="font-semibold">Documentation Progress</h3>
            <p className="text-xs text-muted-foreground">Your journey so far</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { step: "Identity", icon: Brain, complete: (analytics?.totalTestimonies || 0) > 0 },
            { step: "Story", icon: FileText, complete: (analytics?.totalTestimonies || 0) > 1 },
            { step: "Timeline", icon: Calendar, complete: (analytics?.totalTimelineEvents || 0) > 0 },
            { step: "Evidence", icon: Shield, complete: (analytics?.totalEvidence || 0) > 0 },
          ].map((item, i) => (
            <div 
              key={item.step}
              className={`flex items-center gap-3 p-4 rounded-xl border ${
                item.complete 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-muted/30 border-border/50'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                item.complete ? 'bg-green-500/20' : 'bg-muted'
              }`}>
                {item.complete ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className={`text-sm font-medium ${item.complete ? 'text-green-500' : 'text-muted-foreground'}`}>
                  {item.step}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.complete ? 'Completed' : 'Pending'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card rounded-2xl p-6 border border-border/50"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold">Recent Activity</h3>
            <p className="text-xs text-muted-foreground">Your latest actions</p>
          </div>
        </div>

        {analytics?.recentActivity && analytics.recentActivity.length > 0 ? (
          <div className="space-y-3">
            {analytics.recentActivity.map((activity, i) => (
              <div 
                key={i}
                className="flex items-center gap-4 p-3 rounded-xl bg-muted/30"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activity.type === 'session' ? 'bg-primary/20' : 'bg-accent/20'
                }`}>
                  {activity.type === 'session' ? (
                    <Layers className="w-4 h-4 text-primary" />
                  ) : (
                    <FileText className="w-4 h-4 text-accent" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No recent activity. Start documenting to see your progress here.
          </div>
        )}
      </motion.div>
    </div>
  )
}
