"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import { 
  Brain, 
  Mic, 
  FileText, 
  Shield, 
  Clock, 
  Heart,
  Sparkles,
  Lock,
  ArrowRight,
  ChevronRight
} from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "AI-Powered Understanding",
    description: "Our intelligent system adapts to your emotional state, slowing down when needed and using softer language during difficult moments.",
    stats: { value: "99.2%", label: "Emotional accuracy" },
    preview: "Real-time sentiment analysis that adjusts questioning pace and tone automatically",
    accent: "#818cf8",
  },
  {
    icon: Mic,
    title: "Voice & Text Input",
    description: "Share your story however feels comfortable. Type, speak, or provide fragments - we piece together the timeline for you.",
    stats: { value: "40+", label: "Languages supported" },
    preview: "Advanced speech recognition with trauma-sensitive pause detection",
    accent: "#38bdf8",
  },
  {
    icon: Clock,
    title: "Smart Timeline Builder",
    description: "Transform fragmented memories into structured, legal-ready timelines with AI-assisted chronological ordering.",
    stats: { value: "3min", label: "Avg. processing time" },
    preview: "Automatic event detection and temporal relationship mapping",
    accent: "#c084fc",
  },
  {
    icon: FileText,
    title: "Legal Report Generation",
    description: "Generate professional FIR-style reports and legal summaries, ready for download in PDF format.",
    stats: { value: "12+", label: "Report formats" },
    preview: "Jurisdiction-aware formatting with legal terminology standards",
    accent: "#60a5fa",
  },
  {
    icon: Heart,
    title: "Trauma-Informed Design",
    description: "Every interaction is designed with care. Pause anytime, skip questions, save and resume later - no pressure, ever.",
    stats: { value: "100%", label: "Control" },
    preview: "Safety controls including panic button and emergency resources",
    accent: "#fb7185",
  },
  {
    icon: Lock,
    title: "Complete Privacy",
    description: "End-to-end encryption, anonymous mode, and zero data collection. Your testimony belongs only to you.",
    stats: { value: "256-bit", label: "AES encryption" },
    preview: "Zero-knowledge architecture with local-first data storage",
    accent: "#34d399",
  }
]

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(cardRef, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={cardRef}
      variants={item}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative h-full"
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? "translateY(0)" : "translateY(30px)",
        transition: `all 0.5s ease ${index * 0.1}s`
      }}
    >
      {/* ===== Glassy card ===== */}
      <div 
        className="h-full p-7 rounded-2xl transition-all duration-500 overflow-hidden relative group"
        style={{
          background: 'rgba(12, 16, 35, 0.4)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(100, 120, 180, 0.1)',
          boxShadow: isHovered 
            ? '0 16px 48px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.06)' 
            : '0 4px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
        }}
      >
        {/* Icon */}
        <motion.div 
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 relative z-10"
          style={{
            background: `${feature.accent}12`,
            border: `1px solid ${feature.accent}20`,
          }}
          animate={isHovered ? { scale: 1.08 } : { scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <feature.icon className="w-5 h-5" style={{ color: feature.accent }} />
        </motion.div>

        <h3 className="text-lg font-semibold mb-3 text-white/90 relative z-10">{feature.title}</h3>
        <p className="text-sm text-white/35 leading-relaxed mb-6 relative z-10">{feature.description}</p>

        {/* Bottom stats */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] relative z-10">
          <div>
            <p className="text-xl font-bold" style={{ color: feature.accent }}>{feature.stats.value}</p>
            <p className="text-xs text-white/25">{feature.stats.label}</p>
          </div>
          <motion.div
            animate={isHovered ? { x: 5 } : { x: 0 }}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <ChevronRight className="w-4 h-4 text-white/25 group-hover:text-white/50 transition-colors" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  return (
    <section ref={sectionRef} id="features" className="relative py-28 px-4 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#6366f1]/[0.03] rounded-full blur-[150px]" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full"
            style={{
              background: 'rgba(15, 20, 45, 0.4)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(120, 140, 200, 0.12)',
            }}
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="w-4 h-4 text-[#818cf8]" />
            <span className="text-sm text-white/45">Powerful Features</span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">Technology that </span>
            <span className="bg-gradient-to-r from-[#818cf8] via-[#a78bfa] to-[#818cf8] bg-clip-text text-transparent">
              understands
            </span>
          </h2>
          <p className="text-lg text-white/35 max-w-2xl mx-auto">
            Built with empathy at its core. Every feature is designed to support, not interrogate.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="text-white/35 mb-5">Ready to share your story safely?</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm transition-all"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              color: 'rgba(255, 255, 255, 0.9)',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
            }}
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
