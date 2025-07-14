import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProposalApproval, ProposalForApproval } from '@/hooks/useProposalApproval';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

type ApprovalState = 'loading' | 'valid' | 'invalid' | 'confirming' | 'success' | 'error';

export default function ProposalApproval() {
  const { token } = useParams<{ token: string }>();
  const { validateToken, approveProposal, isLoading, isApproving } = useProposalApproval();
  
  const [state, setState] = useState<ApprovalState>('loading');
  const [proposal, setProposal] = useState<ProposalForApproval | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setState('invalid');
      setErrorMessage('Token não encontrado na URL');
      return;
    }

    const validate = async () => {
      const { isValid, proposal, error } = await validateToken(token);
      
      if (isValid && proposal) {
        setProposal(proposal);
        setState('valid');
        // Pre-fill client name if available
        setClientName(proposal.client.name || '');
      } else {
        setState('invalid');
        setErrorMessage(error || 'Token inválido');
      }
    };

    validate();
  }, [token, validateToken]);

  const handleApprove = async () => {
    if (!token) return;

    setState('confirming');
    const { success, error } = await approveProposal(token, clientName);
    
    if (success) {
      setState('success');
    } else {
      setState('error');
      setErrorMessage(error || 'Erro ao aprovar proposta');
    }
  };

  const getStateIcon = () => {
    switch (state) {
      case 'loading':
        return <Clock className="w-12 h-12 text-muted-foreground animate-spin" />;
      case 'valid':
        return <AlertCircle className="w-12 h-12 text-warning" />;
      case 'success':
        return <CheckCircle className="w-12 h-12 text-success" />;
      case 'invalid':
      case 'error':
        return <XCircle className="w-12 h-12 text-destructive" />;
      default:
        return null;
    }
  };

  const getStateTitle = () => {
    switch (state) {
      case 'loading':
        return 'Carregando proposta...';
      case 'valid':
        return 'Aprovação de Proposta';
      case 'confirming':
        return 'Processando aprovação...';
      case 'success':
        return 'Proposta Aprovada!';
      case 'invalid':
        return 'Link Inválido';
      case 'error':
        return 'Erro na Aprovação';
      default:
        return '';
    }
  };

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6 pb-6 space-y-4">
            {getStateIcon()}
            <h1 className="text-xl font-semibold">{getStateTitle()}</h1>
            <p className="text-muted-foreground">Verificando as informações da proposta...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state === 'invalid') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6 pb-6 space-y-4">
            {getStateIcon()}
            <h1 className="text-xl font-semibold text-destructive">{getStateTitle()}</h1>
            <p className="text-muted-foreground">{errorMessage}</p>
            <p className="text-sm text-muted-foreground">
              Entre em contato com o responsável pela proposta se você acredita que isso é um erro.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6 pb-6 space-y-4">
            {getStateIcon()}
            <h1 className="text-xl font-semibold text-success">{getStateTitle()}</h1>
            <p className="text-muted-foreground">
              Obrigado por aprovar nossa proposta! Entraremos em contato em breve para dar continuidade ao projeto.
            </p>
            <div className="pt-4">
              <Badge variant="outline" className="text-success border-success">
                Proposta #{proposal?.id.slice(0, 8).toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6 pb-6 space-y-4">
            {getStateIcon()}
            <h1 className="text-xl font-semibold text-destructive">{getStateTitle()}</h1>
            <p className="text-muted-foreground">{errorMessage}</p>
            <Button 
              onClick={() => setState('valid')} 
              variant="outline"
              className="mt-4"
            >
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!proposal) return null;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            {getStateIcon()}
            <div>
              <h1 className="text-2xl font-bold">{getStateTitle()}</h1>
              <p className="text-muted-foreground">
                Revise os detalhes abaixo e confirme se deseja aprovar esta proposta.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Company Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da Empresa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <strong>{proposal.company.name}</strong>
            </div>
            {proposal.company.email && (
              <div className="text-muted-foreground">
                Email: {proposal.company.email}
              </div>
            )}
            {proposal.company.phone && (
              <div className="text-muted-foreground">
                Telefone: {proposal.company.phone}
              </div>
            )}
            {proposal.company.address && (
              <div className="text-muted-foreground">
                Endereço: {proposal.company.address}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Proposal Details */}
        <Card>
          <CardHeader>
            <CardTitle>{proposal.title}</CardTitle>
            <Badge variant="outline">
              Proposta #{proposal.id.slice(0, 8).toUpperCase()}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {proposal.description && (
              <div>
                <Label className="font-medium">Descrição</Label>
                <p className="text-muted-foreground mt-1">{proposal.description}</p>
              </div>
            )}
            
            <Separator />
            
            <div>
              <Label className="font-medium">Itens da Proposta</Label>
              <div className="mt-2 space-y-2">
                {proposal.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-muted rounded-md">
                    <div>
                      <div className="font-medium">{item.product_name}</div>
                      <div className="text-sm text-muted-foreground">
                        Quantidade: {item.quantity} × {formatCurrency(item.unit_price)}
                      </div>
                    </div>
                    <div className="font-medium">
                      {formatCurrency(item.total_price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total da Proposta:</span>
              <span className="text-primary">{formatCurrency(proposal.total_amount)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Client Confirmation */}
        <Card>
          <CardHeader>
            <CardTitle>Confirmação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Seu Nome (opcional)</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Digite seu nome para confirmação"
              />
            </div>
            
            <div className="pt-4">
              <Button 
                onClick={handleApprove}
                disabled={isApproving || state === 'confirming'}
                className="w-full"
                size="lg"
              >
                {isApproving || state === 'confirming' ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Processando Aprovação...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aprovar Proposta
                  </>
                )}
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              Ao clicar em "Aprovar Proposta", você confirma que aceita todos os termos e condições apresentados.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}