import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ProposalApprovalToken {
  id: string;
  proposal_id: string;
  token: string;
  expires_at: string;
  used_at: string | null;
  client_ip: string | null;
  created_at: string;
}

export interface ProposalForApproval {
  id: string;
  title: string;
  description: string | null;
  total_amount: number;
  created_at: string;
  client: {
    name: string;
    email: string;
    phone: string | null;
  };
  items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  company: {
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
  };
}

export const useProposalApproval = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const validateToken = async (token: string): Promise<{
    isValid: boolean;
    proposal?: ProposalForApproval;
    error?: string;
  }> => {
    try {
      setIsLoading(true);

      // First, validate the token (using any type temporarily until migration is applied)
      const { data: tokenData, error: tokenError } = await (supabase as any)
        .from('proposal_approval_tokens')
        .select('*')
        .eq('token', token)
        .maybeSingle();

      if (tokenError) {
        throw tokenError;
      }

      if (!tokenData) {
        return { isValid: false, error: 'Token não encontrado' };
      }

      if (tokenData.used_at) {
        return { isValid: false, error: 'Esta proposta já foi aprovada anteriormente' };
      }

      if (new Date(tokenData.expires_at) < new Date()) {
        return { isValid: false, error: 'O link de aprovação expirou' };
      }

      // Get proposal details with client and company info (using any to bypass type issues temporarily)
      const { data: proposalData, error: proposalError } = await (supabase as any)
        .from('proposals')
        .select(`
          id,
          title,
          description,
          total_amount,
          created_at,
          client:clients(name, email, phone),
          company:companies(name, email, phone, address)
        `)
        .eq('id', tokenData.proposal_id)
        .single();

      if (proposalError) {
        throw proposalError;
      }

      // Get proposal items
      const { data: itemsData, error: itemsError } = await supabase
        .from('proposal_items')
        .select('id, product_name, quantity, unit_price, total_price')
        .eq('proposal_id', tokenData.proposal_id)
        .order('created_at');

      if (itemsError) {
        throw itemsError;
      }

      return {
        isValid: true,
        proposal: {
          ...proposalData,
          items: itemsData || []
        }
      };

    } catch (error: any) {
      console.error('Error validating token:', error);
      return { 
        isValid: false, 
        error: 'Erro ao validar o token de aprovação' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const approveProposal = async (token: string, clientName?: string): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      setIsApproving(true);

      // Get client IP (simplified - in production you'd use a proper IP detection service)
      const clientIP = await fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => data.ip)
        .catch(() => null);

      // Call the approve proposal function
      const { data, error } = await supabase.functions.invoke('approve-proposal', {
        body: {
          token,
          clientName: clientName || null,
          clientIP,
          userAgent: navigator.userAgent
        }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        return { success: false, error: data.error || 'Erro ao aprovar proposta' };
      }

      toast.success('Proposta aprovada com sucesso!');
      return { success: true };

    } catch (error: any) {
      console.error('Error approving proposal:', error);
      const errorMessage = error.message || 'Erro ao aprovar proposta';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsApproving(false);
    }
  };

  const submitClientComments = async (
    token: string,
    clientName: string,
    clientEmail: string,
    comments: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      setIsApproving(true);

      // Get client IP
      const clientIP = await fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => data.ip)
        .catch(() => null);

      // Call the submit comments function
      const { data, error } = await supabase.functions.invoke('submit-client-comments', {
        body: {
          token,
          clientName,
          clientEmail,
          comments,
          clientIP,
          userAgent: navigator.userAgent
        }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        return { success: false, error: data.error || 'Erro ao enviar observações' };
      }

      toast.success('Observações enviadas com sucesso!');
      return { success: true };

    } catch (error: any) {
      console.error('Error submitting comments:', error);
      const errorMessage = error.message || 'Erro ao enviar observações';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsApproving(false);
    }
  };

  return {
    validateToken,
    approveProposal,
    submitClientComments,
    isLoading,
    isApproving
  };
};