
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Proposal } from './useProposals';

export interface ProposalSend {
  id: string;
  proposal_id: string;
  send_method: 'email' | 'whatsapp';
  recipient: string;
  sent_at: string;
  status: 'sent' | 'delivered' | 'failed';
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export const useProposalSend = () => {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  const sendProposalByEmail = async (
    proposal: Proposal,
    recipient: string,
    subject?: string,
    message?: string
  ) => {
    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-proposal-email', {
        body: {
          proposalId: proposal.id,
          recipient,
          subject,
          message,
        },
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Erro ao enviar proposta por email');
      }

      toast({
        title: 'Sucesso',
        description: 'Proposta enviada por email com sucesso',
      });

      return { success: true, data };
    } catch (error) {
      console.error('Error sending proposal by email:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao enviar proposta por email',
        variant: 'destructive',
      });
      return { success: false, error };
    } finally {
      setIsSending(false);
    }
  };

  const generateWhatsAppMessage = (proposal: Proposal) => {
    const clientName = proposal.client?.name || 'Cliente';
    const message = `
Olá ${clientName}! 👋

Segue nossa proposta comercial:

📋 *${proposal.title}*
📊 Proposta: ${proposal.proposal_number}
💰 Valor Total: R$ ${proposal.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
${proposal.validity_days ? `⏰ Validade: ${proposal.validity_days} dias` : ''}

${proposal.description ? `\n📝 ${proposal.description}` : ''}

Ficamos à disposição para esclarecimentos!

*Equipe Comercial*
    `.trim();

    return encodeURIComponent(message);
  };

  const openWhatsApp = async (proposal: Proposal, phoneNumber: string) => {
    try {
      const message = generateWhatsAppMessage(proposal);
      
      // Clean phone number (remove spaces, dashes, parentheses)
      const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
      
      // Ensure it starts with country code
      const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
      
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${message}`;
      
      // Record the send attempt
      const { error } = await supabase
        .from('proposal_sends')
        .insert({
          proposal_id: proposal.id,
          send_method: 'whatsapp',
          recipient: phoneNumber,
          status: 'sent',
        });

      if (error) {
        console.error('Error recording WhatsApp send:', error);
      }

      // Open WhatsApp
      window.open(whatsappUrl, '_blank');

      toast({
        title: 'WhatsApp Aberto',
        description: 'Mensagem preparada no WhatsApp. Verifique e envie manualmente.',
      });

      return { success: true };
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao abrir WhatsApp',
        variant: 'destructive',
      });
      return { success: false, error };
    }
  };

  const getProposalSends = async (proposalId: string): Promise<ProposalSend[]> => {
    try {
      const { data, error } = await supabase
        .from('proposal_sends')
        .select('*')
        .eq('proposal_id', proposalId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type cast the database response to match our interface
      return (data || []).map(item => ({
        ...item,
        send_method: item.send_method as 'email' | 'whatsapp',
        status: item.status as 'sent' | 'delivered' | 'failed'
      }));
    } catch (error) {
      console.error('Error fetching proposal sends:', error);
      return [];
    }
  };

  return {
    sendProposalByEmail,
    openWhatsApp,
    generateWhatsAppMessage,
    getProposalSends,
    isSending,
  };
};
