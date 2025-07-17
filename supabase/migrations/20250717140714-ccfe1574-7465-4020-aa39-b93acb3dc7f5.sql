-- Atualizar o constraint do tipo de mudança para incluir 'client_comment'
ALTER TABLE proposal_changes DROP CONSTRAINT IF EXISTS proposal_changes_change_type_check;

-- Recriar o constraint com 'client_comment' incluído
ALTER TABLE proposal_changes ADD CONSTRAINT proposal_changes_change_type_check
CHECK (change_type IN ('field_update', 'status_change', 'item_added', 'item_updated', 'item_deleted', 'proposal_sent', 'client_comment'));