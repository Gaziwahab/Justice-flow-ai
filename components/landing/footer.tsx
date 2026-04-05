"use client"

import { Shield, Heart } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="relative py-16 px-4" style={{ borderTop: '1px solid rgba(100, 120, 180, 0.1)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl p-[1px]" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.8), rgba(139, 92, 246, 0.8))' }}>
                <div className="w-full h-full rounded-xl flex items-center justify-center" style={{ background: 'rgba(10, 14, 31, 0.9)' }}>
                  <Shield className="w-4 h-4 text-[#a5b4fc]" />
                </div>
              </div>
              <span className="text-lg font-semibold text-white/90 tracking-tight">JusticeFlow</span>
            </Link>
            <p className="text-white/30 max-w-sm mb-6 text-sm leading-relaxed">
              A trauma-aware system that listens like a human and structures like a machine. 
              Your story matters. Your safety comes first.
            </p>
            <div className="flex items-center gap-2 text-sm text-white/20">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
              <span>for survivors everywhere</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white/60 text-sm">Platform</h4>
            <ul className="space-y-3">
              {[
                { href: '#features', label: 'Features' },
                { href: '#how-it-works', label: 'How It Works' },
                { href: '#security', label: 'Security' },
              ].map(link => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm text-white/30 hover:text-[#818cf8] transition-colors duration-200">
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link href="/auth" className="text-sm text-white/30 hover:text-[#818cf8] transition-colors duration-200">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white/60 text-sm">Legal</h4>
            <ul className="space-y-3">
              {['Privacy Policy', 'Terms of Service', 'Data Security', 'Contact Us'].map(label => (
                <li key={label}>
                  <a href="#" className="text-sm text-white/30 hover:text-[#818cf8] transition-colors duration-200">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: '1px solid rgba(100, 120, 180, 0.08)' }}>
          <p className="text-sm text-white/20">
            &copy; {new Date().getFullYear()} Justice Flow. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-sm text-white/20">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
