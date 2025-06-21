
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight, FileText, Users, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Activity {
  id: string;
  type: 'proposta' | 'cliente' | 'produto';
  title: string;
  description: string;
  time: string;
  status?: 'success' | 'pending' | 'info';
}

const ActivityFeed: React.FC = () => {
  const activities: Activity[] = [
    {
      id: '1',
      type: 'proposta',
      title: 'Nova proposta criada',
      description: 'Proposta #001 para TechCorp Ltda',
      time: '2 horas atrás',
      status: 'success'
    },
    {
      id: '2',
      type: 'cliente',
      title: 'Cliente cadastrado',
      description: 'Inovação Digital Ltda',
      time: '4 horas atrás',
      status: 'info'
    },
    {
      id: '3',
      type: 'proposta',
      title: 'Proposta enviada',
      description: 'Proposta #002 para StartupXYZ',
      time: '1 dia atrás',
      status: 'pending'
    },
    {
      id: '4',
      type: 'produto',
      title: 'Produto atualizado',
      description: 'Preço do Produto ABC alterado',
      time: '2 dias atrás',
      status: 'info'
    }
  ];

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'proposta':
        return <FileText className="w-4 h-4 text-primary-600" />;
      case 'cliente':
        return <Users className="w-4 h-4 text-green-600" />;
      case 'produto':
        return <Package className="w-4 h-4 text-orange-600" />;
      default:
        return <Clock className="w-4 h-4 text-commercial-400" />;
    }
  };

  const getStatusColor = (status?: Activity['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 border-l-green-500';
      case 'pending':
        return 'bg-yellow-100 border-l-yellow-500';
      case 'info':
        return 'bg-blue-100 border-l-blue-500';
      default:
        return 'bg-commercial-50 border-l-commercial-300';
    }
  };

  return (
    <Card className="card-shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-commercial-900 flex items-center space-x-2">
          <Clock className="w-5 h-5" />
          <span>Atividades Recentes</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className={`p-3 rounded-lg border-l-4 ${getStatusColor(activity.status)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-commercial-900">
                    {activity.title}
                  </p>
                  <p className="text-sm text-commercial-600">
                    {activity.description}
                  </p>
                  <p className="text-xs text-commercial-500 mt-1">
                    {activity.time}
                  </p>
                </div>
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
  );
};

export default ActivityFeed;
