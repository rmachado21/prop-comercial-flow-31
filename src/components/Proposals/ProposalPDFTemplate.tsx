import React from 'react';
import { Proposal, ProposalItem } from '@/hooks/useProposals';
import { CompanyData } from '@/hooks/useCompanyData';

interface ProposalPDFTemplateProps {
  proposal: Proposal;
  items: ProposalItem[];
  company: CompanyData | null;
}

const ProposalPDFTemplate: React.FC<ProposalPDFTemplateProps> = ({
  proposal,
  items,
  company,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <div 
      id="pdf-template" 
      className="bg-white text-gray-900 max-w-4xl mx-auto p-8 font-sans"
      style={{ 
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.4',
        minHeight: '297mm',
        width: '210mm'
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-commercial-500">
        {/* Logo/Company Name */}
        <div className="flex-1">
          {company?.logo_url ? (
            <img 
              src={company.logo_url} 
              alt={`Logo ${company.name}`}
              className="h-16 w-auto mb-2"
              style={{ maxHeight: '64px', maxWidth: '200px' }}
            />
          ) : (
            <div className="h-16 w-48 bg-gradient-to-r from-commercial-500 to-commercial-600 rounded-lg flex items-center justify-center mb-2">
              <span className="text-white font-bold text-lg">
                {company?.name?.substring(0, 2)?.toUpperCase() || 'EM'}
              </span>
            </div>
          )}
          <h1 className="text-2xl font-bold text-commercial-900">
            {company?.name || 'Sua Empresa'}
          </h1>
        </div>

        {/* Company Info */}
        <div className="text-right text-sm space-y-1 max-w-xs">
          {company?.cnpj && (
            <p><span className="font-semibold">CNPJ:</span> {company.cnpj}</p>
          )}
          {company?.email && (
            <p><span className="font-semibold">Email:</span> {company.email}</p>
          )}
          {company?.phone && (
            <p><span className="font-semibold">Telefone:</span> {company.phone}</p>
          )}
          {company?.website && (
            <p><span className="font-semibold">Website:</span> {company.website}</p>
          )}
          {company?.address && (
            <p><span className="font-semibold">Endereço:</span> {company.address}</p>
          )}
        </div>
      </div>

      {/* Proposal Title */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-commercial-900 mb-2">
          PROPOSTA COMERCIAL
        </h2>
        <div className="flex justify-center items-center space-x-6">
          <span className="text-lg font-semibold">
            Nº {proposal.proposal_number}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            proposal.status === 'draft' ? 'bg-gray-100 text-gray-800' :
            proposal.status === 'sent' ? 'bg-blue-100 text-blue-800' :
            proposal.status === 'approved' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
            {proposal.status === 'draft' ? 'Rascunho' :
             proposal.status === 'sent' ? 'Enviada' :
             proposal.status === 'approved' ? 'Aprovada' : 'Rejeitada'}
          </span>
        </div>
      </div>

      {/* Proposal and Client Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Proposal Info */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-bold text-commercial-900 mb-4 border-b border-commercial-200 pb-2">
            Informações da Proposta
          </h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-semibold">Título:</span> {proposal.title}</p>
            <p><span className="font-semibold">Data:</span> {formatDate(proposal.created_at)}</p>
            {proposal.validity_days && (
              <p><span className="font-semibold">Validade:</span> {proposal.validity_days} dias</p>
            )}
            {proposal.description && (
              <div>
                <span className="font-semibold">Descrição:</span>
                <p className="mt-1 text-gray-700">{proposal.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Client Info */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-bold text-commercial-900 mb-4 border-b border-commercial-200 pb-2">
            Dados do Cliente
          </h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-semibold">Nome:</span> {proposal.client?.name || 'N/A'}</p>
            <p><span className="font-semibold">Email:</span> {proposal.client?.email || 'N/A'}</p>
            <p><span className="font-semibold">Telefone:</span> {proposal.client?.phone || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-commercial-900 mb-4 border-b-2 border-commercial-500 pb-2">
          Itens da Proposta
        </h3>
        <div className="overflow-hidden rounded-lg border border-gray-300">
          <table className="w-full text-sm">
            <thead className="bg-commercial-500 text-white">
              <tr>
                <th className="p-3 text-left font-semibold">Item</th>
                <th className="p-3 text-left font-semibold">Produto</th>
                <th className="p-3 text-center font-semibold">Qtd</th>
                <th className="p-3 text-right font-semibold">Preço Unit.</th>
                <th className="p-3 text-right font-semibold">Desconto</th>
                <th className="p-3 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-3 border-b border-gray-200">{index + 1}</td>
                  <td className="p-3 border-b border-gray-200">
                    <div>
                      <div className="font-medium">{item.product_name}</div>
                      {item.product_description && (
                        <div className="text-gray-600 text-xs mt-1">
                          {item.product_description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3 border-b border-gray-200 text-center">{item.quantity}</td>
                  <td className="p-3 border-b border-gray-200 text-right">
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td className="p-3 border-b border-gray-200 text-right">
                    {item.discount_percentage ? `${item.discount_percentage}%` : '-'}
                    {item.discount_amount ? ` (${formatCurrency(item.discount_amount)})` : ''}
                  </td>
                  <td className="p-3 border-b border-gray-200 text-right font-semibold">
                    {formatCurrency(item.total_price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="flex justify-end mb-8">
        <div className="w-80 bg-gray-50 rounded-lg p-6 border border-gray-300">
          <h3 className="text-lg font-bold text-commercial-900 mb-4 border-b border-commercial-200 pb-2">
            Resumo Financeiro
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(proposal.subtotal)}</span>
            </div>
            {proposal.discount_amount && proposal.discount_amount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Desconto:</span>
                <span>-{formatCurrency(proposal.discount_amount)}</span>
              </div>
            )}
            {proposal.tax_amount && proposal.tax_amount > 0 && (
              <div className="flex justify-between">
                <span>Impostos:</span>
                <span>{formatCurrency(proposal.tax_amount)}</span>
              </div>
            )}
            <div className="border-t border-commercial-500 pt-2 mt-3">
              <div className="flex justify-between text-lg font-bold text-commercial-900">
                <span>TOTAL:</span>
                <span>{formatCurrency(proposal.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      {proposal.terms_and_conditions && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-commercial-900 mb-4 border-b-2 border-commercial-500 pb-2">
            Termos e Condições
          </h3>
          <div className="bg-gray-50 p-6 rounded-lg text-sm text-gray-700 leading-relaxed">
            {proposal.terms_and_conditions.split('\n').map((line, index) => (
              <p key={index} className="mb-2">{line}</p>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t-2 border-commercial-500 pt-6 mt-8 text-center">
        <div className="text-sm text-gray-600 space-y-1">
          <p className="font-semibold text-commercial-900">{company?.name || 'Sua Empresa'}</p>
          {company?.email && <p>Email: {company.email}</p>}
          {company?.phone && <p>Telefone: {company.phone}</p>}
          {company?.website && <p>Website: {company.website}</p>}
          <p className="text-xs text-gray-500 mt-4">
            Proposta gerada em {formatDate(new Date().toISOString())}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProposalPDFTemplate;