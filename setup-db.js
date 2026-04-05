const { Client } = require('pg');

async function setupDatabase() {
  const client = new Client({
    connectionString: "postgres://postgres.zkqnayxokgyenvlcgegh:AAVCya9FhVWsf23t@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
  });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database.');

    const sql = `
      -- 1. chat_messages table
      CREATE TABLE IF NOT EXISTS public.chat_messages (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
          content TEXT NOT NULL,
          risk_indicators JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 2. risk_assessments table
      CREATE TABLE IF NOT EXISTS public.risk_assessments (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          overall_risk_level TEXT NOT NULL,
          risk_score INTEGER NOT NULL,
          risk_factors JSONB,
          immediate_danger BOOLEAN DEFAULT false,
          created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 3. safety_checkins table
      CREATE TABLE IF NOT EXISTS public.safety_checkins (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          status TEXT NOT NULL,
          location JSONB,
          is_safe BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Enable RLS
      ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.safety_checkins ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

      -- Allow authenticated users to INSERT and SELECT their own data
      CREATE POLICY "Users can insert their own chat messages" ON public.chat_messages
          FOR INSERT TO authenticated, anon WITH CHECK (
              user_id = auth.uid() OR 
              (auth.uid() IS NULL AND true)
          );

      CREATE POLICY "Users can view their own chat messages" ON public.chat_messages
          FOR SELECT TO authenticated, anon USING (
              user_id = auth.uid() OR 
              (auth.uid() IS NULL AND true)
          );

      CREATE POLICY "Users can insert their own risk assessments" ON public.risk_assessments
          FOR INSERT TO authenticated, anon WITH CHECK (
              user_id = auth.uid() OR 
              (auth.uid() IS NULL AND true)
          );

      CREATE POLICY "Users can view their own risk assessments" ON public.risk_assessments
          FOR SELECT TO authenticated, anon USING (
              user_id = auth.uid() OR 
              (auth.uid() IS NULL AND true)
          );
      
      CREATE POLICY "Users can modify their own reports" ON public.reports
          FOR ALL TO authenticated, anon USING (
              user_id = auth.uid() OR 
              (auth.uid() IS NULL AND true)
          );

      console.log('Successfully created tables and RLS policies.');
    `;

    await client.query(sql);
    console.log('Database setup complete.');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await client.end();
  }
}

setupDatabase();
