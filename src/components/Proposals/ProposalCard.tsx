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
  onView: (proposal: Proposal) => void;
  onEdit: (proposal: Proposal) => void;
  onDelete: (proposal: Proposal) => void;
  onEmail: (proposal: Proposal) => void;
  onWhatsApp: (proposal: Proposal) => void;
  onExportPDF: (proposal: Proposal) => void;
  onStatusChange: (id: string, status: string) => void;
}

const ProposalCard: React.FC<ProposalCardProps> = ({
  proposal,
  isMobile,
  onView,
  onEdit,
  onDelete,
  onEmail,
  onWhatsApp,
  onExportPDF,
  onStatusChange,
}) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Rascunho', className: 'bg-[hsl(var(--status-draft))] text-[hsl(var(--status-draft-foreground))] border-[hsl(var(--status-draft))]' },
      sent: { label: 'Enviada', className: 'bg-[hsl(var(--status-sent))] text-[hsl(var(--status-sent-foreground))] border-[hsl(var(--status-sent))]' },
      approved: { label: 'Aprovada', className: 'bg-[hsl(var(--status-approved))] text-[hsl(var(--status-approved-foreground))] border-[hsl(var(--status-approved))]' },
      rejected: { label: 'Rejeitada', className: 'bg-[hsl(var(--status-rejected))] text-[hsl(var(--status-rejected-foreground))] border-[hsl(var(--status-rejected))]' },
      expired: { label: 'Expirada', className: 'bg-[hsl(var(--status-expired))] text-[hsl(var(--status-expired-foreground))] border-[hsl(var(--status-expired))]' },
      nfe_issued: { label: 'NFe Emitida', className: 'bg-[hsl(var(--status-nfe-issued))] text-[hsl(var(--status-nfe-issued-foreground))] border-[hsl(var(--status-nfe-issued))]' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        {isMobile ? (
          // Layout compacto para mobile
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <div className="w-8 h-8 bg-primary-100 rounded-md flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm text-commercial-900 truncate">{proposal.title}</h3>
                    {getStatusBadge(proposal.status)}
                  </div>
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
                onDelete={onDelete}
                onEmail={onEmail}
                onWhatsApp={onWhatsApp}
                onExportPDF={onExportPDF}
              />
            </div>
          </div>
        ) : (
          // Layout para desktop
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-primary-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-commercial-900 truncate">{proposal.title}</h3>
                  {getStatusBadge(proposal.status)}
                </div>
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
                onDelete={onDelete}
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