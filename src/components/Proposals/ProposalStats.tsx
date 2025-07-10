import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Edit, Send, Calendar, DollarSign } from 'lucide-react';

interface Stats {
  total: number;
  draft: number;
  sent: number;
  approved: number;
  nfe_issued: number;
  totalValue: number;
}

interface ProposalStatsProps {
  stats: Stats;
  isMobile: boolean;
}

const ProposalStats: React.FC<ProposalStatsProps> = ({ stats, isMobile }) => {
  return (
    <div className={`grid gap-4 mb-8 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-6'}`}>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-commercial-600">Total</p>
              <p className="text-2xl font-bold text-commercial-900">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-primary-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-commercial-600">Rascunhos</p>
              <p className="text-2xl font-bold text-commercial-900">{stats.draft}</p>
            </div>
            <Edit className="w-8 h-8 text-gray-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-commercial-600">Enviadas</p>
              <p className="text-2xl font-bold text-commercial-900">{stats.sent}</p>
            </div>
            <Send className="w-8 h-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-commercial-600">Aprovadas</p>
              <p className="text-2xl font-bold text-commercial-900">{stats.approved}</p>
            </div>
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-commercial-600">NFe Emitida</p>
              <p className="text-2xl font-bold text-commercial-900">{stats.nfe_issued}</p>
            </div>
            <FileText className="w-8 h-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-commercial-600">Valor Aprovado</p>
              <p className="text-xl font-bold text-commercial-900">
                R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProposalStats;