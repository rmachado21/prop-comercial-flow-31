
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Proposal {
  id: string;
  user_id: string;
  client_id: string;
  proposal_number: string;
  title: string;
  description: string | null;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
  subtotal: number;
  discount_percentage: number | null;
  discount_amount: number | null;
  tax_percentage: number | null;
  tax_amount: number | null;
  total_amount: number;
  validity_days: number | null;
  expiry_date: string | null;
  notes: string | null;
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

  useEffect(() => {
    if (user) {
      fetchProposals();
    }
  }, [user]);

  const fetchProposals = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          client:clients(id, name, email, phone)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProposals((data as Proposal[]) || []);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar propostas',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createProposal = async (proposalData: Partial<Proposal>) => {
    if (!user) return null;

    try {
      // Generate proposal number
      const { data: proposalNumber, error: numberError } = await supabase
        .rpc('generate_proposal_number', { user_uuid: user.id });

      if (numberError) throw numberError;

      const { data, error } = await supabase
        .from('proposals')
        .insert({
          ...proposalData,
          user_id: user.id,
          proposal_number: proposalNumber,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchProposals();
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
    try {
      const { error } = await supabase
        .from('proposals')
        .update({
          ...proposalData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      await fetchProposals();
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
    try {
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchProposals();
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
    try {
      const { error } = await supabase
        .from('proposals')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      await fetchProposals();
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

  return {
    proposals,
    isLoading,
    fetchProposals,
    createProposal,
    updateProposal,
    deleteProposal,
    sendProposal,
  };
};
