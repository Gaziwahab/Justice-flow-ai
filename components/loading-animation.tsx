"use client"

import { motion } from "framer-motion"
import { Shield } from "lucide-react"

interface LoadingAnimationProps {
  message?: string
  fullScreen?: boolean
}

export function LoadingAnimation({ 
  message = "Loading securely...", 
  fullScreen = true 
}: LoadingAnimationProps) {
  return (
    <div className={`flex items-center justify-center ${fullScreen ? "min-h-screen" : "min-h-[200px]"}`}>
      <div className="text-center">
        {/* Animated logo */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          {/* Outer rotating ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Middle pulsing ring */}
          <motion.div
            className="absolute inset-2 rounded-full border-2 border-accent/40"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Inner rotating ring (opposite direction) */}
          <motion.div
            className="absolute inset-4 rounded-full border-2 border-primary/50"
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Center icon */}
          <motion.div
            className="absolute inset-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center"
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Shield className="w-6 h-6 text-primary-foreground" />
          </motion.div>

          {/* Orbiting dots */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary"
              style={{
                top: "50%",
                left: "50%",
              }}
              animate={{
                x: [
                  Math.cos((i * 2 * Math.PI) / 3) * 40,
                  Math.cos((i * 2 * Math.PI) / 3 + Math.PI) * 40,
                  Math.cos((i * 2 * Math.PI) / 3 + 2 * Math.PI) * 40,
                ],
                y: [
                  Math.sin((i * 2 * Math.PI) / 3) * 40,
                  Math.sin((i * 2 * Math.PI) / 3 + Math.PI) * 40,
                  Math.sin((i * 2 * Math.PI) / 3 + 2 * Math.PI) * 40,
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.2,
              }}
            />
          ))}
        </div>

        {/* Loading text */}
        <motion.p
          className="text-muted-foreground"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {message}
        </motion.p>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1 mt-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Skeleton loading for cards
export function CardSkeleton() {
  return (
    <div className="rounded-xl glass border border-border/50 p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-muted" />
        <div className="flex-1">
          <div className="h-4 bg-muted rounded w-1/2 mb-2" />
          <div className="h-3 bg-muted rounded w-1/3" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-4/5" />
      </div>
    </div>
  )
}

// Inline loading spinner
export function InlineSpinner({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  }
  
  return (
    <motion.div
      className={`${sizeClasses[size]} border-2 border-primary border-t-transparent rounded-full`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  )
}
