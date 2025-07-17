import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ProposalPortalData {
  id: string;
  title: string;
  proposal_number: string;
  description: string | null;
  total_amount: number;
  status: string;
  created_at: string;
  updated_after_comment?: boolean;
  client_seen_update?: boolean;
  client: {
    name: string;
    email: string;
    phone: string | null;
  };
  items: Array<{
    id: string;
    product_name: string;
    product_description: string | null;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  company?: {
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
  } | null;
  terms_and_conditions: string | null;
}

export interface ProposalComment {
  id: string;
  client_name: string;
  client_email: string | null;
  comments: string;
  created_at: string;
}

export interface ProposalChange {
  id: string;
  change_type: string;
  field_changed: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

export const useProposalPortal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateToken = useCallback(async (token: string): Promise<{
    isValid: boolean;
    proposal?: ProposalPortalData;
    error?: string;
  }> => {
    try {
      setIsLoading(true);

      // Validate the token
      const { data: tokenData, error: tokenError } = await supabase
        .from('proposal_tokens')
        .select('*')
        .eq('token', token)
        .maybeSingle();

      if (tokenError) {
        throw tokenError;
      }

      if (!tokenData) {
        return { isValid: false, error: 'Token não encontrado' };
      }

      // Auto-renew expired tokens to keep links permanent
      if (new Date(tokenData.expires_at) < new Date()) {
        const { error: renewError } = await supabase
          .from('proposal_tokens')
          .update({
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            updated_at: new Date().toISOString()
          })
          .eq('token', token);

        if (renewError) {
          console.error('Error renewing token:', renewError);
          // Continue anyway - token might still work for read access
        }
      }

      // Get proposal details with client info
      const { data: proposalData, error: proposalError } = await supabase
        .from('proposals')
        .select(`
          id,
          title,
          proposal_number,
          description,
          total_amount,
          status,
          created_at,
          user_id,
          terms_and_conditions,
          updated_after_comment,
          client:clients(name, email, phone)
        `)
        .eq('id', tokenData.proposal_id)
        .single();

      if (proposalError) {
        throw proposalError;
      }

      // Get company info
      const { data: companyData } = await supabase
        .from('companies')
        .select('name, email, phone, address')
        .eq('user_id', proposalData.user_id)
        .maybeSingle();

      // Get proposal items
      const { data: itemsData, error: itemsError } = await supabase
        .from('proposal_items')
        .select('id, product_name, product_description, quantity, unit_price, total_price')
        .eq('proposal_id', tokenData.proposal_id)
        .order('created_at');

      if (itemsError) {
        throw itemsError;
      }

      // Update token access tracking and mark as seen if there were updates
      await supabase
        .from('proposal_tokens')
        .update({ 
          last_accessed_at: new Date().toISOString(),
          access_count: (tokenData.access_count || 0) + 1,
          // Mark update as seen if proposal was updated after comment
          client_seen_update: proposalData.updated_after_comment ? true : tokenData.client_seen_update,
        })
        .eq('token', token);

      return {
        isValid: true,
        proposal: {
          ...proposalData,
          company: companyData,
          items: itemsData || [],
          client_seen_update: tokenData.client_seen_update
        }
      };

    } catch (error: any) {
      console.error('Error validating token:', error);
      return { 
        isValid: false, 
        error: 'Erro ao validar o token' 
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approveProposal = useCallback(async (token: string, clientName?: string): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      setIsSubmitting(true);

      // Get client IP
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
      setIsSubmitting(false);
    }
  }, []);

  const submitComments = useCallback(async (
    token: string,
    clientName: string,
    clientEmail: string,
    comments: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      setIsSubmitting(true);

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
        return { success: false, error: data.error || 'Erro ao enviar comentário' };
      }

      toast.success('Comentário enviado com sucesso!');
      return { success: true };

    } catch (error: any) {
      console.error('Error submitting comments:', error);
      const errorMessage = error.message || 'Erro ao enviar comentário';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const getProposalHistory = useCallback(async (proposalId: string): Promise<ProposalChange[]> => {
    try {
      const { data, error } = await supabase
        .from('proposal_changes')
        .select('*')
        .eq('proposal_id', proposalId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching proposal history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching proposal history:', error);
      return [];
    }
  }, []);

  const getProposalComments = useCallback(async (proposalId: string): Promise<ProposalComment[]> => {
    try {
      const { data, error } = await supabase
        .from('proposal_client_comments')
        .select('id, client_name, client_email, comments, created_at')
        .eq('proposal_id', proposalId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching proposal comments:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching proposal comments:', error);
      return [];
    }
  }, []);

  return {
    validateToken,
    approveProposal,
    submitComments,
    getProposalHistory,
    getProposalComments,
    isLoading,
    isSubmitting
  };
};