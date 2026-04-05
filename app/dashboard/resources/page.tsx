"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Phone, 
  Globe, 
  MapPin, 
  Heart, 
  Scale, 
  Home,
  Users,
  Shield,
  BookOpen,
  ExternalLink,
  Search,
  AlertTriangle,
  MessageCircle,
  Gavel,
  Building2,
  HeartHandshake
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const categories = [
  { id: "all", label: "All Resources", icon: Globe },
  { id: "crisis", label: "Crisis Hotlines", icon: AlertTriangle },
  { id: "legal", label: "Legal Aid", icon: Scale },
  { id: "shelter", label: "Shelters", icon: Home },
  { id: "mental", label: "Mental Health", icon: Heart },
  { id: "support", label: "Support Groups", icon: Users },
]

const resources = [
  // Crisis Hotlines
  {
    category: "crisis",
    name: "National Emergency Number",
    description: "Pan-India single emergency number for immediate police/medical/fire assistance",
    phone: "112",
    website: "https://112.gov.in/",
    country: "India",
    available: "24/7",
    languages: ["Hindi", "English", "Regional"]
  },
  {
    category: "crisis",
    name: "Women Helpline (WHL)",
    description: "Government helpline for women in distress needing police or medical assistance",
    phone: "181",
    website: "https://ncw.nic.in",
    country: "India",
    available: "24/7",
    languages: ["Hindi", "English", "Regional"]
  },
  {
    category: "crisis",
    name: "NCW Control Room",
    description: "National Commission for Women complaint and assistance cell",
    phone: "7827170170",
    website: "http://ncw.nic.in/",
    country: "India",
    available: "24/7",
    languages: ["Hindi", "English"]
  },
  // Legal Aid
  {
    category: "legal",
    name: "NALSA (National Legal Services Authority)",
    description: "Free proactive legal services and legal aid for women and marginalized communities",
    phone: "15100",
    website: "https://nalsa.gov.in/",
    country: "India",
    available: "Mon-Fri 9:30am-6pm"
  },
  {
    category: "legal",
    name: "Majlis Legal Centre",
    description: "Legal support and rights advocacy for women facing domestic and sexual violence",
    phone: "022-26661252",
    website: "https://majlislaw.com/",
    country: "India",
    available: "Mon-Sat 10am-6pm"
  },
  {
    category: "legal",
    name: "Lawyers Collective",
    description: "Leading legal advocacy group fighting for women's rights and civil liberties",
    website: "https://lawyerscollective.org/",
    country: "India",
    available: "Online"
  },
  // Shelters
  {
    category: "shelter",
    name: "Swadhar Greh Scheme",
    description: "Government-supported shelters providing rehabilitation for women in difficult circumstances",
    website: "https://wcd.nic.in/schemes/swadhar-greh-scheme",
    country: "India",
    available: "24/7"
  },
  {
    category: "shelter",
    name: "Shakti Shalini",
    description: "Women's shelter and crisis intervention center in Delhi",
    phone: "011-24373737",
    website: "https://shaktishalini.org/",
    country: "India",
    available: "24/7"
  },
  // Mental Health
  {
    category: "mental",
    name: "Kiran Mental Health Helpline",
    description: "Mental health rehabilitation helpline by Govt. of India",
    phone: "1800-599-0019",
    website: "https://socialjustice.gov.in/",
    country: "India",
    available: "24/7",
    languages: ["13 Languages"]
  },
  {
    category: "mental",
    name: "Vandrevala Foundation",
    description: "Free mental health crisis counseling and emotional support",
    phone: "9999 666 555",
    website: "https://www.vandrevalafoundation.com/",
    country: "India",
    available: "24/7",
    languages: ["Hindi", "English", "Marathi", "Gujarati"]
  },
  {
    category: "mental",
    name: "iCALL (TISS)",
    description: "Tata Institute of Social Sciences mental health helpline",
    phone: "9152987821",
    website: "https://icallhelpline.org/",
    country: "India",
    available: "Mon-Sat 10am-8pm",
    languages: ["Hindi", "English", "Marathi", "Gujarati"]
  },
  // Support Groups
  {
    category: "support",
    name: "Jagori",
    description: "Women's training, documentation, and support center",
    phone: "011-26692700",
    website: "http://www.jagori.org",
    country: "India",
    available: "Mon-Fri 9am-5pm"
  },
  {
    category: "support",
    name: "Aks Foundation",
    description: "Crisis intervention and support groups for gender-based violence survivors",
    phone: "8793088814",
    website: "https://aksfoundation.org/",
    country: "India",
    available: "24/7"
  }
]

