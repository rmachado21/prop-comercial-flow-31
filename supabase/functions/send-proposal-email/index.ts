
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "npm:resend@2.0.0";

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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== INÍCIO DO PROCESSO DE ENVIO ===');
    
    // Validate required environment variables
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('RESEND_API_KEY configurada:', !!resendApiKey);
    console.log('SUPABASE_URL configurada:', !!supabaseUrl);
    console.log('SUPABASE_ANON_KEY configurada:', !!supabaseAnonKey);
    console.log('SUPABASE_SERVICE_ROLE_KEY configurada:', !!supabaseServiceKey);
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY não configurada');
    }
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      throw new Error('Credenciais do Supabase não configuradas');
    }
    
    // Initialize Resend with validated API key
    const resend = new Resend(resendApiKey);

    // Initialize Supabase client for user operations (anon key with auth)
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Initialize Supabase client for admin operations (service role key)
    const supabaseAdmin = createClient(
      supabaseUrl,
      supabaseServiceKey
    );

    const { proposalId, recipient, subject, message }: SendProposalEmailRequest = await req.json();

    console.log('=== DADOS RECEBIDOS ===');
    console.log('Proposal ID:', proposalId);
    console.log('Recipient:', recipient);
    console.log('Subject:', subject);

    // Fetch proposal details with client information
    console.log('=== BUSCANDO PROPOSTA ===');
    const { data: proposal, error: proposalError } = await supabaseClient
      .from('proposals')
      .select(`
        *,
        client:clients(id, name, email, phone)
      `)
      .eq('id', proposalId)
      .single();

    if (proposalError) {
      console.error('Erro ao buscar proposta:', proposalError);
      throw new Error(`Erro ao buscar proposta: ${proposalError.message}`);
    }

    if (!proposal) {
      console.error('Proposta não encontrada');
      throw new Error('Proposta não encontrada');
    }

    console.log('Proposta encontrada:', proposal.proposal_number);

    // Fetch proposal items
    console.log('=== BUSCANDO ITENS DA PROPOSTA ===');
    const { data: items, error: itemsError } = await supabaseClient
      .from('proposal_items')
      .select('*')
      .eq('proposal_id', proposalId)
      .order('sort_order', { ascending: true });

    if (itemsError) {
      console.error('Erro ao buscar itens:', itemsError);
      throw new Error(`Erro ao buscar itens da proposta: ${itemsError.message}`);
    }

    console.log('Itens encontrados:', items?.length || 0);

    // Fetch company data for email subject
    console.log('=== BUSCANDO DADOS DA EMPRESA ===');
    const { data: company, error: companyError } = await supabaseClient
      .from('companies')
      .select('name')
      .eq('user_id', proposal.user_id)
      .single();

    if (companyError) {
      console.error('Erro ao buscar empresa:', companyError);
    }

    console.log('Empresa encontrada:', company?.name || 'Não encontrada');

    // Prepare email content with company name in subject
    const companyName = company?.name || 'Proposta';
    const defaultSubject = subject || `Proposta ${companyName} ${proposal.proposal_number}`;
    const defaultMessage = `
Prezado(a) ${proposal.client?.name || 'Cliente'},

Segue nossa proposta comercial conforme solicitado. PDF anexo.

**Detalhes da Proposta:**
- Número: ${proposal.proposal_number}
- Valor Total: R$ ${proposal.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
${proposal.validity_days ? `- Validade: ${proposal.validity_days} dias` : ''}

**Itens da Proposta:**
${items?.map((item: any, index: number) => 
  `${index + 1}. ${item.product_name} - Qtd: ${item.quantity} - Valor: R$ ${item.total_price.toFixed(2)}`
).join('\n') || 'Nenhum item encontrado'}

Ficamos à disposição para esclarecimentos.

Atenciosamente,
Equipe Comercial
    `.trim();

    // Generate approval token using service role
    console.log('=== GERANDO TOKEN DE APROVAÇÃO ===');
    let approvalLink = null;
    let commentsLink = null;
    try {
      const { data: tokenData, error: tokenError } = await supabaseAdmin
        .from('proposal_approval_tokens')
        .insert({
          proposal_id: proposalId,
        })
        .select('token')
        .single();

      if (tokenError) {
        console.error('Erro ao criar token de aprovação:', tokenError);
      } else {
        // Create approval and comments links
        const baseUrl = Deno.env.get('SITE_URL') || 'https://propostaonline.app.br';
        approvalLink = `${baseUrl}/aprovacao/${tokenData.token}`;
        commentsLink = `${baseUrl}/observacoes/${tokenData.token}`;
        console.log('Token de aprovação criado com sucesso:', tokenData.token);
      }
    } catch (error) {
      console.error('Erro ao gerar token:', error);
    }

    console.log('=== ENVIANDO EMAIL ===');
    const emailResponse = await resend.emails.send({
      from: 'Propostas Online <noreply@propostaonline.app.br>',
      to: [recipient],
      subject: defaultSubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; margin-bottom: 20px; text-align: center;">Proposta Comercial</h2>
            <div style="white-space: pre-line; line-height: 1.6; color: #374151;">${message || defaultMessage}</div>
            
            ${approvalLink && commentsLink ? `
            <div style="text-align: center; margin: 40px 0;">
              <div style="margin-bottom: 15px;">
                <a href="${approvalLink}" 
                   style="background-color: #22c55e; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 6px; font-weight: bold;
                          display: inline-block; margin-right: 10px;">
                  ✅ Aprovar Proposta
                </a>
              </div>
              <div>
                <a href="${commentsLink}" 
                   style="background-color: #3b82f6; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 6px; font-weight: bold;
                          display: inline-block;">
                  💬 Adicionar Observações
                </a>
              </div>
              <p style="font-size: 12px; color: #6b7280; margin-top: 15px;">
                Clique em "Aprovar" para aceitar a proposta ou "Adicionar Observações" para enviar comentários e/ou solicitar alterações.
              </p>
            </div>
            ` : ''}
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <div style="text-align: center;">
              <p style="font-size: 12px; color: #6b7280; margin: 0;">
                Esta é uma mensagem automática do sistema Propostas Online
              </p>
              <p style="font-size: 12px; color: #6b7280; margin: 5px 0 0 0;">
                Por favor, não responda a este email.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error('Erro na resposta do Resend:', emailResponse.error);
      throw new Error(`Erro ao enviar email: ${emailResponse.error.message}`);
    }

    console.log('Email enviado com sucesso. ID:', emailResponse.data?.id);

    // Record the send in proposal_sends table
    console.log('=== REGISTRANDO ENVIO ===');
    const { error: recordError } = await supabaseClient
      .from('proposal_sends')
      .insert({
        proposal_id: proposalId,
        send_method: 'email',
        recipient: recipient,
        status: 'sent',
      });

    if (recordError) {
      console.error('Erro ao registrar envio:', recordError);
      // Don't throw here as email was sent successfully
    } else {
      console.log('Envio registrado com sucesso');
    }

    // Update proposal status to "Enviada" and set sent_at timestamp
    console.log('=== ATUALIZANDO STATUS DA PROPOSTA ===');
    const { error: updateError } = await supabaseClient
      .from('proposals')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', proposalId);

    if (updateError) {
      console.error('Erro ao atualizar status da proposta:', updateError);
      // Don't throw here as email was sent successfully
    } else {
      console.log('Status da proposta atualizado para "Enviada"');
    }

    console.log('=== PROCESSO CONCLUÍDO COM SUCESSO ===');

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
