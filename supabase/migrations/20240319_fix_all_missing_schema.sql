-- ==========================================
-- Supabase Migration: 20240319_fix_all_missing_schema
-- Consolidate all missing tables and policies
-- ==========================================

-- 1. Time Entries
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

-- 2. Hearings
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

-- 3. Integrations
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'Disconnected',
  last_sync TIMESTAMPTZ,
  icon TEXT,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. API Sync Logs
CREATE TABLE IF NOT EXISTS public.api_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES public.integrations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  event TEXT NOT NULL,
  status TEXT NOT NULL,
  details TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Court Case Links (for Court Tracker)
CREATE TABLE IF NOT EXISTS public.court_case_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  court_type TEXT NOT NULL,
  court_name TEXT NOT NULL,
  cnr_number TEXT NOT NULL UNIQUE,
  filing_year TEXT,
  state TEXT,
  district TEXT,
  last_synced_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'Pending',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Court Sync Logs
CREATE TABLE IF NOT EXISTS public.court_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  cnr_number TEXT NOT NULL,
  status TEXT NOT NULL,
  message TEXT,
  updates_found INT DEFAULT 0,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Notifications
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

-- 8. Communications
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

-- 9. Knowledge Base
CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  snippet TEXT,
  content TEXT,
  tags TEXT[],
  ai_summary TEXT,
  url TEXT,
  views INT DEFAULT 0,
  date_added TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Contracts
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

-- 11. Audit Logs
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

-- 12. Security Events
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  resolved BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Reports
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  filters JSONB DEFAULT '{}',
  generated_by UUID REFERENCES public.profiles(id),
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Scheduled Reports
CREATE TABLE IF NOT EXISTS public.scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id),
  report_type TEXT NOT NULL,
  frequency TEXT NOT NULL,
  recipients TEXT[],
  last_sent TIMESTAMPTZ,
  next_run TIMESTAMPTZ,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for all new tables
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hearings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.court_case_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.court_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;

-- Basic Read Policies for Authenticated Users
DO $$ 
DECLARE
  t text;
BEGIN
  FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Auth read %I" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "Auth read %I" ON public.%I FOR SELECT USING (auth.role() = ''authenticated'')', t, t);
    
    EXECUTE format('DROP POLICY IF EXISTS "Auth insert %I" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "Auth insert %I" ON public.%I FOR INSERT WITH CHECK (auth.role() = ''authenticated'')', t, t);
    
    EXECUTE format('DROP POLICY IF EXISTS "Auth update %I" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "Auth update %I" ON public.%I FOR UPDATE USING (auth.role() = ''authenticated'')', t, t);
  END LOOP;
END $$;
