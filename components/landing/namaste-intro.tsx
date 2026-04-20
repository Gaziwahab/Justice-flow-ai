"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState, useCallback } from "react"

const greetings = [
  { word: "नमस्ते", label: "Hindi — Namaste", lang: "hi" },
  { word: "Hello", label: "English — Hello", lang: "en" },
  { word: "வணக்கம்", label: "Tamil — Vanakkam", lang: "ta" },
  { word: "নমস্কার", label: "Bengali — Namaskar", lang: "bn" },
  { word: "నమస్కారం", label: "Telugu — Namaskāram", lang: "te" },
  { word: "नमस्कार", label: "Marathi — Namaskar", lang: "mr" },
  { word: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ", label: "Punjabi — Sat Srī Akāl", lang: "pa" },
  { word: "નમસ્તે", label: "Gujarati — Namaste", lang: "gu" },
  { word: "آداب", label: "Urdu — Ādāb", lang: "ur" },
  { word: "ನಮಸ್ಕಾರ", label: "Kannada — Namaskāra", lang: "kn" },
  { word: "നമസ്കാരം", label: "Malayalam — Namaskāram", lang: "ml" },
  { word: "ନମସ୍କାର", label: "Odia — Namaskar", lang: "or" },
]

const WORD_DURATION = 380   // ms each word is shown
const FADE_DURATION = 300   // ms for fade in/out
const TOTAL_TIME = greetings.length * WORD_DURATION + 800  // extra buffer at end

interface NamasteIntroProps {
  onComplete: () => void
}

export default function NamasteIntro({ onComplete }: NamasteIntroProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [phase, setPhase] = useState<"playing" | "exiting" | "done">("playing")
  const [visible, setVisible] = useState(true)

  // Check session storage — skip if already seen
  useEffect(() => {
    if (typeof window !== "undefined") {
      const seen = sessionStorage.getItem("namaste-seen")
      if (seen) {
        setPhase("done")
        setVisible(false)
        onComplete()
      }
    }
  }, [onComplete])

  // Cycle through words
  useEffect(() => {
    if (phase !== "playing") return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= greetings.length - 1) {
          clearInterval(timer)
          // Start exit animation
          setTimeout(() => {
            setPhase("exiting")
            setTimeout(() => {
              setPhase("done")
              setVisible(false)
              if (typeof window !== "undefined") {
                sessionStorage.setItem("namaste-seen", "true")
              }
              onComplete()
            }, 600)
          }, 400)
          return prev
        }
        return prev + 1
      })
    }, WORD_DURATION)

    return () => clearInterval(timer)
  }, [phase, onComplete])

  // Progress percentage
  const progress = phase === "playing"
    ? ((currentIndex + 1) / greetings.length) * 100
    : 100

  if (!visible && phase === "done") return null

  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          key="namaste-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{
            background: `
              radial-gradient(ellipse 60% 50% at 50% 45%, rgba(99, 102, 241, 0.15) 0%, transparent 70%),
              radial-gradient(ellipse 40% 40% at 30% 60%, rgba(139, 92, 246, 0.1) 0%, transparent 60%),
              radial-gradient(ellipse 40% 35% at 70% 35%, rgba(59, 130, 246, 0.08) 0%, transparent 60%),
              linear-gradient(180deg, #060a18 0%, #0a0e1f 50%, #080c1a 100%)
            `,
          }}
        >
          {/* Subtle particle dots in background */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: 2 + (i % 3),
                  height: 2 + (i % 3),
                  left: `${(i * 37 + 13) % 100}%`,
                  top: `${(i * 53 + 7) % 100}%`,
                  background: `rgba(129, 140, 248, ${0.1 + (i % 5) * 0.06})`,
                }}
                animate={{
                  opacity: [0.2, 0.5, 0.2],
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 3 + (i % 3),
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>

          {/* Main word display */}
          <div className="relative z-10 flex flex-col items-center justify-center min-h-[160px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.96 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="flex flex-col items-center gap-3"
              >
                <span
                  className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight"
                  style={{
                    background: 'linear-gradient(135deg, #e0e7ff 0%, #a5b4fc 40%, #818cf8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: 'none',
                    filter: 'drop-shadow(0 0 40px rgba(99, 102, 241, 0.3))',
                  }}
                >
                  {greetings[currentIndex].word}
                </span>
                <span className="text-sm sm:text-base text-white/30 font-medium tracking-wide">
                  {greetings[currentIndex].label}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-48 sm:w-64">
            <div
              className="h-[2px] rounded-full overflow-hidden"
              style={{ background: 'rgba(255, 255, 255, 0.06)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #818cf8, #a78bfa)',
                }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: "linear" }}
              />
            </div>
            <p className="text-center text-xs text-white/15 mt-3 tracking-widest uppercase">
              Welcome to Justice Flow
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
