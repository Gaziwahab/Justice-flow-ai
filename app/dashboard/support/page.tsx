"use client"

import { useChat } from "@ai-sdk/react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Send, 
  Bot, 
  User, 
  AlertTriangle, 
  Phone, 
  Heart,
  Sparkles,
  Shield,
  RefreshCw,
  Pause,
  Play,
  Mic
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

const suggestedPrompts = [
  "I need help organizing my thoughts about what happened",
  "Can you help me create a timeline of events?",
  "I'm not sure where to start with my testimony",
  "What resources are available for my situation?",
  "I need to take a break but want to continue later"
]

// Helper to extract text content from a UIMessage's parts
function getMessageText(message: { parts: Array<{ type: string; text?: string }> }): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text || "")
    .join("")
}

export default function AISupportPage() {
  const [showCrisisResources, setShowCrisisResources] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { messages, sendMessage, status, setMessages } = useChat({
    id: "ai-support",
    messages: [
      {
        id: "welcome",
        role: "assistant" as const,
        parts: [
          {
            type: "text" as const,
            text: "Hello, I'm ARIA, your AI support companion. I'm here to help you document your experience at your own pace, in a safe and supportive environment.\n\nTake your time. There's no pressure here. When you're ready, you can share what's on your mind, ask questions about the process, or let me know how I can best support you today.\n\nRemember: Everything you share here is private and encrypted. You're in control."
          }
        ]
      }
    ] as any
  })

  const isLoading = status === "submitted" || status === "streaming"

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Check for crisis keywords in messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role === "user") {
      const messageText = getMessageText(lastMessage)
      const crisisKeywords = ["kill", "suicide", "end my life", "hurt myself", "weapon", "gun"]
      const hasCrisisKeyword = crisisKeywords.some(keyword => 
        messageText.toLowerCase().includes(keyword)
      )
      if (hasCrisisKeyword) {
        setShowCrisisResources(true)
      }
    }
  }, [messages])

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || isPaused) return
    const text = input.trim()
    setInput("")
    await sendMessage({ text })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleFormSubmit(e)
    }
  }

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt)
    textareaRef.current?.focus()
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
            <Bot className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">AI Support</h1>
            <p className="text-muted-foreground flex items-center gap-2 text-sm md:text-base">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
              ARIA is here to help
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
            className="gap-2 shrink-0"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {isPaused ? "Resume" : "Pause"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMessages([messages[0]])}
            className="gap-2 shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="whitespace-nowrap">New Chat</span>
          </Button>
        </div>
      </div>

      {/* Crisis Resources Banner */}
      <AnimatePresence>
        {showCrisisResources && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 rounded-xl bg-destructive/10 border border-destructive/30"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-destructive mb-2">Crisis Resources Available</p>
                <p className="text-sm text-muted-foreground mb-3">
                  If you&apos;re in immediate danger or having thoughts of self-harm, please reach out:
                </p>
                <div className="flex flex-wrap gap-2">
                  <a href="tel:1-800-799-7233" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90">
                    <Phone className="w-4 h-4" />
                    1-800-799-7233
                  </a>
                  <a href="sms:741741&body=HOME" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
                    Text HOME to 741741
                  </a>
                </div>
              </div>
              <button 
                onClick={() => setShowCrisisResources(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <span className="sr-only">Close</span>
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paused State */}
      {isPaused && (
        <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
          <p className="text-amber-500 flex items-center justify-center gap-2">
            <Pause className="w-4 h-4" />
            Conversation paused. Take all the time you need.
          </p>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
              message.role === 'user' 
                ? 'bg-primary/20' 
                : 'bg-gradient-to-br from-primary to-accent'
            }`}>
              {message.role === 'user' ? (
                <User className="w-5 h-5 text-primary" />
              ) : (
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              )}
            </div>
            <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block p-4 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-sm'
                  : 'glass-card border border-border/50 rounded-tl-sm'
              }`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{getMessageText(message)}</p>
              </div>
            </div>
          </motion.div>
        ))}
        
        {/* Typing indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="glass-card border border-border/50 p-4 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      {messages.length <= 2 && (
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Heart className="w-3 h-3" />
            Suggested ways to start
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSuggestedPrompt(prompt)}
                className="px-3 py-1.5 text-xs rounded-full bg-muted/50 hover:bg-muted border border-border/50 transition-colors text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleFormSubmit} className="relative">
        <div className="glass-card border border-border/50 rounded-2xl p-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isPaused ? "Conversation paused..." : "Type your message... (Enter to send, Shift+Enter for new line)"}
            disabled={isLoading || isPaused}
            className="min-h-[60px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
          />
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>End-to-end encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                disabled
              >
                <Mic className="w-4 h-4" />
              </Button>
              <Button
                type="submit"
                disabled={!input.trim() || isLoading || isPaused}
                className="h-9 px-4 bg-gradient-to-r from-primary to-accent"
              >
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
