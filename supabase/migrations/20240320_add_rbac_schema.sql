-- RBAC SCHEMA FOR CASE COMPASS
-- Adds granular permissions for roles

CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL CHECK (role IN ('Admin', 'Partner', 'Lawyer', 'Junior Associate', 'Client')),
    module TEXT NOT NULL,
    actions TEXT[] NOT NULL, -- e.g. ['View', 'Edit', 'Delete', 'Export']
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role, module)
);

-- Seed initial permissions
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
('Admin', 'System', '{"View", "Edit", "Delete", "Export"}'),
('Client', 'Cases', '{"View"}'),
('Client', 'Documents', '{"View"}'),
('Client', 'Billing', '{"View"}')
ON CONFLICT (role, module) DO NOTHING;

-- Enable RLS
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read for all authenticated" ON public.role_permissions
    FOR SELECT USING (auth.role() = 'authenticated');
