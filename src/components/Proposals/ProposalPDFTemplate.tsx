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
      className="bg-white text-gray-900 max-w-4xl mx-auto p-6 font-sans"
      style={{ 
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.5',
        minHeight: '297mm',
        width: '210mm',
        fontSize: '12px'
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-300">
        {/* Logo/Company Name */}
        <div className="flex-1">
          {company?.logo_url ? (
            <img 
              src={company.logo_url} 
              alt={`Logo ${company.name}`}
              className="h-12 w-auto mb-2"
              style={{ maxHeight: '48px', maxWidth: '180px' }}
            />
          ) : (
            <div className="h-12 w-36 bg-gradient-to-r from-gray-600 to-gray-700 rounded flex items-center justify-center mb-2">
              <span className="text-white font-bold text-sm">
                {company?.name?.substring(0, 2)?.toUpperCase() || 'EM'}
              </span>
            </div>
          )}
          <h1 className="text-xl font-bold text-gray-800" style={{ fontSize: '18px' }}>
            {company?.name || 'Sua Empresa'}
          </h1>
        </div>

        {/* Company Info */}
        <div className="text-right text-xs space-y-1 max-w-xs" style={{ fontSize: '10px' }}>
          {company?.cnpj && (
            <p><span className="font-semibold">CNPJ:</span> {company.cnpj}</p>
          )}
          {company?.email && (
            <p><span className="font-semibold">E-mail:</span> {company.email}</p>
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
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-3" style={{ fontSize: '20px' }}>
          PROPOSTA COMERCIAL
        </h2>
      </div>

      {/* Three Column Layout - Inspired by JNG model */}
      <div className="grid grid-cols-3 gap-6 mb-6 text-xs" style={{ fontSize: '11px' }}>
        {/* Column 1 - Proposal Info */}
        <div>
          <div className="space-y-2">
            <div>
              <span className="font-semibold text-gray-700">Proposta Nº:</span>
              <div className="font-bold text-gray-900" style={{ fontSize: '14px' }}>
                {proposal.proposal_number}
              </div>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Data:</span>
              <div className="text-gray-900">{formatDate(proposal.created_at)}</div>
            </div>
            {proposal.validity_days && (
              <div>
                <span className="font-semibold text-gray-700">Validade:</span>
                <div className="text-gray-900">{proposal.validity_days} dias</div>
              </div>
            )}
            <div>
              <span className="font-semibold text-gray-700">Status:</span>
              <div className={`inline-block px-2 py-1 rounded text-xs mt-1 ${
                proposal.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                proposal.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                proposal.status === 'approved' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {proposal.status === 'draft' ? 'Rascunho' :
                 proposal.status === 'sent' ? 'Enviada' :
                 proposal.status === 'approved' ? 'Aprovada' : 'Rejeitada'}
              </div>
            </div>
          </div>
        </div>

        {/* Column 2 - Client Info */}
        <div>
          <div className="space-y-2">
            <div>
              <span className="font-semibold text-gray-700">Cliente:</span>
              <div className="text-gray-900 font-medium">{proposal.client?.name || 'N/A'}</div>
            </div>
            <div>
              <span className="font-semibold text-gray-700">E-mail:</span>
              <div className="text-gray-900">{proposal.client?.email || 'N/A'}</div>
            </div>
            {proposal.client?.contact_name && (
              <div>
                <span className="font-semibold text-gray-700">Contato:</span>
                <div className="text-gray-900">{proposal.client.contact_name}</div>
              </div>
            )}
            <div>
              <span className="font-semibold text-gray-700">Telefone:</span>
              <div className="text-gray-900">{proposal.client?.phone || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Column 3 - Additional Info */}
        <div>
          <div className="space-y-2">
            <div>
              <span className="font-semibold text-gray-700">Título:</span>
              <div className="text-gray-900">{proposal.title}</div>
            </div>
            {proposal.description && (
              <div>
                <span className="font-semibold text-gray-700">Descrição:</span>
                <div className="text-gray-900">{proposal.description}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Items Table - JNG Inspired Design */}
      <div className="mb-6">
        <div className="border border-gray-300">
          <table className="w-full" style={{ fontSize: '11px' }}>
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="p-2 text-left font-semibold border-r border-gray-600" style={{ width: '8%' }}>Item</th>
                <th className="p-2 text-left font-semibold border-r border-gray-600" style={{ width: '42%' }}>Produto/Serviço</th>
                <th className="p-2 text-center font-semibold border-r border-gray-600" style={{ width: '10%' }}>Qtd</th>
                <th className="p-2 text-right font-semibold border-r border-gray-600" style={{ width: '15%' }}>Preço Unit.</th>
                <th className="p-2 text-right font-semibold border-r border-gray-600" style={{ width: '10%' }}>Desc.</th>
                <th className="p-2 text-right font-semibold" style={{ width: '15%' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-2 border-b border-r border-gray-200 text-center">{index + 1}</td>
                  <td className="p-2 border-b border-r border-gray-200">
                    <div className="font-medium text-gray-900">{item.product_name}</div>
                    {item.product_description && (
                      <div className="text-gray-600 text-xs mt-1 leading-tight">
                        {item.product_description}
                      </div>
                    )}
                  </td>
                  <td className="p-2 border-b border-r border-gray-200 text-center">{item.quantity}</td>
                  <td className="p-2 border-b border-r border-gray-200 text-right">
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td className="p-2 border-b border-r border-gray-200 text-right">
                    {item.discount_percentage ? `${item.discount_percentage}%` : '-'}
                  </td>
                  <td className="p-2 border-b border-gray-200 text-right font-semibold">
                    {formatCurrency(item.total_price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial Summary - Aligned Right */}
      <div className="flex justify-end mb-6">
        <div className="w-64 text-sm" style={{ fontSize: '11px' }}>
          <div className="space-y-1">
            <div className="flex justify-between py-1">
              <span className="text-gray-700">Subtotal:</span>
              <span className="font-medium">{formatCurrency(proposal.subtotal)}</span>
            </div>
            {proposal.discount_amount && proposal.discount_amount > 0 && (
              <div className="flex justify-between py-1 text-red-600">
                <span>Desconto Total:</span>
                <span className="font-medium">-{formatCurrency(proposal.discount_amount)}</span>
              </div>
            )}
            {proposal.tax_amount && proposal.tax_amount > 0 && (
              <div className="flex justify-between py-1">
                <span className="text-gray-700">Impostos:</span>
                <span className="font-medium">{formatCurrency(proposal.tax_amount)}</span>
              </div>
            )}
            <div className="border-t border-gray-400 pt-2 mt-2">
              <div className="flex justify-between py-1">
                <span className="font-bold text-gray-900" style={{ fontSize: '13px' }}>VALOR TOTAL:</span>
                <span className="font-bold text-gray-900" style={{ fontSize: '13px' }}>{formatCurrency(proposal.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Observations/Terms */}
      {proposal.terms_and_conditions && (
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-3" style={{ fontSize: '12px' }}>
            Observações:
          </h3>
          <div className="text-gray-700 text-justify leading-relaxed" style={{ fontSize: '10px' }}>
            {proposal.terms_and_conditions.split('\n').map((line, index) => (
              <p key={index} className="mb-2">{line}</p>
            ))}
          </div>
        </div>
      )}

      {/* Validity Notice */}
      <div className="mb-6 text-center">
        <p className="text-gray-700 font-medium" style={{ fontSize: '11px' }}>
          {proposal.validity_days 
            ? `Esta proposta é válida por ${proposal.validity_days} dias a partir da data de emissão.`
            : 'Esta proposta é válida por 30 dias a partir da data de emissão.'
          }
        </p>
      </div>

      {/* Footer - Clean and Professional */}
      <div className="border-t border-gray-400 pt-4 text-center">
        <div className="space-y-1" style={{ fontSize: '10px' }}>
          <p className="font-bold text-gray-800">{company?.name || 'Sua Empresa'}</p>
          <div className="flex justify-center space-x-4 text-gray-600">
            {company?.email && <span>E-mail: {company.email}</span>}
            {company?.phone && <span>Telefone: {company.phone}</span>}
          </div>
          {company?.website && (
            <p className="text-gray-600">Website: {company.website}</p>
          )}
          <p className="text-gray-500 text-xs mt-3">
            Documento gerado em {formatDate(new Date().toISOString())}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProposalPDFTemplate;