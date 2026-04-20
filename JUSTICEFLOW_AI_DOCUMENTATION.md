# JusticeFlow AI — Complete Project Documentation

> **"Transforming fragmented, emotional human experiences into structured, reliable, and legally usable testimony — without compromising the user's well-being."**

---

## Table of Contents

1. [Project Overview & Mission](#1-project-overview--mission)
2. [The Core Problem Solved](#2-the-core-problem-solved)
3. [Technology Stack](#3-technology-stack)
4. [System Architecture](#4-system-architecture)
5. [Database Schema](#5-database-schema)
6. [AI Systems & Engines](#6-ai-systems--engines)
7. [Application Pages & Routes](#7-application-pages--routes)
8. [API Endpoints](#8-api-endpoints)
9. [Core Components](#9-core-components)
10. [Custom Hooks](#10-custom-hooks)
11. [Library Utilities](#11-library-utilities)
12. [Authentication & Security](#12-authentication--security)
13. [User Journey (End-to-End Flow)](#13-user-journey-end-to-end-flow)
14. [Emotion-Aware Design System](#14-emotion-aware-design-system)
15. [Legal Document Generation (RAG)](#15-legal-document-generation-rag)
16. [Evidence Management](#16-evidence-management)
17. [Key Design Decisions](#17-key-design-decisions)
18. [Environment Variables & Secrets](#18-environment-variables--secrets)

---

## 1. Project Overview & Mission

**JusticeFlow AI** is an end-to-end, trauma-informed platform that helps individuals safely record and structure their experiences for legal use. It acts as an **intelligent bridge between human experience and legal structure**.

### The Problem It Solves

| Human Reality Under Trauma | Legal System Expectation |
|---|---|
| Memories come in fragments, non-linear | Clear, chronological statements |
| Vague on exact times/places | Precise dates, locations, times |
| Emotionally distressed while recalling | Objective, formal recounting |
| Forced to repeat story multiple times | Consistent, repeatable account |

This mismatch causes:
- Inconsistent testimonies that weaken legal cases
- Re-traumatization from repeated retelling
- Justice becoming harder to achieve

### JusticeFlow AI's Solution

Instead of forcing survivors into rigid forms, the platform:
1. Lets them share in fragments — text or voice, in any order
2. Uses AI to organize, structure, and reconstruct their account
3. Generates legally formatted documents automatically
4. Maintains full emotional awareness throughout the process

---

## 2. The Core Problem Solved

### Human Memory vs. Legal System

JusticeFlow AI addresses the critical gap between **how survivors experience and remember trauma** versus **what legal systems require as evidence**. The platform acts as an AI intermediary that:

- **Accepts fragmented input** — The user can share fragments out of order, in any level of detail
- **Reconstructs coherence** — AI organizes the fragments into a structured timeline
- **Fills gaps gently** — ARIA (the AI companion) asks targeted follow-up questions
- **Generates legal documents** — The structured output is converted into FIR, police complaints, affidavits, etc.

### Types of Incidents Supported

The platform supports documenting:
- Assault (physical, sexual)
- Workplace/school harassment and bullying
- Domestic violence
- Stalking
- Discrimination
- Any other traumatic/threatening experience

---

## 3. Technology Stack

### Frontend Framework
- **Next.js 16.2** — React-based full-stack framework with App Router
- **React 19** — UI rendering
- **TypeScript 5.7** — Type-safe development

### Styling & UI
- **TailwindCSS v4** — Utility-first CSS
- **Framer Motion 12** — Animations and transitions
- **Radix UI** — Accessible headless component primitives (25+ components)
- **Lucide React** — Icon library
- **shadcn/ui** — Pre-built component layer over Radix UI
- **next-themes** — Light/dark mode switching
- **Spline** (`@splinetool/react-spline`) — 3D interactive elements on landing page

### AI & Language Model
- **Google Gemini** (`@ai-sdk/google`) — Primary AI model (`gemini-3-flash-preview`)
- **Vercel AI SDK** (`ai`) — Streaming and text generation utilities
- **Model**: `gemini-3-flash-preview` — Used across all three AI engines

### Backend & Database
- **Supabase** — Backend-as-a-Service
  - PostgreSQL database
  - Row Level Security (RLS) policies
  - Auth (email/password + anonymous sessions)
  - Storage (for voice recordings and evidence files)
- **Next.js API Routes** — Serverless API handlers

### PDF & Document Handling
- **pdf-parse** — Extracts text from PDF legal templates
- **jsPDF** — PDF generation in the browser

### Other Libraries
- **framer-motion** — UI animations
- **recharts** — Analytics charts
- **react-hook-form + zod** — Form validation
- **date-fns** — Date utilities
- **sonner** — Toast notifications
- **Vercel Analytics** — Usage tracking

---

## 4. System Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    JusticeFlow AI                          │
│                                                            │
│  ┌─────────────┐    ┌──────────────────────────────────┐  │
│  │  Landing    │    │         Dashboard App            │  │
│  │  Page       │    │                                  │  │
│  │  (/)        │    │  ┌────────┐  ┌────────────────┐  │  │
│  └─────────────┘    │  │Sidebar │  │  Page Content  │  │  │
│                     │  │ Nav    │  │                │  │  │
│  ┌─────────────┐    │  └────────┘  └────────────────┘  │  │
│  │  Auth       │    └──────────────────────────────────┘  │
│  │  (/auth)    │                                           │
│  └─────────────┘                                           │
│           │                                                │
│           ▼                                                │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                   API Layer                         │  │
│  │                                                     │  │
│  │  /api/testimony-ai    — ARIA conversation AI       │  │
│  │  /api/structure-engine — Fragment → Timeline AI    │  │
│  │  /api/rag-report       — Legal document generator  │  │
│  │  /api/chat             — General support chat AI  │  │
│  │  /api/transcribe       — Audio transcription       │  │
│  └─────────┬──────────────────────────────────────────┘  │
│             │                                              │
│             ▼                                              │
│  ┌──────────────────┐   ┌──────────────────────────────┐  │
│  │  Google Gemini   │   │     Supabase (PostgreSQL)    │  │
│  │  AI Models       │   │                              │  │
│  │                  │   │  profiles │ sessions         │  │
│  │  gemini-3-flash  │   │  testimonies │ evidence      │  │
│  │  -preview        │   │  timeline_events │ reports   │  │
│  └──────────────────┘   │  chat_messages │ voice_recs  │  │
│                          └──────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### Key Design Pattern

Every user interaction flows through these layers:
1. **User Input** (text or voice) → ARIA conversation
2. **ARIA** → Extracts structured data, asks missing questions
3. **User completes steps** → Fragments accumulated in DB
4. **Structure Engine** → Analyzes ALL fragments → structured JSON
5. **RAG Report** → Injects structured JSON into legal template → official document

---

## 5. Database Schema

JusticeFlow uses Supabase (PostgreSQL) with these core tables:

### `profiles`
Stores user profile data. Supports both authenticated and anonymous users.

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Links to Supabase Auth user |
| `full_name` | text | User's display name |
| `email` | text | Email (null for anonymous) |
| `is_anonymous` | boolean | Whether session is anonymous |
| `anonymous_id` | text | Unique ID for anonymous users |
| `avatar_url` | text | Profile picture URL |

### `sessions`
A "session" is one case / testimony thread.

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Session identifier |
| `user_id` | UUID | Foreign key to auth user |
| `title` | text | User-given name e.g. "Incident at work" |
| `status` | text | `draft`, `in_progress`, `completed` |
| `current_step` | int | Which of the 5 steps the user is on |
| `emotional_state` | text | `calm`, `unsure`, `anxious`, `overwhelmed` |
| `description` | text | Stores serialized structured analysis (JSON) |

### `testimonies`
Individual testimony fragments (text or voice).

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Fragment identifier |
| `session_id` | UUID | Which session this belongs to |
| `user_id` | UUID | Owner |
| `step_type` | text | `identity`, `story`, `impact`, `evidence` |
| `content` | text | The raw text of the fragment |
| `voice_url` | text | URL to voice recording (if voice input) |
| `voice_transcript` | text | Transcribed voice audio |
| `metadata` | JSONB | Extra info (input type, is chat contribution, etc.) |

### `timeline_events`
AI-structured events extracted from fragments.

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Event identifier |
| `session_id` | UUID | Linked session |
| `title` | text | Short event description |
| `description` | text | Full description |
| `event_date` | text | ISO date string |
| `approximate_date` | text | Vague dates (e.g., "last summer") |
| `confidence_level` | text | `high`, `medium`, `low` |
| `location` | text | Where it happened |
| `people_involved` | text[] | Array of names |
| `sort_order` | int | Display order in timeline |
| `source_testimony_id` | UUID | Which fragment this came from |

### `evidence`
Uploaded supporting files.

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Evidence identifier |
| `session_id` | UUID | Linked session |
| `user_id` | UUID | Owner |
| `file_name` | text | Original filename |
| `file_type` | text | MIME type |
| `file_url` | text | URL to file in Supabase Storage |
| `storage_path` | text | Internal storage path |
| `description` | text | User-provided description |
| `timeline_event_id` | UUID | Linked to specific timeline event |
| `hash` | text | File hash for deduplication |

### `reports`
Generated formal reports.

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Report identifier |
| `session_id` | UUID | Linked session |
| `user_id` | UUID | Owner |
| `title` | text | e.g. "Structured Report - April 2026" |
| `report_type` | text | `structured`, `fir`, `complaint`, etc. |
| `content` | JSONB | Full structured JSON of the report |
| `html_content` | text | HTML version for printing |
| `status` | text | `generated`, `submitted` |
| `submitted_to` | text | Where it was submitted |

### `chat_messages`
Persistent ARIA conversation history.

| Field | Type | Description |
|---|---|---|
| `session_id` | UUID | Linked session |
| `user_id` | UUID | Owner |
| `role` | text | `user` or `assistant` |
| `content` | text | Message text |
| `metadata` | JSONB | Step, emotional state, microcopy, knownData snapshot |

### `voice_recordings`
Saved audio recordings.

| Field | Type | Description |
|---|---|---|
| `session_id` | UUID | Linked session |
| `user_id` | UUID | Owner |
| `storage_path` | text | Path in Supabase Storage `evidence` bucket |
| `duration_seconds` | int | Length of recording |
| `transcript` | text | Transcribed text |
| `processed` | boolean | Whether transcription was done |

---

## 6. AI Systems & Engines

JusticeFlow AI has **three distinct AI engines**, each with a clear responsibility:

---

### 6.1 ARIA — Testimony AI Companion
**File**: `app/api/testimony-ai/route.ts`  
**Endpoint**: `PUT /api/testimony-ai`

ARIA is a **trauma-informed conversational AI** designed to guide users through sharing their experience.

#### Purpose
- Acts as a warm, empathetic human companion (not a form or chatbot)
- Asks targeted questions to collect required legal details
- Adapts tone based on detected emotional distress

#### How It Works

**Step 1 — Parallel Processing**  
Two AI calls run simultaneously:

1. **Structured Data Extractor** (`extractStructuredData`)  
   A fast, low-temperature (0.1) Gemini call that parses the user's message and extracts 9 key legal fields plus metadata:
   - `incident_date`, `incident_location`
   - `perpetrator`, `relationship_to_perpetrator`
   - `witnesses`, `evidence_exists`
   - `reported_to_authority`, `pattern_or_single`
   - `impact`
   - Plus: `rawPeople`, `rawLocations`, `rawDates`, `evidenceClues`
   
2. **ARIA Response Generator**  
   A higher-temperature (0.8) Gemini call that generates ARIA's conversational reply. The prompt includes:
   - The last 10 messages of conversation history
   - What ARIA already knows (to avoid redundant questions)
   - What the next missing required field is
   - The detected emotional distress level

**Step 2 — Fill-the-Gaps Logic**  
The system tracks 9 `REQUIRED_FIELDS`. After each user message, it checks which are still missing and includes that in the prompt as: *"Your next question should naturally ask about: [missing field]"*

**Step 3 — Distress Detection**  
```
Level 3 (Crisis): "suicidal", "want to die", "end it", "kill myself"
Level 2 (High): "hopeless", "worthless", "trapped", "destroyed"
Level 1 (Mild): "scared", "afraid", "confused", "overwhelmed"
Level 0 (Calm): Normal state
```
The distress level directly affects ARIA's tone — higher distress means slower, warmer responses.

**Step 4 — Microcopy**  
Based on distress level, ARIA generates a brief reassuring badge message:
- Level 0: "You're doing well", "Every detail helps"
- Level 1: "I hear you", "You're being brave"  
- Level 2: "We can pause anytime", "I believe you"
- Level 3: "You're not alone", "Your safety first"

#### Response Schema
```json
{
  "response": "ARIA's conversational message",
  "microcopy": "Short supportive badge text",
  "supportLevel": 0-3,
  "reviewMode": true/false,
  "questionAsked": "which required field was asked",
  "extractedData": { ...all 9 fields plus raw arrays },
  "updatedKnownData": { ...merged known facts }
}
```

---

### 6.2 Structure Engine — Forensic Analysis
**File**: `app/api/structure-engine/route.ts`  
**Endpoint**: `POST /api/structure-engine`

The Structure Engine is a **forensic-grade AI analyst** that takes all collected testimony fragments and converts them into a comprehensive legal intelligence report.

#### Purpose
- Processes ALL fragments holistically (not one by one)
- Constructs a chronological timeline
- Extracts every entity (person, place, organization)
- Identifies patterns, gaps, and legal strengths/weaknesses
- Does NOT invent facts — only extracts what is explicitly stated

#### Input
```json
{
  "fragments": [{ "id", "content", "timestamp", "type" }],
  "knownData": { "incident_date": "...", ... },
  "evidence": [{ "id", "name", "type", "description" }],
  "sessionId": "..."
}
```

#### AI Rules (Strict System Prompt)
1. NEVER invent facts
2. Vague dates → mark as approximate with confidence: "low"
3. Overlapping events across fragments → MERGE into one
4. Track every entity and its role
5. Link evidence to specific events when possible
6. Preserve the survivor's exact words for key quotes — do NOT paraphrase
7. Flag contradictions as "needs_clarification"
8. Confidence levels: high (exact info) / medium (vague) / low (implied)

#### Output Structure (Full JSON)
```
{
  case_summary: "2-3 sentence overview",
  incident_type: "assault|harassment|bullying|domestic_violence|...",
  severity_assessment: "critical|severe|moderate|concerning",
  
  timeline_events: [
    {
      id, title, description,
      date_raw, date_estimated, time_of_day,
      location, location_type,
      people_involved[],
      perpetrator_actions,
      survivor_response,
      witnesses_present,
      evidence_referenced[],
      emotional_state_during,
      confidence: "high|medium|low",
      key_quotes[]
    }
  ],
  
  entities: {
    people: [{ name, role, relationship_to_survivor, description, mentioned_in_events[] }],
    locations: [{ name, type, significance, events_here[] }],
    organizations: [{ name, type, role_in_case }]
  },
  
  evidence_map: [{ type, description, linked_events[], status, importance }],
  
  pattern_analysis: { is_pattern, frequency, escalation, pattern_description },
  
  impact_assessment: { emotional[], physical[], financial[], social[], professional_academic[] },
  
  reporting_history: { reported_to_anyone, reports[] },
  
  gaps_and_clarifications: [{ field, question, importance: "critical|helpful|optional" }],
  
  legal_strength: { score: 1-10, strengths[], weaknesses[], recommended_evidence[] },
  
  metadata: { processed_at, fragment_count, evidence_count, model, engine_version }
}
```

---

### 6.3 RAG Legal Document Generator
**File**: `app/api/rag-report/route.ts`  
**Endpoint**: `POST /api/rag-report`

This implements a **Retrieval-Augmented Generation (RAG)** pipeline to produce official legal documents.

#### Purpose
- Converts the structured intelligence report into a ready-to-print legal document
- Uses real PDF legal templates as reference
- Supports 4 document types: FIR, Police Complaint, Legal Statement, Case Summary

#### How RAG Works

**Phase 1 — Retrieve**  
`lib/rag/retrieveTemplate.ts` loads the appropriate PDF template from `lib/rag/templates/`:
- `fir_template.pdf` → FIR (First Information Report)
- `police_complaint.pdf` → Police Complaint
- `legal_statement.pdf` → Legal Statement / Affidavit
- `case_summary.pdf` → Lawyer Case Summary  

It uses `pdf-parse` to extract the template text. If the PDF is missing, it falls back to a hardcoded template.

**Phase 2 — Generate**  
The template text + the full structured JSON are sent to Gemini with strict rules:
- ONLY use facts from the provided data
- NEVER invent dates, names, or events
- Use `[NOT PROVIDED]` for missing mandatory fields
- Output a complete, ready-to-print formal legal document
- Low temperature (0.15) for deterministic, accurate output

#### Supported Document Types

| Type Key | Document Name | Description |
|---|---|---|
| `fir` | First Information Report | Indian police FIR format |
| `complaint` | Formal Police Complaint | Formal written complaint |
| `statement` | Legal Witness/Survivor Statement | Section 161/164 format |
| `summary` | Lawyer Case Summary | Executive dossier for lawyers |

---

### 6.4 General Support Chat — ARIA (Streaming)
**File**: `app/api/chat/route.ts`  
**Endpoint**: `POST /api/chat`

This is a **streaming** version of ARIA for the dedicated "AI Support" page. Unlike the testimony AI (which tracks structured data), this is purely a supportive conversation interface.

#### Key Features
- **Streaming responses** using `streamText()` + `toUIMessageStreamResponse()`
- Built-in **Risk Assessment** engine that scores every user message:
  - Critical (≥50): weapons, suicide, immediate danger
  - High (≥30): stalking, strangulation, pregnancy + violence
  - Medium (≥15): hitting, control, monitoring
  - Low (≥5): verbal/verbal insult
- Follows the same trauma-informed system prompt as the testimony AI

---

## 7. Application Pages & Routes

### Public Routes

#### Landing Page — `/`
**File**: `app/page.tsx`

The marketing/entry page with:
- **NamasteIntro** — Animated intro overlay that fades out before content shows
- **AnimatedBackground** — Dynamic CSS/canvas background
- **Header** — Navigation with auth links
- **Hero** — Main value proposition
- **Features** — Platform feature cards
- **Scroll3DShowcase** — 3D scroll-driven visual with Spline
- **Steps** — Interactive step-by-step "How it works" section
- **Security** — Security/trust indicators
- **Footer**

#### Auth Page — `/auth`
**File**: `app/auth/` directory  
Handles sign-in, sign-up, and anonymous access.

---

### Protected Routes (Require Authentication)

All routes inside `/dashboard` are protected. The layout checks for an authenticated Supabase session, and unauthenticated users are redirected to `/auth`.

#### Dashboard Home — `/dashboard`
**File**: `app/dashboard/page.tsx`

The main landing page after login. Shows:
- **Welcome greeting** (time-aware: morning/afternoon/evening)
- **Anonymous/Secure mode badge**
- **"Start New Testimony" card** — Large CTA button
- **Testimony Name Modal** — Popup to name the new testimony session
- **Stats Cards** (4 cards): Total Sessions, Completed, In Progress, 256-bit Encryption
- **Recent Sessions list** — All past sessions with continue/delete actions

**Key Functions**:
- `handleCreateSessionClick()` — Opens the naming modal
- `handleConfirmCreateSession()` — Creates session in Supabase, navigates to testimony page
- `handleDeleteSession()` — Deletes a session with confirmation

---

#### Testimony Page — `/dashboard/testimony?session={id}`
**File**: `app/dashboard/testimony/page.tsx` (977 lines — the largest and most complex)

This is the **heart of JusticeFlow**. A conversational interface where the user shares their story.

**Structure**: 5 Steps
| Step | Label | Description |
|---|---|---|
| 0 | Identity | Optional: age, location, role |
| 1 | Your Story | Conversational fragment sharing |
| 2 | Impact | How the event affected them |
| 3 | Evidence | Upload supporting files |
| 4 | Review | Summary + generate report |

**Layout**: 2-pane
- **Left Sidebar** (desktop only):
  - Steps progress tracker
  - Emotion state buttons
  - Evidence radar (auto-detects evidence clues in text)
  - Witness radar (auto-detects names mentioned)
  - "Save & exit" link

- **Main Area**:
  - ARIA conversation flow
  - Text area OR voice input
  - File attachment support
  - Emotional support banner (real-time keyword detection)
  - Breathing exercise overlay (appears at distress level 2)
  - Safe Stop overlay (appears at distress level 3)

**Key State Variables**:
- `messages` — Full conversation history
- `knownData` — Accumulated extracted facts (passed to API on every turn)
- `fragments` — Raw text fragments collected so far
- `extractedData` — Peoples, locations, dates, evidence clues (display layer)
- `emotionState` — User-selected emotion button value
- `isRecording` — Whether voice recording is active

**Key Functions**:
- `sendToAria(text, mode)` — Sends a message to ARIA API, saves to DB, handles response
- `startRecording()` / `stopRecording()` — Full voice recording with Web Speech API + MediaRecorder
- `saveAndNext()` — Advances to next step, persists to DB
- `handleEmotionButton(val, level)` — Updates emotional state, triggers UI responses

**Emotional State Handling**:
- Level 1 (nervous): ARIA sends a gentle reassurance
- Level 2 (hard): Breathing exercise modal appears
- Level 3 (overwhelmed): Safe Stop full-screen overlay

**Voice Input**:
Uses the **Web Speech API** (`SpeechRecognition`) for real-time transcription while recording. `MediaRecorder` captures the audio blob. A `VoicePauseDetector` triggers gentle prompts after 3-5 seconds of silence.

---

#### Timeline Page — `/dashboard/timeline`
**File**: `app/dashboard/timeline/page.tsx`

Visual chronological timeline of extracted events. Each event card shows:
- Date (raw and estimated)
- Location
- People involved
- Confidence level (color-coded)
- Evidence linked

Users can also add/edit timeline events manually.

---

#### Evidence Page — `/dashboard/evidence`
**File**: `app/dashboard/evidence/page.tsx`

Evidence vault management:
- Upload new files (photos, documents, audio, messages)
- View all uploaded evidence with thumbnails
- Link evidence to specific timeline events
- View file metadata (type, size, upload date)
- Delete evidence

---

#### Report Page — `/dashboard/report`
**File**: `app/dashboard/report/page.tsx` (858 lines)

The AI-generated report viewer and legal document generator.

**Tabs**:
| Tab | Content |
|---|---|
| Overview | Case summary, legal strength score, pattern analysis, impact, gaps |
| Timeline | Chronological event list with confidence indicators |
| Entities | People (with roles), locations, organizations, evidence map |
| Legal | Detailed legal strength score, strengths/weaknesses, reporting history |
| Legal Docs | Official document generator (FIR, complaint, statement, summary) |

**Generate Report Flow**:
1. Click "Run Structure Engine"
2. All fragments from `testimonies` + `chat_messages` tables are fetched
3. Sent to `/api/structure-engine`
4. Structured JSON returned and stored in `reports` table + `sessions.description`
5. Report renders with full tab navigation

**Generate Legal Document Flow**:
1. User selects document type (FIR, complaint, etc.)
2. Click "Generate Document"
3. Sends structured data to `/api/rag-report`
4. Generated document text appears in a preview pane
5. User can Download (print dialog) or Copy the document

**Legal Strength Gauge**:
- Score 7-10 → Green
- Score 4-6 → Yellow
- Score 1-3 → Red

---

#### AI Support Page — `/dashboard/support`
A dedicated streaming chat interface with ARIA for emotional support and answering questions. Uses the `/api/chat` streaming endpoint.

---

#### Resources Page — `/dashboard/resources`
Curated list of Indian emergency services and support organizations:
- National emergency numbers
- Women's helplines
- Legal aid resources
- Mental health crisis lines

---

#### Analytics Page — `/dashboard/analytics`
**File**: `app/dashboard/analytics/page.tsx`

A data dashboard showing:
- **Stats Grid**: Total sessions, completed, testimonies count, evidence files, timeline events, completion rate
- **Weekly Activity Chart**: Bar chart (sessions vs testimonies per day, last 7 days)
- **Risk Assessment Overview**: Distribution of risk levels from AI assessments
- **Documentation Progress**: Checklist view (identity/story/timeline/evidence complete?)
- **Recent Activity**: Latest 5 actions taken

---

#### Share Page — `/dashboard/share`
Functionality for securely sharing a case report with legal professionals, support organizations, or law enforcement while maintaining access controls.

---

## 8. API Endpoints

| Route | Method | Description |
|---|---|---|
| `/api/testimony-ai` | PUT / POST | ARIA conversational AI — processes user messages |
| `/api/structure-engine` | POST | Forensic analysis of all fragments → structured JSON |
| `/api/rag-report` | POST | Generates official legal document using RAG |
| `/api/chat` | POST | Streaming ARIA support chat |
| `/api/transcribe` | POST | Audio transcription |
| `/api/auth/*` | Various | Supabase auth callbacks |

### Request / Response Details

**`/api/testimony-ai` (PUT)**

Request:
```json
{
  "userMessage": "string",
  "conversationHistory": [{ "role": "user|assistant", "content": "string" }],
  "knownData": { "incident_date": "..." },
  "emotionalState": "calm|unsure|anxious|overwhelmed"
}
```

Response:
```json
{
  "response": "ARIA's reply",
  "microcopy": "Short badge text",
  "supportLevel": 0,
  "reviewMode": false,
  "questionAsked": "incident_date",
  "extractedData": { ... },
  "updatedKnownData": { ... }
}
```

---

**`/api/structure-engine` (POST)**

Request:
```json
{
  "fragments": [{ "id", "content", "timestamp", "type" }],
  "knownData": { ... },
  "evidence": [{ "id", "name", "type", "description" }],
  "sessionId": "uuid"
}
```

Response: Full structured intelligence report JSON (see Section 6.2)

---

**`/api/rag-report` (POST)**

Request:
```json
{
  "structuredData": { ...full structured report... },
  "type": "fir|complaint|statement|summary"
}
```

Response:
```json
{
  "success": true,
  "report": "Full formatted legal document text",
  "templateUsed": "fir"
}
```

---

## 9. Core Components

### Layout & Navigation

#### `app/dashboard/layout.tsx`
The main application shell. Provides:
- **Responsive sidebar** with smooth expand/collapse animation
- **Navigation links** to all 9 sections
- **User profile section** showing name, anonymous status
- **Theme toggle** (light/dark)
- **Sign out** button
- **Mobile header** with hamburger menu
- Auth guard (redirects to `/auth` if not logged in)
- Listens for Supabase auth state changes

**Navigation Items**:
```
/ dashboard  → Dashboard (Home)
/ testimony  → Testimony recording
/ timeline   → Visual timeline
/ evidence   → Evidence vault
/ report     → AI report + legal docs
/ support    → AI Support chat
/ resources  → Help resources
/ analytics  → Case analytics
/ share      → Share/export
```

---

### Testimony Components (`components/testimony/testimony-ui.tsx`)

A collection of pure UI components used in the testimony page:

| Component | Purpose |
|---|---|
| `AriaAvatar` | Colored gradient avatar for ARIA that changes color by distress level |
| `ThinkingIndicator` | Animated 3-dot bouncing loader shown while ARIA processes |
| `MicrocopBadge` | Small pill badge showing supportive microcopy |
| `EmotionalSupportBanner` | Full-width colored banner that appears when distress is detected (level 1-3) |
| `AriaBubble` | ARIA's conversation message bubble |
| `UserBubble` | User's message bubble (with optional attachment preview) |
| `EvidenceRadar` | Alert shown when evidence is mentioned in text (e.g. "I have messages") |
| `WitnessRadar` | Pill buttons for each person detected in text — click to add as witness |
| `BreathingExercise` | Animated breathing guide (4-4-4 pattern) shown at distress level 2 |
| `SafeStopScreen` | Full-screen safe pause overlay shown at distress level 3 |
| `EMOTION_STATES` | Array of 4 emotion state options with emoji, label, level |

**ARIA Avatar Color Scheme by Distress Level**:
- Level 0 (calm): Indigo/Purple gradient
- Level 1 (mild): Amber/Orange gradient  
- Level 2 (high): Purple/Violet gradient
- Level 3 (crisis): Red gradient

---

### Voice Components (`components/voice/voice-recorder.tsx`)

A standalone voice recording component used in the Evidence page and other areas.

**Features**:
- Microphone permission handling
- Real-time audio visualization (32-bar frequency display)
- Record / Pause / Resume / Stop controls
- Duration timer (MM:SS format)
- Playback with progress bar
- Transcription trigger (sends to transcription API)
- Upload to Supabase Storage (`evidence` bucket)
- Saves metadata to `voice_recordings` table

---

### Landing Components (`components/landing/`)

| Component | Purpose |
|---|---|
| `NamasteIntro` | Animated "Namaste 🙏" entry overlay — plays then fades away |
| `Header` | Navigation bar with logo and auth links |
| `Hero` | Main hero section with tagline and CTA |
| `Features` | 3-4 column feature card grid |
| `Scroll3DShowcase` | Scroll-triggered 3D visual (Spline integration) |
| `Steps` | Interactive numbered steps showing the workflow |
| `Security` | Security/trust signals section |
| `Footer` | Site footer |

---

### Global Components

| Component | Purpose |
|---|---|
| `AnimatedBackground` | Canvas-based animated particle/gradient background |
| `LoadingAnimation` | Full-screen loading spinner for route transitions |
| `ThemeProvider` | Wraps app in `next-themes` for dark/light mode |
| `ThemeToggle` | Sun/moon icon button to switch theme |

---

## 10. Custom Hooks

### `useEmotionalSensing(text: string)`
**File**: `hooks/use-emotional-sensing.ts`

Real-time emotional keyword detection that runs on every keystroke.

**Returns**:
```typescript
{
  supportLevel: 0 | 1 | 2 | 3,
  triggerWords: string[],        // which words triggered the level
  recommendation: string,        // what ARIA should do
  bannerConfig: {
    bg: string,                  // CSS color for banner background
    border: string,              // CSS color for banner border
    textColor: string,           // Text color
    icon: string,                // Emoji icon
    message: string              // Displayed message
  }
}
```

**Keyword Map**:
- Level 3: `suicidal`, `can't go on`, `want to die`, `end my life`, `kill myself`
- Level 2: `hopeless`, `worthless`, `trapped`, `destroyed`, `broken`
- Level 1: `scared`, `afraid`, `confused`, `overwhelmed`, `anxious`, `hurt`, `crying`

Uses `useMemo` to avoid re-running on every render.

---

### `createVoicePauseDetector(onPause)`
**File**: `hooks/use-emotional-sensing.ts`

Detects silence during voice recording using the Web Audio API's `AnalyserNode`.

**Logic**:
- Analyzes RMS (Root Mean Square) amplitude of audio frames
- If amplitude below threshold (0.01) for >2.5 seconds → trigger
- At 3 seconds silence: "It's okay to pause. Take a breath."
- At 5 seconds silence: "Take your time… I'm here whenever you're ready."
- Resets silence timer on detected speech

---

### `useMobile()`
**File**: `hooks/use-mobile.ts`  
Simple breakpoint hook to detect mobile screen size (< 768px).

---

### `useToast()`
**File**: `hooks/use-toast.ts`  
Sonner-based toast notification hook.

---

## 11. Library Utilities

### `lib/testimony-store.ts`

Local state management utilities for testimony data. Uses `localStorage` as a fallback persistence layer.

**Types**:
- `TestimonyData` — Full testimony object including fragments, timeline, evidence, status
- `TimelineEvent` — Individual timeline event with confidence level
- `Evidence` — Uploaded evidence file metadata

**Functions**:
- `createTestimony()` — Creates new testimony instance with defaults
- `saveTestimony(data)` — Saves to localStorage (`sv_testimonies` + `sv_current_testimony`)
- `getTestimonies()` — Returns all saved testimonies
- `getCurrentTestimony()` — Gets the active testimony
- `clearCurrentTestimony()` — Clears current (after submission)

---

### `lib/rag/retrieveTemplate.ts`

RAG template retrieval system.

**Types**: `DocumentType = 'fir' | 'complaint' | 'statement' | 'summary'`

**`retrieveTemplate(type)`** → `Promise<string>`
1. Looks up PDF filename from `TEMPLATE_MAP`
2. Resolves path to `lib/rag/templates/{filename}`
3. If file exists: uses `pdf-parse` to extract text
4. If file missing or parse fails: falls back to `getFallbackTemplate(type)`

**Fallback Templates Built-in**:
All 4 document types have hardcoded fallback templates that provide the correct legal structure even without PDF files.

---

### `lib/supabase/client.ts` & `lib/supabase/server.ts`
Client-side and server-side Supabase client factories. The server client uses Next.js `cookies()` for SSR session handling.

### `lib/database.types.ts`
Full TypeScript types auto-generated from Supabase schema. Provides type-safe database access via `Tables<"sessions">`, `TablesInsert<"evidence">`, etc.

### `lib/utils.ts`
`cn()` utility for merging Tailwind class names (uses `clsx` + `tailwind-merge`).

---

## 12. Authentication & Security

### Authentication Methods
1. **Email/Password** — Standard account creation
2. **Anonymous Sessions** — No account required. User gets an anonymous Supabase session stored in cookies. Data is tied to the anonymous user ID.

### Row Level Security (RLS)
**File**: `supabase-rls-setup.sql`

Every database table has RLS policies ensuring users can ONLY access their own data:
```sql
-- Example: Users can only SELECT their own sessions
CREATE POLICY "Users can view own sessions"
ON sessions FOR SELECT
USING (auth.uid() = user_id);
```
This is enforced at the database level — even if the API is compromised, data cannot be cross-accessed.

### Middleware
**File**: `middleware.ts`

All routes pass through `updateSession()` which:
- Checks for a valid Supabase session cookie
- Refreshes the session token if needed
- Protects all routes except static files and images

Unauthenticated users attempting to access `/dashboard/*` or any API route are denied.

### Data Security Features
- **256-bit AES encryption** at rest (Supabase/PostgreSQL)
- **HTTPS** in transit
- **Anonymous mode** — no PII required to use the platform
- **No data sharing** — User data is never used for AI training
- **User-controlled deletion** — Sessions and all associated data can be permanently deleted

---

## 13. User Journey (End-to-End Flow)

```
1. USER ARRIVES at justiceflow.ai
   └── NamasteIntro animation plays
   └── Landing page fades in
   └── User reads features/how-it-works

2. USER SIGNS IN (or continues anonymously)
   └── Creates or logs into account
   └── Redirected to /dashboard

3. DASHBOARD
   └── Click "Start New Testimony"
   └── Name the testimony (e.g. "Incident at work")
   └── Redirected to /dashboard/testimony?session=<id>

4. TESTIMONY RECORDING (Step 1-4)
   │
   ├── Step 0: IDENTITY (optional)
   │   └── Age range, general location, role
   │   └── Click "Continue"
   │
   ├── Step 1: YOUR STORY (core)
   │   ├── ARIA opens: "Thank you for being here..."
   │   ├── User types or speaks
   │   ├── ARIA responds with empathy + next question
   │   ├── Evidence radar alerts when user mentions evidence
   │   ├── Witness radar shows names detected
   │   ├── Emotional state buttons available
   │   └── If distressed: breathing / safe stop overlays
   │
   ├── Step 2: IMPACT
   │   └── ARIA asks how the event affected their life
   │
   ├── Step 3: EVIDENCE
   │   └── Upload photos, documents, messages, recordings
   │
   └── Step 4: REVIEW
       └── Summary of fragments, dates, locations, people
       └── Click "Generate Report →"

5. REPORT PAGE
   ├── Click "Run Structure Engine"
   ├── AI analyzes all fragments (30-120 seconds)
   ├── Structured report appears with tabs:
   │   ├── Overview: Case summary, legal strength (1-10)
   │   ├── Timeline: Chronological events
   │   ├── Entities: People, locations, organizations
   │   ├── Legal: Strengths, weaknesses, gaps
   │   └── Legal Docs: Generate FIR/complaint/statement
   │
   └── Generate Legal Document:
       ├── Select document type
       ├── Click "Generate"
       ├── AI fills template from structured data
       └── Download / Print / Copy the document

6. SHARE (optional)
   └── Securely share report with lawyer/organization
```

---

## 14. Emotion-Aware Design System

JusticeFlow uses a **3-layer emotion detection system** that adapts the entire experience:

### Layer 1 — Real-Time Text Keyword Detection
`useEmotionalSensing()` hook runs on every keystroke in the testimony textarea. If crisis keywords are detected, a colored banner appears immediately above the chat area — before the user even sends the message.

### Layer 2 — Voice Pause Detection
`createVoicePauseDetector()` monitors microphone audio amplitude during voice recording. Extended silence triggers a gentle prompt in the UI, normalizing breaks and pauses.

### Layer 3 — AI-Level Detection
The testimony-ai API independently detects distress level in the user's message. If the AI detects higher distress than the UI did, it escalates the support level. This ensures even subtle/implicit distress signals are caught.

### Support Level Responses

| Level | Trigger | UI Response | ARIA Tone |
|---|---|---|---|
| 0 | No keywords | No banner | Normal, curious |
| 1 | Scared/uncertain words | Yellow banner "I hear you" | Warmer, slower pacing |
| 2 | Hopeless/trapped words | Purple banner, "Take a Break" button | Validate more, offer pause |
| 3 | Crisis indicators | Red banner, crisis hotline link | Immediate crisis resources, safe stop |

### Breathing Exercise
At level 2, a beautiful full-screen breathing exercise appears:
- Animated circle that expands/contracts in a 4-4-4 rhythm
- "Breathe in for 4… hold for 4… out for 4…"
- "Take as long as you need. There's no rush."
- "I'm ready to continue" button to resume

### Safe Stop Screen
At level 3 (or when user clicks the red "Stop" button), a full-screen overlay:
- "You're safe here"
- "Your session is saved and encrypted"
- Two options: "Continue when ready" or "Save and exit"

---

## 15. Legal Document Generation (RAG)

### RAG Pipeline

**R — Retrieve**: Load the relevant legal template PDF  
**A — Augment**: Combine template + case data into a prompt  
**G — Generate**: AI produces the filled-out document

### Document Formats

**FIR (First Information Report)**
Follows Indian police FIR format:
- District, Police Station
- Date and time of occurrence
- Informant details
- Description of offense
- Officer signature block

**Formal Police Complaint**
Addressed to Station House Officer:
- Subject line with incident type
- Formal opening
- Chronological case details
- Prayer/request
- Signature

**Legal Statement (Section 161/164)**
- Under oath format
- Incident timeline
- Affirmation of accuracy
- Deponent signature

**Case Summary**
- Executive overview for lawyers
- Full case details
- Generated by JusticeFlow AI attribution

### Template Fallback System
If PDF files are not present in `lib/rag/templates/`, the system uses hardcoded fallback templates with the same structure. This ensures the feature always works even in demo/development environments.

---

## 16. Evidence Management

### Evidence Types Supported
- Photos (JPEG, PNG, WEBP, SVG)
- Documents (PDF, DOCX, TXT)
- Audio/Video recordings (MP3, MP4, WEBM)
- Messages/Screenshots
- Medical records
- Financial records

### Evidence Storage
- Files are uploaded to Supabase Storage in the `evidence` bucket
- Path format: `{user_id}/{timestamp}.{ext}`
- Public URLs generated after upload

### Evidence in the AI Pipeline
When the Structure Engine analyzes fragments, it receives the full evidence inventory:
```
1. photo.jpg (image/jpeg) — "Screenshot of threatening messages"
2. recording.webm (audio/webm) — "Voice memo from that night"
```

The AI links evidence to specific timeline events and categorizes them by importance (critical / important / supporting) and status (uploaded / mentioned / missing).

### Evidence Radar (Auto-Detection)
When ARIA processes a user message, the `extractedData.evidenceClues` array is populated with any evidence mentioned:
- "I have messages" → `evidenceClues: ["messages"]`
- "There were photos" → `evidenceClues: ["photos"]`

The Evidence Radar component displays these as a clickable alert in the sidebar: *"You mentioned: messages. Tap to add evidence →"*

---

## 17. Key Design Decisions

### Decision 1 — Conversational vs. Form-Based Input
**Choice**: Conversational chat interface (ARIA)  
**Why**: Forms are clinical and intimidating for trauma survivors. A conversation feels natural, allows fragmented sharing, and the AI can guide the user through gaps without making them feel interrogated.

### Decision 2 — Parallel AI Calls
**Choice**: Run extraction + response generation simultaneously  
**Why**: Each user message requires two AI calls: one for structured data extraction (fast, low-temperature) and one for ARIA's empathetic response (expressive, higher-temperature). Running in parallel reduces latency significantly.

### Decision 3 — knownData Accumulation
**Choice**: Pass growing `knownData` object to AI on every turn  
**Why**: Prevents ARIA from asking the same question twice. The AI knows what's already been collected and only asks for what's still missing.

### Decision 4 — Three-Stage Pipeline
**Choice**: ARIA → Structure Engine → RAG  
**Why**: Separation of concerns. ARIA handles emotional interaction, the Structure Engine handles forensic analysis, RAG handles document formatting. Each is specialized and can be improved independently.

### Decision 5 — Anonymous Mode
**Choice**: Support completely anonymous usage  
**Why**: Many survivors fear creating an account due to safety concerns. Anonymous mode requires no email, no password, and no personal information — just a session cookie.

### Decision 6 — Chat History Persistence
**Choice**: Save every message to `chat_messages` table in Supabase  
**Why**: Users must be able to leave and come back without losing progress. The conversation history is restored from the database, not from local state.

### Decision 7 — Low Temperature for Legal Documents
**Choice**: Temperature 0.15-0.2 for legal document generation, 0.8 for ARIA's conversational responses  
**Why**: Legal documents require accuracy and consistency — low temperature ensures deterministic output. ARIA's responses need warmth and natural variation — higher temperature achieves this.

---

## 18. Environment Variables & Secrets

**File**: `.env.development.local`

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (public) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (public, safe to expose) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key (SERVER ONLY — never expose in client) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini API key (used for all AI engines) |
| `RAG_AI_API` | Optional separate API key for RAG feature (falls back to main key) |

> **Security Note**: The `SUPABASE_SERVICE_ROLE_KEY` bypasses all RLS policies. It should ONLY be used in server-side API routes and never exposed to the browser.

---

## Summary

JusticeFlow AI is a full-stack Next.js application that combines:
1. **Trauma-informed UX** — Emotion-aware interactions, breathing exercises, safe stop
2. **Intelligent AI Conversation** — ARIA guides users through sharing without pressure
3. **Forensic AI Analysis** — Structure Engine converts raw fragments into structured intelligence
4. **Legal Document Generation** — RAG pipeline produces official legal documents
5. **Secure Data Architecture** — Supabase with RLS, anonymous mode, 256-bit encryption

The platform represents a fundamental rethinking of how legal documentation works — instead of asking survivors to conform to rigid formats, the technology adapts to how humans actually experience and recall traumatic events.

---

*Generated: April 2026 | Version: 1.0.0 | Platform: JusticeFlow AI*
