// patch_cases_data.mjs — Update cases with proper titles, opponents, and fix profile name
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jepigwsdhxsmvwpaqryg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplcGlnd3NkaHhzbXZ3cGFxcnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MDIxMzgsImV4cCI6MjA4OTM3ODEzOH0.q-vL33g15KEwK6ZCXv5YSorohoczJr9qN4w5Qy5YmAc';
const supabase = createClient(supabaseUrl, supabaseKey);

// Indian legal case templates
const caseTemplates = [
  { title: 'Sharma vs. State of Maharashtra',     opponent: 'State of Maharashtra',       type: 'Criminal' },
  { title: 'TCS vs. Infosys — Patent Dispute',    opponent: 'Infosys Ltd.',               type: 'Corporate' },
  { title: 'Mehta vs. Mehta — Divorce Petition',   opponent: 'Sunita Mehta',               type: 'Family' },
  { title: 'Reliance Industries vs. SEBI',         opponent: 'Securities & Exchange Board', type: 'Corporate' },
  { title: 'Kapoor vs. DDA — Land Acquisition',    opponent: 'Delhi Development Authority', type: 'Civil' },
  { title: 'Nair Estate — Succession Dispute',     opponent: 'Ramesh Nair (Brother)',       type: 'Civil' },
  { title: 'Wipro vs. HCL — Trade Secret',         opponent: 'HCL Technologies',           type: 'Corporate' },
  { title: 'Patel vs. Municipal Corporation',       opponent: 'Ahmedabad Municipal Corp.',  type: 'Civil' },
  { title: 'Mahindra — Employee Misconduct',        opponent: 'Ravi Kumar (Ex-Employee)',    type: 'Criminal' },
  { title: 'Iyer vs. ICICI Bank — Loan Fraud',     opponent: 'ICICI Bank Ltd.',             type: 'Civil' },
  { title: 'Deshmukh vs. State of Karnataka',      opponent: 'State of Karnataka',          type: 'Criminal' },
  { title: 'Bajaj Auto vs. Hero — Design Patent',  opponent: 'Hero MotoCorp Ltd.',          type: 'Corporate' },
  { title: 'Gupta vs. Gupta — Custody Battle',     opponent: 'Prakash Gupta',               type: 'Family' },
  { title: 'Adani Group — Environmental Dispute',  opponent: 'National Green Tribunal',     type: 'Corporate' },
  { title: 'Verma vs. LIC — Insurance Claim',      opponent: 'Life Insurance Corporation',  type: 'Civil' },
  { title: 'HDFC vs. Borrower — Recovery Suit',    opponent: 'Sunil Malhotra',              type: 'Civil' },
  { title: 'Reddy vs. Apollo Hospital — Malpractice', opponent: 'Apollo Hospitals Ltd.',    type: 'Civil' },
  { title: 'Airtel vs. TRAI — Spectrum Dispute',   opponent: 'TRAI',                        type: 'Corporate' },
  { title: 'Kumar vs. State of UP — Anticipatory Bail', opponent: 'State of Uttar Pradesh', type: 'Criminal' },
  { title: 'Godrej vs. Tenant — Eviction Notice',  opponent: 'Manoj Saxena (Tenant)',       type: 'Civil' },
  { title: 'Bhatia vs. Builder — RERA Complaint',  opponent: 'Sunshine Realtors Pvt Ltd',   type: 'Civil' },
  { title: 'Sun Pharma vs. DPCO — Pricing Order',  opponent: 'Drug Pricing Authority',      type: 'Corporate' },
  { title: 'Malhotra vs. Malhotra — Alimony',      opponent: 'Ritu Malhotra',               type: 'Family' },
  { title: 'ITC vs. Cigarette Ban — Writ Petition', opponent: 'Union of India',             type: 'Corporate' },
  { title: 'Krishnan vs. Kerala State — RTI Appeal', opponent: 'State Information Commission', type: 'Civil' },
  { title: 'Birla Group — Merger Opposition',       opponent: 'Minority Shareholders Assoc.', type: 'Corporate' },
  { title: 'Saxena vs. Traffic Police — Challan',   opponent: 'Delhi Traffic Police',        type: 'Criminal' },
  { title: 'Tech Mahindra — Non-Compete Violation', opponent: 'Ashish Verma (Ex-CTO)',       type: 'Corporate' },
  { title: 'Chopra vs. Builder — Delayed Possession', opponent: 'DLF Universal Ltd.',       type: 'Civil' },
  { title: 'JSW Steel vs. Customs — Import Duty',  opponent: 'Customs Authority of India',   type: 'Corporate' },
  { title: 'Banerjee vs. Neighbour — Nuisance Suit', opponent: 'Ramanlal Joshi',            type: 'Civil' },
  { title: 'Cipla vs. Novartis — Generic Drug',    opponent: 'Novartis AG',                  type: 'Corporate' },
  { title: 'Agarwal vs. FIR Quashing — 482 CrPC',  opponent: 'State of Rajasthan',          type: 'Criminal' },
  { title: 'BEL — Defence Procurement Dispute',    opponent: 'Ministry of Defence',          type: 'Corporate' },
  { title: 'Dubey vs. Employer — Wrongful Termination', opponent: 'ABC Manufacturing Ltd.', type: 'Civil' },
  { title: 'UltraTech vs. Pollution Board — NOC',  opponent: 'State Pollution Control Board', type: 'Corporate' },
  { title: 'Pillai vs. Hospital — Medical Negligence', opponent: 'Fortis Healthcare Ltd.',   type: 'Civil' },
  { title: 'Hero vs. Dealer — Franchise Dispute',  opponent: 'Star Automobiles Pvt Ltd.',    type: 'Corporate' },
  { title: 'Mishra vs. State of Bihar — Bail',     opponent: 'State of Bihar',               type: 'Criminal' },
  { title: 'ICICI vs. Guarantor — Debt Recovery',  opponent: 'Ashok Enterprises',            type: 'Civil' },
  { title: 'Sinha vs. University — Admission Dispute', opponent: 'Delhi University',         type: 'Civil' },
  { title: "Dr. Reddy's vs. FDA Import Alert",     opponent: 'US FDA (Advisory)',             type: 'Corporate' },
  { title: 'Thakur vs. Thakur — Property Partition', opponent: 'Suresh Thakur (Elder Brother)', type: 'Civil' },
  { title: 'HUL vs. Competitor — Trademark Infringement', opponent: 'ABC Consumer Products', type: 'Corporate' },
  { title: 'Joshi vs. Insurance — Motor Accident Claim', opponent: 'United India Insurance', type: 'Civil' },
  { title: 'Tiwari vs. Police — Custodial Violence', opponent: 'State of Madhya Pradesh',   type: 'Criminal' },
  { title: 'Bharat Electronics — Contract Dispute', opponent: 'HAL (Hindustan Aeronautics)', type: 'Corporate' },
  { title: 'Rathore vs. SHO — Illegal Detention',  opponent: 'SHO Jaipur Central',           type: 'Criminal' },
  { title: 'Cement Corp vs. Tax Authority — GST',  opponent: 'Commissioner of GST',          type: 'Corporate' },
  { title: 'Nair vs. Co-op Society — Membership',  opponent: 'Green Valley Housing Society',  type: 'Civil' },
];

