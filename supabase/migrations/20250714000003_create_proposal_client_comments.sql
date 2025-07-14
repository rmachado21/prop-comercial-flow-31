-- Create proposal_client_comments table
CREATE TABLE proposal_client_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  token UUID NOT NULL REFERENCES proposal_approval_tokens(token) ON DELETE CASCADE,
  client_name TEXT,
  client_email TEXT,
  comments TEXT NOT NULL,
  client_ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for performance
CREATE INDEX idx_proposal_client_comments_proposal_id ON proposal_client_comments(proposal_id);
CREATE INDEX idx_proposal_client_comments_token ON proposal_client_comments(token);

-- Enable RLS
ALTER TABLE proposal_client_comments ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to view comments on their proposals
CREATE POLICY "Users can view comments on their proposals" ON proposal_client_comments
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM proposals 
      WHERE proposals.id = proposal_client_comments.proposal_id 
      AND proposals.user_id = auth.uid()
    )
  );

-- Create policy for inserting comments (public access with valid token)
CREATE POLICY "Anyone can insert comments with valid token" ON proposal_client_comments
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM proposal_approval_tokens 
      WHERE proposal_approval_tokens.token = proposal_client_comments.token
      AND proposal_approval_tokens.expires_at > now()
    )
  );