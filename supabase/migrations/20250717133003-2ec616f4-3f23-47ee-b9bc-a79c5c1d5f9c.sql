-- Add unique constraint to prevent future duplicate tokens for same proposal/purpose
CREATE UNIQUE INDEX idx_unique_proposal_portal_token 
ON proposal_tokens (proposal_id, purpose) 
WHERE purpose = 'portal';