import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

console.log('Authenticating as admin to bypass RLS...');
const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email: 'admin@casecompass.com',
  password: 'V3n92nCsQzOINM0h'
});

if (authError) {
  console.error('Auth error:', authError.message);
  process.exit(1);
}
console.log('Authentication successful!');

const userId = '6bf900f2-84a8-4f3a-9f89-7eebadf12596';
console.log('Using user UUID:', userId);

const { data: clients } = await supabase.from('clients').select('id, name').limit(10);
const { data: cases }   = await supabase.from('cases').select('id, title').limit(10);
const clientMap = clients || [];
const caseMap   = cases   || [];
console.log(`Found ${clientMap.length} clients, ${caseMap.length} cases`);

const now = new Date();
const daysAgo  = (n) => new Date(now - n * 86400000).toISOString();
const hoursAgo = (n) => new Date(now - n * 3600000).toISOString();

// ── Clear old generic notifications ─────────────────────────────────────────
await supabase.from('notifications').delete().ilike('title', 'Update on Case%');
console.log('Old generic notifications cleared.');

// ── Seed Notifications (only real columns: user_id, title, message, type, read, link, created_at) ──
const notifications = [
  { user_id: userId, title: 'Urgent: Hearing Tomorrow',               type: 'Hearing',       read: false, link: '/calendar',  created_at: hoursAgo(2),  message: 'You have a hearing for "Sharma vs. State of Maharashtra" in Bombay High Court tomorrow at 10:30 AM. Prepare cross-examination notes.' },
  { user_id: userId, title: 'Invoice Overdue – Reliance Industries',  type: 'Billing',       read: false, link: '/billing',   created_at: hoursAgo(5),  message: 'Invoice INV-2026-018 for ₹75,000 is now 7 days overdue. A reminder has been sent to the client.' },
  { user_id: userId, title: 'New Task Assigned',                      type: 'Task',          read: false, link: '/tasks',    created_at: hoursAgo(8),  message: 'Research task "Precedents for Section 138 NI Act defence" has been assigned to you by Senior Partner.' },
  { user_id: userId, title: 'Client Communication Received',          type: 'Communication', read: true,  link: '/clients',  created_at: daysAgo(1),   message: 'New WhatsApp message from Rajesh Mehta regarding "Mahindra Employee Misconduct" case. He is requesting a hearing update.' },
  { user_id: userId, title: 'Hearing Adjourned – Kapoor Divorce',     type: 'Hearing',       read: true,  link: '/calendar', created_at: daysAgo(1),   message: 'Hearing scheduled for 03-Apr-2026 in Family Court, Pune has been adjourned to 15-Apr-2026. Update calendar.' },
  { user_id: userId, title: 'Document Uploaded for Review',           type: 'Task',          read: true,  link: '/documents',created_at: daysAgo(2),   message: 'Client Priya Verma uploaded "Title Deed – Andheri West" for the property dispute case. AI analysis pending.' },
  { user_id: userId, title: 'Payment Received – Tata Consultancy',   type: 'Billing',       read: true,  link: '/billing',  created_at: daysAgo(2),   message: 'Payment of ₹1,20,000 against Invoice INV-2026-010 received. March revenue target is now at 92%.' },
  { user_id: userId, title: 'Upcoming Court Deadline',                type: 'Hearing',       read: false, link: '/cases',   created_at: daysAgo(3),   message: 'Statutory filing deadline for "Union Bank vs. XYZ Corp" is in 3 days. Documents must be notarized and filed.' },
  { user_id: userId, title: 'New Case Referral',                      type: 'Communication', read: true,  link: '/cases',   created_at: daysAgo(4),   message: 'Advocate Joshi referred Mr. Aditya Rao for a corporate dispute involving fraudulent share transfer. Initial brief attached.' },
  { user_id: userId, title: 'Task Overdue – Draft Petition',          type: 'Task',          read: false, link: '/tasks',   created_at: daysAgo(4),   message: '"Draft bail petition for Sharma vs. State" was due 01-Apr-2026 and is incomplete. Escalated to Senior Partner.' },
  { user_id: userId, title: 'Court Order Received',                   type: 'Hearing',       read: true,  link: '/calendar',created_at: daysAgo(5),   message: 'Delhi High Court passed an interim stay order in favour of your client in the property dispute.' },
  { user_id: userId, title: 'Monthly Billing Report Ready',           type: 'Billing',       read: true,  link: '/billing', created_at: daysAgo(6),   message: 'March 2026: Billed ₹4,85,000 | Collected ₹3,20,000 | Outstanding ₹1,65,000. Review for partner meeting.' },
];

