"use client"

import { motion } from "framer-motion"
import { 
  Shield, 
  Lock, 
  Eye, 
  Server,
  KeyRound,
  Fingerprint
} from "lucide-react"

const securityFeatures = [
  { icon: Lock, title: "End-to-End Encryption", description: "Your data is encrypted before it leaves your device. Not even we can read it." },
  { icon: Eye, title: "Anonymous Mode", description: "No email, no name, no tracking. Create a session and share your story." },
  { icon: Server, title: "Zero Data Collection", description: "We don\u0027t sell, share, or analyze your personal information. Ever." },
  { icon: KeyRound, title: "Session-Based Security", description: "Your session key is yours alone. Without it, your data remains unreadable." },
  { icon: Fingerprint, title: "No Biometrics Required", description: "We never require or store biometric data of any kind." },
  { icon: Shield, title: "Data Ownership", description: "Delete everything at any time. Your testimony, your control." },
]

export default function Security() {
  return (
    <section id="security" className="relative py-28 px-4 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(100, 120, 200, 0.15), transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(100, 120, 200, 0.15), transparent)' }} />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full"
              style={{
                background: 'rgba(15, 20, 45, 0.4)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(120, 140, 200, 0.12)',
              }}
            >
              <Shield className="w-4 h-4 text-[#818cf8]" />
              <span className="text-sm text-white/45">Military-Grade Security</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              <span className="text-white">Your safety is </span>
              <span className="bg-gradient-to-r from-[#818cf8] to-[#a78bfa] bg-clip-text text-transparent">our foundation</span>
            </h2>
            
            <p className="text-lg text-white/35 mb-8 leading-relaxed">
              We built Justice Flow from the ground up with security at its core. 
              Every decision we make prioritizes your privacy and safety.
            </p>

            {/* Glassy security badge */}
            <div 
              className="inline-flex items-center gap-4 p-4 rounded-xl"
              style={{
                background: 'rgba(12, 16, 35, 0.4)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(100, 120, 180, 0.12)',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
              }}
            >
              <div className="w-14 h-14 rounded-lg flex items-center justify-center" style={{
                background: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.2)'
              }}>
                <Shield className="w-7 h-7 text-[#818cf8]" />
              </div>
              <div>
                <p className="text-sm text-white/35">Trusted by</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-[#818cf8] to-[#a78bfa] bg-clip-text text-transparent">10,000+ Survivors</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-5 rounded-xl transition-all duration-300"
                style={{
                  background: 'rgba(12, 16, 35, 0.4)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(100, 120, 180, 0.1)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
                }}
              >
                <feature.icon className="w-5 h-5 text-[#818cf8] mb-3 transition-transform group-hover:scale-110" />
                <h3 className="font-semibold mb-1.5 text-white/85 text-sm">{feature.title}</h3>
                <p className="text-xs text-white/30 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
