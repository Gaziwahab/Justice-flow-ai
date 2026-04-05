"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Shield, 
  Mail, 
  Lock, 
  User,
  UserX,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Check,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

function AuthContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [mode, setMode] = useState<"choose" | "signin" | "signup" | "anonymous" | "success">("choose")
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (searchParams.get("anonymous") === "true") {
      setMode("anonymous")
    }
  }, [searchParams])

  // Check if already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      // Only redirect if a non-anonymous user is already logged in
      if (user && !user.is_anonymous) {
        router.push("/dashboard")
      }
    }
    checkUser()
  }, [router, supabase.auth])

  const [anonDisabled, setAnonDisabled] = useState(false)
  
  const handleAnonymousStart = async () => {
    setIsLoading(true)
    setError(null)
    setAnonDisabled(false)
    
    try {
      // Try to sign in anonymously using Supabase
      const { data, error: signInError } = await supabase.auth.signInAnonymously()
      
      if (signInError) {
        // Check if anonymous sign-ins are disabled
        if (signInError.message.includes("Anonymous sign-ins are disabled")) {
          setAnonDisabled(true)
          throw new Error("Anonymous sign-ins need to be enabled in Supabase. See instructions below.")
        }
        throw signInError
      }
      
      if (data.user) {
        // Update profile to mark as anonymous
        await supabase.from('profiles').upsert({
          id: data.user.id,
          is_anonymous: true,
          anonymous_id: crypto.randomUUID()
        })
        
        router.push("/dashboard")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create anonymous session")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (signInError) throw signInError
      
      if (data.user) {
        // Ensure profile exists and is marked as non-anonymous
        await supabase.from('profiles').upsert({
          id: data.user.id,
          is_anonymous: false,
          updated_at: new Date().toISOString()
        })
      }
      
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || 
            `${window.location.origin}/dashboard`,
          data: {
            full_name: name || null,
            is_anonymous: false
          }
        }
      })
      
      if (signUpError) throw signUpError
      
      setMessage("Please check your email to confirm your account.")
      setMode("success")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden animated-gradient">
      {/* Background elements */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-[128px]" />

      {/* Back to home */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Shield className="w-5 h-5 text-primary" />
        <span className="font-semibold">JusticeFlow</span>
      </Link>

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Main card */}
        <div className="glass-strong rounded-3xl p-8 md:p-10 border border-primary/20 glow-soft">
          <AnimatePresence mode="wait">
            {/* Success message */}
            {mode === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent p-[2px] mb-6">
                    <div className="w-full h-full rounded-2xl bg-background flex items-center justify-center">
                      <Check className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold mb-3 text-foreground">Check Your Email</h1>
                  <p className="text-muted-foreground mb-6">{message}</p>
                  <Button
                    onClick={() => setMode("signin")}
                    variant="outline"
                    className="w-full"
                  >
                    Back to Sign In
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Choose mode */}
            {mode === "choose" && (
              <motion.div
                key="choose"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent p-[2px] mb-6">
                    <div className="w-full h-full rounded-2xl bg-background flex items-center justify-center">
                      <Shield className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold mb-3 text-foreground">Welcome to Justice Flow</h1>
                  <p className="text-muted-foreground">
                    Choose how you&apos;d like to continue. Your safety is our priority.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Anonymous option - Primary */}
                  <button
                    onClick={() => setMode("anonymous")}
                    className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-accent p-[1px] transition-all hover:scale-[1.02]"
                  >
                    <div className="relative rounded-2xl bg-background/95 p-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <UserX className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-left flex-1">
                        <h3 className="font-semibold text-foreground">Continue Anonymously</h3>
                        <p className="text-sm text-muted-foreground">No account needed. Your privacy protected.</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-primary transition-transform group-hover:translate-x-1" />
                    </div>
                  </button>

                  <div className="relative flex items-center gap-4 py-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-sm text-muted-foreground">or</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  {/* Sign in option */}
                  <button
                    onClick={() => setMode("signin")}
                    className="w-full group rounded-2xl glass border border-border/50 hover:border-primary/50 p-5 flex items-center gap-4 transition-all hover:scale-[1.02]"
                  >
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                      <User className="w-6 h-6 text-foreground" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="font-semibold text-foreground">Sign In</h3>
                      <p className="text-sm text-muted-foreground">Access your saved testimonies</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </button>

                  {/* Sign up option */}
                  <button
                    onClick={() => setMode("signup")}
                    className="w-full group rounded-2xl glass border border-border/50 hover:border-primary/50 p-5 flex items-center gap-4 transition-all hover:scale-[1.02]"
                  >
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                      <Sparkles className="w-6 h-6 text-foreground" />
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="font-semibold text-foreground">Create Account</h3>
                      <p className="text-sm text-muted-foreground">Save progress permanently</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Anonymous mode */}
            {mode === "anonymous" && (
              <motion.div
                key="anonymous"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <button 
                  onClick={() => setMode("choose")}
                  className="mb-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  &larr; Back
                </button>

                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent p-[2px] mb-6">
                    <div className="w-full h-full rounded-2xl bg-background flex items-center justify-center">
                      <UserX className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold mb-3 text-foreground">Anonymous Session</h1>
                  <p className="text-muted-foreground">
                    You can continue without sharing your identity.
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <div className="text-sm text-destructive">
                      <p>{error}</p>
                      {anonDisabled && (
                        <div className="mt-3 p-3 rounded-lg bg-background/50 border border-border text-muted-foreground">
                          <p className="font-medium text-foreground mb-2">To enable anonymous sign-ins:</p>
                          <ol className="list-decimal list-inside space-y-1 text-xs">
                            <li>Go to your Supabase project dashboard</li>
                            <li>Navigate to Authentication → Providers</li>
                            <li>Find &quot;Anonymous Sign-ins&quot; and toggle it on</li>
                          </ol>
                          <p className="mt-3 text-xs">Or create an account below to get started immediately.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!anonDisabled && (
                  <div className="space-y-4 mb-8">
                    {[
                      "No personal data required",
                      "Secure session with full encryption",
                      "Your data belongs to you",
                      "Delete anytime"
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  onClick={handleAnonymousStart}
                  disabled={isLoading || anonDisabled}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground py-6 text-lg disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Creating secure session...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Start Anonymous Session
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </Button>

                {anonDisabled && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-sm text-center text-muted-foreground mb-4">
                      Or create a free account to get started
                    </p>
                    <Button
                      onClick={() => { setMode("signup"); setError(null); setAnonDisabled(false) }}
                      variant="outline"
                      className="w-full py-6"
                    >
                      <span className="flex items-center gap-2">
                        Create Free Account
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    </Button>
                  </div>
                )}

                <p className="text-xs text-center text-muted-foreground mt-4">
                  Your session data is encrypted and stored securely.
                </p>
              </motion.div>
            )}

            {/* Sign In / Sign Up forms */}
            {(mode === "signin" || mode === "signup") && (
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <button 
                  onClick={() => setMode("choose")}
                  className="mb-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  &larr; Back
                </button>

                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent p-[2px] mb-6">
                    <div className="w-full h-full rounded-2xl bg-background flex items-center justify-center">
                      {mode === "signin" ? (
                        <User className="w-8 h-8 text-primary" />
                      ) : (
                        <Sparkles className="w-8 h-8 text-primary" />
                      )}
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold mb-3 text-foreground">
                    {mode === "signin" ? "Welcome Back" : "Create Account"}
                  </h1>
                  <p className="text-muted-foreground">
                    {mode === "signin" 
                      ? "Sign in to access your saved testimonies" 
                      : "Create an account to save your progress"
                    }
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <form onSubmit={mode === "signin" ? handleSignIn : handleSignUp} className="space-y-4">
                  {mode === "signup" && (
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Name (optional)</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-12 py-6 bg-secondary/50 border-border focus:border-primary"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-12 py-6 bg-secondary/50 border-border focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="pl-12 pr-12 py-6 bg-secondary/50 border-border focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg mt-6"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        {mode === "signin" ? "Signing in..." : "Creating account..."}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        {mode === "signin" ? "Sign In" : "Create Account"}
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    )}
                  </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-6">
                  {mode === "signin" ? (
                    <>
                      Don&apos;t have an account?{" "}
                      <button onClick={() => { setMode("signup"); setError(null) }} className="text-primary hover:underline">
                        Sign up
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <button onClick={() => { setMode("signin"); setError(null) }} className="text-primary hover:underline">
                        Sign in
                      </button>
                    </>
                  )}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Trust message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-6"
        >
          <Lock className="w-4 h-4 inline mr-1" />
          Your data is always encrypted and secure
        </motion.p>
      </motion.div>
    </main>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <main className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden animated-gradient">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </main>
    }>
      <AuthContent />
    </Suspense>
  )
}
