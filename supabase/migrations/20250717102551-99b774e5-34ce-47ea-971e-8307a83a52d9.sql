-- Add missing INSERT policy for proposal_tokens
CREATE POLICY "Users can create tokens for their own proposals" 
ON public.proposal_tokens 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.proposals 
    WHERE proposals.id = proposal_tokens.proposal_id 
    AND proposals.user_id = auth.uid()
  )
);