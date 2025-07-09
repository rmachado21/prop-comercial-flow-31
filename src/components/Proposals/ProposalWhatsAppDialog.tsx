import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageCircle } from 'lucide-react';
import { Proposal } from '@/hooks/useProposals';
import { useProposalSend } from '@/hooks/useProposalSend';

interface ProposalWhatsAppDialogProps {
  proposal: Proposal | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ProposalWhatsAppDialog: React.FC<ProposalWhatsAppDialogProps> = ({
  proposal,
  open,
  onClose,
  onSuccess,
}) => {
  const { openWhatsApp, generateWhatsAppMessage } = useProposalSend();
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    if (proposal && open) {
      setPhoneNumber(proposal.client?.phone || '');
    }
  }, [proposal, open]);

  const handleSend = async () => {
    if (!proposal || !phoneNumber) return;

    const result = await openWhatsApp(proposal, phoneNumber);
    
    if (result.success) {
      onSuccess?.();
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
    setPhoneNumber('');
  };

  if (!proposal) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-600" />
            Enviar via WhatsApp - {proposal.proposal_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="phone-number">Telefone do Cliente *</Label>
            <Input
              id="phone-number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="(11) 99999-9999"
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              Formato: (XX) XXXXX-XXXX ou apenas números
            </p>
          </div>

          <div>
            <Label>Prévia da Mensagem</Label>
            <div className="bg-muted p-4 rounded-md border text-sm max-h-48 overflow-y-auto">
              <div 
                className="whitespace-pre-line"
                dangerouslySetInnerHTML={{ 
                  __html: decodeURIComponent(generateWhatsAppMessage(proposal)).replace(/\n/g, '<br />') 
                }} 
              />
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Como funciona:</strong> O WhatsApp será aberto com a mensagem pronta. 
              Você pode revisar e editar antes de enviar manualmente.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSend}
              disabled={!phoneNumber}
              className="bg-green-600 hover:bg-green-700 min-w-[140px]"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Abrir WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalWhatsAppDialog;