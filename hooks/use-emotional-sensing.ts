"use client"

import { useMemo } from "react"

export type SupportLevel = 0 | 1 | 2 | 3

export interface EmotionalSenseResult {
  supportLevel: SupportLevel
  triggerWords: string[]
  recommendation: string
  bannerConfig: {
    bg: string
    border: string
    textColor: string
    icon: string
    message: string
  }
}

const KEYWORD_MAP: Record<SupportLevel, string[]> = {
  3: ['suicidal', "can't go on", 'end it all', 'no point living', 'want to die', 'kill myself', 'end my life', 'hurt myself'],
  2: ['hopeless', 'helpless', 'worthless', 'trapped', 'no way out', 'unbearable', 'destroyed', 'broken', 'agony', 'torment', 'numb', 'pointless', 'nothing matters'],
  1: ['scared', 'fear', 'afraid', 'confused', 'unsure', 'lost', 'alone', 'anxious', 'nervous', 'worried', 'overwhelmed', 'panic', 'terrified', 'pain', 'hurt', 'crying', 'helpless'],
  0: [],
}

const BANNER_CONFIGS = {
  0: {
    bg: 'rgba(52, 211, 153, 0.08)',
    border: 'rgba(52, 211, 153, 0.2)',
    textColor: '#34d399',
    icon: '✓',
    message: "You're doing great. Take all the time you need.",
  },
  1: {
    bg: 'rgba(251, 191, 36, 0.08)',
    border: 'rgba(251, 191, 36, 0.2)',
    textColor: '#fbbf24',
    icon: '♥',
    message: "I hear you. This is a safe space. Take a breath.",
  },
  2: {
    bg: 'rgba(168, 85, 247, 0.08)',
    border: 'rgba(168, 85, 247, 0.2)',
    textColor: '#a855f7',
    icon: '◎',
    message: "You are incredibly brave for sharing this. We can pause anytime.",
  },
  3: {
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.25)',
    textColor: '#ef4444',
    icon: '⚠',
    message: "Your safety matters most. Crisis support is available — please reach out.",
  },
}

const RECOMMENDATIONS = {
  0: "Continue sharing at your own pace.",
  1: "The AI will slow down and add extra warmth to its responses.",
  2: "ARIA will offer you a pause and grounding exercise.",
  3: "Emergency resources are being shown. Your safety comes first.",
}

export function useEmotionalSensing(text: string): EmotionalSenseResult {
  return useMemo(() => {
    const lower = text.toLowerCase()
    const foundWords: string[] = []
    let detectedLevel: SupportLevel = 0

    // Check from highest to lowest
    for (const level of [3, 2, 1] as SupportLevel[]) {
      const words = KEYWORD_MAP[level]
      const found = words.filter(kw => lower.includes(kw))
      if (found.length > 0) {
        foundWords.push(...found)
        detectedLevel = level
        break // Use highest detected level
      }
    }

    return {
      supportLevel: detectedLevel,
      triggerWords: foundWords,
      recommendation: RECOMMENDATIONS[detectedLevel],
      bannerConfig: BANNER_CONFIGS[detectedLevel],
    }
  }, [text])
}

// Voice pause detection helper
export function createVoicePauseDetector(onPause: (pauseDurationMs: number) => void) {
  let silenceStart: number | null = null
  let animFrame: number | null = null
  const SILENCE_THRESHOLD = 0.01 // below this amplitude = silence

  function check(analyser: AnalyserNode) {
    const data = new Float32Array(analyser.fftSize)
    analyser.getFloatTimeDomainData(data)
    const rms = Math.sqrt(data.reduce((sum, v) => sum + v * v, 0) / data.length)

    if (rms < SILENCE_THRESHOLD) {
      if (silenceStart === null) {
        silenceStart = Date.now()
      } else {
        const duration = Date.now() - silenceStart
        if (duration > 2500) { // 2.5s silence
          onPause(duration)
        }
      }
    } else {
      silenceStart = null
    }

    animFrame = requestAnimationFrame(() => check(analyser))
  }

  return {
    start: (analyser: AnalyserNode) => { check(analyser) },
    stop: () => { if (animFrame) cancelAnimationFrame(animFrame) }
  }
}
