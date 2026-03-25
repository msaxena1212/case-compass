-- ==========================================
-- Supabase Seed (FINAL FIX): 20240319_seed_50_mock_data
-- Resolves ambiguous column references
-- ==========================================

DO $$ 
DECLARE
    i INT;
    v_case_id UUID;
    v_client_id UUID;
    v_profile_id UUID;
    v_office_id UUID;
    v_invoice_id TEXT;
    user_record RECORD;
BEGIN
    -- 1. Ensure at least one office exists
    INSERT INTO public.offices (name, location, address, phone)
    VALUES ('Mumbai Headquarters', 'Nariman Point', '123 Marine Drive, Mumbai', '+91 22 1234 5678')
    ON CONFLICT DO NOTHING;
    
    SELECT id INTO v_office_id FROM public.offices LIMIT 1;

    -- 2. Sync Profiles with existing auth.users
    FOR user_record IN SELECT id, email FROM auth.users LOOP
        INSERT INTO public.profiles (id, name, email, role, office_id, status)
        VALUES (user_record.id, 'User ' || user_record.email, user_record.email, 'Admin', v_office_id, 'Active')
        ON CONFLICT (id) DO NOTHING;
    END LOOP;

    -- Get a valid profile_id to use
    SELECT id INTO v_profile_id FROM public.profiles LIMIT 1;

    IF v_profile_id IS NULL THEN
        RAISE EXCEPTION 'No users found in auth.users. Please sign up at least one user before seeding mock data.';
    END IF;

    -- 3. CLIENTS (50)
    FOR i IN 1..50 LOOP
        INSERT INTO public.clients (name, email, phone, type, status, health_score)
        VALUES (
            'Client ' || i, 
            'client' || i || '@example.com', 
            '+91 98' || LPAD(i::text, 8, '0'), 
            CASE WHEN i % 2 = 0 THEN 'Individual' ELSE 'Corporate' END,
            'Active',
            70 + (i % 30)
        ) ON CONFLICT DO NOTHING;
    END LOOP;

    -- 4. CASES (50)
    FOR i IN 1..50 LOOP
        SELECT id, client_id INTO v_case_id, v_client_id FROM public.cases OFFSET (i-1) LIMIT 1;
        -- If cases aren't seeded yet, get a client_id directly
        IF v_case_id IS NULL THEN
            SELECT id INTO v_client_id FROM public.clients OFFSET (i-1) LIMIT 1;
        END IF;

        INSERT INTO public.cases (title, type, status, court, case_number, lawyer_id, client_id, health_score, filing_date)
        VALUES (
            'Case vs ' || i || ' Corp',
            CASE WHEN i % 3 = 0 THEN 'Civil' WHEN i % 3 = 1 THEN 'Criminal' ELSE 'Corporate' END,
            CASE WHEN i % 4 = 0 THEN 'Open' WHEN i % 4 = 1 THEN 'Pending' WHEN i % 4 = 2 THEN 'Hearing' ELSE 'Closed' END,
            'Supreme Court of India',
            'SC/' || (2020 + (i % 6)) || '/' || LPAD(i::text, 5, '0'),
            v_profile_id,
            v_client_id,
            60 + (i % 40),
            CURRENT_DATE - (i * interval '5 days')
        ) ON CONFLICT DO NOTHING;
    END LOOP;

    -- 5. HEARINGS (50)
    FOR i IN 1..50 LOOP
        SELECT id INTO v_case_id FROM public.cases OFFSET (i-1) LIMIT 1;
        INSERT INTO public.hearings (case_id, title, date, court, judge, stage, status)
        VALUES (
            v_case_id,
            'Advocate Arguments - Stage ' || (i % 5),
            CURRENT_TIMESTAMP + (i * interval '1 day'),
            'High Court Room ' || (i % 20),
            'Hon''ble Justice ' || i,
            'Final Hearing',
            'Upcoming'
        ) ON CONFLICT DO NOTHING;
    END LOOP;

    -- 6. DOCUMENTS (50)
    FOR i IN 1..50 LOOP
        SELECT id INTO v_case_id FROM public.cases OFFSET (i-1) LIMIT 1;
        INSERT INTO public.documents (case_id, file_name, file_url, file_type, document_type, status, version_number)
        VALUES (
            v_case_id,
            'Evidence_Package_' || i || '.pdf',
            'https://storage.example.com/docs/' || i,
            'pdf',
            'Evidence',
            'active',
            1
        ) ON CONFLICT DO NOTHING;
    END LOOP;

    -- 7. TASKS (50)
    FOR i IN 1..50 LOOP
        SELECT id INTO v_case_id FROM public.cases OFFSET (i-1) LIMIT 1;
        INSERT INTO public.tasks (title, description, case_id, assigned_to, status, priority, due_date)
        VALUES (
            'Draft Submission for Case ' || i,
            'Please review the attached evidence and draft the final submission.',
            v_case_id,
            v_profile_id,
            'Pending',
            CASE WHEN i % 3 = 0 THEN 'High' WHEN i % 3 = 1 THEN 'Medium' ELSE 'Low' END,
            CURRENT_TIMESTAMP + (i * interval '2 days')
        ) ON CONFLICT DO NOTHING;
    END LOOP;

    -- 8. BILLING: Invoices (50)
    FOR i IN 1..50 LOOP
        SELECT id, client_id INTO v_case_id, v_client_id FROM public.cases OFFSET (i-1) LIMIT 1;
        v_invoice_id := 'INV-2026-' || LPAD(i::text, 3, '0');
        INSERT INTO public.billing_invoices (id, client_id, case_id, amount, tax, total, issued_date, due_date, status)
        VALUES (
            v_invoice_id,
            v_client_id,
            v_case_id,
            1000 + (i * 100),
            180 + (i * 18),
            1180 + (i * 118),
            CURRENT_DATE - (i * interval '1 day'),
            CURRENT_DATE + (i * interval '20 days'),
            CASE WHEN i % 2 = 0 THEN 'Paid' ELSE 'Unpaid' END
        ) ON CONFLICT DO NOTHING;
    END LOOP;

    -- 9. TIME ENTRIES (50)
    FOR i IN 1..50 LOOP
        SELECT id, client_id INTO v_case_id, v_client_id FROM public.cases OFFSET (i-1) LIMIT 1;
        INSERT INTO public.time_entries (case_id, client_id, user_id, date, duration_minutes, rate_per_hour, description, billable, billed)
        VALUES (
            v_case_id,
            v_client_id,
            v_profile_id,
            CURRENT_TIMESTAMP - (i * interval '10 hours'),
            60 + (i * 15),
            250,
            'Legal consultation and document review for Case ' || i,
            TRUE,
            CASE WHEN i % 2 = 0 THEN TRUE ELSE FALSE END
        ) ON CONFLICT DO NOTHING;
    END LOOP;

    -- 10. NOTIFICATIONS (50)
    FOR i IN 1..50 LOOP
        INSERT INTO public.notifications (user_id, title, message, type, read)
        VALUES (
            v_profile_id,
            'Update on Case ' || i,
            'The court has scheduled a new hearing for your case.',
            CASE WHEN i % 3 = 0 THEN 'Alert' WHEN i % 3 = 1 THEN 'Success' ELSE 'Info' END,
            FALSE
        );
    END LOOP;

    -- 11. CONTRACTS (50)
    FOR i IN 1..50 LOOP
        SELECT id, client_id INTO v_case_id, v_client_id FROM public.cases OFFSET (i-1) LIMIT 1;
        INSERT INTO public.contracts (title, type, status, party_a, party_b, case_id, client_id, risk_score, value)
        VALUES (
            'Service Agreement ' || i,
            'Retainer',
            'Active',
            'Case Compass Law',
            'Client ' || i,
            v_case_id,
            v_client_id,
            10 + (i % 40),
            50000 + (i * 1000)
        ) ON CONFLICT DO NOTHING;
    END LOOP;

    -- 12. KNOWLEDGE BASE (50)
    FOR i IN 1..50 LOOP
        INSERT INTO public.knowledge_base (title, type, snippet, content, tags)
        VALUES (
            'Landmark Judgment ' || i,
            CASE WHEN i % 2 = 0 THEN 'Judgment' ELSE 'Act' END,
            'Summary of the legal implications regarding case ' || i,
            'Full text analysis of the historical background and the final verdict.',
            ARRAY['Constitutional', 'Precedent', '2026']
        ) ON CONFLICT DO NOTHING;
    END LOOP;

    -- 13. COURT TRACKER: Case Links (50)
    FOR i IN 1..50 LOOP
        SELECT id INTO v_case_id FROM public.cases OFFSET (i-1) LIMIT 1;
        INSERT INTO public.court_case_links (case_id, court_type, court_name, cnr_number, sync_status)
        VALUES (
            v_case_id,
            'High Court',
            'Bombay High Court',
            'MHCB' || LPAD(i::text, 8, '0'),
            'Success'
        ) ON CONFLICT DO NOTHING;
    END LOOP;

    -- 14. AUDIT LOGS (50)
    FOR i IN 1..50 LOOP
        INSERT INTO public.audit_logs (user_id, user_name, action, resource, resource_type, status)
        VALUES (
            v_profile_id,
            'Admin User',
            'VIEW',
            'CASE-' || i,
            'Case',
            'Success'
        ) ON CONFLICT DO NOTHING;
    END LOOP;

END $$;
