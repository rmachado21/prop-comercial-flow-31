-- Create proposal_changes table for audit logging
CREATE TABLE proposal_changes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    field_changed TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    change_type TEXT NOT NULL CHECK (change_type IN ('created', 'updated', 'deleted', 'approved', 'commented')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX idx_proposal_changes_proposal_id ON proposal_changes(proposal_id);
CREATE INDEX idx_proposal_changes_created_at ON proposal_changes(created_at DESC);

-- Enable RLS
ALTER TABLE proposal_changes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own proposal changes" ON proposal_changes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM proposals 
            WHERE proposals.id = proposal_changes.proposal_id 
            AND proposals.user_id = auth.uid()
        )
    );

CREATE POLICY "Service role can insert proposal changes" ON proposal_changes
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Users can insert their own proposal changes" ON proposal_changes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM proposals 
            WHERE proposals.id = proposal_changes.proposal_id 
            AND proposals.user_id = auth.uid()
        )
    );