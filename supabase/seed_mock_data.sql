-- ==========================================
-- Supabase Seed: seed_mock_data.sql
-- Populate Case Compass with 50+ mock entries per module
-- ==========================================

-- 1. Seed Offices (10)
INSERT INTO public.offices (id, name, location, address, phone, staff_count, active_cases_count, monthly_revenue, status)
SELECT 
  gen_random_uuid(),
  'Office ' || i,
  (ARRAY['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata'])[floor(random() * 7 + 1)],
  i || ' Main St, Business District',
  '+91 ' || floor(random() * 9000000000 + 1000000000)::text,
  floor(random() * 50 + 5),
  floor(random() * 150 + 10),
  floor(random() * 10000000 + 500000),
  'Active'
FROM generate_series(1, 10) s(i)
ON CONFLICT DO NOTHING;

-- 2. Seed Clients (50)
INSERT INTO public.clients (id, name, email, phone, type, status, health_score, total_billed, outstanding_amount)
SELECT 
  gen_random_uuid(),
  'Client ' || i,
  'client' || i || '@example.com',
  '+91 ' || floor(random() * 9000000000 + 1000000000)::text,
  (ARRAY['Individual', 'Corporate', 'Association'])[floor(random() * 3 + 1)],
  'Active',
  floor(random() * 40 + 60),
  floor(random() * 500000),
  floor(random() * 100000)
FROM generate_series(1, 50) s(i)
ON CONFLICT DO NOTHING;

-- Note: Profiles depend on auth.users. 
-- We'll assume at least one profile exists for foreign key constraints.
-- If no profiles exist, the following inserts will fail.
-- You can create a profile in the Supabase Dashboard first.

-- 3. Seed Cases (50)
INSERT INTO public.cases (id, title, type, status, court, case_number, filing_date, client_id, tags, health_score)
SELECT 
  gen_random_uuid(),
  'Case: ' || (ARRAY['Property Dispute', 'Contract Breach', 'Marriage Annulment', 'Criminal Defense', 'Tax Appeal', 'IP Infringement'])[floor(random() * 6 + 1)] || ' ' || i,
  (ARRAY['Civil', 'Criminal', 'Corporate', 'Family', 'Tax', 'Intellectual Property'])[floor(random() * 6 + 1)],
  (ARRAY['Ongoing', 'Filed', 'In Review', 'Stayed', 'Closed'])[floor(random() * 5 + 1)],
  (ARRAY['High Court', 'District Court', 'Supreme Court', 'Consumer Forum'])[floor(random() * 4 + 1)],
  'CN/' || (2020 + floor(random() * 6)) || '/' || floor(random() * 1000),
  CURRENT_DATE - (floor(random() * 365) || ' days')::interval,
  (SELECT id FROM public.clients ORDER BY random() LIMIT 1),
  ARRAY[(ARRAY['High Priority', 'Pro Bono', 'Complex', 'Litigation'])[floor(random() * 4 + 1)]],
  floor(random() * 50 + 50)
FROM generate_series(1, 50) s(i)
ON CONFLICT DO NOTHING;

-- 4. Seed Time Entries (100)
INSERT INTO public.time_entries (id, case_id, client_id, user_id, date, duration_minutes, rate_per_hour, description, billable, billed)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM public.cases ORDER BY random() LIMIT 1),
  (SELECT id FROM public.clients ORDER BY random() LIMIT 1),
  (SELECT id FROM public.profiles ORDER BY random() LIMIT 1),
  CURRENT_TIMESTAMP - (floor(random() * 60) || ' days')::interval,
  floor(random() * 240 + 15),
  (ARRAY[1500, 2000, 3500, 5000, 7500])[floor(random() * 5 + 1)],
  'Work on entry ' || i || ': ' || (ARRAY['Research', 'Drafting', 'Client Meeting', 'Court Appearance', 'Reviewing Evidence'])[floor(random() * 5 + 1)],
  true,
  (random() > 0.5)
FROM generate_series(1, 100) s(i)
ON CONFLICT DO NOTHING;

-- 5. Seed Invoices (50)
INSERT INTO public.billing_invoices (id, client_id, case_id, amount, tax, total, issued_date, due_date, status, items)
SELECT 
  'INV-' || (2025 + floor(random() * 2)) || '-' || floor(random() * 10000)::text,
  (SELECT id FROM public.clients ORDER BY random() LIMIT 1),
  (SELECT id FROM public.cases ORDER BY random() LIMIT 1),
  10000 + floor(random() * 50000),
  1800 + floor(random() * 9000),
  11800 + floor(random() * 59000),
  CURRENT_DATE - (floor(random() * 30) || ' days')::interval,
  CURRENT_DATE + (floor(random() * 30) || ' days')::interval,
  (ARRAY['Paid', 'Unpaid', 'Partial', 'Overdue'])[floor(random() * 4 + 1)],
  '[{"description": "Legal Consultation", "amount": 5000, "hours": 2, "rate": 2500}]'::jsonb
FROM generate_series(1, 50) s(i)
ON CONFLICT DO NOTHING;

-- 6. Seed Payments (50)
INSERT INTO public.billing_payments (id, invoice_id, amount, date, mode, reference_number)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM public.billing_invoices ORDER BY random() LIMIT 1),
  5000 + floor(random() * 10000),
  CURRENT_TIMESTAMP - (floor(random() * 15) || ' days')::interval,
  (ARRAY['UPI', 'Bank Transfer', 'Cash', 'Credit Card'])[floor(random() * 4 + 1)],
  'REF' || floor(random() * 1000000)
FROM generate_series(1, 50) s(i)
ON CONFLICT DO NOTHING;

-- 7. Seed Hearings / Court Calendar (50)
INSERT INTO public.hearings (id, case_id, title, date, court, status, stage)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM public.cases ORDER BY random() LIMIT 1),
  'Hearing on ' || (ARRAY['Interim Relief', 'Evidence', 'Final Arguments', 'Admission', 'Cross-examination'])[floor(random() * 5 + 1)],
  CURRENT_TIMESTAMP + (floor(random() * 30 - 15) || ' days')::interval,
  (ARRAY['Court Room 14', 'Court Room 2', 'Chamber 5', 'Virtual Court 3'])[floor(random() * 4 + 1)],
  (ARRAY['Upcoming', 'Completed', 'Adjourned', 'Cancelled'])[floor(random() * 4 + 1)],
  (ARRAY['Initial Hearing', 'Evidence Phase', 'Arguments', 'Judgment'])[floor(random() * 4 + 1)]
FROM generate_series(1, 50) s(i)
ON CONFLICT DO NOTHING;

-- 8. Seed Documents (50)
INSERT INTO public.documents (id, case_id, file_name, file_url, file_type, document_type, status, version_number)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM public.cases ORDER BY random() LIMIT 1),
  'Doc_' || i || '.pdf',
  'https://example.com/docs/doc_' || i || '.pdf',
  'application/pdf',
  (ARRAY['Pleading', 'Evidence', 'Affidavit', 'Judgment', 'Correspondence'])[floor(random() * 5 + 1)],
  'active',
  1
FROM generate_series(1, 50) s(i)
ON CONFLICT DO NOTHING;

-- 9. Seed Tasks (50)
INSERT INTO public.tasks (id, title, description, case_id, status, priority, due_date)
SELECT 
  gen_random_uuid(),
  'Task ' || i || ': ' || (ARRAY['Prepare Brief', 'File Application', 'Contact Client', 'Research Caselaw', 'Draft Reply'])[floor(random() * 5 + 1)],
  'Description for task ' || i,
  (SELECT id FROM public.cases ORDER BY random() LIMIT 1),
  (ARRAY['Pending', 'In Progress', 'Completed', 'Delayed'])[floor(random() * 4 + 1)],
  (ARRAY['Low', 'Medium', 'High', 'Critical'])[floor(random() * 4 + 1)],
  CURRENT_TIMESTAMP + (floor(random() * 20 - 10) || ' days')::interval
