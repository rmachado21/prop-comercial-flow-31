import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const ProposalLoadingState: React.FC = () => {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-commercial-600">Carregando propostas...</p>
      </CardContent>
    </Card>
  );
};

export default ProposalLoadingState;