async function run() {
  const { error: authErr } = await supabase.auth.signInWithPassword({
    email: 'admin@casecompass.com',
    password: 'V3n92nCsQzOINM0h'
  });
  if (authErr) { console.error('Auth error:', authErr.message); process.exit(1); }
  console.log('✓ Authenticated');

  // 1. Update profile name
  const { error: profileErr } = await supabase
    .from('profiles')
    .update({ name: 'Adv. Vikram Saxena' })
    .eq('id', '6bf900f2-84a8-4f3a-9f89-7eebadf12596');
  
  if (profileErr) console.error('Profile update error:', profileErr.message);
  else console.log('✓ Updated lawyer profile name to "Adv. Vikram Saxena"');

  // 2. Fetch all cases
  const { data: cases, error: casesErr } = await supabase
    .from('cases')
    .select('id')
    .order('created_at', { ascending: true });

  if (casesErr) { console.error('Cases fetch error:', casesErr.message); process.exit(1); }
  console.log(`Found ${cases.length} cases`);

  const total = Math.min(cases.length, caseTemplates.length);
  let updated = 0;

  for (let i = 0; i < total; i++) {
    const caseId = cases[i].id;
    const tmpl = caseTemplates[i];

    const { error: updateErr } = await supabase
      .from('cases')
      .update({
        title: tmpl.title,
        opponent: tmpl.opponent,
        type: tmpl.type
      })
      .eq('id', caseId);

    if (updateErr) {
      console.error(`Error updating case ${caseId}:`, updateErr.message);
    } else {
      updated++;
      console.log(`✓ ${tmpl.title} | vs. ${tmpl.opponent}`);
    }
  }

  console.log(`\nDone! Updated ${updated}/${total} cases.`);
}

run();
