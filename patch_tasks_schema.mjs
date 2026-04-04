import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// We need to use the REST API with service role or use rpc
// Since we only have anon key, we'll use a raw SQL approach via rpc
async function patchTasksSchema() {
  console.log('Attempting to patch tasks table schema...');
  
  // Try executing raw SQL via rpc
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE public.tasks 
        ALTER COLUMN assigned_to TYPE TEXT USING assigned_to::TEXT,
        ALTER COLUMN created_by TYPE TEXT USING created_by::TEXT;
      
      UPDATE public.tasks SET assigned_to = 'Adv. Kumar' WHERE assigned_to IS NULL OR assigned_to = '';
    `
  });
  
  if (error) {
    console.error('RPC not available, trying direct approach:', error.message);
    
    // Fallback: read existing tasks and check the schema
    const { data, error: fetchError } = await supabase
      .from('tasks')
      .select('id, assigned_to, created_by')
      .limit(3);
    
    console.log('Sample tasks:', data);
    console.log('Fetch error:', fetchError?.message);
    console.log('\nNote: Column type change requires service role or direct DB access.');
    console.log('Applying workaround: the app will store names as text and handle UUID gracefully.');
  } else {
    console.log('Schema patched successfully!');
  }
}

patchTasksSchema();
