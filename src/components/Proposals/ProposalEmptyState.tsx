import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';

interface ProposalEmptyStateProps {
  isFiltered: boolean;
  onNewProposal: () => void;
}

const ProposalEmptyState: React.FC<ProposalEmptyStateProps> = ({ isFiltered, onNewProposal }) => {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <FileText className="w-12 h-12 text-commercial-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-commercial-900 mb-2">
          {isFiltered ? 'Nenhuma proposta encontrada' : 'Nenhuma proposta cadastrada'}
        </h3>
        <p className="text-commercial-600 mb-4">
          {isFiltered 
            ? 'Tente ajustar os filtros de busca.' 
            : 'Comece criando sua primeira proposta comercial.'
          }
        </p>
        {!isFiltered && (
          <Button onClick={onNewProposal} className="bg-gradient-primary hover:bg-primary-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Proposta
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ProposalEmptyState;