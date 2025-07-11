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
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-commercial-900">{proposal.title}</h3>
                  {getStatusBadge(proposal.status)}
                </div>
                <p className="text-sm text-commercial-600">
                  {proposal.proposal_number} • {proposal.client?.name}
                </p>
              </div>
            </div>

            {isMobile ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-commercial-500 text-sm">Valor Total:</span>
                  <p className="font-bold text-lg text-commercial-900">
                    R$ {proposal.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="flex justify-between">
                  <span className="text-commercial-500 text-sm">Criada em:</span>
                  <p className="font-medium text-sm">
                    {new Date(proposal.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex justify-between">
                  <span className="text-commercial-500 text-sm">Validade:</span>
                  <p className="font-medium text-sm">
                    {proposal.validity_days ? `${proposal.validity_days} dias` : 'Indefinida'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-commercial-500">Criada em:</span>
                  <p className="font-medium">
                    {new Date(proposal.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <span className="text-commercial-500">Cliente:</span>
                  <p className="font-medium">{proposal.client?.name}</p>
                </div>
                <div>
                  <span className="text-commercial-500">Validade:</span>
                  <p className="font-medium">
                    {proposal.validity_days ? `${proposal.validity_days} dias` : 'Indefinida'}
                  </p>
                </div>
                <div>
                  <span className="text-commercial-500">Valor Total:</span>
                  <p className="font-bold text-lg text-commercial-900">
                    R$ {proposal.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 ml-4">
            {isMobile ? (
              <div className="flex items-center gap-2">
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
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProposalCard;