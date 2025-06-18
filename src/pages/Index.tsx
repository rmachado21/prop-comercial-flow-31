
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Users, 
  Package, 
  TrendingUp,
  Plus,
  ArrowRight,
  DollarSign,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const { user } = useAuth();

  // Mock data - In real app, this would come from an API
  const stats = {
    propostas: { total: 24, recentes: 5, valor: 'R$ 125.600' },
    clientes: { total: 18, novos: 3 },
    produtos: { total: 45, categorias: 8 },
    conversao: { taxa: '68%', tendencia: '+5%' }
  };

  const recentActivity = [
    { type: 'proposta', title: 'Proposta #001 criada', client: 'TechCorp Ltda', time: '2 horas atrás' },
    { type: 'cliente', title: 'Novo cliente cadastrado', client: 'Inovação Digital', time: '4 horas atrás' },
    { type: 'proposta', title: 'Proposta #002 enviada', client: 'StartupXYZ', time: '1 dia atrás' },
  ];

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-commercial-900">
            Olá, {user?.name}! 👋
          </h1>
          <p className="text-commercial-600 mt-2">
            Bem-vindo ao seu painel de controle. Aqui está um resumo das suas atividades.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button asChild className="h-16 bg-gradient-primary hover:bg-primary-700">
            <Link to="/propostas/nova" className="flex items-center justify-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Nova Proposta</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-16">
            <Link to="/clientes/novo" className="flex items-center justify-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Novo Cliente</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-16">
            <Link to="/produtos/novo" className="flex items-center justify-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Novo Produto</span>
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Propostas */}
          <Card className="card-shadow hover:card-shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-commercial-600">
                Propostas
              </CardTitle>
              <FileText className="h-4 w-4 text-primary-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-commercial-900">{stats.propostas.total}</div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-commercial-500">
                  {stats.propostas.recentes} esta semana
                </p>
                <p className="text-xs font-medium text-green-600">
                  {stats.propostas.valor}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Clientes */}
          <Card className="card-shadow hover:card-shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-commercial-600">
                Clientes
              </CardTitle>
              <Users className="h-4 w-4 text-primary-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-commercial-900">{stats.clientes.total}</div>
              <p className="text-xs text-commercial-500 mt-2">
                +{stats.clientes.novos} novos este mês
              </p>
            </CardContent>
          </Card>

          {/* Produtos */}
          <Card className="card-shadow hover:card-shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-commercial-600">
                Produtos
              </CardTitle>
              <Package className="h-4 w-4 text-primary-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-commercial-900">{stats.produtos.total}</div>
              <p className="text-xs text-commercial-500 mt-2">
                {stats.produtos.categorias} categorias
              </p>
            </CardContent>
          </Card>

          {/* Taxa de Conversão */}
          <Card className="card-shadow hover:card-shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-commercial-600">
                Taxa de Conversão
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-commercial-900">{stats.conversao.taxa}</div>
              <p className="text-xs text-green-600 mt-2">
                {stats.conversao.tendencia} vs. mês anterior
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity and Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-commercial-900 flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Atividades Recentes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-commercial-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'proposta' ? 'bg-primary-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-commercial-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-commercial-600">
                        {activity.client}
                      </p>
                      <p className="text-xs text-commercial-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button asChild variant="ghost" className="w-full mt-4">
                <Link to="/atividades" className="flex items-center justify-center space-x-2">
                  <span>Ver todas as atividades</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-commercial-900">
                Acesso Rápido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                <Button asChild variant="ghost" className="justify-start h-12">
                  <Link to="/propostas" className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-primary-600" />
                    <div className="text-left">
                      <p className="font-medium">Gerenciar Propostas</p>
                      <p className="text-xs text-commercial-500">Ver todas as propostas</p>
                    </div>
                  </Link>
                </Button>
                
                <Button asChild variant="ghost" className="justify-start h-12">
                  <Link to="/clientes" className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-green-600" />
                    <div className="text-left">
                      <p className="font-medium">Base de Clientes</p>
                      <p className="text-xs text-commercial-500">Gerenciar contatos</p>
                    </div>
                  </Link>
                </Button>
                
                <Button asChild variant="ghost" className="justify-start h-12">
                  <Link to="/produtos" className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-orange-600" />
                    <div className="text-left">
                      <p className="font-medium">Catálogo de Produtos</p>
                      <p className="text-xs text-commercial-500">Preços e disponibilidade</p>
                    </div>
                  </Link>
                </Button>
                
                <Button asChild variant="ghost" className="justify-start h-12">
                  <Link to="/relatorios" className="flex items-center space-x-3">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                    <div className="text-left">
                      <p className="font-medium">Relatórios</p>
                      <p className="text-xs text-commercial-500">Análises e métricas</p>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
