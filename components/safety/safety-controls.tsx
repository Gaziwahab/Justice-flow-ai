"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Shield, 
  X, 
  Phone, 
  AlertTriangle,
  ExternalLink,
  Eye,
  EyeOff,
  Keyboard,
  Wind,
  Heart,
  Pause,
  Play
} from "lucide-react"
import { Button } from "@/components/ui/button"

// Quick exit - redirects to innocuous website
const quickExit = () => {
  if (typeof window !== 'undefined') {
    // Clear the current page from history by replacing with same-origin blank, 
    // then immediately navigate away to an innocuous site
    try {
      // First clear history entry with same-origin URL
      window.history.replaceState(null, '', '/')
    } catch {
      // Ignore if history manipulation fails
    }
    // Navigate away immediately - this is the important part
    window.location.href = 'https://www.google.com/search?q=weather'
  }
}

// Emergency numbers by country
const emergencyNumbers = [
  { country: "USA", number: "1-800-799-7233", name: "National Domestic Violence Hotline" },
  { country: "USA", number: "988", name: "Suicide & Crisis Lifeline" },
  { country: "UK", number: "0808 2000 247", name: "National Domestic Abuse Helpline" },
  { country: "India", number: "181", name: "Women Helpline" },
  { country: "India", number: "1091", name: "Women in Distress" },
  { country: "Canada", number: "1-866-863-0511", name: "Domestic Violence Helpline" },
  { country: "Australia", number: "1800 737 732", name: "1800RESPECT" },
  { country: "International", number: "112", name: "Emergency Services" },
]

