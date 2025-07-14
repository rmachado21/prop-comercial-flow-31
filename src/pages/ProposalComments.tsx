import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, MessageCircle, FileText, User, DollarSign } from 'lucide-react';
import { useProposalApproval, ProposalForApproval } from '@/hooks/useProposalApproval';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const ProposalComments = () => {
  const { token } = useParams<{ token: string }>();
  const { validateToken } = useProposalApproval();
  const [proposal, setProposal] = useState<ProposalForApproval | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [comments, setComments] = useState('');

  useEffect(() => {
    const loadProposal = async () => {
      if (!token) {
        setError('Token não fornecido');
        setIsLoading(false);
        return;
      }

      try {
        const result = await validateToken(token);
        if (result.isValid && result.proposal) {
          setProposal(result.proposal);
          // Pre-fill client data if available
          if (result.proposal.client) {
            setClientName(result.proposal.client.name);
            setClientEmail(result.proposal.client.email);
          }
        } else {
          setError(result.error || 'Token inválido');
        }
      } catch (err) {
        setError('Erro ao validar token');
      } finally {
        setIsLoading(false);
      }
    };

    loadProposal();
  }, [token, validateToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token || !comments.trim()) {
      toast.error('Por favor, preencha suas observações');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get client IP
      const clientIP = await fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => data.ip)
        .catch(() => null);

      const { data, error } = await supabase.functions.invoke('submit-client-comments', {
        body: {
          token,
          clientName: clientName.trim(),
          clientEmail: clientEmail.trim(),
          comments: comments.trim(),
          clientIP,
          userAgent: navigator.userAgent
        }
      });

      if (error) {
        throw new Error(error.message || 'Erro ao enviar observações');
      }

      if (data.success) {
        setSuccess(true);
        toast.success('Observações enviadas com sucesso!');
      } else {
        throw new Error(data.error || 'Erro ao enviar observações');
      }
    } catch (error: any) {
      console.error('Error submitting comments:', error);
      toast.error(error.message || 'Erro ao enviar observações');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando proposta...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Erro</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-green-600">Sucesso!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <MessageCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Suas observações foram enviadas com sucesso. A empresa responsável foi notificada e entrará em contato em breve.
            </p>
            <p className="text-sm text-muted-foreground">
              Você pode fechar esta janela.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Proposta não encontrada</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              Não foi possível carregar a proposta.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Adicionar Observações</h1>
          <p className="text-muted-foreground">
            Adicione suas observações e sugestões sobre a proposta abaixo
          </p>
        </div>

        {/* Proposal Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detalhes da Proposta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Título</Label>
                <p className="font-medium">{proposal.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Valor Total</Label>
                <p className="font-medium text-green-600">
                  R$ {proposal.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {proposal.description && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Descrição</Label>
                <p className="text-sm">{proposal.description}</p>
              </div>
            )}

            {proposal.items && proposal.items.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Itens da Proposta</Label>
                <div className="mt-2 space-y-2">
                  {proposal.items.map((item, index) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantidade: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          R$ {item.total_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Unit: R$ {item.unit_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comments Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Suas Observações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientName">Nome *</Label>
                  <Input
                    id="clientName"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="clientEmail">Email</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="comments">Observações *</Label>
                <Textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Escreva suas observações, sugestões ou dúvidas sobre a proposta..."
                  rows={6}
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Descreva suas observações de forma clara e detalhada.
                </p>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || !comments.trim()}
                  className="px-8"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Enviar Observações
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProposalComments;