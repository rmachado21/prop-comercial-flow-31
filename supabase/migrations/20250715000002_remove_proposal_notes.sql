-- Remove notes column from proposals table
ALTER TABLE public.proposals DROP COLUMN IF EXISTS notes;