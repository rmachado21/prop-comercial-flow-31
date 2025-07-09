
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Mail, MessageCircle, Send, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Proposal } from '@/hooks/useProposals';
import { useProposalSend, ProposalSend } from '@/hooks/useProposalSend';

interface ProposalSendDialogProps {
  proposal: Proposal | null;
  open: boolean;
  onClose: () => void;
}

const ProposalSendDialog: React.FC<ProposalSendDialogProps> = ({
  proposal,
  open,
  onClose,
}) => {
  const { sendProposalByEmail, openWhatsApp, generateWhatsAppMessage, getProposalSends, isSending } = useProposalSend();
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [sendHistory, setSendHistory] = useState<ProposalSend[]>([]);

  useEffect(() => {
    if (proposal && open) {
      // Set default values from client
      setEmailRecipient(proposal.client?.email || '');
      setPhoneNumber(proposal.client?.phone || '');
      setEmailSubject(`Proposta Comercial - ${proposal.proposal_number}`);
      
      const defaultMessage = `
Prezado(a) ${proposal.client?.name || 'Cliente'},

Segue em anexo nossa proposta comercial conforme solicitado.

**Detalhes da Proposta:**
- Número: ${proposal.proposal_number}
- Título: ${proposal.title}
- Valor Total: R$ ${proposal.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
${proposal.validity_days ? `- Validade: ${proposal.validity_days} dias` : ''}

Ficamos à disposição para esclarecimentos.

Atenciosamente,
Equipe Comercial
      `.trim();
      
      setEmailMessage(defaultMessage);

      // Load send history
      loadSendHistory();
    }
  }, [proposal, open]);

  const loadSendHistory = async () => {
    if (proposal) {
      const history = await getProposalSends(proposal.id);
      setSendHistory(history);
    }
  };

  const handleSendEmail = async () => {
    if (!proposal || !emailRecipient) return;

    const result = await sendProposalByEmail(
      proposal,
      emailRecipient,
      emailSubject,
      emailMessage
    );

    if (result.success) {
      await loadSendHistory();
    }
  };

  const handleOpenWhatsApp = async () => {
    if (!proposal || !phoneNumber) return;

    const result = await openWhatsApp(proposal, phoneNumber);
    
    if (result.success) {
      await loadSendHistory();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Send className="w-4 h-4 text-blue-600" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      sent: 'Enviado',
      delivered: 'Entregue',
      failed: 'Falhou',
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (!proposal) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Enviar Proposta - {proposal.proposal_number}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="send" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="send">Enviar Proposta</TabsTrigger>
            <TabsTrigger value="history">Histórico de Envios</TabsTrigger>
          </TabsList>

          <TabsContent value="send" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary-600" />
                  <h3 className="text-lg font-semibold">Envio por Email</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="email-recipient">Email do Cliente</Label>
                    <Input
                      id="email-recipient"
                      type="email"
                      value={emailRecipient}
                      onChange={(e) => setEmailRecipient(e.target.value)}
                      placeholder="cliente@exemplo.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email-subject">Assunto</Label>
                    <Input
                      id="email-subject"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Assunto do email"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email-message">Mensagem</Label>
                    <Textarea
                      id="email-message"
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      rows={8}
                      placeholder="Mensagem do email"
                    />
                  </div>

                  <Button
                    onClick={handleSendEmail}
                    disabled={!emailRecipient || isSending}
                    className="w-full"
                  >
                    {isSending ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Enviar por Email
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* WhatsApp Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold">Envio via WhatsApp</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="phone-number">Telefone do Cliente</Label>
                    <Input
                      id="phone-number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div>
                    <Label>Prévia da Mensagem</Label>
                    <div className="bg-gray-50 p-3 rounded-md border text-sm">
                      <div dangerouslySetInnerHTML={{ 
                        __html: decodeURIComponent(generateWhatsAppMessage(proposal)).replace(/\n/g, '<br />') 
                      }} />
                    </div>
                  </div>

                  <Button
                    onClick={handleOpenWhatsApp}
                    disabled={!phoneNumber}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Abrir WhatsApp
                  </Button>

                  <p className="text-sm text-gray-600">
                    * O WhatsApp será aberto com a mensagem pronta. Você deve enviar manualmente.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <h3 className="text-lg font-semibold">Histórico de Envios</h3>
            
            {sendHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Send className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum envio registrado para esta proposta</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sendHistory.map((send) => (
                  <div key={send.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {send.send_method === 'email' ? (
                          <Mail className="w-4 h-4 text-blue-600" />
                        ) : (
                          <MessageCircle className="w-4 h-4 text-green-600" />
                        )}
                        <span className="font-medium capitalize">{send.send_method}</span>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getStatusIcon(send.status)}
                          {getStatusLabel(send.status)}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(send.sent_at).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600">
                      <strong>Destinatário:</strong> {send.recipient}
                    </p>
                    
                    {send.error_message && (
                      <p className="text-sm text-red-600 mt-1">
                        <strong>Erro:</strong> {send.error_message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalSendDialog;
