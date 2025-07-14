import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubmitCommentsRequest {
  token: string;
  clientName?: string;
  clientEmail?: string;
  comments: string;
  clientIP?: string;
  userAgent?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { token, clientName, clientEmail, comments, clientIP, userAgent }: SubmitCommentsRequest = await req.json();

    console.log('=== INÍCIO DO PROCESSO DE OBSERVAÇÕES ===');
    console.log('Token:', token);
    console.log('Client Name:', clientName);
    console.log('Comments length:', comments?.length || 0);

    // Validate token
    const { data: tokenData, error: tokenError } = await supabaseClient
      .from('proposal_approval_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (tokenError || !tokenData) {
      console.error('Token inválido:', tokenError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Token inválido ou expirado' 
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Check if token has expired
    if (new Date(tokenData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'O link de observações expirou' 
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Insert client comments
    const { data: commentData, error: commentError } = await supabaseClient
      .from('proposal_client_comments')
      .insert({
        proposal_id: tokenData.proposal_id,
        token: token,
        client_name: clientName,
        client_email: clientEmail,
        comments: comments,
        client_ip: clientIP,
        user_agent: userAgent
      })
      .select()
      .single();

    if (commentError) {
      console.error('Erro ao inserir comentários:', commentError);
      throw new Error('Erro ao salvar observações');
    }

    console.log('Comentários salvos com sucesso:', commentData.id);

    // Update proposal status to "Contestada"
    const { error: updateError } = await supabaseClient
      .from('proposals')
      .update({ status: 'Contestada' })
      .eq('id', tokenData.proposal_id);

    if (updateError) {
      console.error('Erro ao atualizar status:', updateError);
      // Don't throw here as comment was saved successfully
    } else {
      console.log('Status da proposta atualizado para Contestada');
    }

    // Log the change in proposal_changes table
    try {
      const { error: changeError } = await supabaseClient
        .from('proposal_changes')
        .insert({
          proposal_id: tokenData.proposal_id,
          field_name: 'observacoes_cliente',
          old_value: null,
          new_value: comments,
          change_type: 'update',
          changed_by: 'client',
          client_approval: false,
          client_ip: clientIP,
          user_agent: userAgent
        });

      if (changeError) {
        console.error('Erro ao registrar mudança:', changeError);
      } else {
        console.log('Mudança registrada no histórico');
      }
    } catch (error) {
      console.error('Erro ao registrar no histórico:', error);
    }

    console.log('=== PROCESSO CONCLUÍDO COM SUCESSO ===');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Observações enviadas com sucesso'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error('Error in submit-client-comments function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Erro interno do servidor'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
};

serve(handler);