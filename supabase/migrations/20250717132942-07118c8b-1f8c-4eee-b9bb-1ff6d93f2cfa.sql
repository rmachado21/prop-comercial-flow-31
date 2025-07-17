-- First, let's check the structure and clean up carefully
-- Update comments to reference the newest token for each proposal
WITH newest_tokens AS (
  SELECT DISTINCT ON (proposal_id, purpose) 
    proposal_id, token, purpose
  FROM proposal_tokens 
  WHERE purpose = 'portal'
  ORDER BY proposal_id, purpose, created_at DESC
)
UPDATE proposal_client_comments 
SET token = newest_tokens.token
FROM newest_tokens 
WHERE proposal_client_comments.proposal_id = newest_tokens.proposal_id
  AND proposal_client_comments.token != newest_tokens.token;

-- Now safely delete duplicate tokens (keeping only the newest one per proposal)
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