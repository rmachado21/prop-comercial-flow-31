import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.51.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubmitCommentsRequest {
  token: string;
  clientName: string;
  clientEmail: string;
  comments: string;
  clientIP?: string;
  userAgent?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("=== INÍCIO DO PROCESSO DE OBSERVAÇÕES ===");
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { token, clientName, clientEmail, comments, clientIP, userAgent }: SubmitCommentsRequest = await req.json();
    
    console.log("Client Name:", clientName);
    console.log("Token:", token);
    console.log("Comments length:", comments.length);

    // Get client IP from request headers if not provided
    const realClientIP = clientIP || req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const realUserAgent = userAgent || req.headers.get('user-agent') || 'unknown';

    // 1. Validate token and get proposal info
    const { data: tokenData, error: tokenError } = await supabase
      .from('proposal_tokens')
      .select(`
        *,
        proposals (
          id,
          user_id,
          proposal_number,
          title,
          clients (
            id,
            name,
            email
          )
        )
      `)
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (tokenError || !tokenData) {
      console.error("Token validation error:", tokenError);
      return new Response(JSON.stringify({ error: 'Token inválido ou expirado' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log("Token válido para proposta:", tokenData.proposals.proposal_number);

    // 2. Save client comments
    const { data: commentData, error: commentError } = await supabase
      .from('proposal_client_comments')
      .insert({
        proposal_id: tokenData.proposal_id,
        token: token,
        client_name: clientName,
        client_email: clientEmail,
        comments: comments,
        client_ip: realClientIP,
        user_agent: realUserAgent,
      })
      .select()
      .single();

    if (commentError) {
      console.error("Erro ao salvar comentários:", commentError);
      return new Response(JSON.stringify({ error: 'Erro ao salvar comentários' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log("Comentários salvos com sucesso:", commentData.id);

    // 3. Update proposal status to 'contested'
    const { error: updateError } = await supabase
      .from('proposals')
      .update({ 
        status: 'contested',
        updated_after_comment: false // Reset this flag when contested
      })
      .eq('id', tokenData.proposal_id);

    if (updateError) {
      console.error("Erro ao atualizar status:", updateError);
      // Continue even if status update fails - comments are already saved
    } else {
      console.log("Status da proposta atualizado para 'contested'");
    }

    // 4. Register the change in proposal_changes (with NULL user_id for system)
    const { error: changeError } = await supabase
      .from('proposal_changes')
      .insert({
        proposal_id: tokenData.proposal_id,
        user_id: null, // System change
        change_type: 'client_comment',
        field_changed: 'status',
        old_value: 'sent',
        new_value: 'contested'
      });

    if (changeError) {
      console.error("Erro ao registrar mudança:", changeError);
      // Continue even if logging fails
    } else {
      console.log("Mudança registrada no histórico");
    }

    console.log("=== PROCESSO CONCLUÍDO COM SUCESSO ===");

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Comentários enviados com sucesso'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Erro geral:", error);
    return new Response(JSON.stringify({ 
      error: 'Erro interno do servidor' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);