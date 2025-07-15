import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ContestedProposal {
  id: string;
  proposal_number: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  client: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
  latest_comment: {
    id: string;
    comments: string;
    client_name: string | null;
    client_email: string | null;
    created_at: string;
  } | null;
  is_read: boolean;
}

export const useContestedProposals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [contestedProposals, setContestedProposals] = useState<ContestedProposal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchContestedProposals();
      
      // Set up real-time subscription for new contested proposals
      const channel = supabase
        .channel('contested-proposals')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'proposals',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            if (payload.new?.status === 'contested') {
              fetchContestedProposals();
              toast({
                title: 'Nova Proposta Contestada',
                description: `A proposta ${payload.new.proposal_number} foi contestada pelo cliente.`,
                variant: 'destructive',
              });
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'proposal_client_comments',
          },
          () => {
            fetchContestedProposals();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchContestedProposals = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // First get contested proposals
      const { data: proposals, error: proposalsError } = await supabase
        .from('proposals')
        .select(`
          id,
          proposal_number,
          title,
          status,
          created_at,
          updated_at,
          client:clients(id, name, email, phone)
        `)
        .eq('user_id', user.id)
        .eq('status', 'contested')
        .order('updated_at', { ascending: false });

      if (proposalsError) throw proposalsError;

      if (!proposals || proposals.length === 0) {
        setContestedProposals([]);
        return;
      }

      // Get latest comments for each proposal
      const proposalIds = proposals.map(p => p.id);
      const { data: comments, error: commentsError } = await supabase
        .from('proposal_client_comments')
        .select('*')
        .in('proposal_id', proposalIds)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;

      // Combine proposals with their latest comments
      const contestedWithComments: ContestedProposal[] = proposals.map(proposal => {
        const latestComment = comments?.find(c => c.proposal_id === proposal.id) || null;
        
        return {
          ...proposal,
          latest_comment: latestComment,
          is_read: false // For now, we'll consider all as unread
        };
      });

      setContestedProposals(contestedWithComments);
    } catch (error) {
      console.error('Error fetching contested proposals:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar propostas contestadas',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (proposalId: string) => {
    setContestedProposals(prev => 
      prev.map(proposal => 
        proposal.id === proposalId 
          ? { ...proposal, is_read: true }
          : proposal
      )
    );
  };

  const dismissAll = () => {
    setContestedProposals(prev => 
      prev.map(proposal => ({ ...proposal, is_read: true }))
    );
  };

  const unreadCount = contestedProposals.filter(p => !p.is_read).length;

  return {
    contestedProposals,
    unreadCount,
    isLoading,
    fetchContestedProposals,
    markAsRead,
    dismissAll,
  };
};