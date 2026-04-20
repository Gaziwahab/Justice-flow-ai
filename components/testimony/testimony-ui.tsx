"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Heart, Shield, AlertTriangle } from "lucide-react"
import type { SupportLevel } from "@/hooks/use-emotional-sensing"

// ===== ARIA Avatar =====
export function AriaAvatar({ supportLevel = 0 }: { supportLevel?: SupportLevel }) {
  const colors = {
    0: "from-[#818cf8] to-[#6366f1]",
    1: "from-[#fbbf24] to-[#f59e0b]",
    2: "from-[#a855f7] to-[#7c3aed]",
    3: "from-[#ef4444] to-[#dc2626]",
  }
  return (
    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors[supportLevel]} p-[1.5px] shrink-0`}>
      <div className="w-full h-full rounded-full flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <Sparkles className="w-4 h-4 text-[#818cf8]" />
      </div>
    </div>
  )
}

// ===== Thinking Indicator =====
export function ThinkingIndicator({ message = "Thinking…" }: { message?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/5 border border-primary/10"
    >
      <div className="flex gap-1">
        {[0, 0.15, 0.3].map((delay, i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary/60"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay }}
          />
        ))}
      </div>
      <span className="text-sm text-foreground/50 italic">{message}</span>
    </motion.div>
  )
}

// ===== Microcopy Badge =====
export function MicrocopBadge({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20"
    >
      <span className="text-emerald-500 text-xs">✓</span>
      <span className="text-sm text-foreground/70 font-medium">{text}</span>
    </motion.div>
  )
}

// ===== Emotional Support Banner =====
export function EmotionalSupportBanner({
  supportLevel,
  bannerConfig,
  onBreak,
}: {
  supportLevel: SupportLevel
  bannerConfig: { bg: string; border: string; textColor: string; icon: string; message: string }
  onBreak: () => void
}) {
  if (supportLevel === 0) return null

  return (
    <motion.div
      key={supportLevel}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-start gap-3 px-4 py-3 rounded-xl"
      style={{ background: bannerConfig.bg, border: `1px solid ${bannerConfig.border}` }}
    >
      <span className="text-lg" style={{ color: bannerConfig.textColor }}>{bannerConfig.icon}</span>
      <div className="flex-1">
        <p className="text-sm" style={{ color: bannerConfig.textColor }}>{bannerConfig.message}</p>
        {supportLevel === 3 && (
          <a href="https://www.crisistextline.org/" target="_blank" rel="noopener noreferrer"
            className="text-xs underline mt-1 block" style={{ color: bannerConfig.textColor }}>
            Crisis Text Line — Text HOME to 741741
          </a>
        )}
      </div>
      {supportLevel >= 2 && (
        <button onClick={onBreak}
          className="text-xs px-3 py-1 rounded-full shrink-0 transition-all hover:opacity-80"
          style={{ background: bannerConfig.border, color: bannerConfig.textColor }}>
          Take a break
        </button>
      )}
    </motion.div>
  )
}

// ===== ARIA Conversation Bubble =====
export function AriaBubble({
  text,
  supportLevel = 0,
  microcopy,
}: {
  text: string
  supportLevel?: SupportLevel
  microcopy?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
    >
      <AriaAvatar supportLevel={supportLevel} />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-foreground/40">ARIA</span>
          {microcopy && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500/70 border border-emerald-500/20">
              {microcopy}
            </span>
          )}
        </div>
        <div className="p-4 rounded-2xl rounded-tl-sm bg-primary/5 border border-primary/10">
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{text}</p>
        </div>
      </div>
    </motion.div>
  )
}

// ===== User Message Bubble =====
export function UserBubble({
  text,
  inputType = "text",
  attachmentName,
  attachmentType,
}: {
  text: string
  inputType?: "text" | "voice"
  attachmentName?: string
  attachmentType?: string
}) {
  const isImage = attachmentType && attachmentType.startsWith("image/")

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 justify-end"
    >
      <div className="flex-1 max-w-[80%]">
        <div className="p-4 rounded-2xl rounded-tr-sm ml-auto space-y-2 bg-primary/10 border border-primary/20">
          {attachmentName && (
            <div className="flex items-center gap-2 p-2 rounded-xl mb-2 bg-background/50 border border-foreground/5">
              <div className="w-8 h-8 rounded-lg flex flex-shrink-0 items-center justify-center bg-primary/15">
                {isImage ? <span className="text-sm">🖼️</span> : <span className="text-sm">📄</span>}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground/80 truncate">{attachmentName}</p>
                <p className="text-[10px] text-foreground/40 uppercase tracking-wider">Attached Evidence</p>
              </div>
            </div>
          )}
          <p className="text-sm text-foreground/85 leading-relaxed">{text}</p>
          {inputType === "voice" && (
            <span className="text-[10px] text-foreground/30 mt-1 block">🎙 via voice</span>
          )}
        </div>
      </div>
      <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center bg-primary/10 border border-primary/20">
        <Heart className="w-4 h-4 text-primary" />
      </div>
    </motion.div>
  )
}

// ===== Evidence Radar Alert =====
export function EvidenceRadar({
  clues,
  onUploadEvidence,
}: {
  clues: string[]
  onUploadEvidence: () => void
}) {
  if (clues.length === 0) return null
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 p-3 rounded-xl cursor-pointer hover:bg-amber-500/5 transition-all bg-amber-500/10 border border-amber-500/20"
      onClick={onUploadEvidence}
    >
      <Shield className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-semibold text-amber-500">Evidence Detected</p>
        <p className="text-xs text-foreground/40 mt-0.5 leading-relaxed">
          You mentioned: {clues.slice(0, 2).join(', ')}. Tap to add evidence →
        </p>
      </div>
    </motion.div>
  )
}

// ===== Witness Radar =====
export function WitnessRadar({ people, onAddWitness }: { people: string[]; onAddWitness: (name: string) => void }) {
  if (people.length === 0) return null
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-3 rounded-xl bg-primary/5 border border-primary/10"
    >
      <p className="text-xs font-semibold text-primary mb-2">👤 People Mentioned</p>
      <div className="flex flex-wrap gap-2">
        {people.slice(0, 3).map((name) => (
          <button key={name} onClick={() => onAddWitness(name)}
            className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 transition-all hover:bg-primary/20">
            + {name} as witness
          </button>
        ))}
      </div>
    </motion.div>
  )
}

// ===== Breathing Exercise =====
export function BreathingExercise({ onDone }: { onDone: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12 px-6 rounded-2xl bg-primary/5 border border-primary/10"
    >
      <motion.div
        className="w-24 h-24 rounded-full mx-auto mb-8 flex items-center justify-center bg-primary/10 border border-primary/20"
        animate={{ scale: [1, 1.4, 1.4, 1, 1] }}
        transition={{ duration: 8, repeat: Infinity, times: [0, 0.25, 0.5, 0.75, 1] }}
      >
        <motion.p
          className="text-xs text-foreground/60"
          animate={{ opacity: [1, 0, 1, 0, 1] }}
          transition={{ duration: 8, repeat: Infinity, times: [0, 0.24, 0.25, 0.74, 0.75] }}
        >
          breathe
        </motion.p>
      </motion.div>
      <p className="text-foreground/60 text-sm mb-2 font-medium">Breathe in for 4… hold for 4… out for 4…</p>
      <p className="text-foreground/30 text-xs mb-8">Take as long as you need. There's no rush.</p>
      <button onClick={onDone}
        className="px-6 py-2.5 rounded-full text-sm font-semibold bg-primary/10 text-primary border border-primary/25 transition-all hover:bg-primary/20">
        I'm ready to continue
      </button>
    </motion.div>
  )
}

// ===== Safe Stop Screen =====
export function SafeStopScreen({ onResume, onExit }: { onResume: () => void; onExit: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/95 backdrop-blur-xl"
    >
      <div className="max-w-md text-center">
        <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center bg-primary/10 border border-primary/25">
          <Shield className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3 tracking-tight">You're safe here</h2>
        <p className="text-foreground/50 mb-8 leading-relaxed">
          Your session is saved and encrypted. Take all the time you need.
          You can leave now and come back whenever you're ready.
        </p>
        <div className="flex flex-col gap-3">
          <button onClick={onResume}
            className="w-full py-3 rounded-full font-semibold bg-primary text-primary-foreground transition-all hover:opacity-90">
            Continue when ready
          </button>
          <button onClick={onExit}
            className="w-full py-3 rounded-full text-sm text-foreground/40 hover:text-foreground/70 transition-colors">
            Save and exit
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ===== Emotion State Buttons (Method 3) =====
export const EMOTION_STATES = [
  { value: "calm", emoji: "😌", label: "I'm okay", level: 0 },
  { value: "unsure", emoji: "😰", label: "Nervous", level: 1 },
  { value: "anxious", emoji: "😢", label: "This is hard", level: 2 },
  { value: "overwhelmed", emoji: "🛑", label: "Need a break", level: 3 },
] as const

export type EmotionStateValue = typeof EMOTION_STATES[number]["value"]

export type EmotionStateValue = typeof EMOTION_STATES[number]["value"]
