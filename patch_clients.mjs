// patch_clients.mjs — Update Supabase client records with Indian names, emails, and phones
// Authenticates as the admin user to bypass RLS
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jepigwsdhxsmvwpaqryg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplcGlnd3NkaHhzbXZ3cGFxcnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MDIxMzgsImV4cCI6MjA4OTM3ODEzOH0.q-vL33g15KEwK6ZCXv5YSorohoczJr9qN4w5Qy5YmAc';
const supabase = createClient(supabaseUrl, supabaseKey);

const indianClients = [
  { name: 'Rajesh Sharma',       type: 'Individual', email: 'rajesh.sharma@gmail.com',           phone: '+91 98100 45231' },
  { name: 'Priya Mehta',         type: 'Individual', email: 'priya.mehta@outlook.com',            phone: '+91 98765 43210' },
  { name: 'Tata Consultancy Services', type: 'Corporate', email: 'legal@tcs.com',                phone: '+91 22 6778 9000' },
  { name: 'Ananya Iyer',         type: 'Individual', email: 'ananya.iyer@yahoo.co.in',            phone: '+91 94440 12345' },
  { name: 'Reliance Industries', type: 'Corporate', email: 'corporate.legal@ril.com',             phone: '+91 22 3555 5000' },
  { name: 'Vikram Singh Rathore',type: 'Individual', email: 'vikram.rathore@hotmail.com',          phone: '+91 98290 67890' },
  { name: 'Infosys Ltd.',        type: 'Corporate', email: 'legal.team@infosys.com',              phone: '+91 80 2852 0261' },
  { name: 'Sunita Deshmukh',     type: 'Individual', email: 'sunita.deshmukh@gmail.com',          phone: '+91 98220 55678' },
  { name: 'Mahindra & Mahindra', type: 'Corporate', email: 'compliance@mahindra.com',             phone: '+91 22 2490 1441' },
  { name: 'Arjun Kapoor',        type: 'Individual', email: 'arjun.kapoor@gmail.com',             phone: '+91 98110 23456' },
  { name: 'Deepika Nair',        type: 'Individual', email: 'deepika.nair@gmail.com',             phone: '+91 94970 34567' },
  { name: 'Wipro Technologies',  type: 'Corporate', email: 'legal@wipro.com',                     phone: '+91 80 2844 0011' },
  { name: 'Amit Patel',          type: 'Individual', email: 'amit.patel@rediffmail.com',           phone: '+91 97260 78901' },
  { name: 'Larsen & Toubro',     type: 'Corporate', email: 'corporate.affairs@larsentoubro.com',   phone: '+91 22 6752 5656' },
  { name: 'Kavita Joshi',        type: 'Individual', email: 'kavita.joshi@outlook.com',            phone: '+91 98710 23456' },
  { name: 'HCL Technologies',    type: 'Corporate', email: 'legal@hcltech.com',                   phone: '+91 120 438 2000' },
  { name: 'Manoj Tiwari',        type: 'Individual', email: 'manoj.tiwari@gmail.com',              phone: '+91 95550 67890' },
  { name: 'Adani Group',         type: 'Corporate', email: 'legal.affairs@adani.com',              phone: '+91 79 2555 5555' },
  { name: 'Neha Gupta',          type: 'Individual', email: 'neha.gupta@yahoo.com',                phone: '+91 98180 12345' },
  { name: 'Bajaj Auto Ltd.',     type: 'Corporate', email: 'secretarial@bajajauto.co.in',          phone: '+91 20 2721 5000' },
  { name: 'Rohit Verma',         type: 'Individual', email: 'rohit.verma@gmail.com',               phone: '+91 99100 45678' },
  { name: 'HDFC Bank',           type: 'Corporate', email: 'legal.dept@hdfcbank.com',              phone: '+91 22 3395 4600' },
  { name: 'Shalini Reddy',       type: 'Individual', email: 'shalini.reddy@gmail.com',             phone: '+91 99890 56789' },
  { name: 'Bharti Airtel',       type: 'Corporate', email: 'legal@airtel.com',                     phone: '+91 11 4666 6100' },
  { name: 'Suresh Kumar',        type: 'Individual', email: 'suresh.kumar@outlook.com',            phone: '+91 94140 78901' },
  { name: 'Godrej Industries',   type: 'Corporate', email: 'compliance@godrejinds.com',            phone: '+91 22 2518 8010' },
  { name: 'Pooja Bhatia',        type: 'Individual', email: 'pooja.bhatia@gmail.com',              phone: '+91 98310 89012' },
  { name: 'Sun Pharma',          type: 'Corporate', email: 'legal@sunpharma.com',                  phone: '+91 22 4324 4324' },
  { name: 'Karan Malhotra',      type: 'Individual', email: 'karan.malhotra@hotmail.com',          phone: '+91 98720 34567' },
  { name: 'ITC Limited',         type: 'Corporate', email: 'corporate.legal@itcportal.com',        phone: '+91 33 2288 9371' },
  { name: 'Meera Krishnan',      type: 'Individual', email: 'meera.krishnan@gmail.com',            phone: '+91 98410 45678' },
  { name: 'Aditya Birla Group',  type: 'Corporate', email: 'legal@adityabirla.com',                phone: '+91 22 6652 5000' },
  { name: 'Rahul Saxena',        type: 'Individual', email: 'rahul.saxena@gmail.com',              phone: '+91 99350 56789' },
  { name: 'Tech Mahindra',       type: 'Corporate', email: 'legal.team@techmahindra.com',          phone: '+91 20 6601 8100' },
  { name: 'Divya Chopra',        type: 'Individual', email: 'divya.chopra@outlook.com',            phone: '+91 98910 67890' },
  { name: 'JSW Steel',           type: 'Corporate', email: 'compliance@jsw.in',                    phone: '+91 22 4286 1000' },
  { name: 'Nikhil Banerjee',     type: 'Individual', email: 'nikhil.banerjee@gmail.com',           phone: '+91 98300 78901' },
  { name: 'Cipla Ltd.',          type: 'Corporate', email: 'legal@cipla.com',                      phone: '+91 22 2482 6000' },
  { name: 'Rekha Agarwal',       type: 'Individual', email: 'rekha.agarwal@yahoo.co.in',           phone: '+91 94150 89012' },
  { name: 'Bharat Electronics',  type: 'Corporate', email: 'company.secretary@bel.co.in',          phone: '+91 80 2503 9300' },
  { name: 'Manish Dubey',        type: 'Individual', email: 'manish.dubey@gmail.com',              phone: '+91 95800 90123' },
  { name: 'UltraTech Cement',    type: 'Corporate', email: 'legal@ultratechcement.com',            phone: '+91 22 6669 2727' },
  { name: 'Sneha Pillai',        type: 'Individual', email: 'sneha.pillai@gmail.com',              phone: '+91 97440 01234' },
  { name: 'Hero MotoCorp',       type: 'Corporate', email: 'secretarial@heromotocorp.com',         phone: '+91 11 2613 3001' },
  { name: 'Aakash Mishra',       type: 'Individual', email: 'aakash.mishra@hotmail.com',           phone: '+91 98390 12345' },
  { name: 'ICICI Bank',          type: 'Corporate', email: 'legal.group@icicibank.com',            phone: '+91 22 2653 1414' },
  { name: 'Ritu Sinha',          type: 'Individual', email: 'ritu.sinha@gmail.com',                phone: '+91 98610 23456' },
  { name: 'Dr. Reddy\'s Labs',   type: 'Corporate', email: 'legal@drreddys.com',                   phone: '+91 40 4900 2900' },
  { name: 'Sanjay Thakur',       type: 'Individual', email: 'sanjay.thakur@gmail.com',             phone: '+91 94180 34567' },
  { name: 'Hindustan Unilever',  type: 'Corporate', email: 'legal.affairs@hul.co.in',              phone: '+91 22 3983 0000' },
];

