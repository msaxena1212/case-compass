// patch_case_notes_table.mjs — Create case_notes table in Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jepigwsdhxsmvwpaqryg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplcGlnd3NkaHhzbXZ3cGFxcnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MDIxMzgsImV4cCI6MjA4OTM3ODEzOH0.q-vL33g15KEwK6ZCXv5YSorohoczJr9qN4w5Qy5YmAc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Authenticate as admin
  const { error: authErr } = await supabase.auth.signInWithPassword({
    email: 'admin@casecompass.com',
    password: 'V3n92nCsQzOINM0h'
  });

  if (authErr) {
    console.error('Auth error:', authErr.message);
    process.exit(1);
  }
  console.log('✓ Authenticated as admin');

  // Use rpc to run raw SQL to create the table
  const { error } = await supabase.rpc('exec_sql', {
    query: `
      CREATE TABLE IF NOT EXISTS case_notes (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        case_id uuid REFERENCES cases(id) ON DELETE CASCADE,
        content text NOT NULL DEFAULT '',
        created_by uuid REFERENCES auth.users(id),
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );

      ALTER TABLE case_notes ENABLE ROW LEVEL SECURITY;

      CREATE POLICY "Users can manage their own notes" ON case_notes
        FOR ALL USING (auth.uid() IS NOT NULL);
    `
  });

  if (error) {
    // If exec_sql doesn't exist, try direct insert to test if table already exists
    console.log('RPC not available, trying direct table access...');
    
    const { error: testErr } = await supabase
      .from('case_notes')
      .select('id')
      .limit(1);

    if (testErr && testErr.message.includes('does not exist')) {
      console.error('\n⚠️  The case_notes table does not exist yet.');
      console.log('\nPlease run this SQL in Supabase Dashboard > SQL Editor:\n');
      console.log(`
CREATE TABLE IF NOT EXISTS case_notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id uuid REFERENCES cases(id) ON DELETE CASCADE,
  content text NOT NULL DEFAULT '',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE case_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notes" ON case_notes
  FOR ALL USING (auth.uid() IS NOT NULL);
      `);
    } else if (testErr) {
      console.error('Error:', testErr.message);
    } else {
      console.log('✓ case_notes table already exists!');
    }
  } else {
    console.log('✓ case_notes table created successfully!');
  }
}

run();
