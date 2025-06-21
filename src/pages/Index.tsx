
import React from 'react';
import Navbar from '@/components/Navbar';
import WelcomeHeader from '@/components/Dashboard/WelcomeHeader';
import StatsCard from '@/components/Dashboard/StatsCard';
import ActivityFeed from '@/components/Dashboard/ActivityFeed';
import QuickActions from '@/components/Dashboard/QuickActions';
import { 
  FileText, 
  Users, 
  Package, 
  TrendingUp,
  DollarSign,
  Calendar,
  Clock,
  Target
} from 'lucide-react';

const Index = () => {
  // Mock data - In real app, this would come from an API
  const stats = [
    {
      title: 'Propostas',
      value: 24,
      subtitle: '5 esta semana',
      icon: FileText,
      iconColor: 'text-primary-600',
      trend: { value: '+12%', isPositive: true }
    },
    {
      title: 'Clientes',
      value: 18,
      subtitle: '3 novos este mês',
      icon: Users,
      iconColor: 'text-green-600',
      trend: { value: '+20%', isPositive: true }
    },
    {
      title: 'Produtos',
      value: 45,
      subtitle: '8 categorias',
      icon: Package,
      iconColor: 'text-orange-600'
    },
    {
      title: 'Taxa de Conversão',
      value: '68%',
      subtitle: 'vs. mês anterior',
      icon: TrendingUp,
      iconColor: 'text-purple-600',
      trend: { value: '+5%', isPositive: true }
    },
    {
      title: 'Receita Total',
      value: 'R$ 125.600',
      subtitle: 'Este mês',
      icon: DollarSign,
      iconColor: 'text-emerald-600',
      trend: { value: '+18%', isPositive: true }
    },
    {
      title: 'Propostas Pendentes',
      value: 7,
      subtitle: 'Aguardando resposta',
      icon: Clock,
      iconColor: 'text-yellow-600'
    },
    {
      title: 'Meta Mensal',
      value: '85%',
      subtitle: 'R$ 170.000',
      icon: Target,
      iconColor: 'text-blue-600',
      trend: { value: '15% restante', isPositive: false }
    },
    {
      title: 'Agendamentos',
      value: 12,
      subtitle: 'Esta semana',
      icon: Calendar,
      iconColor: 'text-indigo-600',
      trend: { value: '+3', isPositive: true }
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
                  <span className="text-sm text-commercial-600">Propostas Enviadas</span>
                  <span className="font-medium">24</span>
                </div>
                <div className="w-full bg-commercial-200 rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-commercial-600">Propostas Aceitas</span>
                  <span className="font-medium">16</span>
                </div>
                <div className="w-full bg-commercial-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-commercial-600">Receita Gerada</span>
                  <span className="font-medium">R$ 125.600</span>
                </div>
                <div className="w-full bg-commercial-200 rounded-full h-2">
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg card-shadow p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">
                🎯 Meta do Mês
              </h3>
              <p className="text-primary-100 text-sm mb-4">
                Você está quase lá! Faltam apenas R$ 44.400 para atingir sua meta.
              </p>
              <div className="bg-white/20 rounded-full h-3 mb-2">
                <div className="bg-white h-3 rounded-full" style={{ width: '74%' }}></div>
              </div>
              <p className="text-sm text-primary-100">
                74% concluído - R$ 125.600 de R$ 170.000
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
