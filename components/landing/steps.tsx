"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  UserCheck,
  MessageSquare,
  Clock,
  FileCheck,
  ArrowRight,
  Shield,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const steps = [
  {
    number: "01",
    icon: UserCheck,
    title: "Choose Your Path",
    description:
      "Sign up for permanent storage or continue completely anonymously. No pressure, no judgment. Your identity, your choice.",
    accent: "#818cf8",
    illustration: "choose" as const,
  },
  {
    number: "02",
    icon: MessageSquare,
    title: "Share Your Story",
    description:
      "Type or speak your experience in fragments. Our AI understands context and fills gaps gently, at your own pace.",
    accent: "#38bdf8",
    illustration: "share" as const,
  },
  {
    number: "03",
    icon: Clock,
    title: "Build Timeline",
    description:
      "Watch as AI organizes your memories into a coherent, chronological timeline with evidence links and context.",
    accent: "#c084fc",
    illustration: "timeline" as const,
  },
  {
    number: "04",
    icon: FileCheck,
    title: "Generate Report",
    description:
      "Download a professional, legal-ready report in PDF format. Ready for authorities if you choose to proceed.",
    accent: "#34d399",
    illustration: "report" as const,
  },
]

const AUTO_ADVANCE_MS = 5000
const RING_CIRCUMFERENCE = 56.5 // 2 * Math.PI * 9

/* ================================================================
   Per-step animated illustrations (pure CSS + SVG)
   ================================================================ */

