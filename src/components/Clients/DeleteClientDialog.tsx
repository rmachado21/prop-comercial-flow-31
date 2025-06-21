
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

interface Client {
  id: string;
  name: string;
}

interface DeleteClientDialogProps {
  client: Client | null;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const DeleteClientDialog: React.FC<DeleteClientDialogProps> = ({
  client,
  onClose,
  onConfirm,
  isLoading
}) => {
  if (!client) return null;

  return (
    <Dialog open={!!client} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Tem certeza que deseja excluir o cliente <strong>{client.name}</strong>?
            Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end space-x-4 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Excluindo...</span>
              </div>
            ) : (
              'Excluir'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteClientDialog;
