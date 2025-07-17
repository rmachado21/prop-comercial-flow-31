-- Cleanup duplicate tokens keeping only the most recent one per proposal
WITH ranked_tokens AS (
  SELECT id, proposal_id, token, created_at,
         ROW_NUMBER() OVER (PARTITION BY proposal_id, purpose ORDER BY created_at DESC) as rn
  FROM proposal_tokens
  WHERE purpose = 'portal'
)
DELETE FROM proposal_tokens
WHERE id IN (
  SELECT id FROM ranked_tokens WHERE rn > 1
);

-- Add unique constraint to prevent future duplicates
CREATE UNIQUE INDEX CONCURRENTLY idx_unique_proposal_portal_token 
ON proposal_tokens (proposal_id, purpose) 
WHERE purpose = 'portal';