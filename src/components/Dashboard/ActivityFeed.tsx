
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight, FileText, Users, Package, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDashboardActivities } from '@/hooks/useDashboardActivities';

const ActivityFeed: React.FC = () => {
  const { activities, loading } = useDashboardActivities();

  const getActivityIcon = (type: 'proposta' | 'cliente' | 'produto') => {
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

  const getStatusColor = (status?: 'success' | 'pending' | 'info') => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-commercial-100 text-commercial-600';
    }
  };

  if (loading) {
    return (
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-commercial-900 flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Atividades Recentes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-commercial-400" />
            <span className="ml-2 text-sm text-commercial-500">Carregando atividades...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-commercial-900 flex items-center space-x-2">
          <Clock className="w-5 h-5" />
          <span>Atividades Recentes</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-8 w-8 text-commercial-300 mx-auto mb-2" />
            <p className="text-sm text-commercial-500">Nenhuma atividade recente</p>
            <p className="text-xs text-commercial-400 mt-1">
              Atividades aparecerão aqui quando você criar propostas, clientes ou produtos
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-commercial-50 transition-colors">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-commercial-900 truncate">
                    {activity.title}
                  </p>
                  <p className="text-sm text-commercial-500 truncate">
                    {activity.description}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-commercial-400">{activity.time}</p>
                    {activity.status && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status === 'success' && 'Concluído'}
                        {activity.status === 'pending' && 'Pendente'}
                        {activity.status === 'info' && 'Novo'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <Button asChild variant="ghost" className="w-full mt-4">
          <Link to="/propostas" className="flex items-center justify-center space-x-2">
            <span>Ver todas as propostas</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
