-- ULTIMATE MOCK SEED FOR CASE COMPASS
-- Populates all modules with realistic data
-- Handles new office_id column in cases table

DO $$ 
DECLARE
    i INT;
    v_case_id UUID;
    v_client_id UUID;
    v_profile_id UUID;
    v_office_id UUID;
    v_office_blr_id UUID;
    v_office_delhi_id UUID;
    v_invoice_id TEXT;
    user_record RECORD;
BEGIN
    -- 0. CLEANUP (Optional - comment out if you want to keep existing data)
    -- DELETE FROM public.notifications;
    -- DELETE FROM public.audit_logs;
    -- DELETE FROM public.billing_payments;
    -- DELETE FROM public.billing_invoices;
    -- DELETE FROM public.tasks;
    -- DELETE FROM public.documents;
    -- DELETE FROM public.hearings;
    -- DELETE FROM public.cases;
    -- DELETE FROM public.clients;

    -- 0.5 Ensure office_id exists in cases table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cases' AND column_name='office_id') THEN
        ALTER TABLE public.cases ADD COLUMN office_id UUID REFERENCES public.offices(id);
    END IF;

    -- 0.7 Allow mock profiles without auth.users (Drop strict FK for seeding)
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='profiles_id_fkey') THEN
        ALTER TABLE public.profiles DROP CONSTRAINT profiles_id_fkey;
    END IF;

    -- 1. OFFICES (Ensure Unique Constraint for ON CONFLICT)
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name='offices' AND constraint_type='UNIQUE') THEN
        ALTER TABLE public.offices ADD CONSTRAINT offices_name_key UNIQUE (name);
    END IF;

    -- 1.5 Ensure Read Policies for Mock Data
    DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.profiles;
    CREATE POLICY "Enable read access for all authenticated users" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
    
    DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.offices;
    CREATE POLICY "Enable read access for all authenticated users" ON public.offices FOR SELECT USING (auth.role() = 'authenticated');

    INSERT INTO public.offices (name, location, address, phone, status)
    VALUES 
    ('Mumbai HQ', 'Nariman Point', '123 Marine Drive, Mumbai', '+91 22 1111 2222', 'Active'),
    ('Bengaluru Branch', 'Indiranagar', '456 100ft Road, Bengaluru', '+91 80 3333 4444', 'Active'),
    ('Delhi Office', 'Connaught Place', '789 KG Marg, New Delhi', '+91 11 5555 6666', 'Active')
    ON CONFLICT (name) DO UPDATE SET status = 'Active';

    SELECT id INTO v_office_id FROM public.offices WHERE name = 'Mumbai HQ' LIMIT 1;
    SELECT id INTO v_office_blr_id FROM public.offices WHERE name = 'Bengaluru Branch' LIMIT 1;
    SELECT id INTO v_office_delhi_id FROM public.offices WHERE name = 'Delhi Office' LIMIT 1;

    -- 2. SYNC PROFILES & ADD MOCK LAWYERS (3 per branch)
    -- First, sync real auth users
    FOR user_record IN SELECT id, email FROM auth.users LOOP
        INSERT INTO public.profiles (id, name, email, role, office_id, status)
        VALUES (user_record.id, 'Senior Partner (' || user_record.email || ')', user_record.email, 'Admin', v_office_id, 'Active')
        ON CONFLICT (id) DO UPDATE SET role = 'Admin', office_id = v_office_id;
    END LOOP;

    -- Add 3 Mock Lawyers for Mumbai
    INSERT INTO public.profiles (id, name, email, role, office_id, status, department) VALUES
    (gen_random_uuid(), 'Adv. Vikram Sethi', 'vikram.mumbai@legaldesk.com', 'Partner', v_office_id, 'Active', 'Litigation'),
    (gen_random_uuid(), 'Adv. Anjali Rao', 'anjali.mumbai@legaldesk.com', 'Lawyer', v_office_id, 'Active', 'Corporate'),
    (gen_random_uuid(), 'Adv. Karan Mehra', 'karan.mumbai@legaldesk.com', 'Junior Associate', v_office_id, 'Active', 'Research')
    ON CONFLICT DO NOTHING;

    -- Add 3 Mock Lawyers for Bengaluru
    INSERT INTO public.profiles (id, name, email, role, office_id, status, department) VALUES
    (gen_random_uuid(), 'Adv. S. Ramaswamy', 's.ram@legaldesk.com', 'Partner', v_office_blr_id, 'Active', 'IP Law'),
    (gen_random_uuid(), 'Adv. Deepa Nair', 'deepa.blr@legaldesk.com', 'Lawyer', v_office_blr_id, 'Active', 'Real Estate'),
    (gen_random_uuid(), 'Adv. Arjun Reddy', 'arjun.blr@legaldesk.com', 'Junior Associate', v_office_blr_id, 'Active', 'Litigation')
    ON CONFLICT DO NOTHING;

    -- Add 3 Mock Lawyers for Delhi
    INSERT INTO public.profiles (id, name, email, role, office_id, status, department) VALUES
    (gen_random_uuid(), 'Adv. Hardeep Singh', 'hardeep.delhi@legaldesk.com', 'Partner', v_office_delhi_id, 'Active', 'Criminal'),
    (gen_random_uuid(), 'Adv. Meenakshi Iyer', 'meenakshi.delhi@legaldesk.com', 'Lawyer', v_office_delhi_id, 'Active', 'Constitutional'),
    (gen_random_uuid(), 'Adv. Rahul Verma', 'rahul.delhi@legaldesk.com', 'Junior Associate', v_office_delhi_id, 'Active', 'Family Law')
    ON CONFLICT DO NOTHING;

    SELECT id INTO v_profile_id FROM public.profiles WHERE email LIKE '%mumbai%' LIMIT 1;
    IF v_profile_id IS NULL THEN SELECT id INTO v_profile_id FROM public.profiles LIMIT 1; END IF;

    -- 2.5 Refresh Staff Counts in Offices
    UPDATE public.offices o
    SET staff_count = (SELECT count(*) FROM public.profiles p WHERE p.office_id = o.id);

    -- 3. CLIENTS (30)
    FOR i IN 1..30 LOOP
        INSERT INTO public.clients (name, email, phone, type, status, health_score, total_billed)
        VALUES (
            CASE WHEN i % 3 = 0 THEN 'Reliance Industries' WHEN i % 3 = 1 THEN 'Tata Motors' ELSE 'Client ' || i END, 
            'contact' || i || '@example.com', 
            '+91 9' || LPAD(i::text, 9, '0'), 
            CASE WHEN i % 2 = 0 THEN 'Individual' ELSE 'Corporate' END,
            'Active',
            60 + (i % 40),
            i * 5000
        ) ON CONFLICT DO NOTHING;
    END LOOP;

    -- 4. CASES (50)
    FOR i IN 1..50 LOOP
        -- Alternate between offices
        v_office_id := CASE WHEN i % 3 = 0 THEN v_office_id WHEN i % 3 = 1 THEN v_office_blr_id ELSE v_office_delhi_id END;
        
        -- Get a client
        SELECT id INTO v_client_id FROM public.clients OFFSET (i % 30) LIMIT 1;

        INSERT INTO public.cases (title, type, status, court, case_number, lawyer_id, client_id, office_id, health_score, filing_date)
        VALUES (
            CASE 
                WHEN i % 5 = 0 THEN 'Intellectual Property Dispute vs TechCorp'
                WHEN i % 5 = 1 THEN 'Shareholder Litigation - ' || i
                WHEN i % 5 = 2 THEN 'Property Title Clearance'
                WHEN i % 5 = 3 THEN 'Employment Arbitration'
                ELSE 'Commercial Contract Breach'
            END,
            CASE WHEN i % 3 = 0 THEN 'Civil' WHEN i % 3 = 1 THEN 'Criminal' ELSE 'Corporate' END,
            CASE WHEN i % 4 = 0 THEN 'Open' WHEN i % 4 = 1 THEN 'Pending' WHEN i % 4 = 2 THEN 'Hearing' ELSE 'Won' END,
            CASE WHEN i % 2 = 0 THEN 'Supreme Court of India' ELSE 'High Court of Bombay' END,
            'CAS/' || (2024 + (i % 3)) || '/' || LPAD(i::text, 4, '0'),
            v_profile_id,
            v_client_id,
            v_office_id,
            50 + (i % 50),
            CURRENT_DATE - (i * interval '3 days')
        ) ON CONFLICT DO NOTHING;
    END LOOP;

    -- 5. HEARINGS (Last 20 cases)
    FOR i IN 1..20 LOOP
        SELECT id INTO v_case_id FROM public.cases OFFSET (i-1) LIMIT 1;
        INSERT INTO public.hearings (case_id, title, date, court, judge, stage, status)
        VALUES (
            v_case_id,
            'Cross Examination of Witness',
            CURRENT_TIMESTAMP + (i * interval '2 days'),
            'Court Room ' || (i + 10),
            'Justice Malhotra',
            'Trial',
            'Upcoming'
        );
    END LOOP;

    -- 6. DOCUMENTS
    FOR i IN 1..40 LOOP
        SELECT id INTO v_case_id FROM public.cases OFFSET (i % 50) LIMIT 1;
        INSERT INTO public.documents (case_id, file_name, file_url, file_type, document_type, status)
        VALUES (
            v_case_id,
            'Legal_Brief_V' || i || '.docx',
            'https://storage.example.com/' || i,
            'docx',
            'Pleading',
            'active'
        );
    END LOOP;

    -- 7. BILLING: Invoices
    FOR i IN 1..25 LOOP
        SELECT id, client_id INTO v_case_id, v_client_id FROM public.cases OFFSET (i % 50) LIMIT 1;
        v_invoice_id := 'INV-2026-' || LPAD(i::text, 3, '0');
        INSERT INTO public.billing_invoices (id, client_id, case_id, amount, tax, total, issued_date, due_date, status)
        VALUES (
            v_invoice_id,
            v_client_id,
            v_case_id,
            5000 * i,
            900 * i,
            5900 * i,
            CURRENT_DATE - (i * interval '2 days'),
            CURRENT_DATE + (i * interval '15 days'),
            CASE WHEN i % 3 = 0 THEN 'Paid' WHEN i % 3 = 1 THEN 'Partial' ELSE 'Unpaid' END
        ) ON CONFLICT DO NOTHING;

        -- Add a payment for paid ones
        IF i % 3 = 0 THEN
            INSERT INTO public.billing_payments (invoice_id, amount, date, mode)
            VALUES (v_invoice_id, 5900 * i, CURRENT_TIMESTAMP, 'Bank Transfer');
        END IF;
    END LOOP;

    -- 8. PERMISSIONS (Ensuring RBAC table exists and is filled)
    CREATE TABLE IF NOT EXISTS public.role_permissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        role TEXT NOT NULL CHECK (role IN ('Admin', 'Partner', 'Lawyer', 'Junior Associate', 'Client')),
        module TEXT NOT NULL,
        actions TEXT[] NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(role, module)
    );

    DELETE FROM public.role_permissions;
    INSERT INTO public.role_permissions (role, module, actions) VALUES
    ('Partner', 'Cases', '{"View", "Edit", "Delete", "Export"}'),
    ('Partner', 'Documents', '{"View", "Edit", "Delete", "Export"}'),
    ('Partner', 'Billing', '{"View", "Edit", "Delete", "Export"}'),
    ('Partner', 'AI', '{"View", "Edit"}'),
    ('Lawyer', 'Cases', '{"View", "Edit"}'),
    ('Lawyer', 'Documents', '{"View", "Edit"}'),
    ('Lawyer', 'Billing', '{"View"}'),
    ('Lawyer', 'AI', '{"View", "Edit"}'),
    ('Junior Associate', 'Cases', '{"View"}'),
    ('Junior Associate', 'Documents', '{"View", "Edit"}'),
    ('Junior Associate', 'Billing', '{"View"}'),
    ('Admin', 'Cases', '{"View", "Edit", "Delete", "Export"}'),
    ('Admin', 'Documents', '{"View", "Edit", "Delete", "Export"}'),
    ('Admin', 'Billing', '{"View", "Edit", "Delete", "Export"}'),
    ('Admin', 'System', '{"View", "Edit", "Delete", "Export"}'),
    ('Admin', 'AI', '{"View", "Edit"}'),
    ('Client', 'Cases', '{"View"}'),
    ('Client', 'Documents', '{"View"}'),
    ('Client', 'Billing', '{"View"}')
    ON CONFLICT (role, module) DO NOTHING;

END $$;
