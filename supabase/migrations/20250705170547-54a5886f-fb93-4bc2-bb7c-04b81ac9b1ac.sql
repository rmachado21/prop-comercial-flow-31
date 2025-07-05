-- Add 'nfe_issued' status to proposals
-- First, let's see the current check constraint on status
-- We need to update it to include the new status

-- Update the check constraint to include 'nfe_issued' status
ALTER TABLE public.proposals 
DROP CONSTRAINT IF EXISTS proposals_status_check;

ALTER TABLE public.proposals 
ADD CONSTRAINT proposals_status_check 
CHECK (status IN ('draft', 'sent', 'approved', 'rejected', 'expired', 'nfe_issued'));