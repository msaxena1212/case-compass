import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

console.log('Authenticating...');
const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email: 'admin@casecompass.com',
  password: 'V3n92nCsQzOINM0h'
});

if (authError) {
  console.error('Auth error:', authError.message);
  process.exit(1);
}

const { data: cases } = await supabase.from('cases').select('id, title');
const { data: tasks } = await supabase.from('tasks').select('id, title, case_id');

let updated = 0;
for (const task of tasks) {
  if (task.case_id) {
    const rCase = cases.find(c => c.id === task.case_id);
    if (rCase) {
      let newTitle = task.title;
      // Replace generic "Case X" from title with actual case title if it matches a pattern
      if (newTitle.match(/Case \d+/i)) {
        newTitle = newTitle.replace(/Case \d+/i, rCase.title);
      } else {
        // If it doesn't match Case X but it's linked, prepend/append if feeling like it
        // Or if it IS a mock title:
        newTitle = newTitle + ' (' + rCase.title + ')';
      }
      
      await supabase.from('tasks').update({ title: newTitle }).eq('id', task.id);
      updated++;
    }
  }
}
console.log(`Updated ${updated} tasks with real case names.`);
process.exit(0);
