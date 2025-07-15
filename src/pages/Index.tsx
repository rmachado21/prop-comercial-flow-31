
import React from 'react';
import Navbar from '@/components/Navbar';
import WelcomeHeader from '@/components/Dashboard/WelcomeHeader';
import StatsCard from '@/components/Dashboard/StatsCard';
import ActivityFeed from '@/components/Dashboard/ActivityFeed';
import QuickActions from '@/components/Dashboard/QuickActions';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { 
  FileText, 
  Users, 
  Package, 
  TrendingUp,
  DollarSign,
  Clock,
  Target,
  Loader2
} from 'lucide-react';

const Index = () => {
  const dashboardStats = useDashboardStats();

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
      title: 'Produtos',
      value: dashboardStats.totalProducts,
      subtitle: `${dashboardStats.totalCategories} categorias`,
      icon: Package,
      iconColor: 'text-orange-600'
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
    },
    {
      title: 'Propostas Pendentes',
      value: dashboardStats.pendingProposals,
      subtitle: 'Aguardando resposta',
      icon: Clock,
      iconColor: 'text-yellow-600'
    },
    {
      title: 'Meta Mensal',
      value: formatPercentage(dashboardStats.monthlyGoalPercentage),
      subtitle: formatCurrency(dashboardStats.monthlyGoal),
      icon: Target,
      iconColor: 'text-blue-600',
      trend: dashboardStats.monthlyGoalPercentage < 100 ? 
        { value: `${formatCurrency(dashboardStats.monthlyGoal - dashboardStats.revenueThisMonth)} restante`, isPositive: false } : 
        { value: 'Meta atingida!', isPositive: true }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeHeader />

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActions />
        </div>

        {/* Stats Grid */}
        {dashboardStats.loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(7)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg card-shadow p-6">
                <div className="animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-4 bg-commercial-200 rounded w-24"></div>
                    <div className="h-4 bg-commercial-200 rounded w-4"></div>
                  </div>
                  <div className="h-8 bg-commercial-200 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-commercial-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <StatsCard
                key={index}
                title={stat.title}
                value={stat.value}
                subtitle={stat.subtitle}
                icon={stat.icon}
                iconColor={stat.iconColor}
                trend={stat.trend}
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
                  <span className="text-sm text-commercial-600">Propostas Este Mês</span>
                  <span className="font-medium">{dashboardStats.proposalsThisMonth}</span>
                </div>
                <div className="w-full bg-commercial-200 rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${Math.min((dashboardStats.proposalsThisMonth / 30) * 100, 100)}%` }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-commercial-600">Propostas Aprovadas</span>
                  <span className="font-medium">{dashboardStats.approvedProposalsThisMonth}</span>
                </div>
                <div className="w-full bg-commercial-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${dashboardStats.proposalsThisMonth > 0 ? (dashboardStats.approvedProposalsThisMonth / dashboardStats.proposalsThisMonth) * 100 : 0}%` }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-commercial-600">Receita Este Mês</span>
                  <span className="font-medium">{formatCurrency(dashboardStats.revenueThisMonth)}</span>
                </div>
                <div className="w-full bg-commercial-200 rounded-full h-2">
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${Math.min(dashboardStats.monthlyGoalPercentage, 100)}%` }}></div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg card-shadow p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">
                🎯 Meta do Mês
              </h3>
              <p className="text-primary-100 text-sm mb-4">
                {dashboardStats.monthlyGoalPercentage >= 100 
                  ? 'Parabéns! Você atingiu sua meta mensal!' 
                  : `Faltam ${formatCurrency(dashboardStats.monthlyGoal - dashboardStats.revenueThisMonth)} para atingir sua meta.`
                }
              </p>
              <div className="bg-white/20 rounded-full h-3 mb-2">
                <div className="bg-white h-3 rounded-full" style={{ width: `${Math.min(dashboardStats.monthlyGoalPercentage, 100)}%` }}></div>
              </div>
              <p className="text-sm text-primary-100">
                {formatPercentage(dashboardStats.monthlyGoalPercentage)} concluído - {formatCurrency(dashboardStats.revenueThisMonth)} de {formatCurrency(dashboardStats.monthlyGoal)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
