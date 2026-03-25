-- ==========================================
-- Supabase Migration: 20240318_initial_schema
-- Core schema for Case Compass Legal OS
-- ==========================================

-- 1. Profiles (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Partner', 'Lawyer', 'Junior Associate', 'Client')),
  office_id UUID,
  department TEXT,
  status TEXT DEFAULT 'Active',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Offices
CREATE TABLE IF NOT EXISTS public.offices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  manager_id UUID REFERENCES public.profiles(id),
  staff_count INT DEFAULT 0,
  active_cases_count INT DEFAULT 0,
  monthly_revenue NUMERIC(15, 2) DEFAULT 0,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Clients
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  type TEXT NOT NULL CHECK (type IN ('Individual', 'Corporate', 'Association')),
  status TEXT DEFAULT 'Active',
  notes TEXT,
  avatar_url TEXT,
  health_score INT DEFAULT 100,
  total_billed NUMERIC(15, 2) DEFAULT 0,
  outstanding_amount NUMERIC(15, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Cases
CREATE TABLE IF NOT EXISTS public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  court TEXT NOT NULL,
  case_number TEXT,
  filing_date DATE,
  lawyer_id UUID REFERENCES public.profiles(id),
  client_id UUID REFERENCES public.clients(id),
  opponent JSONB, -- petitioner, respondent, opposingLawyer, judge
  tags TEXT[],
  health_score INT DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Documents
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  document_type TEXT,
  tags TEXT[],
  version_number INT DEFAULT 1,
  uploaded_by UUID REFERENCES public.profiles(id),
  size TEXT,
  status TEXT DEFAULT 'active',
  extracted_text TEXT,
  ai_summary TEXT,
  ai_keywords TEXT[],
  risk_clauses JSONB DEFAULT '[]',
  hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.profiles(id),
  created_by UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'Pending',
  priority TEXT DEFAULT 'Medium',
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  dependencies UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Billing: Invoices
CREATE TABLE IF NOT EXISTS public.billing_invoices (
  id TEXT PRIMARY KEY, -- e.g. INV-2026-001
  client_id UUID REFERENCES public.clients(id),
  case_id UUID REFERENCES public.cases(id),
  amount NUMERIC(15, 2) NOT NULL,
  tax NUMERIC(15, 2) DEFAULT 0,
  total NUMERIC(15, 2) NOT NULL,
  issued_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'Unpaid',
  items JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Billing: Payments
CREATE TABLE IF NOT EXISTS public.billing_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id TEXT REFERENCES public.billing_invoices(id),
  amount NUMERIC(15, 2) NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  mode TEXT NOT NULL,
  reference_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8.5 Billing: Time Entries
CREATE TABLE IF NOT EXISTS public.time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  date TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL,
  rate_per_hour NUMERIC(15, 2) DEFAULT 0,
  description TEXT,
  billable BOOLEAN DEFAULT TRUE,
  billed BOOLEAN DEFAULT FALSE,
  linked_invoice_id TEXT REFERENCES public.billing_invoices(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8.6 Hearings
CREATE TABLE IF NOT EXISTS public.hearings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  court TEXT NOT NULL,
  judge TEXT,
  stage TEXT,
  status TEXT DEFAULT 'Upcoming',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8.7 Communications
CREATE TABLE IF NOT EXISTS public.communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  summary TEXT NOT NULL,
  notes TEXT,
  logged_by UUID REFERENCES public.profiles(id),
  follow_up_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8.8 Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'Info',
  read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8.9 Knowledge Base
CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Judgment', 'Template', 'Act', 'Other')),
  snippet TEXT,
  content TEXT,
  tags TEXT[],
  ai_summary TEXT,
  url TEXT,
  views INT DEFAULT 0,
  date_added TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Contracts
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  party_a TEXT NOT NULL,
  party_b TEXT NOT NULL,
  case_id UUID REFERENCES public.cases(id),
  client_id UUID REFERENCES public.clients(id),
  risk_score INT DEFAULT 0,
  clauses JSONB DEFAULT '[]',
  approvals JSONB DEFAULT '[]',
  value NUMERIC(15, 2),
  start_date DATE,
  expiry_date DATE,
  signed_date DATE,
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  user_name TEXT,
  action TEXT NOT NULL,
  resource TEXT,
  resource_type TEXT,
  ip_address TEXT,
  status TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Reports
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Case Summary', 'Revenue', 'Hearing History', 'Audit Log')),
  filters JSONB DEFAULT '{}',
  generated_by UUID REFERENCES public.profiles(id),
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Scheduled Reports
CREATE TABLE IF NOT EXISTS public.scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id),
  report_type TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('Daily', 'Weekly', 'Monthly')),
  recipients TEXT[], -- Array of emails
  last_sent TIMESTAMPTZ,
  next_run TIMESTAMPTZ,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hearings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offices ENABLE ROW LEVEL SECURITY;

-- Sample Policy: Only authenticated users can read cases
CREATE POLICY "Authenticated users can read cases" ON public.cases
  FOR SELECT USING (auth.role() = 'authenticated');

-- Associate profiles with offices
ALTER TABLE public.profiles ADD CONSTRAINT fk_profiles_office FOREIGN KEY (office_id) REFERENCES public.offices(id);
