"use client"

import { useState, useCallback } from "react"
import Header from "@/components/landing/header"
import Hero from "@/components/landing/hero"
import Features from "@/components/landing/features"
import Scroll3DShowcase from "@/components/landing/scroll-3d-showcase"
import Steps from "@/components/landing/steps"
import Security from "@/components/landing/security"
import Footer from "@/components/landing/footer"
import AnimatedBackground from "@/components/animated-background"
import NamasteIntro from "@/components/landing/namaste-intro"

export default function LandingPage() {
  const [introComplete, setIntroComplete] = useState(false)

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true)
  }, [])

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background">
      {/* Namaste Entry Overlay */}
      <NamasteIntro onComplete={handleIntroComplete} />

      {/* Animated Background - fixed behind everything */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <AnimatedBackground />
      </div>
      
      {/* Page content — fades in after intro */}
      <div
        className="transition-opacity duration-700 ease-out"
        style={{ opacity: introComplete ? 1 : 0 }}
      >
        {/* Header */}
        <Header />

        {/* Main Content Sections */}
        <div className="relative z-10 flex flex-col items-center w-full max-w-full">
          {/* Hero Section */}
          <div className="w-full">
            <Hero />
          </div>

          {/* Features Section */}
          <div className="w-full relative">
            <Features />
          </div>

          {/* Scroll-Driven 3D Showcase */}
          <div className="w-full relative">
            <Scroll3DShowcase />
          </div>

          {/* How it Works — Interactive Stepper */}
          <div className="w-full relative">
            <Steps />
          </div>

          {/* Security Section */}
          <div className="w-full relative">
            <Security />
          </div>

          {/* Footer */}
          <div className="w-full">
            <Footer />
          </div>
        </div>
      </div>
    </main>
  )
}
