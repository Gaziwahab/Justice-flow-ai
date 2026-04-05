"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, Menu, X, LogOut, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "Solutions" },
  { href: "#security", label: "Security" },
  { href: "#about", label: "About Us" },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)
    }
    checkUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => { subscription.unsubscribe() }
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "py-2" : "py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* ===== GLASSY NAVBAR PILL ===== */}
          <div 
            className="flex items-center justify-between py-3 px-6 rounded-full transition-all duration-500"
            style={{
              background: 'rgba(15, 20, 40, 0.45)',
              backdropFilter: 'blur(20px) saturate(1.5)',
              WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
              border: '1px solid rgba(100, 120, 180, 0.15)',
              boxShadow: scrolled 
                ? '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)' 
                : '0 4px 24px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
            }}
          >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div 
                className="w-9 h-9 rounded-xl p-[1px] transition-transform group-hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.8), rgba(139, 92, 246, 0.8))',
                }}
              >
                <div 
                  className="w-full h-full rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(10, 14, 31, 0.85)' }}
                >
                  <Shield className="w-4 h-4 text-[#a5b4fc]" />
                </div>
              </div>
              <span className="text-lg font-semibold text-white/95 tracking-tight">
                JusticeFlow
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-white/50 hover:text-white/90 transition-colors duration-200 relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-white/40 transition-all duration-300 group-hover:w-full" />
                </a>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              {!isLoading && (
                <>
                  {user ? (
                    <>
                      <Link href="/dashboard">
                        <Button 
                          variant="ghost" 
                          className="text-white/50 hover:text-white hover:bg-white/5 gap-2 rounded-full"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Button>
                      </Link>
                      <Button 
                        onClick={handleLogout}
                        variant="outline" 
                        className="border-white/10 bg-transparent text-white/50 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 gap-2 rounded-full"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/auth">
                        {/* Sign In - glassy pill button */}
                        <button 
                          className="px-5 py-2 rounded-full text-sm font-medium text-white/70 hover:text-white transition-colors duration-200"
                          style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          Sign In
                        </button>
                      </Link>
                      <Link href="/auth">
                        {/* Get Started - outlined glassy pill */}
                        <button 
                          className="px-5 py-2 rounded-full text-sm font-medium text-white/90 hover:text-white transition-all duration-200 hover:bg-white/10"
                          style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                          }}
                        >
                          Get Started
                        </button>
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {mobileOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-20 z-40 p-4 md:hidden"
          >
            <div 
              className="rounded-2xl p-6 space-y-4"
              style={{
                background: 'rgba(12, 16, 36, 0.85)',
                backdropFilter: 'blur(24px) saturate(1.5)',
                WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
                border: '1px solid rgba(100, 120, 180, 0.15)',
                boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4)',
              }}
            >
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block text-lg text-white/70 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 border-t border-white/10 space-y-3">
                {!isLoading && (
                  <>
                    {user ? (
                      <>
                        <Link href="/dashboard" className="block" onClick={() => setMobileOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start gap-3 text-white/70 hover:text-white">
                            <LayoutDashboard className="w-5 h-5" />
                            Dashboard
                          </Button>
                        </Link>
                        <Button 
                          onClick={() => { handleLogout(); setMobileOpen(false); }}
                          variant="ghost" 
                          className="w-full justify-start gap-3 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        >
                          <LogOut className="w-5 h-5" />
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link href="/auth" className="block" onClick={() => setMobileOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start text-white/70 hover:text-white">Sign In</Button>
                        </Link>
                        <Link href="/auth" className="block" onClick={() => setMobileOpen(false)}>
                          <button className="w-full py-2.5 rounded-full text-sm font-semibold text-white/90" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                            Get Started
                          </button>
                        </Link>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
