"use client"

import Header from "@/components/landing/header"
import Hero from "@/components/landing/hero"
import Features from "@/components/landing/features"
import Steps from "@/components/landing/steps"
import Security from "@/components/landing/security"
import Footer from "@/components/landing/footer"
import AnimatedBackground from "@/components/animated-background"

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden" style={{ background: '#0a0e1f' }}>
      {/* Animated Background - fixed behind everything */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <AnimatedBackground />
      </div>
      
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

        {/* How it Works */}
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
    </main>
  )
}
