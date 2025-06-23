
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Download,
  Edit,
  Send,
  Printer,
  Eye
} from 'lucide-react';
import { useProposals, Proposal } from '@/hooks/useProposals';
import { useProposalItems } from '@/hooks/useProposalItems';
import Navbar from '@/components/Navbar';
import ProposalPreview from '@/components/Proposals/ProposalPreview';
import ProposalExportDialog from '@/components/Proposals/ProposalExportDialog';

const ProposalView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { proposals, sendProposal } = useProposals();
  const { items } = useProposalItems(id || null);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (id && proposals.length > 0) {
      const foundProposal = proposals.find(p => p.id === id);
      setProposal(foundProposal || null);
    }
  }, [id, proposals]);

  const handleEdit = () => {
    navigate(`/propostas/editar/${id}`);
  };

  const handleSend = async () => {
    if (proposal && proposal.status === 'draft') {
      await sendProposal(proposal.id);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Rascunho', className: 'bg-gray-100 text-gray-800' },
      sent: { label: 'Enviada', className: 'bg-blue-100 text-blue-800' },
      approved: { label: 'Aprovada', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejeitada', className: 'bg-red-100 text-red-800' },
      expired: { label: 'Expirada', className: 'bg-yellow-100 text-yellow-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (!proposal) {
    return (
      <div className="min-h-screen bg-gradient-bg">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-commercial-600">Proposta não encontrada</p>
              <Button onClick={() => navigate('/propostas')} className="mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showPreview) {
    return (
      <div className="min-h-screen bg-white">
        <div className="print:hidden bg-commercial-50 p-4 border-b">
          <div className="container mx-auto flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowExportDialog(true)}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button
                onClick={() => window.print()}
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>
        </div>
        <ProposalPreview proposal={proposal} items={items} />
        
        {showExportDialog && (
          <ProposalExportDialog
            proposal={proposal}
            items={items}
            open={showExportDialog}
            onClose={() => setShowExportDialog(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/propostas')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-commercial-900">
                {proposal.title}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-commercial-600">{proposal.proposal_number}</span>
                {getStatusBadge(proposal.status)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPreview(true)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Visualizar
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowExportDialog(true)}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            {proposal.status === 'draft' && (
              <Button
                variant="outline"
                onClick={handleSend}
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar
              </Button>
            )}
            <Button onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Proposal Details */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhes da Proposta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {proposal.description && (
                  <div>
                    <span className="text-commercial-600">Descrição:</span>
                    <p className="mt-1">{proposal.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-commercial-600">Cliente:</span>
                    <p className="font-medium">{proposal.client?.name}</p>
                  </div>
                  <div>
                    <span className="text-commercial-600">Data de Criação:</span>
                    <p>{new Date(proposal.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div>
                    <span className="text-commercial-600">Validade:</span>
                    <p>{proposal.validity_days ? `${proposal.validity_days} dias` : 'Indefinida'}</p>
                  </div>
                  {proposal.expiry_date && (
                    <div>
                      <span className="text-commercial-600">Data de Expiração:</span>
                      <p>{new Date(proposal.expiry_date).toLocaleDateString('pt-BR')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader>
                <CardTitle>Itens da Proposta ({items.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <p className="text-commercial-600 text-center py-8">
                    Nenhum item adicionado
                  </p>
                ) : (
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-commercial-900">
                              {index + 1}. {item.product_name}
                            </h4>
                            {item.product_description && (
                              <p className="text-sm text-commercial-600 mt-1">
                                {item.product_description}
                              </p>
                            )}
                            <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                              <div>
                                <span className="text-commercial-500">Quantidade:</span>
                                <p className="font-medium">{item.quantity}</p>
                              </div>
                              <div>
                                <span className="text-commercial-500">Preço Unit.:</span>
                                <p className="font-medium">
                                  R$ {item.unit_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                              <div>
                                <span className="text-commercial-500">Total:</span>
                                <p className="font-bold">
                                  R$ {item.total_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Information */}
            {(proposal.notes || proposal.terms_and_conditions) && (
              <Card>
                <CardHeader>
                  <CardTitle>Informações Adicionais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {proposal.notes && (
                    <div>
                      <span className="text-commercial-600 font-medium">Observações:</span>
                      <p className="mt-1">{proposal.notes}</p>
                    </div>
                  )}
                  
                  {proposal.terms_and_conditions && (
                    <div>
                      <span className="text-commercial-600 font-medium">Termos e Condições:</span>
                      <p className="mt-1 whitespace-pre-wrap">{proposal.terms_and_conditions}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-commercial-600">Subtotal:</span>
                    <span className="font-medium">
                      R$ {proposal.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  {proposal.discount_amount && proposal.discount_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-commercial-600">
                        Desconto ({proposal.discount_percentage}%):
                      </span>
                      <span className="font-medium text-red-600">
                        -R$ {proposal.discount_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  
                  {proposal.tax_amount && proposal.tax_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-commercial-600">
                        Impostos ({proposal.tax_percentage}%):
                      </span>
                      <span className="font-medium">
                        R$ {proposal.tax_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  
                  <hr />
                  <div className="flex justify-between">
                    <span className="font-semibold text-commercial-900">Total:</span>
                    <span className="font-bold text-xl text-commercial-900">
                      R$ {proposal.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showExportDialog && (
        <ProposalExportDialog
          proposal={proposal}
          items={items}
          open={showExportDialog}
          onClose={() => setShowExportDialog(false)}
        />
      )}
    </div>
  );
};

export default ProposalView;
