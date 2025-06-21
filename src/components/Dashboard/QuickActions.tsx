
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileText, Users, Package, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const QuickActions: React.FC = () => {
  const primaryActions = [
    {
      href: '/propostas/nova',
      label: 'Nova Proposta',
      icon: Plus,
      variant: 'default' as const,
      className: 'bg-gradient-primary hover:bg-primary-700'
    },
    {
      href: '/clientes/novo',
      label: 'Novo Cliente',
      icon: Users,
      variant: 'outline' as const
    },
    {
      href: '/produtos/novo',
      label: 'Novo Produto',
      icon: Package,
      variant: 'outline' as const
    }
  ];

  const quickLinks = [
    {
      href: '/propostas',
      title: 'Gerenciar Propostas',
      description: 'Ver todas as propostas',
      icon: FileText,
      iconColor: 'text-primary-600'
    },
    {
      href: '/clientes',
      title: 'Base de Clientes',
      description: 'Gerenciar contatos',
      icon: Users,
      iconColor: 'text-green-600'
    },
    {
      href: '/produtos',
      title: 'Catálogo de Produtos',
      description: 'Preços e disponibilidade',
      icon: Package,
      iconColor: 'text-orange-600'
    },
    {
      href: '/relatorios',
      title: 'Relatórios',
      description: 'Análises e métricas',
      icon: TrendingUp,
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Primary Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {primaryActions.map((action) => {
          const Icon = action.icon;
          return (
            <Button 
              key={action.href}
              asChild 
              variant={action.variant}
              className={`h-16 ${action.className || ''}`}
            >
              <Link to={action.href} className="flex items-center justify-center space-x-2">
                <Icon className="w-5 h-5" />
                <span>{action.label}</span>
              </Link>
            </Button>
          );
        })}
      </div>

      {/* Quick Links */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-commercial-900">
            Acesso Rápido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Button key={link.href} asChild variant="ghost" className="justify-start h-12">
                  <Link to={link.href} className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${link.iconColor}`} />
                    <div className="text-left">
                      <p className="font-medium">{link.title}</p>
                      <p className="text-xs text-commercial-500">{link.description}</p>
                    </div>
                  </Link>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickActions;
