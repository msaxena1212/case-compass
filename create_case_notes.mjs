// create_case_notes.mjs — Create the case_notes table via Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jepigwsdhxsmvwpaqryg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplcGlnd3NkaHhzbXZ3cGFxcnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MDIxMzgsImV4cCI6MjA4OTM3ODEzOH0.q-vL33g15KEwK6ZCXv5YSorohoczJr9qN4w5Qy5YmAc';

async function run() {
  // Try direct SQL via the management API
  const sql = `
    CREATE TABLE IF NOT EXISTS public.case_notes (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE,
      content text NOT NULL DEFAULT '',
      created_by uuid,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
    ALTER TABLE public.case_notes ENABLE ROW LEVEL SECURITY;
  `;

  const policySQL = `
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'case_notes' AND policyname = 'Users can manage notes'
      ) THEN
        CREATE POLICY "Users can manage notes" ON public.case_notes
          FOR ALL USING (auth.uid() IS NOT NULL);
      END IF;
    END $$;
  `;

  // Try via Supabase Management API (requires service_role key or dashboard)
  // Since we only have anon key, try the rpc approach
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Authenticate first
  const { error: authErr } = await supabase.auth.signInWithPassword({
    email: 'admin@casecompass.com',
    password: 'V3n92nCsQzOINM0h'
  });
  if (authErr) {
    console.error('Auth error:', authErr.message);
    process.exit(1);
  }
  console.log('✓ Authenticated');

  // Try direct fetch to the SQL endpoint
  const session = (await supabase.auth.getSession()).data.session;
  
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ query: sql })
  });

  if (!response.ok) {
    console.log('Direct SQL RPC not available (expected for hosted Supabase)');
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║  MANUAL STEP REQUIRED                                       ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log('║                                                              ║');
    console.log('║  Please go to your Supabase Dashboard:                       ║');
    console.log('║  https://supabase.com/dashboard/project/jepigwsdhxsmvwpaqryg ║');
    console.log('║                                                              ║');
    console.log('║  Go to: SQL Editor → New Query → Paste & Run:                ║');
    console.log('║                                                              ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(sql);
    console.log(policySQL);
  } else {
    const result = await response.text();
    console.log('✓ Table created:', result);
  }
}

run();
