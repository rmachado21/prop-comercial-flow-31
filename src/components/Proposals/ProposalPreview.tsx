import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Proposal, ProposalItem } from '@/hooks/useProposals';

interface ProposalPreviewProps {
  proposal: Proposal;
  items: ProposalItem[];
  className?: string;
}

const ProposalPreview: React.FC<ProposalPreviewProps> = ({
  proposal,
  items,
  className = '',
}) => {
  const getStatusLabel = (status: string) => {
    const statusConfig = {
      draft: 'Rascunho',
      sent: 'Enviada',
      approved: 'Aprovada',
      rejected: 'Cancelada',
      expired: 'Expirada',
    };
    return statusConfig[status as keyof typeof statusConfig] || status;
  };

  return (
    <div className={`proposal-preview bg-white ${className}`} style={{ minHeight: '297mm', width: '210mm', margin: '0 auto' }}>
      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-commercial-900 mb-2">
            PROPOSTA COMERCIAL
          </h1>
          <div className="flex items-center justify-center gap-4">
            <span className="text-lg font-medium">{proposal.proposal_number}</span>
            <Badge variant="outline">
              {getStatusLabel(proposal.status)}
            </Badge>
          </div>
        </div>

        {/* Proposal Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Informações da Proposta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-commercial-900 mb-4">Dados da Proposta</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-commercial-600">Título:</span>
                    <span className="ml-2 font-medium">{proposal.title}</span>
                  </div>
                  {proposal.description && (
                    <div>
                      <span className="text-commercial-600">Descrição:</span>
                      <span className="ml-2">{proposal.description}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-commercial-600">Data de Criação:</span>
                    <span className="ml-2">{new Date(proposal.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div>
                    <span className="text-commercial-600">Validade:</span>
                    <span className="ml-2">{proposal.validity_days ? `${proposal.validity_days} dias` : 'Indefinida'}</span>
                  </div>
                  {proposal.expiry_date && (
                    <div>
                      <span className="text-commercial-600">Data de Expiração:</span>
                      <span className="ml-2">{new Date(proposal.expiry_date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-commercial-900 mb-4">Dados do Cliente</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-commercial-600">Nome:</span>
                    <span className="ml-2 font-medium">{proposal.client?.name}</span>
                  </div>
                  {proposal.client?.email && (
                    <div>
                      <span className="text-commercial-600">E-mail:</span>
                      <span className="ml-2">{proposal.client.email}</span>
                    </div>
                  )}
                  {proposal.client?.phone && (
                    <div>
                      <span className="text-commercial-600">Telefone:</span>
                      <span className="ml-2">{proposal.client.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items Table */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Itens da Proposta</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Item</TableHead>
                  <TableHead>Produto/Serviço</TableHead>
                  <TableHead className="w-20 text-center">Qtd</TableHead>
                  <TableHead className="w-24 text-right">Preço Unit.</TableHead>
                  <TableHead className="w-24 text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.product_name}</div>
                        {item.product_description && (
                          <div className="text-sm text-commercial-600">
                            {item.product_description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      R$ {item.unit_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      R$ {item.total_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Totals */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex justify-end">
              <div className="w-80 space-y-3">
                <div className="flex justify-between">
                  <span className="text-commercial-600">Subtotal:</span>
                  <span className="font-medium">
                    R$ {proposal.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                {proposal.discount_amount && proposal.discount_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-commercial-600">
                      Desconto ({proposal.discount_percentage || 0}%):
                    </span>
                    <span className="font-medium text-red-600">
                      -R$ {proposal.discount_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                
                {proposal.tax_amount && proposal.tax_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-commercial-600">
                      Impostos ({proposal.tax_percentage || 0}%):
                    </span>
                    <span className="font-medium">
                      R$ {proposal.tax_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                
                <Separator />
                <div className="flex justify-between">
                  <span className="font-bold text-lg text-commercial-900">TOTAL:</span>
                  <span className="font-bold text-xl text-commercial-900">
                    R$ {proposal.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms and Conditions */}
        {proposal.terms_and_conditions && (
          <Card>
            <CardContent className="pt-6">
              <div>
                <h3 className="font-semibold text-commercial-900 mb-2">Termos e Condições</h3>
                <p className="text-sm text-commercial-700 whitespace-pre-wrap">
                  {proposal.terms_and_conditions}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProposalPreview;
