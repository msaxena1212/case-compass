-- ==========================================
-- Supabase Migration: 20240318_fix_missing_billing_schema
-- Fixes missing tables and RLS policies for billing
-- ==========================================

-- 0. Profiles Table (Base for many tables)
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

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Authenticated users can read profiles') THEN
    CREATE POLICY "Authenticated users can read profiles" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- 1. Clients table
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

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Authenticated users can read clients') THEN
    CREATE POLICY "Authenticated users can read clients" ON public.clients FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- 1.5 Cases table
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
  opponent JSONB,
  tags TEXT[],
  health_score INT DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cases' AND policyname = 'Authenticated users can read cases') THEN
    CREATE POLICY "Authenticated users can read cases" ON public.cases FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- 2. Ensure billing_invoices table exists and has policies
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

ALTER TABLE public.billing_invoices ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  -- Read policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'billing_invoices' AND policyname = 'Authenticated users can read invoices') THEN
    CREATE POLICY "Authenticated users can read invoices" ON public.billing_invoices
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
  
  -- Insert policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'billing_invoices' AND policyname = 'Authenticated users can insert invoices') THEN
    CREATE POLICY "Authenticated users can insert invoices" ON public.billing_invoices
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;

  -- Update policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'billing_invoices' AND policyname = 'Authenticated users can update invoices') THEN
    CREATE POLICY "Authenticated users can update invoices" ON public.billing_invoices
      FOR UPDATE USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- 3. Ensure time_entries table exists and has policies
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

ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  -- Read policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'time_entries' AND policyname = 'Authenticated users can read time entries') THEN
    CREATE POLICY "Authenticated users can read time entries" ON public.time_entries
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;

  -- Update policy (Critical for marking as billed)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'time_entries' AND policyname = 'Authenticated users can update time entries') THEN
    CREATE POLICY "Authenticated users can update time entries" ON public.time_entries
      FOR UPDATE USING (auth.role() = 'authenticated');
  END IF;
  
  -- Insert policy (For logging time)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'time_entries' AND policyname = 'Authenticated users can insert time entries') THEN
    CREATE POLICY "Authenticated users can insert time entries" ON public.time_entries
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

-- 4. Ensure billing_payments table exists and has policies
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

ALTER TABLE public.billing_payments ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  -- Read policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'billing_payments' AND policyname = 'Authenticated users can read payments') THEN
    CREATE POLICY "Authenticated users can read payments" ON public.billing_payments
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;

  -- Insert policy
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'billing_payments' AND policyname = 'Authenticated users can insert payments') THEN
    CREATE POLICY "Authenticated users can insert payments" ON public.billing_payments
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

-- 5. Integrations Table
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Disconnected',
  icon TEXT,
  description TEXT,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'integrations' AND policyname = 'Authenticated users can read integrations') THEN
    CREATE POLICY "Authenticated users can read integrations" ON public.integrations FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'integrations' AND policyname = 'Authenticated users can update integrations') THEN
    CREATE POLICY "Authenticated users can update integrations" ON public.integrations FOR UPDATE USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- 6. API Sync Logs Table
CREATE TABLE IF NOT EXISTS public.api_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  event TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.api_sync_logs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'api_sync_logs' AND policyname = 'Authenticated users can read sync logs') THEN
    CREATE POLICY "Authenticated users can read sync logs" ON public.api_sync_logs FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'api_sync_logs' AND policyname = 'Authenticated users can insert sync logs') THEN
    CREATE POLICY "Authenticated users can insert sync logs" ON public.api_sync_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

-- 7. Court Case Links (Court Tracker)
CREATE TABLE IF NOT EXISTS public.court_case_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  cnr_number TEXT NOT NULL UNIQUE,
  court_name TEXT,
  court_type TEXT,
  sync_status TEXT DEFAULT 'Pending',
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.court_case_links ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'court_case_links' AND policyname = 'Authenticated users can read links') THEN
    CREATE POLICY "Authenticated users can read links" ON public.court_case_links FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'court_case_links' AND policyname = 'Authenticated users can manage links') THEN
    CREATE POLICY "Authenticated users can manage links" ON public.court_case_links ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- 9. Court Sync Logs
CREATE TABLE IF NOT EXISTS public.court_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cnr_number TEXT NOT NULL,
  status TEXT NOT NULL,
  message TEXT,
  updates_found INTEGER DEFAULT 0,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.court_sync_logs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'court_sync_logs' AND policyname = 'Authenticated users can read court logs') THEN
    CREATE POLICY "Authenticated users can read court logs" ON public.court_sync_logs FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- 10. Security Events
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
  message TEXT NOT NULL,
  ip_address TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'security_events' AND policyname = 'Authenticated users can read security events') THEN
    CREATE POLICY "Authenticated users can read security events" ON public.security_events FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'security_events' AND policyname = 'Authenticated users can update security events') THEN
    CREATE POLICY "Authenticated users can update security events" ON public.security_events FOR UPDATE USING (auth.role() = 'authenticated');
  END IF;
END $$;
