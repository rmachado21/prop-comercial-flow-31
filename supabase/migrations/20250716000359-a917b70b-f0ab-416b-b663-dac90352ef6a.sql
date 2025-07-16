-- Update RLS policy for proposal_approval_tokens to allow public access to valid tokens
DROP POLICY IF EXISTS "Allow public read for valid tokens" ON proposal_approval_tokens;

CREATE POLICY "Allow public read for valid tokens" ON proposal_approval_tokens
  FOR SELECT 
  TO anon, authenticated
  USING (
    expires_at > NOW() 
    AND used_at IS NULL
  );

-- Also allow public access to proposals through valid tokens  
CREATE POLICY "Allow public read proposals with valid tokens" ON proposals
  FOR SELECT 
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM proposal_approval_tokens 
      WHERE proposal_approval_tokens.proposal_id = proposals.id
      AND proposal_approval_tokens.expires_at > NOW()
      AND proposal_approval_tokens.used_at IS NULL
    )
  );

-- Allow public access to clients through valid proposal tokens
CREATE POLICY "Allow public read clients with valid proposal tokens" ON clients
  FOR SELECT 
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM proposals
      JOIN proposal_approval_tokens ON proposal_approval_tokens.proposal_id = proposals.id
      WHERE proposals.client_id = clients.id
      AND proposal_approval_tokens.expires_at > NOW()
      AND proposal_approval_tokens.used_at IS NULL
    )
  );

-- Allow public access to companies through valid proposal tokens  
CREATE POLICY "Allow public read companies with valid proposal tokens" ON companies
  FOR SELECT 
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM proposals
      JOIN proposal_approval_tokens ON proposal_approval_tokens.proposal_id = proposals.id
      WHERE proposals.user_id = companies.user_id
      AND proposal_approval_tokens.expires_at > NOW()
      AND proposal_approval_tokens.used_at IS NULL
    )
  );

-- Allow public access to proposal items through valid proposal tokens
CREATE POLICY "Allow public read proposal_items with valid tokens" ON proposal_items
  FOR SELECT 
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM proposal_approval_tokens 
      WHERE proposal_approval_tokens.proposal_id = proposal_items.proposal_id
      AND proposal_approval_tokens.expires_at > NOW()
      AND proposal_approval_tokens.used_at IS NULL
    )
  );