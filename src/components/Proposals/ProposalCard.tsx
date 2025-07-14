import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
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

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className={showGridLayout ? "p-4" : "p-3"}>
        {isMobile ? (
          // Layout compacto para mobile
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <div className="w-8 h-8 bg-primary-100 rounded-md flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-commercial-900 truncate mb-1">{proposal.title}</h3>
                  <p className="text-xs text-commercial-600 truncate">
                    {proposal.proposal_number} • {proposal.client?.name}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-commercial-500">
                {new Date(proposal.created_at).toLocaleDateString('pt-BR')}
              </span>
              <span className="font-bold text-sm text-commercial-900">
                R$ {proposal.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            
            <div className="flex items-center justify-between pt-1">
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
          // Layout em grid para desktop - melhorado
          <div className="h-48 flex flex-col">
            {/* Header com status no canto superior direito */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-commercial-900 truncate leading-tight">{proposal.title}</h3>
                  <p className="text-sm text-commercial-500 truncate">{proposal.proposal_number}</p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <StatusSelector
                  currentStatus={proposal.status}
                  onStatusChange={(newStatus) => onStatusChange(proposal.id, newStatus)}
                />
              </div>
            </div>
            
            {/* Corpo com informações em grid 2x2 */}
            <div className="flex-1 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-commercial-500 mb-1">Cliente</p>
                  <p className="text-sm text-commercial-900 truncate font-medium">{proposal.client?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-commercial-500 mb-1">Data</p>
                  <p className="text-sm text-commercial-900">{new Date(proposal.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-xs text-commercial-500 mb-1">Validade</p>
                  <p className="text-sm text-commercial-900">{proposal.validity_days ? `${proposal.validity_days} dias` : 'Indefinida'}</p>
                </div>
                <div>
                  <p className="text-xs text-commercial-500 mb-1">Valor</p>
                  <p className="text-lg font-bold text-commercial-900">
                    R$ {proposal.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Footer com ações */}
            <div className="flex justify-end pt-3 border-t border-commercial-200">
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
          // Layout em lista para desktop
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-primary-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-commercial-900 truncate mb-1">{proposal.title}</h3>
                <div className="flex items-center gap-4 text-sm text-commercial-600">
                  <span>{proposal.proposal_number}</span>
                  <span>•</span>
                  <span className="truncate">{proposal.client?.name}</span>
                  <span>•</span>
                  <span>{new Date(proposal.created_at).toLocaleDateString('pt-BR')}</span>
                  <span>•</span>
                  <span>{proposal.validity_days ? `${proposal.validity_days} dias` : 'Indefinida'}</span>
                </div>
              </div>
              
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-lg text-commercial-900">
                  R$ {proposal.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
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