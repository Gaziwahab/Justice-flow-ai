<div align="center">

<img src="public/logo.png" alt="JusticeFlow AI Logo" width="80" />

# JusticeFlow AI

**Trauma-informed testimony platform powered by AI**

*Transforming fragmented, emotional human experiences into structured, reliable, and legally usable testimony — without compromising the user's well-being.*

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-AI_Engine-4285F4?logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-Private-red)](LICENSE)

</div>

---

## The Problem

People who experience trauma often remember events in fragments — not in a clear sequence. They struggle to recall exact times, locations, or the precise order of events. Yet, legal systems demand clear, consistent, and chronological statements with precise details.

This mismatch causes:

- Testimonies that appear inconsistent, weakening legal cases
- Survivors forced to repeat their story multiple times to different authorities
- Re-traumatization from rigid documentation processes
- Justice becoming harder to achieve

**JusticeFlow AI bridges this gap.** It lets survivors share in fragments, then uses AI to organize, structure, and convert those fragments into legally usable documents — without ever forcing the user to conform to a rigid format.

---

## What It Does

```
User shares fragments (text or voice)
          ↓
ARIA (AI companion) listens, empathizes, fills gaps gently
          ↓
Structure Engine analyzes all fragments forensically
          ↓
Generates a structured intelligence report
          ↓
RAG pipeline fills an official legal template (FIR, complaint, etc.)
          ↓
User downloads a ready-to-submit legal document
```

---

## Key Features

### 🤖 ARIA — Trauma-Informed AI Companion
A conversational AI calibrated for empathy, not interrogation. ARIA:
- Guides users through sharing their experience without retraumatizing them
- Detects emotional distress in real-time and adapts its tone and pacing
- Asks gentle, targeted follow-up questions to fill legal information gaps
- Never repeats questions it has already learned the answer to
- Supports both text and voice input

### 🧠 Structure Engine — Forensic AI Analyst
Takes all raw testimony fragments and produces a comprehensive legal intelligence report:
- Builds a chronological timeline of events (merging overlapping fragments)
- Extracts every entity: people, locations, organizations
- Maps evidence to specific events
- Identifies patterns, escalation, and impact
- Scores legal case strength (1–10) with strengths and weaknesses
- Identifies information gaps with gentle follow-up questions
- Assigns confidence levels to each extracted detail

### 📄 RAG Legal Document Generator
Retrieves official legal templates and fills them using structured case data:
- **FIR** — First Information Report (Indian police format)
- **Police Complaint** — Formal written police complaint
- **Legal Statement** — Section 161/164 affidavit format
- **Case Summary** — Executive dossier for lawyers

### 🛡️ Evidence Vault
- Upload photos, documents, voice recordings, messages, and medical records
- Files stored securely in Supabase Storage
- AI automatically links evidence to specific timeline events
- Evidence Radar detects when evidence is mentioned in conversation and prompts upload

### 💜 Emotion-Aware Design
Three-layer emotional detection system:
1. **Real-time keyword scanning** on every keystroke
2. **Voice pause detection** — prompts gently after 3–5 seconds of silence
3. **AI distress analysis** — independent server-side emotion classification

| Level | State | Response |
|-------|-------|----------|
| 0 | Calm | Normal pacing |
| 1 | Nervous | Yellow banner, warmer tone |
| 2 | Distressed | Breathing exercise overlay |
| 3 | Crisis | Full-screen safe stop + crisis hotline |

### 📊 Case Analytics
Track documentation progress:
- Weekly activity charts
- Risk assessment breakdowns
- Documentation completion checklist
- Recent activity log

### 🔒 Anonymous Mode
No account required. Full anonymous sessions with complete data isolation via Supabase Row Level Security.

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16.2 (App Router) |
| **Language** | TypeScript 5.7 |
| **Styling** | TailwindCSS v4 + Framer Motion 12 |
| **UI Components** | Radix UI + shadcn/ui |
| **3D Elements** | Spline |
| **AI Model** | Google Gemini (`gemini-3-flash-preview`) |
| **AI SDK** | Vercel AI SDK (`ai`, `@ai-sdk/google`) |
| **Database** | Supabase (PostgreSQL + RLS) |
| **Auth** | Supabase Auth (email/password + anonymous) |
| **Storage** | Supabase Storage |
| **PDF Parsing** | pdf-parse |
| **Charts** | Recharts |

---

## Project Structure

```
justiceflow-ai/
├── app/
│   ├── page.tsx                     # Landing page
│   ├── api/
│   │   ├── testimony-ai/route.ts    # ARIA conversation AI
│   │   ├── structure-engine/route.ts # Forensic analysis AI
│   │   ├── rag-report/route.ts      # Legal document generator
│   │   ├── chat/route.ts            # Streaming support chat
│   │   └── transcribe/route.ts      # Audio transcription
│   ├── auth/                        # Auth pages
│   └── dashboard/
│       ├── layout.tsx               # App shell with sidebar
│       ├── page.tsx                 # Dashboard home
│       ├── testimony/page.tsx       # Core testimony interface
│       ├── timeline/page.tsx        # Visual timeline
│       ├── evidence/page.tsx        # Evidence vault
│       ├── report/page.tsx          # AI report + legal docs
│       ├── support/page.tsx         # AI support chat
│       ├── resources/page.tsx       # Crisis resources
│       ├── analytics/page.tsx       # Case analytics
│       └── share/page.tsx           # Secure sharing
│
├── components/
│   ├── testimony/testimony-ui.tsx   # ARIA UI components
│   ├── voice/voice-recorder.tsx     # Voice recording component
│   ├── landing/                     # Landing page sections
│   └── ui/                          # shadcn/ui component library
│
├── hooks/
│   ├── use-emotional-sensing.ts     # Real-time distress detection
│   └── use-mobile.ts
│
├── lib/
│   ├── database.types.ts            # Supabase type definitions
│   ├── testimony-store.ts           # Local state management
│   ├── rag/
│   │   ├── retrieveTemplate.ts      # PDF template retriever
│   │   └── templates/               # Legal document PDFs
│   └── supabase/                    # Supabase client factories
│
├── supabase-rls-setup.sql           # Row Level Security policies
└── JUSTICEFLOW_AI_DOCUMENTATION.md  # Full technical documentation
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com/) account and project
- A [Google AI Studio](https://ai.google.dev/) API key (Gemini)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/justiceflow-ai.git
cd justiceflow-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Gemini AI
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key

# Optional: separate key for RAG feature
RAG_AI_API=your_gemini_api_key
```

> ⚠️ **Important**: Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser. It is server-side only.

### 4. Set Up the Database

In your Supabase SQL Editor, run the SQL files in this order:

```bash
# 1. Create all tables
scripts/001_create_secure_voice_schema.sql

# 2. Apply Row Level Security policies
supabase-rls-setup.sql
```

Then in your Supabase Storage dashboard, create an `evidence` bucket.

### 5. (Optional) Add Legal Document Templates

Place legal template PDFs in `lib/rag/templates/`:
```
lib/rag/templates/
├── fir_template.pdf
├── police_complaint.pdf
├── legal_statement.pdf
└── case_summary.pdf
```

If not present, the system uses built-in fallback templates automatically.

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## How It Works — User Journey

```
1. Land on justiceflow.ai
   └─ Namaste intro animation plays

2. Sign in or continue anonymously
   └─ No account required for anonymous mode

3. Start a new testimony session
   └─ Give it a name (e.g. "Incident at work - March 2026")

4. Share your story with ARIA (5 steps)
   ├─ Step 0: Optional identity details (age, location, role)
   ├─ Step 1: Your story — share in fragments, voice or text
   ├─ Step 2: Impact — how this has affected your life
   ├─ Step 3: Evidence — upload supporting files
   └─ Step 4: Review — see what was collected

5. Generate structured report
   └─ AI analyzes all fragments → structured intelligence JSON

6. Generate official legal document
   └─ Select FIR / Complaint / Statement / Summary
   └─ AI fills template with your case data
   └─ Download or print the completed document
```

---

## AI Engine Details

### ARIA — Testimony AI (`/api/testimony-ai`)
- Runs **two parallel AI calls** per user message:
  1. Structured data extractor (temperature 0.1 — precise)
  2. Conversational response generator (temperature 0.8 — empathetic)
- Tracks 9 required legal fields and asks for missing ones naturally
- Distress detection: 4 levels with appropriate response escalation
- Generates supportive microcopy badges at each distress level

### Structure Engine (`/api/structure-engine`)
- Temperature: **0.2** (forensic accuracy)
- Processes ALL fragments holistically in a single pass
- System prompt enforces: no invented facts, merge duplicates, preserve exact quotes
- Output: ~15 structured fields including timeline, entities, legal strength, gaps

### RAG Document Generator (`/api/rag-report`)
- Temperature: **0.15** (deterministic legal output)
- Retrieves real PDF templates using `pdf-parse`
- Strict rules: use `[NOT PROVIDED]` for missing info, never invent facts
- Produces ready-to-print formal legal documents

---

## Security & Privacy

- **Row Level Security (RLS)** — Every database table enforces user-level data isolation at the PostgreSQL layer
- **Anonymous Sessions** — Full functionality with no personal information required
- **256-bit AES encryption** — Data at rest encrypted by Supabase
- **HTTPS** — All data in transit encrypted
- **No cross-user data access** — RLS prevents any API compromise from exposing other users' data
- **User-controlled deletion** — Sessions and all data can be permanently deleted

---

## Dashboard Navigation

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/dashboard` | Home, stats, start new session |
| Testimony | `/dashboard/testimony` | Core ARIA conversation interface |
| Timeline | `/dashboard/timeline` | Visual event timeline |
| Evidence | `/dashboard/evidence` | Upload and manage evidence |
| Report | `/dashboard/report` | AI report + legal document generator |
| AI Support | `/dashboard/support` | Streaming support chat |
| Resources | `/dashboard/resources` | Indian crisis helplines & legal aid |
| Analytics | `/dashboard/analytics` | Case progress and risk charts |
| Share | `/dashboard/share` | Securely share with lawyers/organizations |

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profile and anonymous mode flags |
| `sessions` | Testimony sessions (cases) |
| `testimonies` | Raw testimony fragments |
| `chat_messages` | Full ARIA conversation history |
| `timeline_events` | AI-structured chronological events |
| `evidence` | Uploaded supporting files metadata |
| `reports` | Generated structured reports |
| `voice_recordings` | Saved audio recordings with transcripts |

---

## Full Documentation

For a complete technical reference including AI engine details, all component APIs, database schema, design decisions, and more — see:

📄 **[JUSTICEFLOW_AI_DOCUMENTATION.md](./JUSTICEFLOW_AI_DOCUMENTATION.md)**

---

## Important Disclaimer

> JusticeFlow AI provides technological assistance to help document and organize experiences for legal purposes. **It does not legally represent users and does not replace professional legal counsel.** If you are in immediate danger, please contact emergency services.

**India Emergency Resources:**
- Police: **100**
- Women's Helpline: **1091**
- National Emergency: **112**
- iCall Mental Health: **9152987821**

---

<div align="center">

Built with ❤️ for survivors

*JusticeFlow AI — Because your story deserves to be heard, in your own way, at your own pace.*

</div>
