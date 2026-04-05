"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Sun, Moon } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className="w-12 h-6 md:w-14 md:h-7 rounded-full bg-secondary border border-border/50 opacity-50 cursor-default" aria-hidden="true" />
    )
  }

  const isDark = resolvedTheme === "dark" || theme === "dark"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-14 h-7 rounded-full p-1 transition-colors duration-500 flex items-center border ${
        isDark 
          ? "bg-primary/20 border-primary/30" 
          : "bg-orange-100 border-orange-200"
      }`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
    >
      {/* Background track icons inside toggle */}
      <div className="absolute inset-0 w-full flex justify-between items-center px-1.5 pointer-events-none">
        <Moon className="w-3.5 h-3.5 text-primary/70" />
        <Sun className="w-4 h-4 text-orange-400" />
      </div>

      {/* The sliding toggle thumb */}
      <motion.div
        className={`w-5 h-5 rounded-full flex items-center justify-center shadow-md border ${
          isDark ? "bg-background border-primary/50" : "bg-white border-orange-300"
        }`}
        initial={false}
        animate={{ 
          x: isDark ? 0 : 26 
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <motion.div
           initial={false}
           animate={{ rotate: isDark ? 0 : 180 }}
           transition={{ duration: 0.5 }}
        >
          {isDark ? (
            <Moon className="w-3 h-3 text-primary" />
          ) : (
            <Sun className="w-3 h-3 text-orange-500" />
          )}
        </motion.div>
      </motion.div>
    </button>
  )
}

