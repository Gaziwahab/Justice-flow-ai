# JusticeFlow 🛡️

**JusticeFlow** (formerly SecureVoice) is a secure, intelligent, trauma-informed testimony platform. It is designed to help survivors of abuse, harassment, and trauma safely share fragmented experiences, converting emotional memory into structured legal timelines using autonomous AI support.

![JusticeFlow UI](public/logo.png)

## 📌 Mission

Sharing traumatic events can be overwhelming, disorganized, and re-traumatizing. **JusticeFlow** provides a completely secure sandbox where survivors can talk to **ARIA**, a highly specialized trauma-informed companion AI. By documenting their experiences safely in fragments over time, the platform's Structure Engine automatically cross-references and outputs forensic-grade event timelines and formalized Legal Reports (FIRs, Complaints, Dossiers) for legal advocates, without stripping agency or comfort away from the survivor.

---

## ⚡ Key Features

- **ARIA Trauma-Support Companion**: A conversational AI interface calibrated for immediate empathy, validation, and gently guiding unchronological testimony gathering without re-traumatizing.
- **AI Structure Engine**: Translates fragmented, emotional data streams into a formalized intelligence object (JSON structure indicating precise chronological events, entities, and locations).
- **Interactive Timeline**: Visualizes the progression of events accurately.
- **Evidence Vault**: Secure, immutable persistent storage for uploading images, documents, and other file proofs to back up testimonies using Supabase.
- **RAG Dossier Generation**: Employs Google's `gemini-3-flash-preview` and `pdf-parse` to fill official legal templates (FIRs, Case Dossiers) automatically based on the AI-analyzed case context. Then securely prints directly to PDF locally.
- **Liquid Glass Interface & Security**: Features a highly accessible dark-mode UI with smooth `framer-motion` transitions.
- **Pan-India Resource Hub**: Direct, locally integrated access to verified legal representation, shelters, and mental health aid lines.

---

## 🛠 Technology Stack

- **Framework**: [Next.js 14 App Router](https://nextjs.org/) (React)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & Vanilla CSS custom tokens (Liquid Glass Design System)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend & Auth**: [Supabase](https://supabase.com/) (Postgres, Row Level Security, Storage)
- **AI Engines**: `@google/genai` (Gemini Flash/Pro layers for ARIA and Document Generation)
- **PDF Generation**: `pdf-parse` + Native browser-printing mechanics

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/justice-flow.git
cd justice-flow
```

### 2. Install Dependencies

You may use `npm`, `yarn`, or `pnpm`.

```bash
npm install
```

### 3. Environment Variables

You will need to configure Supabase and Gemini keys. Copy the `.env.example` file to create a `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI / RAG Configuration
AI_API_KEY=your_gemini_api_key
RAG_AI_API=your_gemini_api_key
```

### 4. Setup Supabase Database

Run the SQL files included in this repository (e.g., `scripts/001_create_secure_voice_schema.sql` and `supabase-rls-setup.sql`) in your Supabase SQL Editor to establish the proper tables (`sessions`, `testimony_fragments`, `evidence`, etc.) and Row Level Security (RLS) policies to keep user data strictly isolated.

Make sure to create an `evidence` Storage Bucket in Supabase.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the platform. 

---

## 🔒 Security & Privacy Notice

**JusticeFlow** operates on the principle of extreme anonymity and data isolation:
- No telemetry or external tracking scripts are loaded on the main dashboard.
- Users can operate in entirely **Anonymous Sessions**, which isolate their data strictly via Supabase RLS tracking.
- Testimonies and uploaded Evidence are intrinsically protected by Supabase security policies locking access only to the uniquely generated `session_id`.

*JusticeFlow provides technological assistance but does not legally represent users and does not replace official legal counsel.*