const { data: notifResult, error: ne } = await supabase.from('notifications').insert(notifications).select();
if (ne) console.error('Notification insert error:', ne.message);
else    console.log(`✅ Inserted ${notifResult.length} notifications.`);

// ── Seed Communication Logs (columns: client_id, case_id, type, date, summary, notes, logged_by) ──
// NOTE: 'type' in the communications table IS the mode of communication
const getC = (i) => clientMap[i % Math.max(clientMap.length, 1)]?.id || null;
const getK = (i) => caseMap  [i % Math.max(caseMap.length, 1)]  ?.id || null;

const commLogs = [
  { client_id: getC(0), case_id: getK(0), type: 'WhatsApp',  date: hoursAgo(3),  summary: 'Discussed upcoming hearing strategy and document requirements.',            notes: 'Client confirmed availability for pre-hearing meeting on Thursday.', logged_by: userId },
  { client_id: getC(1), case_id: getK(1), type: 'Email',     date: hoursAgo(6),  summary: 'Sent invoice INV-2026-018 with payment details and due date reminder.',     notes: 'Attached itemized billing breakdown. Client acknowledged receipt.', logged_by: userId },
  { client_id: getC(2), case_id: getK(2), type: 'Phone Call',date: daysAgo(1),   summary: 'Initial consultation – client explained property dispute background.',      notes: '45-min call. Advised to gather property documents and Panchayat records.', logged_by: userId },
  { client_id: getC(3), case_id: getK(3), type: 'WhatsApp',  date: daysAgo(1),   summary: 'Sent hearing reminder and court room details to client.',                    notes: 'Instructed to arrive 30 min early. Advised not to speak to opposing counsel.', logged_by: userId },
  { client_id: getC(4), case_id: getK(4), type: 'Email',     date: daysAgo(2),   summary: 'Forwarded court order copy and explained legal implications.',                notes: 'Translated key points into plain language. Advised compliance steps.', logged_by: userId },
  { client_id: getC(0), case_id: getK(5), type: 'SMS',        date: daysAgo(2),   summary: 'Sent SMS alert about upcoming filing deadline.',                             notes: 'Client needs to courier original documents by Thursday.', logged_by: userId },
  { client_id: getC(1), case_id: getK(6), type: 'In Person', date: daysAgo(3),   summary: 'Office meeting to review evidence documents and witness list.',               notes: '2-hour meeting. Reviewed 12 documents. Shortlisted 4 witnesses.', logged_by: userId },
  { client_id: getC(2), case_id: getK(7), type: 'Email',     date: daysAgo(3),   summary: 'Sent draft legal notice for client approval before dispatch.',                notes: 'Client requested minor change in demand amount. Revised and resent.', logged_by: userId },
  { client_id: getC(3), case_id: getK(8), type: 'WhatsApp',  date: daysAgo(4),   summary: 'Client shared additional evidence photos of disputed property.',              notes: '7 images received. Stored in case folder for review.', logged_by: userId },
  { client_id: getC(4), case_id: getK(9), type: 'Phone Call',date: daysAgo(5),   summary: 'Follow-up call after judgement to inform client of outcome.',                 notes: 'Client satisfied. Discussed appeal timeline. Follow-up in 2 weeks.', logged_by: userId },
  { client_id: getC(0), case_id: getK(0), type: 'Email',     date: daysAgo(6),   summary: 'Sent monthly case progress report for Q1 2026.',                             notes: 'Covered all 3 active cases. Included timeline projections and cost estimates.', logged_by: userId },
  { client_id: getC(1), case_id: getK(1), type: 'SMS',        date: daysAgo(7),   summary: 'Payment receipt confirmation sent to client.',                                notes: 'Auto-generated SMS after payment was marked as received in billing system.', logged_by: userId },
];

const { data: commResult, error: ce } = await supabase.from('communications').insert(commLogs).select();
if (ce) console.error('Communication insert error:', ce.message);
else    console.log(`✅ Inserted ${commResult.length} communication logs.`);

process.exit(0);