function ChooseIllustration() {
  return (
    <div className="flex flex-col items-center gap-3 py-4 px-6">
      {/* Two glassy option buttons */}
      {[
        { icon: Shield, label: "Sign Up Securely", sub: "Save your progress" },
        { icon: User, label: "Stay Anonymous", sub: "No account needed" },
      ].map((opt, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: i === 0 ? -30 : 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: i === 0 ? 'rgba(129, 140, 248, 0.08)' : 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${i === 0 ? 'rgba(129, 140, 248, 0.2)' : 'rgba(255, 255, 255, 0.06)'}`,
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: i === 0 ? 'rgba(129, 140, 248, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            }}
          >
            <opt.icon className="w-4 h-4" style={{ color: i === 0 ? '#818cf8' : 'rgba(255,255,255,0.4)' }} />
          </div>
          <div>
            <p className="text-sm font-medium text-white/80">{opt.label}</p>
            <p className="text-[10px] text-white/25">{opt.sub}</p>
          </div>
          {i === 0 && (
            <motion.div
              className="ml-auto w-4 h-4 rounded-full border-2 border-[#818cf8] flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
            >
              <div className="w-2 h-2 rounded-full bg-[#818cf8]" />
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

function ShareIllustration() {
  const messages = [
    { text: "It happened last Tuesday evening...", isUser: true },
    { text: "Take your time. I'm listening.", isUser: false },
    { text: "I was walking home when...", isUser: true },
  ]
  return (
    <div className="flex flex-col gap-2.5 py-3 px-5">
      {messages.map((msg, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 + i * 0.5 }}
          className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className="px-3.5 py-2 rounded-2xl max-w-[80%] text-xs leading-relaxed"
            style={{
              background: msg.isUser
                ? 'rgba(56, 189, 248, 0.12)'
                : 'rgba(255, 255, 255, 0.04)',
              border: msg.isUser
                ? '1px solid rgba(56, 189, 248, 0.2)'
                : '1px solid rgba(255, 255, 255, 0.06)',
              color: msg.isUser ? 'rgba(186, 230, 253, 0.9)' : 'rgba(255, 255, 255, 0.5)',
              borderBottomRightRadius: msg.isUser ? '4px' : undefined,
              borderBottomLeftRadius: !msg.isUser ? '4px' : undefined,
            }}
          >
            {msg.text}
          </div>
        </motion.div>
      ))}
      {/* Typing indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="flex items-center gap-1 pl-2"
      >
        {[0, 1, 2].map((d) => (
          <motion.div
            key={d}
            className="w-1.5 h-1.5 rounded-full bg-white/20"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, delay: d * 0.2, repeat: Infinity }}
          />
        ))}
      </motion.div>
    </div>
  )
}

function TimelineIllustration() {
  const events = [
    { label: "Incident", time: "6:30 PM" },
    { label: "Report Filed", time: "7:15 PM" },
    { label: "Evidence", time: "7:45 PM" },
    { label: "Verified", time: "8:00 PM" },
  ]
  return (
    <div className="py-4 px-5">
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute top-[10px] left-[6px] right-[6px] h-[2px]" style={{ background: 'rgba(192, 132, 252, 0.1)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #c084fc, rgba(192, 132, 252, 0.3))' }}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, delay: 0.3, ease: "easeOut" }}
          />
        </div>

        <div className="flex justify-between relative z-10">
          {events.map((evt, i) => (
            <motion.div
              key={i}
              className="flex flex-col items-center gap-1.5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.4 }}
            >
              <motion.div
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(192, 132, 252, 0.2)',
                  border: '2px solid #c084fc',
                  boxShadow: '0 0 8px rgba(192, 132, 252, 0.4)',
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 + i * 0.4, type: "spring", stiffness: 300 }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#c084fc]" />
              </motion.div>
              <span className="text-[10px] font-medium text-white/50">{evt.label}</span>
              <span className="text-[9px] text-white/20">{evt.time}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ReportIllustration() {
  return (
    <div className="py-3 px-5">
      {/* Document mock */}
      <motion.div
        className="rounded-xl p-4 space-y-2"
        style={{
          background: 'rgba(8, 12, 26, 0.5)',
          border: '1px solid rgba(52, 211, 153, 0.1)',
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-white/30 font-medium">Justice_Report_2026.pdf</span>
          <motion.div
            className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400/70 border border-emerald-400/20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, type: "spring" }}
          >
            Ready
          </motion.div>
        </div>

        {/* Fake text lines */}
        {[90, 70, 85, 50, 75, 60].map((w, i) => (
          <motion.div
            key={i}
            className="h-[4px] rounded-full"
            style={{
              background: i < 2 ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255, 255, 255, 0.04)',
              width: `${w}%`,
            }}
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.4, delay: 0.4 + i * 0.08 }}
          />
        ))}

        {/* Progress bar */}
        <div className="mt-3 pt-2 border-t border-white/[0.04]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] text-white/20">Generating...</span>
            <motion.span
              className="text-[9px] text-emerald-400/60 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              100%
            </motion.span>
          </div>
          <div className="h-1 rounded-full bg-white/[0.04] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400/50 to-emerald-500/80"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const illustrations: Record<string, () => JSX.Element> = {
  choose: ChooseIllustration,
  share: ShareIllustration,
  timeline: TimelineIllustration,
  report: ReportIllustration,
}

/* ================================================================
   Main Steps component
   ================================================================ */

export default function Steps() {
  const [activeStep, setActiveStep] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Auto-advance
  useEffect(() => {
    if (isPaused) return
    timerRef.current = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length)
    }, AUTO_ADVANCE_MS)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPaused, activeStep])

  const goToStep = useCallback((idx: number) => {
    setActiveStep(idx)
    // Reset timer
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement) &&
          document.activeElement !== containerRef.current) return
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault()
        goToStep((activeStep + 1) % steps.length)
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault()
        goToStep((activeStep - 1 + steps.length) % steps.length)
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [activeStep, goToStep])

  const ActiveIllustration = illustrations[steps[activeStep].illustration]

  return (
    <section
      id="how-it-works"
      className="relative py-28 px-4 overflow-hidden"
      ref={containerRef}
      tabIndex={0}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {/* Background glow */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6366f1]/[0.03] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">How </span>
            <span className="bg-gradient-to-r from-[#818cf8] to-[#a78bfa] bg-clip-text text-transparent">
              Justice Flow
            </span>
            <span className="text-white"> works</span>
          </h2>
          <p className="text-lg text-white/35 max-w-2xl mx-auto">
            A gentle, guided process designed to support you every step of the way.
          </p>
        </motion.div>

        {/* ===== Horizontal step tabs ===== */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-12">
          {steps.map((step, i) => {
            const isActive = i === activeStep
            const isPast = i < activeStep
            return (
              <div key={step.number} className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={() => goToStep(i)}
                  className="relative flex flex-col items-center gap-2 group focus:outline-none"
                  aria-label={`Step ${step.number}: ${step.title}`}
                >
                  {/* Circle with progress ring */}
                  <div className="relative">
                    {/* SVG progress ring (only on active) */}
                    {isActive && !isPaused && (
                      <svg
                        className="absolute -inset-[5px] w-[calc(100%+10px)] h-[calc(100%+10px)] -rotate-90"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          cx="12" cy="12" r="9"
                          fill="none"
                          stroke={step.accent}
                          strokeWidth="1.5"
                          strokeDasharray={RING_CIRCUMFERENCE}
                          strokeDashoffset={RING_CIRCUMFERENCE}
                          className="animate-progress-ring"
                          style={{ opacity: 0.5 }}
                        />
                      </svg>
                    )}

                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 relative z-10"
                      style={{
                        background: isActive
                          ? `${step.accent}20`
                          : isPast
                            ? `${step.accent}10`
                            : 'rgba(15, 20, 45, 0.4)',
                        border: `2px solid ${isActive ? step.accent : isPast ? `${step.accent}40` : 'rgba(100, 120, 180, 0.15)'}`,
                        boxShadow: isActive ? `0 0 20px ${step.accent}30` : 'none',
                      }}
                    >
                      <step.icon
                        className="w-4 h-4 sm:w-5 sm:h-5 transition-colors"
                        style={{ color: isActive || isPast ? step.accent : 'rgba(255, 255, 255, 0.25)' }}
                      />
                    </div>
                  </div>

                  {/* Label (hidden on mobile) */}
                  <span
                    className="hidden sm:block text-xs font-medium transition-colors"
                    style={{ color: isActive ? step.accent : 'rgba(255, 255, 255, 0.25)' }}
                  >
                    {step.title}
                  </span>
                </button>

                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="w-8 sm:w-16 h-[2px] rounded-full" style={{
                    background: isPast || (i < activeStep)
                      ? `linear-gradient(90deg, ${steps[i].accent}60, ${steps[i + 1].accent}60)`
                      : 'rgba(100, 120, 180, 0.1)',
                  }} />
                )}
              </div>
            )
          })}
        </div>

        {/* ===== Active step content ===== */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
          >
            {/* Left: text */}
            <div className="order-2 md:order-1">
              <div
                className="p-7 rounded-2xl"
                style={{
                  background: 'rgba(12, 16, 35, 0.4)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(100, 120, 180, 0.1)',
                  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
                }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <span
                    className="text-3xl sm:text-4xl font-bold"
                    style={{ color: steps[activeStep].accent }}
                  >
                    {steps[activeStep].number}
                  </span>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{
                      background: `${steps[activeStep].accent}12`,
                      border: `1px solid ${steps[activeStep].accent}20`,
                    }}
                  >
                    {(() => {
                      const Icon = steps[activeStep].icon
                      return <Icon className="w-5 h-5" style={{ color: steps[activeStep].accent }} />
                    })()}
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-white/90">
                  {steps[activeStep].title}
                </h3>
                <p className="text-white/35 text-sm sm:text-base leading-relaxed mb-6">
                  {steps[activeStep].description}
                </p>

                {/* Navigation buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => goToStep((activeStep - 1 + steps.length) % steps.length)}
                    className="p-2 rounded-lg transition-all duration-200 hover:bg-white/5"
                    style={{
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                    aria-label="Previous step"
                  >
                    <ChevronLeft className="w-4 h-4 text-white/30" />
                  </button>
                  <button
                    onClick={() => goToStep((activeStep + 1) % steps.length)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 hover:scale-[1.03]"
                    style={{
                      background: `${steps[activeStep].accent}15`,
                      border: `1px solid ${steps[activeStep].accent}30`,
                      color: steps[activeStep].accent,
                    }}
                  >
                    {activeStep < steps.length - 1 ? 'Next Step' : 'Start Over'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <span className="ml-auto text-xs text-white/15">
                    {activeStep + 1} / {steps.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: illustration */}
            <div className="order-1 md:order-2">
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(12, 16, 35, 0.5)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(100, 120, 180, 0.1)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
                }}
              >
                {/* Title bar */}
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.04]">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#ff5f57]" />
                    <div className="w-2 h-2 rounded-full bg-[#febc2e]" />
                    <div className="w-2 h-2 rounded-full bg-[#28c840]" />
                  </div>
                  <span className="flex-1 text-center text-[10px] text-white/15 font-medium">
                    Step {steps[activeStep].number}
                  </span>
                </div>

                {/* Illustration content */}
                <div className="min-h-[180px] sm:min-h-[200px] flex items-center justify-center">
                  <ActiveIllustration />
                </div>

                {/* Bottom accent */}
                <div
                  className="h-[2px]"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${steps[activeStep].accent}40, transparent)`,
                  }}
                />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