FROM generate_series(1, 50) s(i)
ON CONFLICT DO NOTHING;

-- 10. Seed Communications (50)
INSERT INTO public.communications (id, client_id, case_id, type, date, summary)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM public.clients ORDER BY random() LIMIT 1),
  (SELECT id FROM public.cases ORDER BY random() LIMIT 1),
  (ARRAY['Email', 'Call', 'Meeting', 'WhatsApp', 'Notice'])[floor(random() * 5 + 1)],
  CURRENT_TIMESTAMP - (floor(random() * 30) || ' days')::interval,
  'Summary of communication ' || i
FROM generate_series(1, 50) s(i)
ON CONFLICT DO NOTHING;

-- 11. Seed Notifications (50)
INSERT INTO public.notifications (id, user_id, title, message, type, read)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM public.profiles ORDER BY random() LIMIT 1),
  'Notification ' || i,
  'Detailed message for notification ' || i,
  (ARRAY['Info', 'Warning', 'Success', 'Urgent'])[floor(random() * 4 + 1)],
  (random() > 0.7)
FROM generate_series(1, 50) s(i)
ON CONFLICT DO NOTHING;

-- 12. Seed Contracts (50)
INSERT INTO public.contracts (id, title, type, status, party_a, party_b, value, start_date, expiry_date)
SELECT 
  gen_random_uuid(),
  'Contract: ' || (ARRAY['Service Agreement', 'Employment', 'Lease', 'NDA', 'Partnership'])[floor(random() * 5 + 1)] || ' ' || i,
  (ARRAY['Vendor', 'Customer', 'Internal', 'Lease'])[floor(random() * 4 + 1)],
  (ARRAY['Active', 'Draft', 'Expired', 'Terminated'])[floor(random() * 4 + 1)],
  'Firm A',
  'Client ' || i,
  50000 + floor(random() * 1000000),
  CURRENT_DATE - (floor(random() * 365) || ' days')::interval,
  CURRENT_DATE + (floor(random() * 365) || ' days')::interval
FROM generate_series(1, 50) s(i)
ON CONFLICT DO NOTHING;

-- 13. Seed Knowledge Base (50)
INSERT INTO public.knowledge_base (id, title, type, snippet, tags)
SELECT 
  gen_random_uuid(),
  'Legal Concept ' || i || ': ' || (ARRAY['Res Judicata', 'Habeas Corpus', 'Mens Rea', 'Force Majeure', 'Estoppel'])[floor(random() * 5 + 1)],
  (ARRAY['Judgment', 'Template', 'Act', 'Other'])[floor(random() * 4 + 1)],
  'Important legal snippet for entry ' || i,
  ARRAY[(ARRAY['Criminal', 'Civil', 'Constitutional', 'Commercial'])[floor(random() * 4 + 1)]]
FROM generate_series(1, 50) s(i)
ON CONFLICT DO NOTHING;

-- 14. Seed Audit Logs (100)
INSERT INTO public.audit_logs (id, user_id, user_name, action, resource, resource_type, status)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM public.profiles ORDER BY random() LIMIT 1),
  'System User',
  (ARRAY['Created', 'Updated', 'Deleted', 'Viewed', 'Exported'])[floor(random() * 5 + 1)],
  'Resource ' || floor(random() * 100),
  (ARRAY['Case', 'Client', 'Invoice', 'Document', 'Task'])[floor(random() * 5 + 1)],
  'Success'
FROM generate_series(1, 100) s(i)
ON CONFLICT DO NOTHING;

