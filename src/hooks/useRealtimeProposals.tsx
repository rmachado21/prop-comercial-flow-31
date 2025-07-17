import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Proposal } from '@/hooks/useProposals';

interface UseRealtimeProposalsProps {
  onInsert?: (proposal: Proposal) => void;
  onUpdate?: (proposal: Proposal) => void;
  onDelete?: (proposalId: string) => void;
}

export const useRealtimeProposals = ({
  onInsert,
  onUpdate,
  onDelete,
}: UseRealtimeProposalsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!user) return;

    // Create unique channel per user
    const channelName = `proposals-realtime-${user.id}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'proposals',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          console.log('Realtime INSERT:', payload);
          
          // Fetch complete proposal with client data
          const { data: fullProposal } = await supabase
            .from('proposals')
            .select(`
              *,
              client:clients(id, name, email, phone, cnpj, contact_name, city, state)
            `)
            .eq('id', payload.new.id)
            .single();

          if (fullProposal && onInsert) {
            onInsert(fullProposal as Proposal);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'proposals',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          console.log('Realtime UPDATE:', payload);
          
          // Fetch complete proposal with client data
          const { data: fullProposal } = await supabase
            .from('proposals')
            .select(`
              *,
              client:clients(id, name, email, phone, cnpj, contact_name, city, state)
            `)
            .eq('id', payload.new.id)
            .single();

          if (fullProposal && onUpdate) {
            onUpdate(fullProposal as Proposal);
            
            // Show toast notification for status changes
            if (payload.old.status !== payload.new.status) {
              const statusLabels = {
                draft: 'Rascunho',
                sent: 'Enviada',
                approved: 'Aprovada',
                rejected: 'Rejeitada',
                expired: 'Expirada',
                nfe_issued: 'NFe Emitida',
                contested: 'Contestada'
              };
              
              toast({
                title: 'Proposta Atualizada',
                description: `Status alterado para: ${statusLabels[payload.new.status as keyof typeof statusLabels]}`,
              });
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'proposals',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Realtime DELETE:', payload);
          
          if (onDelete) {
            onDelete(payload.old.id);
          }
          
          toast({
            title: 'Proposta Removida',
            description: 'Uma proposta foi excluída',
            variant: 'destructive',
          });
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Conectado ao realtime para propostas');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('❌ Erro na conexão realtime:', status);
          toast({
            title: 'Conexão Instável',
            description: 'Atualizações automáticas podem estar indisponíveis',
            variant: 'destructive',
          });
        }
      });

    channelRef.current = channel;

    // Cleanup subscription on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user, onInsert, onUpdate, onDelete, toast]);

  // Method to manually reconnect if needed
  const reconnect = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }
    
    // The useEffect will recreate the subscription automatically
  };

  return {
    reconnect,
    isConnected: channelRef.current?.state === 'joined',
  };
};