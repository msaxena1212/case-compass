-- ==========================================
-- Supabase Migration: 20240318_add_missing_tables
-- Adds tables required by frontend services
-- ==========================================

-- 1. Contacts Table
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Timeline Entries Table
CREATE TABLE IF NOT EXISTS public.timeline_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'Hearing', 'Filing', 'Communication', 'Task'
  date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'Completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_entries ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Enable read for authenticated users)
CREATE POLICY "Authenticated users can read contacts" ON public.contacts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read timeline" ON public.timeline_entries
  FOR SELECT USING (auth.role() = 'authenticated');

-- Ensure time_entries has a policy (Fix for 404/403)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'time_entries' AND policyname = 'Authenticated users can read time entries'
  ) THEN
    CREATE POLICY "Authenticated users can read time entries" ON public.time_entries
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
END $$;
