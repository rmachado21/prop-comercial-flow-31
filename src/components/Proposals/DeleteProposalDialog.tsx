
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, X } from 'lucide-react';
import { useProposals, Proposal } from '@/hooks/useProposals';

interface DeleteProposalDialogProps {
  proposal: Proposal;
  onClose: () => void;
}

const DeleteProposalDialog: React.FC<DeleteProposalDialogProps> = ({ 
  proposal, 
  onClose 
}) => {
  const { deleteProposal } = useProposals();

  const handleDelete = async () => {
    await deleteProposal(proposal.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Confirmar Exclusão
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-commercial-600">
              Tem certeza que deseja excluir a proposta "{proposal.title}"?
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                <strong>Atenção:</strong> Esta ação não pode ser desfeita. 
                A proposta e todos os seus itens serão permanentemente removidos.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
              >
                Excluir Proposta
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeleteProposalDialog;
