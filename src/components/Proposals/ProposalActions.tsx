import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Eye,
  Edit,
  Printer,
  Mail,
  MessageCircle,
  MoreVertical
} from 'lucide-react';
import { Proposal } from '@/hooks/useProposals';

interface ProposalActionsProps {
  proposal: Proposal;
  isMobile: boolean;
  onView: (proposal: Proposal) => void;
  onEdit: (proposal: Proposal) => void;
  onEmail: (proposal: Proposal) => void;
  onWhatsApp: (proposal: Proposal) => void;
  onExportPDF: (proposal: Proposal) => void;
}

const ProposalActions: React.FC<ProposalActionsProps> = ({
  proposal,
  isMobile,
  onView,
  onEdit,
  onEmail,
  onWhatsApp,
  onExportPDF,
}) => {
  if (isMobile) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => onView(proposal)}>
            <Eye className="w-4 h-4 mr-2" />
            Visualizar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onEmail(proposal)}>
            <Mail className="w-4 h-4 mr-2" />
            Enviar por Email
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onWhatsApp(proposal)}>
            <MessageCircle className="w-4 h-4 mr-2" />
            Enviar via WhatsApp
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onExportPDF(proposal)}>
            <Printer className="w-4 h-4 mr-2" />
            Exportar PDF
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onEdit(proposal)}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center gap-1.5 justify-center">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onView(proposal)}
        className="h-8 w-8 p-0"
      >
        <Eye className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onEmail(proposal)}
        title="Enviar por Email"
        className="text-blue-700 border-blue-300 hover:bg-blue-50 bg-blue-50/50 h-8 w-8 p-0"
      >
        <Mail className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onWhatsApp(proposal)}
        title="Enviar via WhatsApp"
        className="text-green-700 border-green-300 hover:bg-green-50 bg-green-50/50 h-8 w-8 p-0"
      >
        <MessageCircle className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onExportPDF(proposal)}
        className="h-8 w-8 p-0"
      >
        <Printer className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onEdit(proposal)}
        className="h-8 w-8 p-0"
      >
        <Edit className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default ProposalActions;