-- 15. Seed Reports (50)
INSERT INTO public.reports (id, title, type, file_url)
SELECT 
  gen_random_uuid(),
  'Report ' || i || ': ' || (ARRAY['Monthly Revenue', 'Annual Case Load', 'Client Acquisition', 'Tax Filings'])[floor(random() * 4 + 1)],
  (ARRAY['Case Summary', 'Revenue', 'Hearing History', 'Audit Log'])[floor(random() * 4 + 1)],
  'https://example.com/reports/rep_' || i || '.pdf'
FROM generate_series(1, 50) s(i)
ON CONFLICT DO NOTHING;

-- 16. Seed Scheduled Reports (10)
INSERT INTO public.scheduled_reports (id, title, report_type, frequency, status)
SELECT 
  gen_random_uuid(),
  'Scheduled ' || (ARRAY['Daily', 'Weekly', 'Monthly'])[floor(random() * 3 + 1)] || ' Recap',
  (ARRAY['Revenue', 'Case Summary', 'Audit Log'])[floor(random() * 3 + 1)],
  (ARRAY['Daily', 'Weekly', 'Monthly'])[floor(random() * 3 + 1)],
  'Active'
FROM generate_series(1, 10) s(i)
ON CONFLICT DO NOTHING;

-- 17. Integrations (Static for App Directory)
INSERT INTO public.integrations (provider, category, status, icon, description)
VALUES 
('Google Calendar', 'Scheduling', 'Connected', '📅', 'Sync your court dates and deadlines with Google Calendar.'),
('Dropbox', 'Storage', 'Connected', '📦', 'Attach case files directly from your Dropbox folders.'),
('Slack', 'Communication', 'Disconnected', '💬', 'Receive real-time notifications in your Slack channels.'),
('LawPay', 'Payments', 'Connected', '💳', 'Securely process client credit card and eCheck payments.'),
('Zoom', 'Meetings', 'Disconnected', '📹', 'Schedule and join virtual hearings and client meetings.');

-- 18. API Sync Logs
INSERT INTO public.api_sync_logs (provider, event, details, status, timestamp)
SELECT 
  (ARRAY['Google Calendar', 'Dropbox', 'LawPay'])[floor(random() * 3 + 1)],
  (ARRAY['Sync Started', 'Data Exported', 'Webhook Received', 'Authentication Refreshed'])[floor(random() * 4 + 1)],
  'Automated background process completed successfully.',
  'Success',
  NOW() - (interval '1 day' * random())
FROM generate_series(1, 20);

INSERT INTO public.api_sync_logs (provider, event, details, status, timestamp)
SELECT 
  (ARRAY['Slack', 'Zoom'])[floor(random() * 2 + 1)],
  'Sync Failed',
  'Invalid API credentials or network timeout.',
  'Failed',
  NOW() - (interval '12 hours' * random())
FROM generate_series(1, 5);

-- 19. Court Case Links
INSERT INTO public.court_case_links (case_id, cnr_number, court_name, court_type, sync_status, last_synced_at)
SELECT 
  id,
  'CNR-' || (100000 + floor(random() * 900000))::text,
  (ARRAY['Delhi High Court', 'Mumbai District Court', 'Bangalore Consumer Forum'])[floor(random() * 3 + 1)],
  (ARRAY['High Court', 'District Court', 'Forum'])[floor(random() * 3 + 1)],
  (ARRAY['Success', 'Failed', 'Pending'])[floor(random() * 3 + 1)],
  NOW() - (interval '2 days' * random())
FROM public.cases
LIMIT 20;

-- 20. Court Sync Logs
INSERT INTO public.court_sync_logs (cnr_number, status, message, updates_found)
SELECT 
  cnr_number,
  'Success',
  'Sync completed. New orders found.',
  floor(random() * 3)::integer
FROM public.court_case_links
WHERE sync_status = 'Success';

INSERT INTO public.court_sync_logs (cnr_number, status, message, updates_found)
SELECT 
  cnr_number,
  'Failed',
  'Captcha verification failed.',
  0
FROM public.court_case_links
WHERE sync_status = 'Failed';
