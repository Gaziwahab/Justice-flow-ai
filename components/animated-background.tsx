"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

// Seeded random for SSR consistency
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000
  return x - Math.floor(x)
}

const round = (n: number) => Math.round(n * 100) / 100

const stars = Array.from({ length: 50 }).map((_, i) => ({
  left: round(seededRandom(i * 23 + 5) * 100),
  top: round(seededRandom(i * 29 + 6) * 100),
  size: round(1 + seededRandom(i * 31 + 7) * 1.5),
  opacity: round(0.15 + seededRandom(i * 37 + 8) * 0.35),
}))

export default function AnimatedBackground() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Deep navy gradient base */}
      <div 
        className="absolute inset-0" 
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(25, 35, 75, 0.7) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 80% 40%, rgba(30, 40, 80, 0.4) 0%, transparent 50%),
            radial-gradient(ellipse 50% 40% at 15% 55%, rgba(25, 30, 65, 0.4) 0%, transparent 50%),
            linear-gradient(180deg, #080c1a 0%, #0c1024 25%, #101530 50%, #0c1024 75%, #080c1a 100%)
          `
        }}
      />

      {/* ====== SVG SWEEPING LIGHT CURVES ====== */}
      {/* These are the signature arcing luminous lines from the reference */}
      <svg 
        className="absolute inset-0 w-full h-full" 
        viewBox="0 0 1440 900" 
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Glow filters for the lines */}
          <filter id="glow1" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur1" />
            <feGaussianBlur stdDeviation="10" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow2" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur1" />
            <feGaussianBlur stdDeviation="8" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow3" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur1" />
            <feGaussianBlur stdDeviation="6" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* Gradient for lines to fade at edges */}
          <linearGradient id="lineGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(120, 140, 220, 0)" />
            <stop offset="15%" stopColor="rgba(120, 140, 220, 0.4)" />
            <stop offset="50%" stopColor="rgba(150, 170, 240, 0.6)" />
            <stop offset="85%" stopColor="rgba(120, 140, 220, 0.35)" />
            <stop offset="100%" stopColor="rgba(120, 140, 220, 0)" />
          </linearGradient>
          <linearGradient id="lineGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(140, 160, 230, 0)" />
            <stop offset="20%" stopColor="rgba(140, 160, 230, 0.3)" />
            <stop offset="50%" stopColor="rgba(160, 180, 245, 0.5)" />
            <stop offset="80%" stopColor="rgba(140, 160, 230, 0.25)" />
            <stop offset="100%" stopColor="rgba(140, 160, 230, 0)" />
          </linearGradient>
          <linearGradient id="lineGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(100, 120, 200, 0)" />
            <stop offset="10%" stopColor="rgba(100, 120, 200, 0.2)" />
            <stop offset="40%" stopColor="rgba(130, 150, 220, 0.35)" />
            <stop offset="70%" stopColor="rgba(100, 120, 200, 0.2)" />
            <stop offset="100%" stopColor="rgba(100, 120, 200, 0)" />
          </linearGradient>
          <linearGradient id="lineGrad4" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(110, 130, 210, 0)" />
            <stop offset="25%" stopColor="rgba(110, 130, 210, 0.25)" />
            <stop offset="50%" stopColor="rgba(140, 155, 230, 0.4)" />
            <stop offset="75%" stopColor="rgba(110, 130, 210, 0.2)" />
            <stop offset="100%" stopColor="rgba(110, 130, 210, 0)" />
          </linearGradient>
          <linearGradient id="lineGrad5" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(130, 145, 225, 0)" />
            <stop offset="30%" stopColor="rgba(130, 145, 225, 0.2)" />
            <stop offset="60%" stopColor="rgba(155, 170, 240, 0.35)" />
            <stop offset="100%" stopColor="rgba(130, 145, 225, 0)" />
          </linearGradient>
        </defs>

        {/* ===== Main sweeping curves ===== */}
        
        {/* Curve 1 - large arc from top-left sweeping across */}
        <motion.path
          d="M -100,200 Q 400,50 720,180 T 1540,120"
          fill="none"
          stroke="url(#lineGrad1)"
          strokeWidth="1.2"
          filter="url(#glow1)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 0.3, ease: "easeOut" }}
        />

        {/* Curve 2 - second arc slightly lower, wider sweep */}
        <motion.path
          d="M -50,280 Q 350,120 750,250 T 1500,200"
          fill="none"
          stroke="url(#lineGrad2)"
          strokeWidth="0.8"
          filter="url(#glow2)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.2, delay: 0.5, ease: "easeOut" }}
        />

        {/* Curve 3 - thinner, higher arc sweeping from left */}
        <motion.path
          d="M -80,140 Q 300,20 650,100 Q 1000,180 1500,80"
          fill="none"
          stroke="url(#lineGrad3)"
          strokeWidth="0.6"
          filter="url(#glow3)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.5, delay: 0.7, ease: "easeOut" }}
        />

        {/* Curve 4 - lower sweep across mid-section */}
        <motion.path
          d="M -100,400 Q 300,280 720,350 Q 1100,420 1540,300"
          fill="none"
          stroke="url(#lineGrad4)"
          strokeWidth="0.7"
          filter="url(#glow2)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.3, delay: 0.9, ease: "easeOut" }}
        />

        {/* Curve 5 - subtle high arc near top */}
        <motion.path
          d="M 100,80 Q 450,-20 800,60 Q 1100,120 1400,40"
          fill="none"
          stroke="url(#lineGrad5)"
          strokeWidth="0.5"
          filter="url(#glow3)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 1.1, ease: "easeOut" }}
        />

        {/* Curve 6 - very subtle lower curve */}
        <motion.path
          d="M -50,500 Q 400,380 800,450 Q 1200,520 1500,420"
          fill="none"
          stroke="url(#lineGrad3)"
          strokeWidth="0.5"
          filter="url(#glow3)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.7 }}
          transition={{ duration: 2.5, delay: 1.3, ease: "easeOut" }}
        />

        {/* Curve 7 - tight arc connecting top curves */}
        <motion.path
          d="M 200,160 Q 500,80 900,160 Q 1200,230 1450,150"
          fill="none"
          stroke="url(#lineGrad2)"
          strokeWidth="0.4"
          filter="url(#glow3)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.6 }}
          transition={{ duration: 2, delay: 1, ease: "easeOut" }}
        />
      </svg>

      {/* Ambient glow pools - soft colored light behind the lines */}
      <div 
        className="absolute"
        style={{
          top: '5%',
          left: '25%',
          width: '50%',
          height: '30%',
          background: 'radial-gradient(ellipse, rgba(60, 75, 155, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div 
        className="absolute"
        style={{
          top: '25%',
          right: '0%',
          width: '35%',
          height: '30%',
          background: 'radial-gradient(ellipse, rgba(70, 60, 140, 0.1) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />
      <div 
        className="absolute"
        style={{
          bottom: '15%',
          left: '5%',
          width: '40%',
          height: '25%',
          background: 'radial-gradient(ellipse, rgba(50, 60, 120, 0.1) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />

      {/* Tiny star dots */}
      {mounted && (
        <div className="absolute inset-0">
          {stars.map((star, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                background: `rgba(180, 195, 240, ${star.opacity})`,
                boxShadow: `0 0 ${star.size * 2}px rgba(180, 195, 240, ${star.opacity * 0.4})`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
