
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "npm:resend@2.0.0";
import jsPDF from "npm:jspdf@2.5.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendProposalEmailRequest {
  proposalId: string;
  recipient: string;
  subject?: string;
  message?: string;
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { proposalId, recipient, subject, message }: SendProposalEmailRequest = await req.json();

    console.log('Sending proposal email:', { proposalId, recipient });

    // Fetch proposal details with client information
    const { data: proposal, error: proposalError } = await supabaseClient
      .from('proposals')
      .select(`
        *,
        client:clients(id, name, email, phone)
      `)
      .eq('id', proposalId)
      .single();

    if (proposalError || !proposal) {
      throw new Error('Proposta não encontrada');
    }

    // Fetch proposal items
    const { data: items, error: itemsError } = await supabaseClient
      .from('proposal_items')
      .select('*')
      .eq('proposal_id', proposalId)
      .order('sort_order', { ascending: true });

    if (itemsError) {
      throw new Error('Erro ao buscar itens da proposta');
    }

    // Generate PDF
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
    items?.forEach((item: any, index: number) => {
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

    // Convert PDF to buffer
    const pdfBuffer = pdf.output('arraybuffer');

    // Send email with PDF attachment
    const defaultSubject = `Proposta Comercial - ${proposal.proposal_number}`;
    const defaultMessage = `
Prezado(a) ${proposal.client?.name || 'Cliente'},

Segue em anexo nossa proposta comercial conforme solicitado.

**Detalhes da Proposta:**
- Número: ${proposal.proposal_number}
- Título: ${proposal.title}
- Valor Total: R$ ${proposal.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
${proposal.validity_days ? `- Validade: ${proposal.validity_days} dias` : ''}

Ficamos à disposição para esclarecimentos.

Atenciosamente,
Equipe Comercial
    `.trim();

    const emailResponse = await resend.emails.send({
      from: 'Proposta Comercial <onboarding@resend.dev>',
      to: [recipient],
      subject: subject || defaultSubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Proposta Comercial</h2>
          <p style="white-space: pre-line;">${message || defaultMessage}</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            Esta é uma mensagem automática. Por favor, não responda a este email.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `proposta-${proposal.proposal_number}.pdf`,
          content: new Uint8Array(pdfBuffer),
        },
      ],
    });

    if (emailResponse.error) {
      throw new Error(`Erro ao enviar email: ${emailResponse.error.message}`);
    }

    // Record the send in proposal_sends table
    const { error: recordError } = await supabaseClient
      .from('proposal_sends')
      .insert({
        proposal_id: proposalId,
        send_method: 'email',
        recipient: recipient,
        status: 'sent',
      });

    if (recordError) {
      console.error('Error recording send:', recordError);
      // Don't throw here as email was sent successfully
    }

    console.log('Email sent successfully:', emailResponse.data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResponse.data?.id,
        message: 'Proposta enviada por email com sucesso'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error in send-proposal-email function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor',
        success: false
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
