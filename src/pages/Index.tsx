
import React from 'react';
import Navbar from '@/components/Navbar';
import WelcomeHeader from '@/components/Dashboard/WelcomeHeader';
import StatsCard from '@/components/Dashboard/StatsCard';
import ActivityFeed from '@/components/Dashboard/ActivityFeed';
import QuickActions from '@/components/Dashboard/QuickActions';
import ContestedProposalBanner from '@/components/Dashboard/ContestedProposalBanner';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  FileText, 
  Users, 
  TrendingUp,
  DollarSign
} from 'lucide-react';

const Index = () => {
  const dashboardStats = useDashboardStats();
  const isMobile = useIsMobile();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${Math.round(value)}%`;
  };

  const stats = [
    {
      title: 'Propostas',
      value: dashboardStats.totalProposals,
      subtitle: `${dashboardStats.proposalsThisWeek} esta semana`,
      icon: FileText,
      iconColor: 'text-primary-600',
      trend: dashboardStats.proposalsThisWeek > 0 ? { value: `+${dashboardStats.proposalsThisWeek}`, isPositive: true } : undefined
    },
    {
      title: 'Clientes',
      value: dashboardStats.totalClients,
      subtitle: `${dashboardStats.newClientsThisMonth} novos este mês`,
      icon: Users,
      iconColor: 'text-green-600',
      trend: dashboardStats.newClientsThisMonth > 0 ? { value: `+${dashboardStats.newClientsThisMonth}`, isPositive: true } : undefined
    },
    {
      title: 'Taxa de Conversão',
      value: formatPercentage(dashboardStats.conversionRate),
      subtitle: 'Este mês',
      icon: TrendingUp,
      iconColor: 'text-purple-600',
      trend: dashboardStats.conversionRate > 50 ? { value: 'Boa taxa', isPositive: true } : undefined
    },
    {
      title: 'Receita Este Mês',
      value: formatCurrency(dashboardStats.revenueThisMonth),
      subtitle: `Total: ${formatCurrency(dashboardStats.totalRevenue)}`,
      icon: DollarSign,
      iconColor: 'text-emerald-600',
      trend: dashboardStats.revenueThisMonth > 0 ? { value: 'Em crescimento', isPositive: true } : undefined
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeHeader />

        {/* Contested Proposals Banner */}
        <ContestedProposalBanner />

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActions />
        </div>

        {/* Stats Grid */}
        {dashboardStats.loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg card-shadow p-3 lg:p-6">
                <div className="animate-pulse">
                  <div className="flex items-center justify-between mb-2 lg:mb-4">
                    <div className="h-3 lg:h-4 bg-commercial-200 rounded w-16 lg:w-24"></div>
                    <div className="h-3 lg:h-4 bg-commercial-200 rounded w-3 lg:w-4"></div>
                  </div>
                  <div className="h-6 lg:h-8 bg-commercial-200 rounded w-12 lg:w-16 mb-1 lg:mb-2"></div>
                  <div className="h-2 lg:h-3 bg-commercial-200 rounded w-16 lg:w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-8">
            {stats.map((stat, index) => (
              <StatsCard
                key={index}
                title={stat.title}
                value={stat.value}
                subtitle={stat.subtitle}
                icon={stat.icon}
                iconColor={stat.iconColor}
                trend={stat.trend}
                compact={isMobile}
              />
            ))}
          </div>
        )}

        {/* Activity Feed and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActivityFeed />
          
          {/* Performance Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg card-shadow p-6">
              <h3 className="text-lg font-semibold text-commercial-900 mb-4">
                Performance Este Mês
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-commercial-600">Produtos</span>
                  <span className="font-medium">{dashboardStats.totalProducts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-commercial-500">Categorias</span>
                  <span className="text-sm text-commercial-600">{dashboardStats.totalCategories}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-commercial-600">Propostas Pendentes</span>
                  <span className="font-medium">{dashboardStats.pendingProposals}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-commercial-500">Aguardando resposta</span>
                  <span className="text-sm text-commercial-600">Este mês</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-commercial-600">Propostas Aprovadas</span>
                  <span className="font-medium">{dashboardStats.approvedProposalsThisMonth}</span>
                </div>
                <div className="w-full bg-commercial-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${dashboardStats.proposalsThisMonth > 0 ? (dashboardStats.approvedProposalsThisMonth / dashboardStats.proposalsThisMonth) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
