-- ==========================================
-- Supabase Seed: mock_data.sql
-- Populate Case Compass with sample data
-- ==========================================

-- 1. Seed Offices
INSERT INTO public.offices (id, name, location, address, phone, staff_count, active_cases_count, monthly_revenue, status)
VALUES 
  ('off_11111111-1111-1111-1111-111111111111', 'Delhi HQ', 'Delhi', 'Connaught Place, New Delhi, 110001', '+91 11 4455 6677', 45, 128, 8500000, 'Active'),
  ('off_22222222-2222-2222-2222-222222222222', 'Mumbai Branch', 'Mumbai', 'Nariman Point, Mumbai, 400021', '+91 22 2288 3344', 32, 94, 6200000, 'Active'),
  ('off_33333333-3333-3333-3333-333333333333', 'Bangalore Tech Hub', 'Bangalore', 'Indiranagar, Bangalore, 560038', '+91 80 6677 8899', 18, 52, 3800000, 'Active')
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Clients
INSERT INTO public.clients (id, name, email, phone, type, status, health_score)
VALUES 
  ('cli_11111111-1111-1111-1111-111111111111', 'Acme Corp', 'contact@acme.com', '+1234567890', 'Corporate', 'Active', 100),
  ('cli_22222222-2222-2222-2222-222222222222', 'John Doe', 'john@example.com', '+0987654321', 'Individual', 'Active', 85)
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Cases
INSERT INTO public.cases (id, title, type, status, court, case_number, filing_date, client_id, tags)
VALUES 
  ('cas_11111111-1111-1111-1111-111111111111', 'Acme vs Zenith - IP Dispute', 'Corporate', 'Ongoing', 'Delhi High Court', 'IP/2023/001', '2023-11-15', 'cli_11111111-1111-1111-1111-111111111111', ARRAY['Intellectual Property', 'High Priority']),
  ('cas_22222222-2222-2222-2222-222222222222', 'State vs John Doe - Traffic Violation', 'Criminal', 'Filed', 'District Court', 'TR/2024/45', '2024-01-20', 'cli_22222222-2222-2222-2222-222222222222', ARRAY['Traffic'])
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Knowledge Base
INSERT INTO public.knowledge_base (title, type, snippet, content, tags)
VALUES 
  ('Section 27: Indian Contract Act', 'Act', 'Agreement in restraint of trade, void.', 'Every agreement by which any one is restrained from exercising a lawful profession...', ARRAY['Contracts', 'Legal Acts']),
  ('Notice Template - Defaulting Party', 'Template', 'Formal legal notice for payment default.', 'Subject: Legal Notice for recovery of dues...', ARRAY['Litigation', 'Recovery'])
ON CONFLICT DO NOTHING;

-- Note: We are not seeding PROFILES or AUTH.USERS directly as they depend on the Auth provider.
-- Users should sign up or be created via the Supabase Auth Dashboard first.
