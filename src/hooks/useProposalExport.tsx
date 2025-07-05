
import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { Proposal, ProposalItem } from './useProposals';
import { useToast } from '@/hooks/use-toast';

export const useProposalExport = () => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async (proposal: Proposal, items: ProposalItem[], customFileName?: string) => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = margin;

      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PROPOSTA COMERCIAL', margin, yPosition);
      yPosition += 20;

      // Proposal info
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Número: ${proposal.proposal_number}`, margin, yPosition);
      yPosition += 10;
      pdf.text(`Título: ${proposal.title}`, margin, yPosition);
      yPosition += 10;
      pdf.text(`Cliente: ${proposal.client?.name || 'N/A'}`, margin, yPosition);
      yPosition += 10;
      pdf.text(`Data: ${new Date(proposal.created_at).toLocaleDateString('pt-BR')}`, margin, yPosition);
      yPosition += 20;

      // Items table
      pdf.setFont('helvetica', 'bold');
      pdf.text('ITENS DA PROPOSTA', margin, yPosition);
      yPosition += 15;

      // Table headers
      const headers = ['Item', 'Descrição', 'Qtd', 'Preço Unit.', 'Total'];
      const columnWidths = [20, 80, 25, 30, 30];
      let xPosition = margin;

      pdf.setFontSize(10);
      headers.forEach((header, index) => {
        pdf.text(header, xPosition, yPosition);
        xPosition += columnWidths[index];
      });
      yPosition += 10;

      // Table rows
      pdf.setFont('helvetica', 'normal');
      items.forEach((item, index) => {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = margin;
        }

        xPosition = margin;
        const rowData = [
          (index + 1).toString(),
          item.product_name,
          item.quantity.toString(),
          `R$ ${item.unit_price.toFixed(2)}`,
          `R$ ${item.total_price.toFixed(2)}`
        ];

        rowData.forEach((data, colIndex) => {
          const maxWidth = columnWidths[colIndex] - 5;
          const lines = pdf.splitTextToSize(data, maxWidth);
          pdf.text(lines, xPosition, yPosition);
          xPosition += columnWidths[colIndex];
        });
        yPosition += 15;
      });

      // Totals
      yPosition += 10;
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Subtotal: R$ ${proposal.subtotal.toFixed(2)}`, pageWidth - 80, yPosition);
      yPosition += 10;
      
      if (proposal.discount_amount && proposal.discount_amount > 0) {
        pdf.text(`Desconto: R$ ${proposal.discount_amount.toFixed(2)}`, pageWidth - 80, yPosition);
        yPosition += 10;
      }
      
      if (proposal.tax_amount && proposal.tax_amount > 0) {
        pdf.text(`Impostos: R$ ${proposal.tax_amount.toFixed(2)}`, pageWidth - 80, yPosition);
        yPosition += 10;
      }
      
      pdf.text(`TOTAL: R$ ${proposal.total_amount.toFixed(2)}`, pageWidth - 80, yPosition);

      // Footer
      if (proposal.terms_and_conditions) {
        yPosition += 20;
        pdf.setFont('helvetica', 'bold');
        pdf.text('TERMOS E CONDIÇÕES', margin, yPosition);
        yPosition += 10;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        const termsLines = pdf.splitTextToSize(proposal.terms_and_conditions, pageWidth - 2 * margin);
        pdf.text(termsLines, margin, yPosition);
      }

      pdf.save(`${customFileName || `proposta-${proposal.proposal_number}`}.pdf`);
      
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