const getCategoryIcon = (category: string) => {
  const icons: Record<string, React.ReactNode> = {
    crisis: <AlertTriangle className="w-5 h-5" />,
    legal: <Gavel className="w-5 h-5" />,
    shelter: <Building2 className="w-5 h-5" />,
    mental: <HeartHandshake className="w-5 h-5" />,
    support: <MessageCircle className="w-5 h-5" />,
  }
  return icons[category] || <Globe className="w-5 h-5" />
}

export default function ResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory
    const matchesSearch = searchQuery === "" || 
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.country.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-2">Resource Hub</h1>
        <p className="text-muted-foreground">
          Access verified helplines, legal resources, and support services worldwide
        </p>
      </div>

      {/* Emergency Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-destructive/20 to-destructive/10 border border-destructive/30"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center shrink-0">
              <Phone className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-destructive mb-1">In Immediate Danger?</h2>
              <p className="text-sm text-muted-foreground">
                If you or someone you know is in immediate danger, call emergency services or a crisis hotline now.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="tel:112" className="px-6 py-3 rounded-xl bg-destructive text-destructive-foreground font-medium hover:opacity-90 transition-opacity">
              Call 112 (Emergency)
            </a>
            <a href="tel:181" className="px-6 py-3 rounded-xl bg-background border border-border font-medium hover:bg-muted transition-colors">
              Call 181 (Women's Helpline)
            </a>
          </div>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search resources by name, type, or country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-muted/30 border-border/50"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              <Icon className="w-4 h-4" />
              {category.label}
            </button>
          )
        })}
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((resource, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card rounded-2xl p-5 border border-border/50 hover:border-primary/30 transition-all group"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                resource.category === 'crisis' ? 'bg-destructive/20 text-destructive' :
                resource.category === 'legal' ? 'bg-amber-500/20 text-amber-500' :
                resource.category === 'shelter' ? 'bg-green-500/20 text-green-500' :
                resource.category === 'mental' ? 'bg-primary/20 text-primary' :
                'bg-accent/20 text-accent'
              }`}>
                {getCategoryIcon(resource.category)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm leading-tight mb-1 group-hover:text-primary transition-colors">
                  {resource.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {resource.country}
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
              {resource.description}
            </p>

            <div className="space-y-2 mb-4">
              {resource.phone && (
                <a 
                  href={`tel:${resource.phone.replace(/[^0-9+]/g, '')}`}
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Phone className="w-4 h-4" />
                  {resource.phone}
                </a>
              )}
              {resource.available && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-3 h-3" />
                  {resource.available}
                </div>
              )}
              {resource.languages && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Globe className="w-3 h-3" />
                  {resource.languages.slice(0, 2).join(", ")}
                  {resource.languages.length > 2 && ` +${resource.languages.length - 2} more`}
                </div>
              )}
            </div>

            {resource.website && (
              <a
                href={resource.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-muted/50 hover:bg-muted text-sm font-medium transition-colors"
              >
                Visit Website
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </motion.div>
        ))}
      </div>

      {/* No Results */}
      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No resources found</h3>
          <p className="text-muted-foreground text-sm">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-12 p-6 rounded-2xl bg-muted/30 border border-border/50">
        <div className="flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium mb-2">Disclaimer</h3>
            <p className="text-sm text-muted-foreground">
              The resources listed here are provided for informational purposes only. JusticeFlow does not endorse 
              any specific organization and is not responsible for the services provided by third parties. 
              Always verify the legitimacy of any organization before sharing personal information.
              If you&apos;re in immediate danger, please contact your local emergency services.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