async function run() {
  // Authenticate as admin user to pass RLS
  const { error: authErr } = await supabase.auth.signInWithPassword({
    email: 'admin@casecompass.com',
    password: 'V3n92nCsQzOINM0h'
  });

  if (authErr) {
    console.error('Auth error:', authErr.message);
    process.exit(1);
  }
  console.log('✓ Authenticated as admin');

  // 1. Fetch all clients ordered by created_at (oldest first)
  const { data: clients, error } = await supabase
    .from('clients')
    .select('id')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching clients:', error.message);
    process.exit(1);
  }

  console.log(`Found ${clients.length} clients in database.`);
  console.log(`Have ${indianClients.length} Indian client templates.`);

  const total = Math.min(clients.length, indianClients.length);
  let updated = 0;

  for (let i = 0; i < total; i++) {
    const clientId = clients[i].id;
    const newData = indianClients[i];

    const { error: updateErr } = await supabase
      .from('clients')
      .update({
        name:  newData.name,
        email: newData.email,
        phone: newData.phone,
        type:  newData.type,
      })
      .eq('id', clientId);

    if (updateErr) {
      console.error(`Error updating client ${clientId}:`, updateErr.message);
    } else {
      updated++;
      console.log(`✓ Updated: ${newData.name} (${newData.type})`);
    }
  }

  console.log(`\nDone! Updated ${updated}/${total} clients.`);
}

run();
