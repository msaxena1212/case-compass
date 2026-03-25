-- COURT ORDERS SCHEMA
-- Stores automated updates from eCourts

CREATE TABLE IF NOT EXISTS public.court_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- e.g. 'Hearing Scheduled', 'Adjournment', 'Notice Issued'
    description TEXT NOT NULL,
    order_date DATE NOT NULL,
    next_hearing_date DATE,
    source_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.court_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read for all authenticated" ON public.court_orders
    FOR SELECT USING (auth.role() = 'authenticated');
