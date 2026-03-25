-- ROBUST FIX FOR ALL MISSING TABLES
-- Run this in your Supabase SQL Editor

-- Create Tables (if they don't exist)
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
  linked_invoice_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  resolved BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  user_name TEXT,
  action TEXT NOT NULL,
  resource TEXT,
  resource_type TEXT,
  status TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for these tables
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hearings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Add Simple Policies
DO $$ 
DECLARE
    table_name_text text;
BEGIN
    FOR table_name_text IN SELECT unnest(ARRAY['time_entries', 'hearings', 'knowledge_base', 'security_events', 'audit_logs', 'contracts'])
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Enable read for all" ON public.%I', table_name_text);
        EXECUTE format('CREATE POLICY "Enable read for all" ON public.%I FOR SELECT USING (true)', table_name_text);
        
        EXECUTE format('DROP POLICY IF EXISTS "Enable insert for all" ON public.%I', table_name_text);
        EXECUTE format('CREATE POLICY "Enable insert for all" ON public.%I FOR INSERT WITH CHECK (true)', table_name_text);

        EXECUTE format('DROP POLICY IF EXISTS "Enable update for all" ON public.%I', table_name_text);
        EXECUTE format('CREATE POLICY "Enable update for all" ON public.%I FOR UPDATE USING (true)', table_name_text);
    END LOOP;
END $$;
