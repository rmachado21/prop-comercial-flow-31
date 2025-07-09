import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Clock } from 'lucide-react';
import { Proposal } from '@/hooks/useProposals';
import { useProposalSend } from '@/hooks/useProposalSend';

interface ProposalEmailDialogProps {
  proposal: Proposal | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ProposalEmailDialog: React.FC<ProposalEmailDialogProps> = ({
  proposal,
  open,
  onClose,
  onSuccess,
}) => {
  const { sendProposalByEmail, isSending } = useProposalSend();
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (proposal && open) {
      setRecipient(proposal.client?.email || '');
      setSubject(`Proposta Comercial - ${proposal.proposal_number}`);
      
      const defaultMessage = `
Prezado(a) ${proposal.client?.name || 'Cliente'},

Segue nossa proposta comercial conforme solicitado.

**Detalhes da Proposta:**
- Número: ${proposal.proposal_number}
- Título: ${proposal.title}
- Valor Total: R$ ${proposal.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
${proposal.validity_days ? `- Validade: ${proposal.validity_days} dias` : ''}

Ficamos à disposição para esclarecimentos.

Atenciosamente,
Equipe Comercial
      `.trim();
      
      setMessage(defaultMessage);
    }
  }, [proposal, open]);

  const handleSend = async () => {
    if (!proposal || !recipient) return;

    const result = await sendProposalByEmail(proposal, recipient, subject, message);

    if (result.success) {
      onSuccess?.();
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form when closing
    setRecipient('');
    setSubject('');
    setMessage('');
  };

  if (!proposal) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            Enviar por Email - {proposal.proposal_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="email-recipient">Email do Cliente *</Label>
            <Input
              id="email-recipient"
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="cliente@exemplo.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="email-subject">Assunto *</Label>
            <Input
              id="email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Assunto do email"
              required
            />
          </div>

          <div>
            <Label htmlFor="email-message">Mensagem</Label>
            <Textarea
              id="email-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={12}
              placeholder="Mensagem do email"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSend}
              disabled={!recipient || !subject || isSending}
              className="min-w-[120px]"
            >
              {isSending ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar Email
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalEmailDialog;