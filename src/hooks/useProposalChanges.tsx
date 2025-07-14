import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ProposalChange {
  id: string;
  proposal_id: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  change_type: 'create' | 'update' | 'delete';
  changed_by: string;
  client_approval?: boolean;
  client_ip?: string;
  user_agent?: string;
  created_at: string;
}

export const useProposalChanges = (proposalId: string | null) => {
  const [changes, setChanges] = useState<ProposalChange[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchChanges = async () => {
    if (!proposalId) return;

    setIsLoading(true);
    try {
      // Temporary implementation - return empty array until migration is applied
      // TODO: Replace with actual database query after migration
      setChanges([]);
    } catch (error) {
      console.error('Error fetching proposal changes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico de alterações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logChange = async (
    proposalId: string,
    fieldChanged: string,
    oldValue: any,
    newValue: any,
    changeType: 'created' | 'updated' | 'deleted' = 'updated'
  ) => {
    if (!user) return;

    try {
      // Temporary implementation - just log to console until migration is applied
      console.log('Change logged:', {
        proposal_id: proposalId,
        user_id: user.id,
        field_changed: fieldChanged,
        old_value: oldValue ? String(oldValue) : null,
        new_value: newValue ? String(newValue) : null,
        change_type: changeType,
      });
    } catch (error) {
      console.error('Error logging change:', error);
    }
  };

  const logMultipleChanges = async (
    proposalId: string,
    changes: Array<{
      field: string;
      oldValue: any;
      newValue: any;
    }>
  ) => {
    if (!user || changes.length === 0) return;

    try {
      // Temporary implementation - just log to console until migration is applied
      console.log('Multiple changes logged:', {
        proposal_id: proposalId,
        user_id: user.id,
        changes: changes.map(change => ({
          field_changed: change.field,
          old_value: change.oldValue ? String(change.oldValue) : null,
          new_value: change.newValue ? String(change.newValue) : null,
          change_type: 'updated',
        })),
      });
    } catch (error) {
      console.error('Error logging multiple changes:', error);
    }
  };

  useEffect(() => {
    if (proposalId) {
      fetchChanges();
    }
  }, [proposalId]);

  return {
    changes,
    isLoading,
    fetchChanges,
    logChange,
    logMultipleChanges,
  };
};