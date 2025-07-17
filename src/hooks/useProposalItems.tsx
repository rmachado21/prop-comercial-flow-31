
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ProposalItem } from './useProposals';

export const useProposalItems = (proposalId: string | null) => {
  const { toast } = useToast();
  const [items, setItems] = useState<ProposalItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (proposalId) {
      fetchItems();
    } else {
      setItems([]);
    }
  }, [proposalId]);

  const fetchItems = async () => {
    if (!proposalId) return;
    
    console.log('Fetching items for proposal:', proposalId);
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('proposal_items')
        .select('*')
        .eq('proposal_id', proposalId)
        .order('sort_order', { ascending: true });

      console.log('Proposal items query result:', { data, error });
      if (error) throw error;
      setItems(data || []);
      console.log('Items set to state:', data || []);
    } catch (error) {
      console.error('Error fetching proposal items:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar itens da proposta',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (itemData: Partial<ProposalItem>) => {
    if (!proposalId) return;

    try {
      const { error } = await supabase
        .from('proposal_items')
        .insert({
          proposal_id: proposalId,
          product_name: itemData.product_name || '',
          product_description: itemData.product_description || null,
          quantity: itemData.quantity || 1,
          unit_price: itemData.unit_price || 0,
          total_price: (itemData.quantity || 1) * (itemData.unit_price || 0),
          product_id: itemData.product_id || null,
          discount_percentage: itemData.discount_percentage || null,
          discount_amount: itemData.discount_amount || null,
          sort_order: itemData.sort_order || null,
        });

      if (error) throw error;

      await fetchItems();
      toast({
        title: 'Sucesso',
        description: 'Item adicionado com sucesso',
      });
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar item',
        variant: 'destructive',
      });
    }
  };

  const updateItem = async (id: string, itemData: Partial<ProposalItem>) => {
    try {
      const updatedData = {
        ...itemData,
        total_price: (itemData.quantity || 1) * (itemData.unit_price || 0),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('proposal_items')
        .update(updatedData)
        .eq('id', id);

      if (error) throw error;

      await fetchItems();
      toast({
        title: 'Sucesso',
        description: 'Item atualizado com sucesso',
      });
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar item',
        variant: 'destructive',
      });
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('proposal_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchItems();
      toast({
        title: 'Sucesso',
        description: 'Item removido com sucesso',
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao remover item',
        variant: 'destructive',
      });
    }
  };

  return {
    items,
    isLoading,
    fetchItems,
    addItem,
    updateItem,
    deleteItem,
  };
};
