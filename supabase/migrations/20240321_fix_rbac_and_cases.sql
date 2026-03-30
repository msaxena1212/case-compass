-- FIX RBAC AND CASES SCHEMA
-- 1. Ensure office_id exists in cases table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cases' AND column_name='office_id') THEN
        ALTER TABLE public.cases ADD COLUMN office_id UUID REFERENCES public.offices(id);
    END IF;
END $$;

-- 2. Ensure role_permissions table is seeded correctly
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

-- 3. Update existing cases with an office_id from their assigned lawyer (if any)
UPDATE public.cases c
SET office_id = p.office_id
FROM public.profiles p
WHERE c.lawyer_id = p.id AND c.office_id IS NULL;