export function SafetyControls() {
  const [showPanel, setShowPanel] = useState(false)
  const [privacyMode, setPrivacyMode] = useState(false)
  const [showBreathing, setShowBreathing] = useState(false)
  const [breathingPhase, setBreathingPhase] = useState<"inhale" | "hold" | "exhale">("inhale")
  const [breathingCount, setBreathingCount] = useState(0)

  // Keyboard shortcuts
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    // ESC ESC ESC = Quick Exit
    if (e.key === 'Escape') {
      const now = Date.now()
      const lastEscape = (window as unknown as { lastEscapeTime?: number }).lastEscapeTime || 0
      const escapeCount = (window as unknown as { escapeCount?: number }).escapeCount || 0
      
      if (now - lastEscape < 500) {
        (window as unknown as { escapeCount: number }).escapeCount = escapeCount + 1
        if (escapeCount >= 2) {
          quickExit()
        }
      } else {
        (window as unknown as { escapeCount: number }).escapeCount = 1
      }
      (window as unknown as { lastEscapeTime: number }).lastEscapeTime = now
    }
    
    // Ctrl + Shift + X = Quick Exit
    if (e.ctrlKey && e.shiftKey && e.key === 'X') {
      quickExit()
    }
    
    // Ctrl + Shift + P = Privacy Mode
    if (e.ctrlKey && e.shiftKey && e.key === 'P') {
      e.preventDefault()
      setPrivacyMode(prev => !prev)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  // Apply privacy mode (blur sensitive content)
  useEffect(() => {
    if (privacyMode) {
      document.body.classList.add('privacy-mode')
    } else {
      document.body.classList.remove('privacy-mode')
    }
  }, [privacyMode])

  // Breathing exercise cycle
  useEffect(() => {
    if (!showBreathing) return
    
    const phases = [
      { name: "inhale" as const, duration: 4000 },
      { name: "hold" as const, duration: 4000 },
      { name: "exhale" as const, duration: 6000 },
    ]
    
    let phaseIndex = 0
    let cycleCount = 0
    
    const runPhase = () => {
      setBreathingPhase(phases[phaseIndex].name)
      
      setTimeout(() => {
        phaseIndex = (phaseIndex + 1) % phases.length
        if (phaseIndex === 0) {
          cycleCount++
          setBreathingCount(cycleCount)
        }
        if (showBreathing && cycleCount < 5) {
          runPhase()
        }
      }, phases[phaseIndex].duration)
    }
    
    runPhase()
  }, [showBreathing])

  return (
    <>
      {/* Floating Safety Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >

        {/* Safety Panel Toggle */}
        <motion.button
          onClick={() => setShowPanel(true)}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Shield className="w-6 h-6" />
        </motion.button>
      </motion.div>

      {/* Quick Exit Button (Top Right) */}
      <motion.div
        className="fixed top-6 right-6 z-[60]"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          onClick={quickExit}
          className="group relative flex items-center gap-2 px-5 py-2.5 rounded-full bg-destructive text-white shadow-lg hover:shadow-destructive/20 hover:bg-destructive/90 transition-all border border-destructive/30 backdrop-blur-md"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <X className="w-4 h-4" />
          <span className="text-sm font-semibold">Quick Exit</span>
          <span className="absolute -bottom-10 right-0 text-xs py-1 px-2 rounded bg-background/80 border border-border text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Press Ctrl+Shift+X or ESC ESC ESC
          </span>
        </motion.button>
      </motion.div>

      {/* Privacy Mode Indicator */}
      <AnimatePresence>
        {privacyMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-500"
          >
            <EyeOff className="w-4 h-4" />
            <span className="text-sm font-medium">Privacy Mode Active</span>
            <button 
              onClick={() => setPrivacyMode(false)}
              className="ml-2 p-1 rounded-full hover:bg-amber-500/20"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breathing Exercise Modal */}
      <AnimatePresence>
        {showBreathing && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/95 backdrop-blur-md z-[60]"
              onClick={() => setShowBreathing(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-[60] flex items-center justify-center"
            >
              <div className="text-center">
                <button
                  onClick={() => setShowBreathing(false)}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Breathing circle */}
                <motion.div
                  className="relative w-64 h-64 mx-auto mb-8"
                  animate={{
                    scale: breathingPhase === "inhale" ? 1.3 : breathingPhase === "hold" ? 1.3 : 1,
                  }}
                  transition={{
                    duration: breathingPhase === "inhale" ? 4 : breathingPhase === "hold" ? 0.1 : 6,
                    ease: "easeInOut"
                  }}
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-xl" />
                  <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-lg" />
                  <div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Heart className="w-12 h-12 text-primary-foreground" />
                  </div>
                </motion.div>

                <motion.p
                  key={breathingPhase}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl font-semibold text-foreground mb-2 capitalize"
                >
                  {breathingPhase === "inhale" ? "Breathe In..." : 
                   breathingPhase === "hold" ? "Hold..." : 
                   "Breathe Out..."}
                </motion.p>
                <p className="text-muted-foreground">
                  Cycle {breathingCount + 1} of 5
                </p>

                <Button
                  onClick={() => setShowBreathing(false)}
                  variant="outline"
                  className="mt-8"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  End Exercise
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Safety Panel */}
      <AnimatePresence>
        {showPanel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
              onClick={() => setShowPanel(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 p-6 rounded-2xl glass-card border border-border/50"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-semibold">Safety Center</h2>
                    <p className="text-sm text-muted-foreground">Your safety is our priority</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPanel(false)}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <Button
                  onClick={quickExit}
                  variant="destructive"
                  className="h-auto py-4 flex flex-col items-center gap-2"
                >
                  <X className="w-6 h-6" />
                  <span className="text-xs">Quick Exit</span>
                </Button>
                
                <Button
                  onClick={() => setPrivacyMode(!privacyMode)}
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2"
                >
                  {privacyMode ? <Eye className="w-6 h-6" /> : <EyeOff className="w-6 h-6" />}
                  <span className="text-xs">{privacyMode ? 'Show' : 'Hide'}</span>
                </Button>

                <Button
                  onClick={() => setShowBreathing(true)}
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 border-primary/30 hover:bg-primary/10"
                >
                  <Wind className="w-6 h-6 text-primary" />
                  <span className="text-xs">Breathe</span>
                </Button>
              </div>

              {/* Emergency Contacts */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h3 className="font-medium">Emergency Helplines</h3>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {emergencyNumbers.map((item, i) => (
                    <a
                      key={i}
                      href={`tel:${item.number.replace(/[^0-9+]/g, '')}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                    >
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.country}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-primary">{item.number}</span>
                        <Phone className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <Keyboard className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Keyboard Shortcuts</h3>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded bg-background/50">
                    <span className="text-muted-foreground">Quick Exit</span>
                    <kbd className="px-2 py-1 rounded bg-muted text-muted-foreground">Ctrl+Shift+X</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-background/50">
                    <span className="text-muted-foreground">Privacy Mode</span>
                    <kbd className="px-2 py-1 rounded bg-muted text-muted-foreground">Ctrl+Shift+P</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-background/50 col-span-2">
                    <span className="text-muted-foreground">Emergency Exit</span>
                    <kbd className="px-2 py-1 rounded bg-muted text-muted-foreground">ESC ESC ESC</kbd>
                  </div>
                </div>
              </div>

              {/* External Resources */}
              <div className="mt-4 flex items-center justify-center">
                <a
                  href="https://www.thehotline.org/get-help/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  More safety resources
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
