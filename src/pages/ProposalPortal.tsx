import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProposalPortal } from '@/hooks/useProposalPortal';
import { ProposalUpdateBanner } from '@/components/Proposals/ProposalUpdateBanner';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  MessageCircle, 
  Download,
  History,
  User,
  Building2,
  Loader2
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

type PortalState = 'loading' | 'valid' | 'invalid' | 'approved' | 'error';

export default function ProposalPortal() {
  const { token } = useParams<{ token: string }>();
  const { 
    validateToken, 
    approveProposal, 
    submitComments, 
    getProposalHistory,
    getProposalComments,
    isLoading, 
    isSubmitting 
  } = useProposalPortal();
  
  const [state, setState] = useState<PortalState>('loading');
  const [proposal, setProposal] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [hasUpdate, setHasUpdate] = useState(false);
  
  // Form states
  const [clientName, setClientName] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [newComment, setNewComment] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setState('invalid');
      setErrorMessage('Token não encontrado na URL');
      return;
    }

    let isMounted = true;

    const loadPortalData = async () => {
      if (!isMounted) return;
      
      setState('loading');
      
      const { isValid, proposal, error } = await validateToken(token);
      
      if (!isMounted) return;
      
      if (isValid && proposal) {
        setProposal(proposal);
        setClientName(proposal.client?.name || '');
        setClientEmail(proposal.client?.email || '');
        setHasUpdate(proposal.updated_after_comment && !proposal.client_seen_update);
        
        if (proposal.status === 'approved') {
          setState('approved');
        } else {
          setState('valid');
        }
        
        // Load history and comments
        const historyData = await getProposalHistory(proposal.id);
        const commentsData = await getProposalComments(proposal.id);
        
        if (isMounted) {
          setHistory(historyData);
          setComments(commentsData);
        }
        
      } else {
        setState('invalid');
        setErrorMessage(error || 'Token inválido');
      }
    };

    loadPortalData();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleMarkUpdateAsSeen = async () => {
    if (!token) return;
    
    try {
      // The validateToken function will automatically mark as seen when accessing
      await validateToken(token);
      setHasUpdate(false);
    } catch (error) {
      console.error('Error marking update as seen:', error);
    }
  };

  const handleApprove = async () => {
    if (!token) return;

    const { success, error } = await approveProposal(token, clientName);
    
    if (success) {
      setState('approved');
      // Reload history to show approval
      const historyData = await getProposalHistory(proposal.id);
      setHistory(historyData);
    } else {
      setState('error');
      setErrorMessage(error || 'Erro ao aprovar proposta');
    }
  };

  const handleSubmitComment = async () => {
    if (!token || !newComment.trim()) return;

    const { success, error } = await submitComments(
      token, 
      clientName || 'Cliente', 
      clientEmail, 
      newComment
    );
    
    if (success) {
      setNewComment('');
      // Reload comments
      const commentsData = await getProposalComments(proposal.id);
      setComments(commentsData);
    } else {
      setErrorMessage(error || 'Erro ao enviar comentário');
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const getStatusIcon = () => {
    switch (state) {
      case 'loading':
        return <Clock className="w-6 h-6 text-muted-foreground animate-spin" />;
      case 'valid':
        return <FileText className="w-6 h-6 text-primary" />;
      case 'approved':
        return <CheckCircle className="w-6 h-6 text-success" />;
      case 'invalid':
      case 'error':
        return <XCircle className="w-6 h-6 text-destructive" />;
    }
  };

  const getStatusBadge = () => {
    if (!proposal) return null;
    
    const status = proposal.status;
    const variant = status === 'approved' ? 'default' : 
                   status === 'sent' ? 'secondary' : 'outline';
    
    return (
      <Badge variant={variant}>
        {status === 'approved' ? 'Aprovada' : 
         status === 'sent' ? 'Enviada' : 'Rascunho'}
      </Badge>
    );
  };

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6 pb-6 space-y-4">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
            <h1 className="text-xl font-semibold">Carregando Proposta</h1>
            <p className="text-muted-foreground">Verificando as informações...</p>
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
            <XCircle className="w-12 h-12 mx-auto text-destructive" />
            <h1 className="text-xl font-semibold text-destructive">Link Inválido</h1>
            <p className="text-muted-foreground">{errorMessage}</p>
            <p className="text-sm text-muted-foreground">
              Entre em contato com o responsável pela proposta se você acredita que isso é um erro.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!proposal) return null;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <ProposalUpdateBanner 
          hasUpdate={hasUpdate}
          onMarkAsSeen={handleMarkUpdateAsSeen}
        />
        
        {/* Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {getStatusIcon()}
                <div>
                  <h1 className="text-2xl font-bold">{proposal.title}</h1>
                  <p className="text-muted-foreground">
                    Proposta #{proposal.proposal_number}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge()}
                <Button variant="outline" size="sm" onClick={handlePrintPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Imprimir PDF
                </Button>
              </div>
            </div>
            
            {/* Company and Client Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <Label className="font-medium">Empresa</Label>
                </div>
                <div className="pl-6">
                  <p className="font-medium">{proposal.company?.name}</p>
                  {proposal.company?.email && (
                    <p className="text-sm text-muted-foreground">{proposal.company.email}</p>
                  )}
                  {proposal.company?.phone && (
                    <p className="text-sm text-muted-foreground">{proposal.company.phone}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <Label className="font-medium">Cliente</Label>
                </div>
                <div className="pl-6">
                  <p className="font-medium">{proposal.client?.name}</p>
                  {proposal.client?.email && (
                    <p className="text-sm text-muted-foreground">{proposal.client.email}</p>
                  )}
                  {proposal.client?.phone && (
                    <p className="text-sm text-muted-foreground">{proposal.client.phone}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="proposal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="proposal">
              <FileText className="w-4 h-4 mr-2" />
              Proposta
            </TabsTrigger>
            <TabsTrigger value="comments">
              <MessageCircle className="w-4 h-4 mr-2" />
              Comentários
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="w-4 h-4 mr-2" />
              Histórico
            </TabsTrigger>
          </TabsList>

          {/* Proposal Details */}
          <TabsContent value="proposal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detalhes da Proposta</CardTitle>
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
                    {proposal.items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-muted rounded-md">
                        <div>
                          <div className="font-medium">{item.product_name}</div>
                          <div className="text-sm text-muted-foreground">
                            Quantidade: {item.quantity} × {formatCurrency(item.unit_price)}
                          </div>
                          {item.product_description && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {item.product_description}
                            </div>
                          )}
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

                {proposal.terms_and_conditions && (
                  <>
                    <Separator />
                    <div>
                      <Label className="font-medium">Termos e Condições</Label>
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                        {proposal.terms_and_conditions}
                      </p>
                    </div>
                  </>
                )}

                {/* Approve Section - moved from Actions tab */}
                <Separator />
                
                {state === 'approved' ? (
                  <div className="text-center space-y-4 p-6 bg-success/10 rounded-lg border border-success/20">
                    <CheckCircle className="w-16 h-16 mx-auto text-success" />
                    <div>
                      <h3 className="text-lg font-semibold text-success">Proposta Aprovada!</h3>
                      <p className="text-muted-foreground">
                        Esta proposta foi aprovada. A empresa entrará em contato em breve.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 p-6 bg-primary/10 rounded-lg border border-primary/20">
                    <h3 className="text-lg font-semibold">Ações Disponíveis</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="actionClientName">Seu Nome (opcional)</Label>
                      <Input
                        id="actionClientName"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Digite seu nome para confirmação"
                      />
                    </div>
                    
                    <Button 
                      onClick={handleApprove}
                      disabled={isSubmitting}
                      className="w-full"
                      size="lg"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Aprovar Proposta
                        </>
                      )}
                    </Button>
                    
                    <p className="text-xs text-muted-foreground text-center">
                      Ao aprovar, você confirma que aceita todos os termos e condições.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>


          {/* Comments */}
          <TabsContent value="comments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Comentários e Observações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Existing Comments */}
                {comments.length > 0 && (
                  <div className="space-y-3">
                    <Label className="font-medium">Comentários Anteriores</Label>
                    {comments.map((comment: any) => (
                      <div key={comment.id} className="p-3 bg-muted rounded-md">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium">{comment.client_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(comment.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <p className="text-sm">{comment.comments}</p>
                      </div>
                    ))}
                    <Separator />
                  </div>
                )}
                
                {/* New Comment Form */}
                <div className="space-y-4">
                  <Label className="font-medium">Adicionar Novo Comentário</Label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="commentClientName">Nome</Label>
                      <Input
                        id="commentClientName"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Seu nome"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="commentClientEmail">Email</Label>
                      <Input
                        id="commentClientEmail"
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="newComment">Comentário</Label>
                    <Textarea
                      id="newComment"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Escreva suas observações, sugestões ou dúvidas..."
                      rows={4}
                    />
                  </div>

                  <Button 
                    onClick={handleSubmitComment}
                    disabled={isSubmitting || !newComment.trim()}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Enviar Comentário
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Alterações</CardTitle>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhuma alteração registrada ainda.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {history.map((change: any) => (
                      <div key={change.id} className="flex items-start gap-3 p-3 border rounded-md">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <p className="font-medium">{change.change_type}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(change.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">{change.field_changed}</p>
                          {change.old_value && change.new_value && (
                            <div className="text-xs text-muted-foreground mt-1">
                              <span className="line-through">{change.old_value}</span>
                              {' → '}
                              <span>{change.new_value}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
