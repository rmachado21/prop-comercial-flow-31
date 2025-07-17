import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Mail, Clock, CheckCircle, XCircle, AlertCircle, Calendar, Building2 } from 'lucide-react';
import { Proposal } from '@/hooks/useProposals';
import { useProposalSend, ProposalSend } from '@/hooks/useProposalSend';
import { useCompanyData } from '@/hooks/useCompanyData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  const { sendProposalByEmail, getProposalSends, isSending } = useProposalSend();
  const { company } = useCompanyData();
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const [sendHistory, setSendHistory] = useState<ProposalSend[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    if (proposal && open) {
      setRecipient(proposal.client?.email || '');
      setSubject(`Proposta Comercial - ${proposal.proposal_number}`);
      setSenderName(company?.name || 'Propostas Online');
      
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
      loadSendHistory();
    }
  }, [proposal, open, company]);

  const loadSendHistory = async () => {
    if (!proposal) return;
    
    setIsLoadingHistory(true);
    try {
      const history = await getProposalSends(proposal.id);
      setSendHistory(history);
    } catch (error) {
      console.error('Error loading send history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSend = async () => {
    if (!proposal || !recipient) return;

    const result = await sendProposalByEmail(proposal, recipient, subject, message, senderName);

    if (result.success) {
      await loadSendHistory(); // Refresh history after sending
      onSuccess?.();
      onClose();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-700" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      sent: 'Enviado',
      delivered: 'Entregue',
      failed: 'Falhou'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const handleClose = () => {
    onClose();
    // Reset form when closing
    setRecipient('');
    setSubject('');
    setMessage('');
    setSenderName('');
  };

  if (!proposal) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            Enviar por Email - {proposal.proposal_number}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="send" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="send">Enviar Email</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="send" className="space-y-4 mt-4">
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
              <Label htmlFor="email-sender" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Remetente
              </Label>
              <Input
                id="email-sender"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Nome da empresa"
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
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Histórico de Envios</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadSendHistory}
                  disabled={isLoadingHistory}
                >
                  {isLoadingHistory ? (
                    <Clock className="w-4 h-4 animate-spin" />
                  ) : (
                    'Atualizar'
                  )}
                </Button>
              </div>

              <div className="max-h-[400px] overflow-y-auto space-y-3">
                {isLoadingHistory ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="w-6 h-6 mx-auto mb-2 animate-spin" />
                    Carregando histórico...
                  </div>
                ) : sendHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="w-6 h-6 mx-auto mb-2" />
                    Nenhum envio registrado para esta proposta
                  </div>
                ) : (
                  sendHistory.map((send) => (
                    <div
                      key={send.id}
                      className="border rounded-lg p-4 space-y-2 bg-card"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(send.status)}
                          <Badge variant="outline">
                            {getStatusLabel(send.status)}
                          </Badge>
                          <Badge variant="secondary">
                            {send.send_method === 'email' ? 'Email' : 'WhatsApp'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(send.sent_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <p><strong>Destinatário:</strong> {send.recipient}</p>
                        {send.error_message && (
                          <p className="text-red-600">
                            <strong>Erro:</strong> {send.error_message}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalEmailDialog;