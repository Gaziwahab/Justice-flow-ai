"use client"

import { motion } from "framer-motion"
import { 
  UserCheck, 
  MessageSquare, 
  Clock, 
  FileCheck,
} from "lucide-react"

const steps = [
  {
    number: "01",
    icon: UserCheck,
    title: "Choose Your Path",
    description: "Sign up for permanent storage or continue completely anonymously. No pressure, no judgment.",
    accent: "#818cf8",
  },
  {
    number: "02",
    icon: MessageSquare,
    title: "Share Your Story",
    description: "Type or speak your experience in fragments. Our AI understands context and fills gaps gently.",
    accent: "#38bdf8",
  },
  {
    number: "03",
    icon: Clock,
    title: "Build Timeline",
    description: "Watch as AI organizes your memories into a coherent, chronological timeline with evidence links.",
    accent: "#c084fc",
  },
  {
    number: "04",
    icon: FileCheck,
    title: "Generate Report",
    description: "Download a professional, legal-ready report in PDF format. Ready for authorities if you choose.",
    accent: "#34d399",
  }
]

export default function Steps() {
  return (
    <section id="how-it-works" className="relative py-28 px-4 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6366f1]/[0.03] rounded-full blur-[120px]" />
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">How </span>
            <span className="bg-gradient-to-r from-[#818cf8] to-[#a78bfa] bg-clip-text text-transparent">Justice Flow</span>
            <span className="text-white"> works</span>
          </h2>
          <p className="text-lg text-white/35 max-w-2xl mx-auto">
            A gentle, guided process designed to support you every step of the way.
          </p>
        </motion.div>

        <div className="relative">
          <div 
            className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px hidden sm:block"
            style={{ background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 50%, rgba(99, 102, 241, 0.2) 100%)' }}
          />

          <div className="space-y-12 md:space-y-0">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative flex flex-col md:flex-row items-center gap-8 md:gap-16 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div className={`flex-1 ${index % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                  {/* Glassy step card */}
                  <div 
                    className="inline-block p-7 rounded-2xl transition-all duration-300"
                    style={{
                      background: 'rgba(12, 16, 35, 0.4)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      border: '1px solid rgba(100, 120, 180, 0.1)',
                      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
                    }}
                  >
                    <div className={`inline-flex items-center gap-3 mb-4 ${index % 2 === 0 ? "md:flex-row-reverse" : ""}`}>
                      <span className="text-3xl font-bold" style={{ color: step.accent }}>{step.number}</span>
                      <div 
                        className="w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{ background: `${step.accent}12`, border: `1px solid ${step.accent}20` }}
                      >
                        <step.icon className="w-5 h-5" style={{ color: step.accent }} />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-white/90">{step.title}</h3>
                    <p className="text-white/35 max-w-sm text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>

                <div 
                  className="absolute left-8 md:left-1/2 top-8 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 w-3.5 h-3.5 rounded-full z-10 hidden sm:block"
                  style={{
                    background: step.accent,
                    boxShadow: `0 0 12px ${step.accent}60`,
                  }}
                />

                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
