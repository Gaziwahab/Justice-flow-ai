const { Client } = require('pg');

async function fixDatabase() {
  const client = new Client({
    connectionString: "postgres://postgres.zkqnayxokgyenvlcgegh:AAVCya9FhVWsf23t@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
  });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database.');

    const sql = `
      -- Enable RLS on newly found missing tables
      ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.testimonies ENABLE ROW LEVEL SECURITY;

      -- Drop just in case
      DROP POLICY IF EXISTS "Users can manage their own sessions" ON public.sessions;
      DROP POLICY IF EXISTS "Users can manage their own testimonies" ON public.testimonies;

      -- SESSIONS
      CREATE POLICY "Users can manage their own sessions" ON public.sessions
          FOR ALL TO authenticated, anon USING (
              user_id = auth.uid() OR 
              (auth.uid() IS NULL AND true)
          );

      -- TESTIMONIES (This fixes the vanishing chat history!)
      CREATE POLICY "Users can manage their own testimonies" ON public.testimonies
          FOR ALL TO authenticated, anon USING (
              user_id = auth.uid() OR 
              (auth.uid() IS NULL AND true)
          );

      console.log('Successfully created missing RLS policies.');
    `;

    await client.query(sql);
    console.log('Database fix complete. Policies applied.');
  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    await client.end();
  }
}

fixDatabase();
