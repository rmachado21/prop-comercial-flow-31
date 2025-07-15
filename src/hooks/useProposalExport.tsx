
import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { Proposal, ProposalItem } from './useProposals';
import { useToast } from '@/hooks/use-toast';
import { useCompanyData } from './useCompanyData';
import { createRoot } from 'react-dom/client';
import ProposalPDFTemplate from '@/components/Proposals/ProposalPDFTemplate';

export const useProposalExport = () => {
  const { toast } = useToast();
  const { company } = useCompanyData();
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async (proposal: Proposal, items: ProposalItem[], customFileName?: string) => {
    setIsExporting(true);
    try {
      // Create a temporary container
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      tempContainer.style.width = '210mm';
      tempContainer.style.backgroundColor = 'white';
      document.body.appendChild(tempContainer);

      // Create React root and render template
      const root = createRoot(tempContainer);
      
      // Render the template
      root.render(
        <ProposalPDFTemplate 
          proposal={proposal} 
          items={items} 
          company={company} 
        />
      );

      // Wait for rendering to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get the rendered template element
      const templateElement = tempContainer.querySelector('#pdf-template') as HTMLElement;
      
      if (!templateElement) {
        throw new Error('Template não encontrado');
      }

      // Generate canvas from HTML
      const canvas = await html2canvas(templateElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: templateElement.scrollWidth,
        height: templateElement.scrollHeight,
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save PDF
      pdf.save(`${customFileName || `proposta-${proposal.proposal_number}`}.pdf`);

      // Cleanup
      root.unmount();
      document.body.removeChild(tempContainer);
      
      toast({
        title: 'Sucesso',
        description: 'PDF exportado com sucesso',
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao exportar PDF',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async (proposal: Proposal, items: ProposalItem[]) => {
    setIsExporting(true);
    try {
      const workbook = XLSX.utils.book_new();
      
      // Proposal info sheet
      const proposalData = [
        ['PROPOSTA COMERCIAL'],
        [''],
        ['Número', proposal.proposal_number],
        ['Título', proposal.title],
        ['Cliente', proposal.client?.name || 'N/A'],
        ['Status', proposal.status],
        ['Data de Criação', new Date(proposal.created_at).toLocaleDateString('pt-BR')],
        ['Validade (dias)', proposal.validity_days?.toString() || 'Indefinida'],
        [''],
        ['RESUMO FINANCEIRO'],
        ['Subtotal', `R$ ${proposal.subtotal.toFixed(2)}`],
        ['Desconto', `R$ ${(proposal.discount_amount || 0).toFixed(2)}`],
        ['Impostos', `R$ ${(proposal.tax_amount || 0).toFixed(2)}`],
        ['TOTAL', `R$ ${proposal.total_amount.toFixed(2)}`],
      ];

      if (proposal.description) {
        proposalData.splice(8, 0, ['Descrição', proposal.description]);
      }

      const proposalSheet = XLSX.utils.aoa_to_sheet(proposalData);
      XLSX.utils.book_append_sheet(workbook, proposalSheet, 'Proposta');

      // Items sheet
      const itemsData = [
        ['Item', 'Nome do Produto', 'Descrição', 'Quantidade', 'Preço Unitário', 'Desconto %', 'Desconto R$', 'Total']
      ];

      items.forEach((item, index) => {
        itemsData.push([
          (index + 1).toString(),
          item.product_name,
          item.product_description || '',
          item.quantity.toString(),
          item.unit_price.toString(),
          (item.discount_percentage || 0).toString(),
          (item.discount_amount || 0).toString(),
          item.total_price.toString()
        ]);
      });

      const itemsSheet = XLSX.utils.aoa_to_sheet(itemsData);
      XLSX.utils.book_append_sheet(workbook, itemsSheet, 'Itens');

      XLSX.writeFile(workbook, `proposta-${proposal.proposal_number}.xlsx`);
      
      toast({
        title: 'Sucesso',
        description: 'Excel exportado com sucesso',
      });
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao exportar Excel',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const printProposal = () => {
    window.print();
  };

  return {
    exportToPDF,
    exportToExcel,
    printProposal,
    isExporting,
  };
};
