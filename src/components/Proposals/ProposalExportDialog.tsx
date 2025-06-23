import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FileText, 
  FileSpreadsheet, 
  Printer,
  Download,
  X
} from 'lucide-react';
import { Proposal, ProposalItem } from '@/hooks/useProposals';
import { useProposalExport } from '@/hooks/useProposalExport';

interface ProposalExportDialogProps {
  proposal: Proposal;
  items: ProposalItem[];
  open: boolean;
  onClose: () => void;
}

const ProposalExportDialog: React.FC<ProposalExportDialogProps> = ({
  proposal,
  items,
  open,
  onClose,
}) => {
  const { exportToPDF, exportToExcel, printProposal, isExporting } = useProposalExport();

  const handleExportPDF = async () => {
    await exportToPDF(proposal, items);
    onClose();
  };

  const handleExportExcel = async () => {
    await exportToExcel(proposal, items);
    onClose();
  };

  const handlePrint = () => {
    printProposal();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Exportar Proposta</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-commercial-600 mb-6">
            Escolha o formato para exportar a proposta <strong>{proposal.proposal_number}</strong>
          </div>

          <div className="grid gap-3">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleExportPDF}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-commercial-900">Exportar como PDF</h3>
                    <p className="text-sm text-commercial-600">
                      Arquivo em formato PDF para impressão ou envio
                    </p>
                  </div>
                  <Download className="w-5 h-5 text-commercial-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleExportExcel}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileSpreadsheet className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-commercial-900">Exportar como Excel</h3>
                    <p className="text-sm text-commercial-600">
                      Planilha editável com dados detalhados
                    </p>
                  </div>
                  <Download className="w-5 h-5 text-commercial-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handlePrint}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Printer className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-commercial-900">Imprimir</h3>
                    <p className="text-sm text-commercial-600">
                      Enviar diretamente para impressora
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onClose} disabled={isExporting}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalExportDialog;
