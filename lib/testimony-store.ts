// Testimony state management
export interface TimelineEvent {
  id: string
  content: string
  estimatedDate?: string
  confidence: "high" | "medium" | "low"
  linkedEvidence?: string[]
  createdAt: string
}

export interface Evidence {
  id: string
  name: string
  type: string
  size: number
  url: string
  linkedEvents?: string[]
  uploadedAt: string
}

export interface TestimonyData {
  id: string
  // Identity step (optional)
  identity?: {
    age?: string
    location?: string
    relationship?: string
  }
  // Emotional state
  emotionalState: "calm" | "unsure" | "anxious" | "overwhelmed"
  // Raw testimony content
  fragments: {
    id: string
    content: string
    type: "text" | "voice"
    timestamp: string
  }[]
  // Processed timeline
  timeline: TimelineEvent[]
  // Evidence
  evidence: Evidence[]
  // Impact statement
  impact?: string
  // Progress tracking
  currentStep: number
  completedSteps: number[]
  // Metadata
  createdAt: string
  updatedAt: string
  status: "draft" | "in-progress" | "review" | "complete"
}

export const createTestimony = (): TestimonyData => ({
  id: crypto.randomUUID(),
  emotionalState: "calm",
  fragments: [],
  timeline: [],
  evidence: [],
  currentStep: 0,
  completedSteps: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: "draft"
})

export const saveTestimony = (testimony: TestimonyData) => {
  const testimonies = getTestimonies()
  const existingIndex = testimonies.findIndex(t => t.id === testimony.id)
  
  testimony.updatedAt = new Date().toISOString()
  
  if (existingIndex >= 0) {
    testimonies[existingIndex] = testimony
  } else {
    testimonies.push(testimony)
  }
  
  localStorage.setItem("sv_testimonies", JSON.stringify(testimonies))
  localStorage.setItem("sv_current_testimony", JSON.stringify(testimony))
  
  return testimony
}

export const getTestimonies = (): TestimonyData[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("sv_testimonies")
  return stored ? JSON.parse(stored) : []
}

export const getCurrentTestimony = (): TestimonyData | null => {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem("sv_current_testimony")
  return stored ? JSON.parse(stored) : null
}

export const clearCurrentTestimony = () => {
  localStorage.removeItem("sv_current_testimony")
}
