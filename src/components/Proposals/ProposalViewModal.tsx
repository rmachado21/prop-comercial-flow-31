
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Download, Mail } from 'lucide-react';
import { Proposal } from '@/hooks/useProposals';
import { useProposalItems } from '@/hooks/useProposalItems';
import ProposalPreview from './ProposalPreview';
import ProposalExportDialog from './ProposalExportDialog';
import ProposalSendDialog from './ProposalSendDialog';

interface ProposalViewModalProps {
  proposal: Proposal | null;
  open: boolean;
  onClose: () => void;
}

const ProposalViewModal: React.FC<ProposalViewModalProps> = ({
  proposal,
  open,
  onClose,
}) => {
  const { items } = useProposalItems(proposal?.id || null);
  const [showExportDialog, setShowExportDialog] = React.useState(false);
  const [showSendDialog, setShowSendDialog] = React.useState(false);

  if (!proposal) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{proposal.title}</DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSendDialog(true)}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExportDialog(true)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            <ProposalPreview 
              proposal={proposal} 
              items={items}
              className="scale-75 origin-top"
            />
          </div>
        </DialogContent>
      </Dialog>

      {showExportDialog && (
        <ProposalExportDialog
          proposal={proposal}
          items={items}
          open={showExportDialog}
          onClose={() => setShowExportDialog(false)}
        />
      )}

      {showSendDialog && (
        <ProposalSendDialog
          proposal={proposal}
          open={showSendDialog}
          onClose={() => setShowSendDialog(false)}
        />
      )}
    </>
  );
};

export default ProposalViewModal;
