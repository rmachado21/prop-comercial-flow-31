import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Grid, List } from 'lucide-react';

interface ProposalFiltersProps {
  searchTerm: string;
  statusFilter: string;
  viewMode: 'grid' | 'list';
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onViewModeChange: (value: 'grid' | 'list') => void;
}

const ProposalFilters: React.FC<ProposalFiltersProps> = ({
  searchTerm,
  statusFilter,
  viewMode,
  onSearchChange,
  onStatusChange,
  onViewModeChange,
}) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-commercial-400" />
              <Input
                placeholder="Buscar por título, número ou cliente..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-commercial-600" />
              <select
                value={statusFilter}
                onChange={(e) => onStatusChange(e.target.value)}
                className="px-3 py-2 border border-commercial-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-48"
              >
                <option value="all">Todos os Status</option>
                <option value="draft">Rascunho</option>
                <option value="sent">Enviada</option>
                <option value="approved">Aprovada</option>
                <option value="rejected">Cancelada</option>
                <option value="expired">Expirada</option>
                <option value="nfe_issued">NFe Emitida</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProposalFilters;