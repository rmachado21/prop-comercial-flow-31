
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeProposals } from '@/hooks/useRealtimeProposals';

export interface Proposal {
  id: string;
  user_id: string;
  client_id: string;
  proposal_number: string;
  title: string;
  description: string | null;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired' | 'nfe_issued' | 'contested';
  subtotal: number;
  discount_percentage: number | null;
  discount_amount: number | null;
  tax_percentage: number | null;
  tax_amount: number | null;
  total_amount: number;
  validity_days: number | null;
  expiry_date: string | null;
  
  terms_and_conditions: string | null;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
  approved_at: string | null;
  client?: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    cnpj: string | null;
    contact_name: string | null;
    city: string | null;
    state: string | null;
  };
}

export interface ProposalItem {
  id: string;
  proposal_id: string;
  product_id: string | null;
  product_name: string;
  product_description: string | null;
  quantity: number;
  unit_price: number;
  discount_percentage: number | null;
  discount_amount: number | null;
  total_price: number;
  sort_order: number | null;
}

export const useProposals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Optimistic update handlers for realtime
  const handleRealtimeInsert = useCallback((newProposal: Proposal) => {
    setProposals(prev => {
      // Check if proposal already exists to avoid duplicates
      const exists = prev.some(p => p.id === newProposal.id);
      if (exists) return prev;
      
      // Insert at beginning (newest first)
      return [newProposal, ...prev];
    });
  }, []);

  const handleRealtimeUpdate = useCallback((updatedProposal: Proposal) => {
    setProposals(prev =>
      prev.map(proposal =>
        proposal.id === updatedProposal.id ? updatedProposal : proposal
      )
    );
  }, []);

  const handleRealtimeDelete = useCallback((proposalId: string) => {
    setProposals(prev => prev.filter(proposal => proposal.id !== proposalId));
  }, []);

  // Setup realtime subscription
  const { reconnect, isConnected } = useRealtimeProposals({
    onInsert: handleRealtimeInsert,
    onUpdate: handleRealtimeUpdate,
    onDelete: handleRealtimeDelete,
  });

  // Initial fetch on mount
  useEffect(() => {
    if (user) {
      fetchProposals();
    }
  }, [user]);

  const fetchProposals = async (silent = false) => {
    if (!user) return;
    
    if (!silent) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          client:clients(id, name, email, phone, cnpj, contact_name, city, state)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProposals((data as Proposal[]) || []);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      if (!silent) {
        toast({
          title: 'Erro',
          description: 'Erro ao carregar propostas',
          variant: 'destructive',
        });
      }
    } finally {
      if (!silent) {
        setIsLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  };

  // Manual refresh method
  const refreshProposals = () => {
    fetchProposals(true);
  };

  const createProposal = async (proposalData: Partial<Proposal>) => {
    if (!user) return null;

    try {
      // Generate proposal number
      const { data: proposalNumber, error: numberError } = await supabase
        .rpc('generate_proposal_number', { user_uuid: user.id });

      if (numberError) throw numberError;

      // Create a clean data object with only the fields that exist in the proposals table
      const cleanProposalData = {
        user_id: user.id,
        proposal_number: proposalNumber,
        title: proposalData.title || '',
        description: proposalData.description || null,
        client_id: proposalData.client_id || '',
        status: proposalData.status || 'draft' as const,
        subtotal: proposalData.subtotal || 0,
        discount_percentage: proposalData.discount_percentage || null,
        discount_amount: proposalData.discount_amount || null,
        tax_percentage: proposalData.tax_percentage || null,
        tax_amount: proposalData.tax_amount || null,
        total_amount: proposalData.total_amount || 0,
        validity_days: proposalData.validity_days || null,
        expiry_date: proposalData.expiry_date || null,
        
        terms_and_conditions: proposalData.terms_and_conditions || null,
      };

      const { data, error } = await supabase
        .from('proposals')
        .insert(cleanProposalData)
        .select()
        .single();

      if (error) throw error;

      // Don't fetch proposals here - realtime will handle the update
      toast({
        title: 'Sucesso',
        description: 'Proposta criada com sucesso',
      });

      return data;
    } catch (error) {
      console.error('Error creating proposal:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar proposta',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateProposal = async (id: string, proposalData: Partial<Proposal>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Get the current proposal to check if it was contested AND validate ownership
      const { data: currentProposal, error: fetchError } = await supabase
        .from('proposals')
        .select('status, client_id, clients(name, email), title, proposal_number, user_id')
        .eq('id', id)
        .eq('user_id', user.id) // Garantir que o usuário só edite suas próprias propostas
        .single();

      if (fetchError) throw fetchError;

      const wasContested = currentProposal.status === 'contested';

      // Create a clean data object excluding read-only fields and relations
      const cleanProposalData = {
        title: proposalData.title,
        description: proposalData.description,
        client_id: proposalData.client_id,
        status: proposalData.status,
        subtotal: proposalData.subtotal,
        discount_percentage: proposalData.discount_percentage,
        discount_amount: proposalData.discount_amount,
        tax_percentage: proposalData.tax_percentage,
        tax_amount: proposalData.tax_amount,
        total_amount: proposalData.total_amount,
        validity_days: proposalData.validity_days,
        expiry_date: proposalData.expiry_date,
        terms_and_conditions: proposalData.terms_and_conditions,
        updated_at: new Date().toISOString(),
        // Mark as updated after comment if it was contested
        updated_after_comment: wasContested ? true : undefined,
      };

      // Remove undefined fields
      Object.keys(cleanProposalData).forEach(key => {
        if (cleanProposalData[key as keyof typeof cleanProposalData] === undefined) {
          delete cleanProposalData[key as keyof typeof cleanProposalData];
        }
      });

      const { error } = await supabase
        .from('proposals')
        .update(cleanProposalData)
        .eq('id', id);

      if (error) throw error;

      // If proposal was contested and now updated, notify client
      if (wasContested && currentProposal.clients?.email) {
        try {
          // Get the proposal portal token
          const { data: tokenData } = await supabase
            .from('proposal_tokens')
            .select('token')
            .eq('proposal_id', id)
            .eq('purpose', 'portal')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (tokenData) {
            const proposalUrl = `${window.location.origin}/portal/${tokenData.token}`;
            
            await supabase.functions.invoke('notify-client-update', {
              body: {
                proposalId: id,
                clientEmail: currentProposal.clients.email,
                clientName: currentProposal.clients.name,
                proposalNumber: currentProposal.proposal_number,
                proposalTitle: currentProposal.title,
                proposalUrl: proposalUrl,
              },
            });
            
            console.log('Cliente notificado sobre atualização da proposta');
          }
        } catch (notifyError) {
          console.error('Erro ao notificar cliente:', notifyError);
          // Continue even if notification fails
        }
      }

      // Don't fetch proposals here - realtime will handle the update
      toast({
        title: 'Sucesso',
        description: 'Proposta atualizada com sucesso',
      });
    } catch (error) {
      console.error('Error updating proposal:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar proposta',
        variant: 'destructive',
      });
    }
  };

  const deleteProposal = async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Garantir que o usuário só delete suas próprias propostas

      if (error) throw error;

      // Don't fetch proposals here - realtime will handle the update
      toast({
        title: 'Sucesso',
        description: 'Proposta excluída com sucesso',
      });
    } catch (error) {
      console.error('Error deleting proposal:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir proposta',
        variant: 'destructive',
      });
    }
  };

  const sendProposal = async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { error } = await supabase
        .from('proposals')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id); // Garantir que o usuário só envie suas próprias propostas

      if (error) throw error;

      // Don't fetch proposals here - realtime will handle the update
      toast({
        title: 'Sucesso',
        description: 'Proposta enviada com sucesso',
      });
    } catch (error) {
      console.error('Error sending proposal:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao enviar proposta',
        variant: 'destructive',
      });
    }
  };

  const updateProposalStatus = async (id: string, newStatus: Proposal['status']) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      // Add specific timestamps based on status
      if (newStatus === 'sent') {
        updateData.sent_at = new Date().toISOString();
      } else if (newStatus === 'approved') {
        updateData.approved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('proposals')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id); // Garantir que o usuário só atualize suas próprias propostas

      if (error) throw error;

      // Don't fetch proposals here - realtime will handle the update and show toast
      // Real-time subscription will handle the toast notification
    } catch (error) {
      console.error('Error updating proposal status:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao alterar status da proposta',
        variant: 'destructive',
      });
    }
  };

  return {
    proposals,
    isLoading,
    isRefreshing,
    isConnected,
    fetchProposals,
    refreshProposals,
    reconnect,
    createProposal,
    updateProposal,
    deleteProposal,
    sendProposal,
    updateProposalStatus,
  };
};
