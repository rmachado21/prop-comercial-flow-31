import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotifyClientRequest {
  proposalId: string;
  clientEmail: string;
  clientName: string;
  proposalNumber: string;
  proposalTitle: string;
  proposalUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("=== INÍCIO NOTIFICAÇÃO CLIENTE ===");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { proposalId, clientEmail, clientName, proposalNumber, proposalTitle, proposalUrl }: NotifyClientRequest = await req.json();
    
    console.log("Enviando notificação para:", clientEmail);
    console.log("Proposta:", proposalNumber);

    // Send email notification
    const emailResponse = await resend.emails.send({
      from: "Proposta Online <noreply@propostas.dev>",
      to: [clientEmail],
      subject: `Proposta ${proposalNumber} foi atualizada`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            Proposta Atualizada
          </h2>
          
          <p>Olá <strong>${clientName}</strong>,</p>
          
          <p>Sua proposta comercial foi atualizada com base nos seus comentários:</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Número da Proposta:</strong> ${proposalNumber}</p>
            <p><strong>Título:</strong> ${proposalTitle}</p>
          </div>
          
          <p>Clique no link abaixo para visualizar as atualizações:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${proposalUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Ver Proposta Atualizada
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Respondemos aos seus comentários e fizemos os ajustes necessários. 
            Por favor, revise a proposta atualizada e nos informe se tudo está conforme suas necessidades.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px;">
            Este é um e-mail automático. Se você não solicitou esta proposta, pode ignorar este e-mail.
          </p>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error("Erro no envio do email:", emailResponse.error);
      throw new Error(`Erro no envio: ${emailResponse.error.message}`);
    }

    console.log("Email enviado com sucesso:", emailResponse.data?.id);

    // Log the notification in database
    const { error: notificationError } = await supabase
      .from('proposal_client_notifications')
      .insert({
        proposal_id: proposalId,
        notification_type: 'updated',
        client_email: clientEmail,
        status: 'sent'
      });

    if (notificationError) {
      console.error("Erro ao registrar notificação:", notificationError);
      // Continue even if logging fails
    }

    console.log("=== NOTIFICAÇÃO CONCLUÍDA ===");

    return new Response(JSON.stringify({ 
      success: true,
      emailId: emailResponse.data?.id
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Erro geral:", error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);