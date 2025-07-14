-- Create proposal approval tokens table
CREATE TABLE proposal_approval_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  token UUID DEFAULT gen_random_uuid() NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  used_at TIMESTAMP WITH TIME ZONE,
  client_ip INET,
  client_user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX idx_proposal_approval_tokens_token ON proposal_approval_tokens(token);
CREATE INDEX idx_proposal_approval_tokens_proposal_id ON proposal_approval_tokens(proposal_id);

-- Enable RLS
ALTER TABLE proposal_approval_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read for valid tokens" ON proposal_approval_tokens
  FOR SELECT USING (
    expires_at > NOW() 
    AND used_at IS NULL
  );

CREATE POLICY "Allow service role full access" ON proposal_approval_tokens
  FOR ALL USING (auth.role() = 'service_role');

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_proposal_approval_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_proposal_approval_tokens_updated_at
  BEFORE UPDATE ON proposal_approval_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_proposal_approval_tokens_updated_at();