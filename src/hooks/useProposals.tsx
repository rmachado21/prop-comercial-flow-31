
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
        notes: proposalData.notes || null,
        terms_and_conditions: proposalData.terms_and_conditions || null,
      };

      const { data, error } = await supabase
        .from('proposals')
        .insert(cleanProposalData)
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
        notes: proposalData.notes,
        terms_and_conditions: proposalData.terms_and_conditions,
        updated_at: new Date().toISOString(),
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
