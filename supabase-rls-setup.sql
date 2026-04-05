-- ============================================================
-- SecureVoice Platform: RLS Policy Setup for ALL Tables
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================

-- 1. Enable RLS on ALL tables
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_recordings ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies (safe: IF EXISTS)
DROP POLICY IF EXISTS "Users can manage their own evidence" ON public.evidence;
DROP POLICY IF EXISTS "Users can manage their own timeline events" ON public.timeline_events;
DROP POLICY IF EXISTS "Users can manage their own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can manage their own chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can manage their own risk assessments" ON public.risk_assessments;
DROP POLICY IF EXISTS "Users can manage their own safety checkins" ON public.safety_checkins;
DROP POLICY IF EXISTS "Users can manage their own shared reports" ON public.shared_reports;
DROP POLICY IF EXISTS "Users can manage their own voice recordings" ON public.voice_recordings;

-- 3. Create ALL (select/insert/update/delete) policies for each table

-- EVIDENCE
CREATE POLICY "Users can manage their own evidence" ON public.evidence
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- TIMELINE_EVENTS
CREATE POLICY "Users can manage their own timeline events" ON public.timeline_events
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- REPORTS
CREATE POLICY "Users can manage their own reports" ON public.reports
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- CHAT_MESSAGES
CREATE POLICY "Users can manage their own chat messages" ON public.chat_messages
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RISK_ASSESSMENTS
CREATE POLICY "Users can manage their own risk assessments" ON public.risk_assessments
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- SAFETY_CHECKINS
CREATE POLICY "Users can manage their own safety checkins" ON public.safety_checkins
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- SHARED_REPORTS
CREATE POLICY "Users can manage their own shared reports" ON public.shared_reports
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- VOICE_RECORDINGS
CREATE POLICY "Users can manage their own voice recordings" ON public.voice_recordings
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- MISSING POLICIES ADDED FOR TESTIMONY & SESSION FIX
-- ============================================================

-- Enable RLS on newly found missing tables
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonies ENABLE ROW LEVEL SECURITY;

-- Drop just in case
DROP POLICY IF EXISTS "Users can manage their own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can manage their own testimonies" ON public.testimonies;

-- SESSIONS
CREATE POLICY "Users can manage their own sessions" ON public.sessions
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- TESTIMONIES (This fixes the vanishing chat history!)
CREATE POLICY "Users can manage their own testimonies" ON public.testimonies
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- EVIDENCE STORAGE STORAGE BUCKET FIX
-- ============================================================

-- Create a private storage bucket for evidence files
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence', 'evidence', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own files
CREATE POLICY "Authenticated users can upload evidence" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'evidence' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to read their own files
CREATE POLICY "Users can read their own evidence" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'evidence' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own evidence" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'evidence' AND auth.uid()::text = (storage.foldername(name))[1]);

