"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Mic, Brain, FileText } from "lucide-react"

const cards = [
  {
    icon: Mic,
    title: "Record",
    subtitle: "Voice & Text Input",
    description: "Share your experience through voice or text. Our system captures every detail with empathy.",
    accent: "#38bdf8",
    mockContent: "waveform" as const,
  },
  {
    icon: Brain,
    title: "Analyse",
    subtitle: "AI Timeline Builder",
    description: "Watch as AI organises your memories into a structured, chronological timeline.",
    accent: "#818cf8",
    mockContent: "timeline" as const,
  },
  {
    icon: FileText,
    title: "Report",
    subtitle: "Legal Document",
    description: "Generate professional, legal-ready reports in PDF format, ready for authorities.",
    accent: "#34d399",
    mockContent: "document" as const,
  },
]

function WaveformMock() {
  return (
    <div className="flex items-end justify-center gap-[3px] h-16 px-4">
      {Array.from({ length: 28 }).map((_, i) => {
        const height = 15 + Math.sin(i * 0.8) * 25 + Math.cos(i * 1.3) * 15
        return (
          <motion.div
            key={i}
            className="w-[3px] rounded-full"
            style={{ background: 'linear-gradient(180deg, #38bdf8, rgba(56, 189, 248, 0.3))' }}
            initial={{ height: 4 }}
            whileInView={{ height: `${Math.max(8, height)}px` }}
            transition={{ duration: 0.6, delay: i * 0.03 }}
          />
        )
      })}
    </div>
  )
}

function TimelineMock() {
  const events = ["Incident", "Report Filed", "Evidence", "Timeline"]
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      {events.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <motion.div
            className="flex flex-col items-center gap-1"
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.15 }}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{
                background: '#818cf8',
                boxShadow: '0 0 8px rgba(129, 140, 248, 0.5)',
              }}
            />
            <span className="text-[9px] text-white/30 whitespace-nowrap">{label}</span>
          </motion.div>
          {i < events.length - 1 && (
            <motion.div
              className="h-[2px] w-8 rounded-full"
              style={{ background: 'rgba(129, 140, 248, 0.3)' }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 0.4, delay: 0.4 + i * 0.15 }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

function DocumentMock() {
  return (
    <div className="px-4 py-2 space-y-2">
      {[85, 65, 90, 45, 70].map((w, i) => (
        <motion.div
          key={i}
          className="h-[6px] rounded-full"
          style={{
            background: i === 0
              ? 'rgba(52, 211, 153, 0.4)'
              : 'rgba(255, 255, 255, 0.06)',
            width: `${w}%`,
          }}
          initial={{ scaleX: 0, originX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
        />
      ))}
      <motion.div
        className="flex items-center gap-1.5 mt-3"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
        <span className="text-[9px] text-emerald-400/60">Report ready</span>
      </motion.div>
    </div>
  )
}

function MockContent({ type }: { type: "waveform" | "timeline" | "document" }) {
  switch (type) {
    case "waveform": return <WaveformMock />
    case "timeline": return <TimelineMock />
    case "document": return <DocumentMock />
  }
}

export default function Scroll3DShowcase() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  // Card transforms driven by scroll
  const card1X = useTransform(scrollYProgress, [0, 0.3, 0.5], [-300, -50, 0])
  const card1Y = useTransform(scrollYProgress, [0, 0.3, 0.5], [100, 20, 0])
  const card1Rotate = useTransform(scrollYProgress, [0, 0.3, 0.5], [-15, -5, 0])
  const card1Opacity = useTransform(scrollYProgress, [0, 0.2, 0.4], [0, 0.5, 1])

  const card2Y = useTransform(scrollYProgress, [0.05, 0.35, 0.55], [200, 40, 0])
  const card2Scale = useTransform(scrollYProgress, [0.05, 0.35, 0.55], [0.85, 0.95, 1])
  const card2Opacity = useTransform(scrollYProgress, [0.05, 0.25, 0.45], [0, 0.5, 1])

  const card3X = useTransform(scrollYProgress, [0.1, 0.4, 0.6], [300, 50, 0])
  const card3Y = useTransform(scrollYProgress, [0.1, 0.4, 0.6], [100, 20, 0])
  const card3Rotate = useTransform(scrollYProgress, [0.1, 0.4, 0.6], [15, 5, 0])
  const card3Opacity = useTransform(scrollYProgress, [0.1, 0.3, 0.5], [0, 0.5, 1])

  // Section-level label
  const labelOpacity = useTransform(scrollYProgress, [0.1, 0.25, 0.7, 0.85], [0, 1, 1, 0])
  const labelY = useTransform(scrollYProgress, [0.1, 0.25], [30, 0])

  const cardTransforms = [
    { x: card1X, y: card1Y, rotateY: card1Rotate, opacity: card1Opacity, scale: undefined },
    { x: undefined, y: card2Y, rotateY: undefined, opacity: card2Opacity, scale: card2Scale },
    { x: card3X, y: card3Y, rotateY: card3Rotate, opacity: card3Opacity, scale: undefined },
  ]

  return (
    <section ref={containerRef} className="relative py-12 md:py-20">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px]"
          style={{
            background: 'radial-gradient(ellipse, rgba(99, 102, 241, 0.06) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      {/* Section label */}
      <motion.div
        className="text-center mb-12 md:mb-16 relative z-10"
        style={{ opacity: labelOpacity, y: labelY }}
      >
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full"
          style={{
            background: 'rgba(15, 20, 45, 0.4)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(120, 140, 200, 0.12)',
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#818cf8] animate-pulse" />
          <span className="text-sm text-white/45">See it in action</span>
        </motion.div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
          <span className="text-white">Three steps to </span>
          <span className="bg-gradient-to-r from-[#38bdf8] via-[#818cf8] to-[#34d399] bg-clip-text text-transparent">
            justice
          </span>
        </h2>
        <p className="text-lg text-white/35 max-w-xl mx-auto">
          Experience the full journey — from voice to verified legal document
        </p>
      </motion.div>

      {/* 3D Cards */}
      <div className="relative z-10 perspective-1000 max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {cards.map((card, index) => {
            const transforms = cardTransforms[index]
            return (
              <motion.div
                key={card.title}
                className="preserve-3d"
                style={{
                  x: transforms.x,
                  y: transforms.y,
                  rotateY: transforms.rotateY,
                  opacity: transforms.opacity,
                  scale: transforms.scale,
                }}
              >
                <div
                  className="group rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.03]"
                  style={{
                    background: 'rgba(12, 16, 35, 0.5)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(100, 120, 180, 0.12)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
                  }}
                >
                  {/* Card header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                        style={{
                          background: `${card.accent}15`,
                          border: `1px solid ${card.accent}25`,
                        }}
                      >
                        <card.icon className="w-5 h-5" style={{ color: card.accent }} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white/90">{card.title}</h3>
                        <p className="text-xs text-white/30">{card.subtitle}</p>
                      </div>
                    </div>
                    <p className="text-sm text-white/35 leading-relaxed">{card.description}</p>
                  </div>

                  {/* Mock content area */}
                  <div
                    className="mx-4 mb-4 rounded-xl py-4 overflow-hidden"
                    style={{
                      background: 'rgba(8, 12, 26, 0.6)',
                      border: '1px solid rgba(100, 120, 180, 0.08)',
                    }}
                  >
                    <MockContent type={card.mockContent} />
                  </div>

                  {/* Bottom accent line */}
                  <div
                    className="h-[2px] w-full"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${card.accent}40, transparent)`,
                    }}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
