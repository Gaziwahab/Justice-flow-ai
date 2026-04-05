-- Secure Voice Database Schema
-- This creates all necessary tables for the trauma-informed testimony platform

-- ===========================================
-- PROFILES TABLE (extends auth.users)
-- ===========================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  anonymous_alias TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- ===========================================
-- SESSIONS TABLE (testimony sessions)
-- ===========================================
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Untitled Session',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'archived')),
  current_step INTEGER DEFAULT 1,
  emotional_state TEXT DEFAULT 'calm' CHECK (emotional_state IN ('calm', 'unsure', 'anxious', 'overwhelmed')),
  last_saved_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sessions_select_own" ON public.sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sessions_insert_own" ON public.sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sessions_update_own" ON public.sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "sessions_delete_own" ON public.sessions FOR DELETE USING (auth.uid() = user_id);

-- ===========================================
-- TESTIMONIES TABLE (main testimony data)
-- ===========================================
CREATE TABLE IF NOT EXISTS public.testimonies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Identity section
  identity_type TEXT DEFAULT 'anonymous' CHECK (identity_type IN ('anonymous', 'confidential', 'public')),
  preferred_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  
  -- Story section (fragments)
  story_fragments JSONB DEFAULT '[]'::jsonb,
  input_mode TEXT DEFAULT 'text' CHECK (input_mode IN ('text', 'voice')),
  
  -- Impact section
  physical_impact TEXT,
  emotional_impact TEXT,
  financial_impact TEXT,
  social_impact TEXT,
  
  -- Status
  is_complete BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.testimonies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "testimonies_select_own" ON public.testimonies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "testimonies_insert_own" ON public.testimonies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "testimonies_update_own" ON public.testimonies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "testimonies_delete_own" ON public.testimonies FOR DELETE USING (auth.uid() = user_id);

-- ===========================================
-- TIMELINE_EVENTS TABLE (AI-generated timeline)
-- ===========================================
CREATE TABLE IF NOT EXISTS public.timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE,
  event_time TIME,
  approximate_date TEXT,
  location TEXT,
  
  -- AI metadata
  confidence_level TEXT DEFAULT 'medium' CHECK (confidence_level IN ('high', 'medium', 'low')),
  source_fragment_ids JSONB DEFAULT '[]'::jsonb,
  is_ai_generated BOOLEAN DEFAULT false,
  is_user_verified BOOLEAN DEFAULT false,
  
  -- Ordering
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "timeline_events_select_own" ON public.timeline_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "timeline_events_insert_own" ON public.timeline_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "timeline_events_update_own" ON public.timeline_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "timeline_events_delete_own" ON public.timeline_events FOR DELETE USING (auth.uid() = user_id);

-- ===========================================
-- EVIDENCE TABLE (uploaded files/evidence)
-- ===========================================
CREATE TABLE IF NOT EXISTS public.evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timeline_event_id UUID REFERENCES public.timeline_events(id) ON DELETE SET NULL,
  
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT,
  storage_path TEXT,
  
  description TEXT,
  evidence_type TEXT CHECK (evidence_type IN ('document', 'image', 'video', 'audio', 'other')),
  
  -- Metadata
  is_encrypted BOOLEAN DEFAULT true,
  hash_checksum TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "evidence_select_own" ON public.evidence FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "evidence_insert_own" ON public.evidence FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "evidence_update_own" ON public.evidence FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "evidence_delete_own" ON public.evidence FOR DELETE USING (auth.uid() = user_id);

-- ===========================================
-- REPORTS TABLE (generated reports)
-- ===========================================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  report_type TEXT DEFAULT 'fir' CHECK (report_type IN ('fir', 'legal', 'summary', 'full')),
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  
  -- Generated report data
  generated_html TEXT,
  generated_pdf_url TEXT,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'finalized', 'submitted', 'archived')),
  finalized_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_select_own" ON public.reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "reports_insert_own" ON public.reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reports_update_own" ON public.reports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reports_delete_own" ON public.reports FOR DELETE USING (auth.uid() = user_id);

-- ===========================================
-- AUTO-CREATE PROFILE TRIGGER
-- ===========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, is_anonymous, anonymous_alias)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NULL),
    COALESCE((NEW.raw_user_meta_data ->> 'is_anonymous')::boolean, false),
    COALESCE(NEW.raw_user_meta_data ->> 'anonymous_alias', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ===========================================
-- UPDATED_AT TRIGGER FUNCTION
-- ===========================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers to all tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_sessions_updated_at ON public.sessions;
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_testimonies_updated_at ON public.testimonies;
CREATE TRIGGER update_testimonies_updated_at
  BEFORE UPDATE ON public.testimonies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_timeline_events_updated_at ON public.timeline_events;
CREATE TRIGGER update_timeline_events_updated_at
  BEFORE UPDATE ON public.timeline_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_evidence_updated_at ON public.evidence;
CREATE TRIGGER update_evidence_updated_at
  BEFORE UPDATE ON public.evidence
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_reports_updated_at ON public.reports;
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(status);
CREATE INDEX IF NOT EXISTS idx_testimonies_session_id ON public.testimonies(session_id);
CREATE INDEX IF NOT EXISTS idx_testimonies_user_id ON public.testimonies(user_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_session_id ON public.timeline_events(session_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_user_id ON public.timeline_events(user_id);
CREATE INDEX IF NOT EXISTS idx_evidence_session_id ON public.evidence(session_id);
CREATE INDEX IF NOT EXISTS idx_evidence_user_id ON public.evidence(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_session_id ON public.reports(session_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);
