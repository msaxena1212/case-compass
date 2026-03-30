-- ==========================================
-- Supabase Migration: ensure_billing_schema
-- Fixes missing tables and RLS policies for billing
-- ==========================================

-- 1. Ensure profiles table exists (Base for many tables)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'Lawyer',
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Ensure billing_invoices table exists
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

-- 3. Ensure time_entries table exists
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

-- 4. Ensure billing_payments table exists
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

-- 5. Enable RLS and setup permissive policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_payments ENABLE ROW LEVEL SECURITY;

DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables 
             WHERE table_schema = 'public' 
             AND table_name IN ('profiles', 'billing_invoices', 'time_entries', 'billing_payments')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Auth manage %I" ON public.%I', t, t);
        EXECUTE format('CREATE POLICY "Auth manage %I" ON public.%I ALL USING (true)', t, t);
    END LOOP;
END $$;
