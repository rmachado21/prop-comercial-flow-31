import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Activity {
  id: string;
  type: 'proposta' | 'cliente' | 'produto';
  title: string;
  description: string;
  time: string;
  status?: 'success' | 'pending' | 'info';
}

export const useDashboardActivities = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchActivities = async () => {
      try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Buscar propostas recentes
        const { data: proposals } = await supabase
          .from('proposals')
          .select(`
            id,
            title,
            status,
            created_at,
            updated_at,
            clients(name)
          `)
          .eq('user_id', user.id)
          .gte('updated_at', sevenDaysAgo.toISOString())
          .order('updated_at', { ascending: false })
          .limit(5);

        // Buscar clientes recentes
        const { data: clients } = await supabase
          .from('clients')
          .select('id, name, created_at')
          .eq('user_id', user.id)
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(3);

        // Buscar produtos recentes
        const { data: products } = await supabase
          .from('products')
          .select('id, name, created_at')
          .eq('user_id', user.id)
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(3);

        const allActivities: Activity[] = [];

        // Adicionar atividades de propostas
        proposals?.forEach(proposal => {
          const clientName = (proposal.clients as any)?.name || 'Cliente';
          
          allActivities.push({
            id: `proposal-${proposal.id}`,
            type: 'proposta',
            title: `Proposta "${proposal.title}"`,
            description: `${getStatusDescription(proposal.status)} para ${clientName}`,
            time: formatTimeAgo(proposal.updated_at),
            status: getActivityStatus(proposal.status)
          });
        });

        // Adicionar atividades de clientes
        clients?.forEach(client => {
          allActivities.push({
            id: `client-${client.id}`,
            type: 'cliente',
            title: `Novo cliente: ${client.name}`,
            description: 'Cliente adicionado ao sistema',
            time: formatTimeAgo(client.created_at),
            status: 'success'
          });
        });

        // Adicionar atividades de produtos
        products?.forEach(product => {
          allActivities.push({
            id: `product-${product.id}`,
            type: 'produto',
            title: `Produto "${product.name}"`,
            description: 'Novo produto cadastrado',
            time: formatTimeAgo(product.created_at),
            status: 'info'
          });
        });

        // Ordenar por data mais recente
        allActivities.sort((a, b) => {
          // Converter time ago para timestamp para ordenação
          return getTimestamp(b.time) - getTimestamp(a.time);
        });

        setActivities(allActivities.slice(0, 8)); // Mostrar apenas os 8 mais recentes
      } catch (error) {
        console.error('Erro ao buscar atividades:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user?.id]);

  return { activities, loading };
};

const getStatusDescription = (status: string): string => {
  const statusMap: Record<string, string> = {
    'draft': 'Rascunho criado',
    'sent': 'Enviada',
    'approved': 'Aprovada',
    'rejected': 'Rejeitada',
    'expired': 'Expirada'
  };
  return statusMap[status] || 'Atualizada';
};

const getActivityStatus = (status: string): 'success' | 'pending' | 'info' => {
  const statusMap: Record<string, 'success' | 'pending' | 'info'> = {
    'approved': 'success',
    'sent': 'pending',
    'draft': 'info',
    'rejected': 'info',
    'expired': 'info'
  };
  return statusMap[status] || 'info';
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Agora mesmo';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min atrás`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} dias atrás`;
  
  return date.toLocaleDateString('pt-BR');
};

const getTimestamp = (timeAgo: string): number => {
  const now = Date.now();
  
  if (timeAgo === 'Agora mesmo') return now;
  if (timeAgo.includes('min atrás')) {
    const minutes = parseInt(timeAgo);
    return now - (minutes * 60 * 1000);
  }
  if (timeAgo.includes('h atrás')) {
    const hours = parseInt(timeAgo);
    return now - (hours * 60 * 60 * 1000);
  }
  if (timeAgo.includes('dias atrás')) {
    const days = parseInt(timeAgo);
    return now - (days * 24 * 60 * 60 * 1000);
  }
  
  return 0; // Para datas formatadas
};