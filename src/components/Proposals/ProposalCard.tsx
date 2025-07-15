import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Phone, User } from 'lucide-react';
import { Proposal } from '@/hooks/useProposals';
import StatusSelector from './StatusSelector';
import ProposalActions from './ProposalActions';

interface ProposalCardProps {
  proposal: Proposal;
  isMobile: boolean;
  viewMode: 'grid' | 'list';
  onView: (proposal: Proposal) => void;
  onEdit: (proposal: Proposal) => void;
  onEmail: (proposal: Proposal) => void;
  onWhatsApp: (proposal: Proposal) => void;
  onExportPDF: (proposal: Proposal) => void;
  onStatusChange: (id: string, status: string) => void;
}

const ProposalCard: React.FC<ProposalCardProps> = ({
  proposal,
  isMobile,
  viewMode,
  onView,
  onEdit,
  onEmail,
  onWhatsApp,
  onExportPDF,
  onStatusChange,
}) => {

  // Para o modo grid em desktop, usar layout em card
  const showGridLayout = viewMode === 'grid' && !isMobile;

  // Função para formatar CNPJ
  const formatCNPJ = (cnpj: string | null) => {
    if (!cnpj) return '';
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  // Função para formatar telefone
  const formatPhone = (phone: string | null) => {
    if (!phone) return '';
    return phone.replace(/^(\d{2})(\d{4,5})(\d{4})$/, '($1) $2-$3');
  };

  // Monta a localização do cliente
  const getClientLocation = () => {
    const parts = [];
    if (proposal.client?.city) parts.push(proposal.client.city);
    if (proposal.client?.state) parts.push(proposal.client.state);
    return parts.join(', ');
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className={showGridLayout ? "p-4" : "p-3"}>
        {isMobile ? (
          // Layout compacto para mobile
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base text-foreground truncate mb-1">
                  {proposal.client?.name || 'Cliente não informado'}
                </h3>
                <p className="text-xs text-muted-foreground truncate mb-2">
                  {proposal.proposal_number}
                </p>
                
                {/* Informações do cliente em mobile */}
                <div className="space-y-1">
                  {proposal.client?.cnpj && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Building2 className="w-3 h-3" />
                      <span>{formatCNPJ(proposal.client.cnpj)}</span>
                    </div>
                  )}
                  {proposal.client?.contact_name && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="w-3 h-3" />
                      <span>{proposal.client.contact_name}</span>
                    </div>
                  )}
                  {getClientLocation() && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{getClientLocation()}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-3">
                <p className="font-bold text-lg text-foreground">
                  R$ {proposal.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(proposal.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <StatusSelector
                currentStatus={proposal.status}
                onStatusChange={(newStatus) => onStatusChange(proposal.id, newStatus)}
              />
              <ProposalActions
                proposal={proposal}
                isMobile={isMobile}
                onView={onView}
                onEdit={onEdit}
                onEmail={onEmail}
                onWhatsApp={onWhatsApp}
                onExportPDF={onExportPDF}
              />
            </div>
          </div>
        ) : showGridLayout ? (
          // Layout em grid para desktop - redesenhado
          <div className="h-56 flex flex-col">
            {/* Header com cliente como título principal */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-foreground truncate leading-tight mb-1">
                  {proposal.client?.name || 'Cliente não informado'}
                </h3>
                <p className="text-sm text-muted-foreground truncate">{proposal.proposal_number}</p>
              </div>
              <div className="flex-shrink-0">
                <StatusSelector
                  currentStatus={proposal.status}
                  onStatusChange={(newStatus) => onStatusChange(proposal.id, newStatus)}
                />
              </div>
            </div>
            
            {/* Informações do cliente */}
            <div className="flex-1 space-y-2 mb-3">
              {proposal.client?.cnpj && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="w-4 h-4" />
                  <span>{formatCNPJ(proposal.client.cnpj)}</span>
                </div>
              )}
              {proposal.client?.contact_name && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{proposal.client.contact_name}</span>
                </div>
              )}
              {proposal.client?.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{formatPhone(proposal.client.phone)}</span>
                </div>
              )}
              {getClientLocation() && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{getClientLocation()}</span>
                </div>
              )}
            </div>
            
            {/* Informações da proposta */}
            <div className="grid grid-cols-2 gap-3 mb-3 py-3 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Data</p>
                <p className="text-sm text-foreground">{new Date(proposal.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Validade</p>
                <p className="text-sm text-foreground">{proposal.validity_days ? `${proposal.validity_days} dias` : 'Indefinida'}</p>
              </div>
            </div>
            
            {/* Footer com valor e ações */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Valor Total</p>
                <p className="text-xl font-bold text-foreground">
                  R$ {proposal.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <ProposalActions
                proposal={proposal}
                isMobile={false}
                onView={onView}
                onEdit={onEdit}
                onEmail={onEmail}
                onWhatsApp={onWhatsApp}
                onExportPDF={onExportPDF}
              />
            </div>
          </div>
        ) : (
          // Layout em lista para desktop - redesenhado
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex-1 min-w-0">
                {/* Cliente como título principal */}
                <h3 className="font-semibold text-foreground truncate mb-1">
                  {proposal.client?.name || 'Cliente não informado'}
                </h3>
                
                {/* Linha com informações do cliente */}
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                  <span className="font-medium">{proposal.proposal_number}</span>
                  {proposal.client?.cnpj && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        <span>{formatCNPJ(proposal.client.cnpj)}</span>
                      </div>
                    </>
                  )}
                  {proposal.client?.contact_name && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{proposal.client.contact_name}</span>
                      </div>
                    </>
                  )}
                  {getClientLocation() && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{getClientLocation()}</span>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Linha com informações da proposta */}
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{new Date(proposal.created_at).toLocaleDateString('pt-BR')}</span>
                  <span>•</span>
                  <span>{proposal.validity_days ? `${proposal.validity_days} dias` : 'Indefinida'}</span>
                  {proposal.client?.phone && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{formatPhone(proposal.client.phone)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-xl text-foreground">
                  R$ {proposal.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">Valor Total</p>
              </div>
            </div>

            <div className="flex items-center gap-3 ml-6 flex-shrink-0">
              <StatusSelector
                currentStatus={proposal.status}
                onStatusChange={(newStatus) => onStatusChange(proposal.id, newStatus)}
              />
              <ProposalActions
                proposal={proposal}
                isMobile={isMobile}
                onView={onView}
                onEdit={onEdit}
                onEmail={onEmail}
                onWhatsApp={onWhatsApp}
                onExportPDF={onExportPDF}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProposalCard;