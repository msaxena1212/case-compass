-- Migration: Add tags to clients table
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
