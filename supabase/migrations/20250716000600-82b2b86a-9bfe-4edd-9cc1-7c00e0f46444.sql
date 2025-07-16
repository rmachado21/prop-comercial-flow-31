-- Rename proposal_approval_tokens to proposal_tokens and update structure
ALTER TABLE proposal_approval_tokens RENAME TO proposal_tokens;

-- Add new columns for unified portal
ALTER TABLE proposal_tokens 
ADD COLUMN purpose TEXT DEFAULT 'portal' CHECK (purpose IN ('portal', 'approval', 'comments')),
ADD COLUMN last_accessed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN access_count INTEGER DEFAULT 0;

-- Update existing tokens to be portal tokens
UPDATE proposal_tokens SET purpose = 'portal';

-- Create index on purpose
CREATE INDEX idx_proposal_tokens_purpose ON proposal_tokens(purpose);

-- Update RLS policies to use new table name
DROP POLICY IF EXISTS "Allow public read for valid tokens" ON proposal_tokens;
DROP POLICY IF EXISTS "Allow service role full access" ON proposal_tokens;

CREATE POLICY "Allow public read for valid tokens" ON proposal_tokens
  FOR SELECT 
  TO anon, authenticated
  USING (
    expires_at > NOW() 
    AND used_at IS NULL
  );

CREATE POLICY "Allow service role full access" ON proposal_tokens
  FOR ALL 
  TO service_role
  USING (true);

-- Update foreign key references in proposal_client_comments
ALTER TABLE proposal_client_comments 
DROP CONSTRAINT IF EXISTS proposal_client_comments_token_fkey;

ALTER TABLE proposal_client_comments 
ADD CONSTRAINT proposal_client_comments_token_fkey 
FOREIGN KEY (token) REFERENCES proposal_tokens(token);

-- Update other policies to use new table name
DROP POLICY IF EXISTS "Allow public read proposals with valid tokens" ON proposals;
DROP POLICY IF EXISTS "Allow public read clients with valid proposal tokens" ON clients;
DROP POLICY IF EXISTS "Allow public read companies with valid proposal tokens" ON companies;
DROP POLICY IF EXISTS "Allow public read proposal_items with valid tokens" ON proposal_items;

CREATE POLICY "Allow public read proposals with valid tokens" ON proposals
  FOR SELECT 
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM proposal_tokens 
      WHERE proposal_tokens.proposal_id = proposals.id
      AND proposal_tokens.expires_at > NOW()
      AND proposal_tokens.used_at IS NULL
    )
  );

CREATE POLICY "Allow public read clients with valid proposal tokens" ON clients
  FOR SELECT 
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM proposals
      JOIN proposal_tokens ON proposal_tokens.proposal_id = proposals.id
      WHERE proposals.client_id = clients.id
      AND proposal_tokens.expires_at > NOW()
      AND proposal_tokens.used_at IS NULL
    )
  );

CREATE POLICY "Allow public read companies with valid proposal tokens" ON companies
  FOR SELECT 
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM proposals
      JOIN proposal_tokens ON proposal_tokens.proposal_id = proposals.id
      WHERE proposals.user_id = companies.user_id
      AND proposal_tokens.expires_at > NOW()
      AND proposal_tokens.used_at IS NULL
    )
  );

CREATE POLICY "Allow public read proposal_items with valid tokens" ON proposal_items
  FOR SELECT 
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM proposal_tokens 
      WHERE proposal_tokens.proposal_id = proposal_items.proposal_id
      AND proposal_tokens.expires_at > NOW()
      AND proposal_tokens.used_at IS NULL
    )
  );