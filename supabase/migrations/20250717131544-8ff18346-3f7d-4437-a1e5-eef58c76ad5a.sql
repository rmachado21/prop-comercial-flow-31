-- Fix database issues for contested proposals system (adjusted approach)

-- 1. Update proposals status constraint to include 'contested'
ALTER TABLE public.proposals 
DROP CONSTRAINT IF EXISTS proposals_status_check;

ALTER TABLE public.proposals 
ADD CONSTRAINT proposals_status_check 
CHECK (status IN ('draft', 'sent', 'approved', 'rejected', 'expired', 'nfe_issued', 'contested'));

-- 2. Add update tracking to proposals
ALTER TABLE public.proposals 
ADD COLUMN IF NOT EXISTS updated_after_comment boolean DEFAULT false;

-- 3. Allow NULL user_id for system-generated proposal changes
ALTER TABLE public.proposal_changes 
ALTER COLUMN user_id DROP NOT NULL;

-- 4. Add client notification tracking
CREATE TABLE IF NOT EXISTS public.proposal_client_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id uuid NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  notification_type text NOT NULL, -- 'updated', 'responded'
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  client_email text NOT NULL,
  status text NOT NULL DEFAULT 'sent' -- 'sent', 'delivered', 'failed'
);

-- Enable RLS on client notifications
ALTER TABLE public.proposal_client_notifications ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage notifications of their proposals
CREATE POLICY "Users can view notifications of their proposals" 
ON public.proposal_client_notifications 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.proposals 
  WHERE proposals.id = proposal_client_notifications.proposal_id 
  AND proposals.user_id = auth.uid()
));

CREATE POLICY "Users can create notifications for their proposals" 
ON public.proposal_client_notifications 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.proposals 
  WHERE proposals.id = proposal_client_notifications.proposal_id 
  AND proposals.user_id = auth.uid()
));

-- Policy for service role to manage notifications
CREATE POLICY "Service role can manage notifications" 
ON public.proposal_client_notifications 
FOR ALL 
USING (auth.role() = 'service_role');

-- 5. Update proposal_tokens to track if client has seen updates
ALTER TABLE public.proposal_tokens 
ADD COLUMN IF NOT EXISTS client_seen_update boolean DEFAULT false;