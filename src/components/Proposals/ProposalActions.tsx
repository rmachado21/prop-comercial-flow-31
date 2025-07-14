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
  Trash2,
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
  onDelete: (proposal: Proposal) => void;
  onEmail: (proposal: Proposal) => void;
  onWhatsApp: (proposal: Proposal) => void;
  onExportPDF: (proposal: Proposal) => void;
}

const ProposalActions: React.FC<ProposalActionsProps> = ({
  proposal,
  isMobile,
  onView,
  onEdit,
  onDelete,
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
          <DropdownMenuItem 
            onClick={() => onDelete(proposal)}
            className="text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onView(proposal)}
      >
        <Eye className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onEmail(proposal)}
        title="Enviar por Email"
        className="text-blue-600 border-blue-200 hover:bg-blue-50 bg-blue-50/50"
      >
        <Mail className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onWhatsApp(proposal)}
        title="Enviar via WhatsApp"
        className="text-green-600 border-green-200 hover:bg-green-50 bg-green-50/50"
      >
        <MessageCircle className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onExportPDF(proposal)}
      >
        <Printer className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onEdit(proposal)}
      >
        <Edit className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onDelete(proposal)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </>
  );
};

export default ProposalActions;