"use client"

import { motion } from "framer-motion"
import { Shield, ArrowRight, User, Sparkles, Play, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"

// Animated counter
function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const increment = target / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) { setCount(target); clearInterval(timer) }
      else { setCount(Math.floor(start)) }
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return <span>{count.toLocaleString()}</span>
}

// ===== GLASSY floating badge matching the reference =====
function FloatingBadge({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay }}
      className={`absolute hidden lg:flex items-center gap-3 px-4 py-3 rounded-2xl ${className}`}
      style={{
        background: 'rgba(15, 20, 45, 0.4)',
        backdropFilter: 'blur(16px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
        border: '1px solid rgba(120, 140, 200, 0.15)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      }}
    >
      {children}
    </motion.div>
  )
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 pt-24 pb-16 overflow-hidden">
      
      {/* ===== Floating glassy badges ===== */}
      
      {/* 100K Secure - top left */}
      <FloatingBadge delay={0.8} className="top-[22%] left-6 xl:left-20">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(52, 211, 153, 0.15)' }}>
          <Shield className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <p className="text-xs font-semibold text-white/90">100K Secure</p>
          <p className="text-[10px] text-white/40">End-to-end encrypted</p>
        </div>
      </FloatingBadge>

      {/* AI-Powered - right side */}
      <FloatingBadge delay={1} className="top-[30%] right-6 xl:right-16">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
          <Sparkles className="w-4 h-4 text-violet-400" />
        </div>
        <div>
          <p className="text-xs font-semibold text-white/90">AI-Powered</p>
          <p className="text-[10px] text-white/40">Trauma Informed support</p>
        </div>
      </FloatingBadge>

      {/* 2,647+ testimonies - bottom left */}
      <FloatingBadge delay={1.2} className="bottom-[32%] left-4 xl:left-16">
        <div className="flex -space-x-1.5">
          {[
            'linear-gradient(135deg, #60a5fa, #3b82f6)',
            'linear-gradient(135deg, #a78bfa, #7c3aed)',
            'linear-gradient(135deg, #818cf8, #6366f1)',
          ].map((bg, i) => (
            <div 
              key={i} 
              className="w-7 h-7 rounded-full border-2"
              style={{ background: bg, borderColor: 'rgba(10, 14, 31, 0.8)' }}
            />
          ))}
        </div>
        <div>
          <p className="text-xs font-semibold text-white/90"><AnimatedCounter target={2647} />+ testimonies</p>
          <p className="text-[10px] text-white/40">Safely documented</p>
        </div>
      </FloatingBadge>

      {/* Verified - bottom right */}
      <FloatingBadge delay={1.4} className="bottom-[28%] right-4 xl:right-16">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(251, 146, 60, 0.15)' }}>
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <p className="text-xs font-semibold text-white/90">Verified</p>
          <p className="text-[10px] text-white/40">Legal-ready reports</p>
        </div>
      </FloatingBadge>
      
      {/* ===== Main hero content ===== */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Glassy top badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2.5 px-5 py-2.5 mb-10 rounded-full"
          style={{
            background: 'rgba(15, 20, 45, 0.4)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(120, 140, 200, 0.15)',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.04)',
          }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span className="text-sm text-white/50 font-medium">End-to-End Encrypted Platform</span>
          <Shield className="w-4 h-4 text-white/30" />
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-bold tracking-tight mb-7 leading-[1.1]"
        >
          <span className="block text-white">Rebuilding how justice</span>
          <span className="block text-white">systems understand trauma</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-base sm:text-lg text-white/40 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          A trauma-aware system that listens like a human and structures like
          a machine. Safely, at your own pace, with AI-powered support.
        </motion.p>

        {/* CTA Buttons - Glassy pill style like reference */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/auth">
            {/* Start Testimony - frosted glass button with subtle fill */}
            <button 
              className="group flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                color: 'rgba(255, 255, 255, 0.9)',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
              }}
            >
              Start Testimony
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </Link>
          
          <Link href="/auth?anonymous=true">
            {/* Continue Anonymously - same glass style */}
            <button 
              className="group flex items-center gap-2 px-8 py-4 rounded-full text-base font-medium transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: 'rgba(255, 255, 255, 0.7)',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
              }}
            >
              <User className="w-4 h-4 transition-transform group-hover:scale-110" />
              Continue Anonymously
            </button>
          </Link>
        </motion.div>

        {/* Watch demo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-8"
        >
          <button className="group inline-flex items-center gap-3 text-sm text-white/35 hover:text-white/70 transition-colors duration-200">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Play className="w-4 h-4 text-white/50 ml-0.5 group-hover:text-white/80 transition-colors" />
            </div>
            Watch how it works
          </button>
        </motion.div>

        {/* ===== Dashboard preview - glassy card ===== */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 relative"
        >
          <div className="relative mx-auto max-w-3xl">
            {/* Glow behind it */}
            <div className="absolute -inset-8 bg-gradient-to-t from-[#6366f1]/[0.06] via-transparent to-transparent blur-3xl rounded-3xl" />
            
            {/* Glassy dashboard card */}
            <div 
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(10, 14, 30, 0.6)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(100, 120, 180, 0.12)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
              }}
            >
              {/* Title bar */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <span className="text-xs text-white/25 font-medium">Overview</span>
                </div>
              </div>
              
              {/* Dashboard content */}
              <div className="p-5 space-y-4">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Active Cases', value: '847', change: '+12%' },
                    { label: 'Reports Generated', value: '2.3K', change: '+8%' },
                    { label: 'Success Rate', value: '99.2%', change: '+2.1%' },
                  ].map((stat, i) => (
                    <div 
                      key={i} 
                      className="p-3 rounded-xl"
                      style={{
                        background: 'rgba(15, 20, 45, 0.5)',
                        border: '1px solid rgba(100, 120, 180, 0.08)',
                      }}
                    >
                      <p className="text-[10px] text-white/20 mb-1">{stat.label}</p>
                      <p className="text-lg font-bold text-white/90">{stat.value}</p>
                      <p className="text-[10px] text-emerald-400/70">{stat.change}</p>
                    </div>
                  ))}
                </div>

                {/* Chart mockup */}
                <div 
                  className="rounded-xl p-4"
                  style={{
                    background: 'rgba(15, 20, 45, 0.5)',
                    border: '1px solid rgba(100, 120, 180, 0.08)',
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-white/30">Activity Overview</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-white/20">Status</span>
                      <div className="w-6 h-3 rounded-full flex items-center justify-end px-0.5" style={{ background: 'rgba(52, 211, 153, 0.2)' }}>
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-end gap-1.5 h-20">
                    {[40, 65, 45, 80, 55, 70, 90, 60, 75, 50, 85, 65, 70, 55, 80, 95, 70, 60, 85, 75].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 0.5, delay: 0.8 + i * 0.05 }}
                        className="flex-1 rounded-sm"
                        style={{
                          background: i >= 14 
                            ? 'linear-gradient(180deg, rgba(244, 63, 94, 0.8), rgba(251, 113, 133, 0.6))' 
                            : i >= 10 
                              ? 'linear-gradient(180deg, rgba(245, 158, 11, 0.8), rgba(251, 191, 36, 0.6))' 
                              : 'linear-gradient(180deg, rgba(99, 102, 241, 0.8), rgba(129, 140, 248, 0.6))',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
