import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  totalProposals: number;
  proposalsThisWeek: number;
  totalClients: number;
  newClientsThisMonth: number;
  totalProducts: number;
  totalCategories: number;
  conversionRate: number;
  totalRevenue: number;
  revenueThisMonth: number;
  pendingProposals: number;
  monthlyGoal: number;
  monthlyGoalPercentage: number;
  proposalsThisMonth: number;
  approvedProposalsThisMonth: number;
  loading: boolean;
  error: string | null;
}

export const useDashboardStats = (): DashboardStats => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProposals: 0,
    proposalsThisWeek: 0,
    totalClients: 0,
    newClientsThisMonth: 0,
    totalProducts: 0,
    totalCategories: 0,
    conversionRate: 0,
    totalRevenue: 0,
    revenueThisMonth: 0,
    pendingProposals: 0,
    monthlyGoal: 170000, // Meta padrão
    monthlyGoalPercentage: 0,
    proposalsThisMonth: 0,
    approvedProposalsThisMonth: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!user?.id) return;

    const fetchStats = async () => {
      try {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        
        // Reset to start of day
        firstDayOfWeek.setHours(0, 0, 0, 0);
        firstDayOfMonth.setHours(0, 0, 0, 0);

        // Buscar propostas
        const { data: proposals } = await supabase
          .from('proposals')
          .select('*')
          .eq('user_id', user.id);

        const totalProposals = proposals?.length || 0;
        
        const proposalsThisWeek = proposals?.filter(p => 
          new Date(p.created_at) >= firstDayOfWeek
        ).length || 0;

        const proposalsThisMonth = proposals?.filter(p => 
          new Date(p.created_at) >= firstDayOfMonth
        ).length || 0;

        const approvedProposalsThisMonth = proposals?.filter(p => 
          p.status === 'approved' && new Date(p.created_at) >= firstDayOfMonth
        ).length || 0;

        const pendingProposals = proposals?.filter(p => 
          p.status === 'sent' || p.status === 'draft'
        ).length || 0;

        // Calcular receita
        const approvedProposals = proposals?.filter(p => p.status === 'approved') || [];
        const totalRevenue = approvedProposals.reduce((sum, p) => sum + (p.total_amount || 0), 0);
        
        const revenueThisMonth = proposals?.filter(p => 
          p.status === 'approved' && new Date(p.created_at) >= firstDayOfMonth
        ).reduce((sum, p) => sum + (p.total_amount || 0), 0) || 0;

        // Buscar clientes
        const { data: clients } = await supabase
          .from('clients')
          .select('*')
          .eq('user_id', user.id);

        const totalClients = clients?.length || 0;
        const newClientsThisMonth = clients?.filter(c => 
          new Date(c.created_at) >= firstDayOfMonth
        ).length || 0;

        // Buscar produtos e categorias
        const { data: products } = await supabase
          .from('products')
          .select('category')
          .eq('user_id', user.id);

        const totalProducts = products?.length || 0;
        const categories = new Set(products?.map(p => p.category).filter(Boolean));
        const totalCategories = categories.size;

        // Calcular taxa de conversão
        const sentProposals = proposals?.filter(p => p.status !== 'draft').length || 0;
        const conversionRate = sentProposals > 0 ? (approvedProposals.length / sentProposals) * 100 : 0;

        // Calcular porcentagem da meta
        const monthlyGoal = 170000; // Pode ser configurável no futuro
        const monthlyGoalPercentage = (revenueThisMonth / monthlyGoal) * 100;

        setStats({
          totalProposals,
          proposalsThisWeek,
          totalClients,
          newClientsThisMonth,
          totalProducts,
          totalCategories,
          conversionRate,
          totalRevenue,
          revenueThisMonth,
          pendingProposals,
          monthlyGoal,
          monthlyGoalPercentage,
          proposalsThisMonth,
          approvedProposalsThisMonth,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: 'Erro ao carregar estatísticas'
        }));
      }
    };

    fetchStats();
  }, [user?.id]);

  return stats;
};