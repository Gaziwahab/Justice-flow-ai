"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Shield, 
  Home, 
  FileText, 
  Clock, 
  Files, 
  Download,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  UserX,
  Bot,
  BookOpen,
  BarChart3,
  Share2,
  PanelLeft
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import type { Tables } from "@/lib/database.types"

type Profile = Tables<"profiles">

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/testimony", label: "Testimony", icon: FileText },
  { href: "/dashboard/timeline", label: "Timeline", icon: Clock },
  { href: "/dashboard/evidence", label: "Evidence", icon: Files },
  { href: "/dashboard/report", label: "Report", icon: Download },
  { href: "/dashboard/support", label: "AI Support", icon: Bot },
  { href: "/dashboard/resources", label: "Resources", icon: BookOpen },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/share", label: "Share", icon: Share2 },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    
    const fetchUserAndProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push("/auth")
          return
        }
        
        setUser(user)
        
        // Fetch profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
        
        if (profileData) {
          setProfile(profileData)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
        router.push("/auth")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchUserAndProfile()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          router.push("/auth")
        } else if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const isAnonymous = profile?.is_anonymous || user.is_anonymous
  const displayName = profile?.full_name || user.email?.split("@")[0] || "User"

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar Overlay on Mobile */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-40 glass-strong border-r border-border/50 flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${
          sidebarCollapsed 
            ? '-translate-x-full opacity-0 w-0 md:translate-x-0 md:opacity-100 md:w-[80px]' 
            : 'translate-x-0 opacity-100 w-[280px]'
        }`}
      >
        {/* Logo and Toggle */}
        <div className={`p-4 flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} border-b border-border/50 relative min-h-[73px]`}>
          <Link href="/" className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent p-[1px] shrink-0">
              <div className="w-full h-full rounded-xl bg-background flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
            </div>
            <span className="text-lg font-bold text-foreground whitespace-nowrap">
              Justice<span className="gradient-text">Flow</span>
            </span>
          </Link>
          
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-10 h-10 flex items-center justify-center rounded-full text-white shrink-0 hover:scale-105 active:scale-95 transition-all bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_0_15px_rgba(59,130,246,0.4)]"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-2 no-scrollbar">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (typeof window !== 'undefined' && window.innerWidth < 768) setSidebarCollapsed(true)
                }}
                className={`flex items-center ${sidebarCollapsed ? 'justify-center w-12 h-12 mx-auto' : 'gap-3 px-4 py-3'} rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent"
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-primary" : ""}`} />
                <span
                  className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-border/50 shrink-0">
          <div className={`flex items-center gap-3 p-3 rounded-xl bg-secondary/30 mb-3 ${sidebarCollapsed ? "md:justify-center" : ""}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent p-[1px] shrink-0">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                {isAnonymous ? (
                  <UserX className="w-5 h-5 text-primary" />
                ) : (
                  <User className="w-5 h-5 text-primary" />
                )}
              </div>
            </div>
            <div className={`flex-1 min-w-0 overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
              <p className="text-sm font-medium text-foreground truncate">
                {isAnonymous ? "Anonymous User" : displayName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {isAnonymous ? "Anonymous Session" : "Authenticated"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className={`flex items-center ${sidebarCollapsed ? "md:justify-center" : "justify-between px-2"}`}>
              <span className={`text-sm text-muted-foreground overflow-hidden whitespace-nowrap transition-all duration-300 ${sidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>Theme</span>
              <ThemeToggle />
            </div>
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className={`w-full text-muted-foreground hover:text-destructive ${sidebarCollapsed ? "md:justify-center md:px-0" : "justify-start"}`}
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${sidebarCollapsed ? 'w-0 opacity-0 ml-0' : 'w-[80px] opacity-100 ml-3'}`}>Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Removed Collapse button */}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen relative w-full border-t md:border-t-0 border-border/50">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-20 glass-strong border-b border-border/50 p-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent p-[1px] shrink-0">
              <div className="w-full h-full rounded-lg bg-background flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
            </div>
            <span className="text-md font-bold text-foreground">
              Justice<span className="gradient-text">Flow</span>
            </span>
          </Link>
          <button 
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-secondary/50 border border-border/50 text-foreground"
            onClick={() => setSidebarCollapsed(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
        </div>

        <main className={`flex-1 w-full min-w-0 transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'md:pl-[80px]' : 'md:pl-[280px]'}`}>
          <div className="p-4 md:p-8 max-w-7xl mx-auto w-full pb-24 md:pb-8 overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>

    </div>
  )
}
