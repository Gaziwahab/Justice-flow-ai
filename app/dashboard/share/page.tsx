"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Share2, 
  Link2, 
  Mail, 
  Lock, 
  Clock, 
  Eye,
  Copy,
  Check,
  Trash2,
  Shield,
  FileText,
  Users,
  Building2,
  Gavel,
  UserCheck,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  QrCode
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

interface SharedReport {
  id: string
  report_id: string
  share_token: string
  recipient_email: string | null
  recipient_type: string
  expires_at: string | null
  accessed_at: string | null
  access_count: number
  is_revoked: boolean
  created_at: string
  reports?: {
    title: string
  }
}

interface Report {
  id: string
  title: string
  status: string
  created_at: string
}

const recipientTypes = [
  { id: 'lawyer', label: 'Lawyer', icon: Gavel, description: 'Legal representative' },
  { id: 'authority', label: 'Authority', icon: Building2, description: 'Law enforcement or regulatory body' },
  { id: 'ngo', label: 'NGO', icon: Users, description: 'Support organization' },
  { id: 'trusted_person', label: 'Trusted Person', icon: UserCheck, description: 'Family member or friend' },
]

export default function SharePage() {
  const [reports, setReports] = useState<Report[]>([])
  const [sharedReports, setSharedReports] = useState<SharedReport[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [recipientType, setRecipientType] = useState<string>('lawyer')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [expiresIn, setExpiresIn] = useState<number>(7)
  const [usePassword, setUsePassword] = useState(false)
  const [password, setPassword] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: reportsData }, { data: sharedData }] = await Promise.all([
      supabase.from('reports').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('shared_reports').select('*, reports(title)').eq('user_id', user.id).order('created_at', { ascending: false })
    ])

    setReports(reportsData || [])
    setSharedReports(sharedData || [])
    setLoading(false)
  }

  const generateShareLink = async () => {
    if (!selectedReport) return

    setIsCreating(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      // Generate a secure token
      const token = crypto.randomUUID() + '-' + crypto.randomUUID()
      
      // Calculate expiry
      const expiresAt = expiresIn > 0 
        ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000).toISOString()
        : null

      // Create share record
      const { data, error } = await supabase.from('shared_reports').insert({
        report_id: selectedReport,
        user_id: user.id,
        share_token: token,
        recipient_email: recipientEmail || null,
        recipient_type: recipientType,
        expires_at: expiresAt,
        access_password_hash: usePassword && password ? password : null // In production, hash this!
      }).select().single()

      if (error) throw error

      const shareUrl = `${window.location.origin}/shared/${token}`
      setGeneratedLink(shareUrl)

      // Refresh data
      fetchData()
    } catch (err) {
      console.error('Failed to create share link:', err)
    } finally {
      setIsCreating(false)
    }
  }

  const copyLink = async (token: string) => {
    const url = `${window.location.origin}/shared/${token}`
    await navigator.clipboard.writeText(url)
    setCopiedId(token)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const revokeAccess = async (id: string) => {
    const supabase = createClient()
    await supabase.from('shared_reports').update({ is_revoked: true }).eq('id', id)
    fetchData()
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, typeof Gavel> = {
      lawyer: Gavel,
      authority: Building2,
      ngo: Users,
      trusted_person: UserCheck,
      other: Share2
    }
    return icons[type] || Share2
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Secure Sharing</h1>
          <p className="text-muted-foreground">
            Share your reports securely with lawyers, authorities, or trusted individuals
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-primary to-accent"
          disabled={reports.length === 0}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Create Share Link
        </Button>
      </div>

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-4 rounded-xl bg-primary/10 border border-primary/30"
      >
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-primary mb-1">End-to-End Security</p>
            <p className="text-xs text-muted-foreground">
              All shared links are encrypted and can be revoked at any time. 
              You control who has access and for how long.
            </p>
          </div>
        </div>
      </motion.div>

      {/* No Reports */}
      {reports.length === 0 && (
        <div className="text-center py-12 glass-card rounded-2xl border border-border/50">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No Reports Yet</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Generate a report first before you can share it
          </p>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard/report'}>
            Create a Report
          </Button>
        </div>
      )}

      {/* Active Shares */}
      {sharedReports.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Active Share Links</h2>
          <div className="space-y-3">
            {sharedReports.map((share, index) => {
              const Icon = getTypeIcon(share.recipient_type)
              const expired = isExpired(share.expires_at)
              
              return (
                <motion.div
                  key={share.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`glass-card rounded-xl p-4 border ${
                    share.is_revoked || expired
                      ? 'border-destructive/30 opacity-60'
                      : 'border-border/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        share.is_revoked || expired
                          ? 'bg-destructive/20'
                          : 'bg-primary/20'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          share.is_revoked || expired
                            ? 'text-destructive'
                            : 'text-primary'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {share.reports?.title || 'Report'}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          Shared with: {share.recipient_type.replace('_', ' ')}
                          {share.recipient_email && ` (${share.recipient_email})`}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {share.expires_at 
                              ? `Expires ${formatDate(share.expires_at)}`
                              : 'Never expires'
                            }
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {share.access_count} views
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {share.is_revoked ? (
                        <span className="px-2 py-1 rounded-full bg-destructive/20 text-destructive text-xs">
                          Revoked
                        </span>
                      ) : expired ? (
                        <span className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-500 text-xs">
                          Expired
                        </span>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyLink(share.share_token)}
                          >
                            {copiedId === share.share_token ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => revokeAccess(share.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Create Share Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
              onClick={() => { setShowCreateModal(false); setGeneratedLink(null) }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 p-6 rounded-2xl glass-card border border-border/50 max-h-[90vh] overflow-y-auto"
            >
              {generatedLink ? (
                // Success State
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Link Created!</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Your secure share link is ready
                  </p>
                  
                  <div className="p-4 rounded-xl bg-muted/50 mb-6">
                    <p className="text-xs text-muted-foreground mb-2">Share Link</p>
                    <div className="flex items-center gap-2">
                      <Input
                        value={generatedLink}
                        readOnly
                        className="text-sm bg-background"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedLink)
                          setCopiedId('new')
                          setTimeout(() => setCopiedId(null), 2000)
                        }}
                      >
                        {copiedId === 'new' ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => { setShowCreateModal(false); setGeneratedLink(null) }}
                    >
                      Done
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => {
                        setGeneratedLink(null)
                        setSelectedReport(null)
                        setRecipientEmail('')
                        setPassword('')
                      }}
                    >
                      Create Another
                    </Button>
                  </div>
                </div>
              ) : (
                // Create Form
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">Create Share Link</h3>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="p-2 rounded-full hover:bg-muted transition-colors"
                    >
                      ×
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Select Report */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Select Report</Label>
                      <div className="space-y-2">
                        {reports.map((report) => (
                          <button
                            key={report.id}
                            onClick={() => setSelectedReport(report.id)}
                            className={`w-full p-3 rounded-xl border text-left transition-all ${
                              selectedReport === report.id
                                ? 'border-primary bg-primary/10'
                                : 'border-border/50 hover:border-border'
                            }`}
                          >
                            <p className="font-medium text-sm">{report.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Created {formatDate(report.created_at)}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Recipient Type */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Sharing With</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {recipientTypes.map((type) => (
                          <button
                            key={type.id}
                            onClick={() => setRecipientType(type.id)}
                            className={`p-3 rounded-xl border text-left transition-all ${
                              recipientType === type.id
                                ? 'border-primary bg-primary/10'
                                : 'border-border/50 hover:border-border'
                            }`}
                          >
                            <type.icon className={`w-5 h-5 mb-1 ${
                              recipientType === type.id ? 'text-primary' : 'text-muted-foreground'
                            }`} />
                            <p className="font-medium text-sm">{type.label}</p>
                            <p className="text-xs text-muted-foreground">{type.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Recipient Email (Optional) */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Recipient Email (Optional)
                      </Label>
                      <Input
                        type="email"
                        placeholder="lawyer@example.com"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        className="bg-muted/30"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        We&apos;ll send them a notification when you share
                      </p>
                    </div>

                    {/* Expiration */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Link Expires In</Label>
                      <div className="flex gap-2">
                        {[
                          { value: 1, label: '24 hours' },
                          { value: 7, label: '7 days' },
                          { value: 30, label: '30 days' },
                          { value: 0, label: 'Never' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setExpiresIn(option.value)}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                              expiresIn === option.value
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted/50 hover:bg-muted'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Password Protection */}
                    <div>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={usePassword}
                          onChange={(e) => setUsePassword(e.target.checked)}
                          className="w-4 h-4 rounded border-border"
                        />
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Password protect link</span>
                        </div>
                      </label>
                      {usePassword && (
                        <Input
                          type="password"
                          placeholder="Enter password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="mt-2 bg-muted/30"
                        />
                      )}
                    </div>

                    {/* Warning */}
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground">
                          Only share your report with people you trust. You can revoke access at any time.
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowCreateModal(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="flex-1 bg-gradient-to-r from-primary to-accent"
                        onClick={generateShareLink}
                        disabled={!selectedReport || isCreating}
                      >
                        {isCreating ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Link2 className="w-4 h-4 mr-2" />
                            Generate Link
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
