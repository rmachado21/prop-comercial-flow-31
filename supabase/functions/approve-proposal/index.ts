import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ApproveProposalRequest {
  token: string;
  clientName?: string;
  clientIP?: string;
  userAgent?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    const { token, clientName, clientIP, userAgent }: ApproveProposalRequest = await req.json()

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token é obrigatório' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Start transaction-like operations
    
    // 1. Validate and get token details
    const { data: tokenData, error: tokenError } = await supabase
      .from('proposal_tokens')
      .select('*')
      .eq('token', token)
      .is('used_at', null)  // Not used yet
      .gt('expires_at', new Date().toISOString())  // Not expired
      .single()

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: tokenError ? 'Token inválido ou expirado' : 'Token não encontrado'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 2. Mark token as used
    const { error: updateTokenError } = await supabase
      .from('proposal_tokens')
      .update({
        used_at: new Date().toISOString(),
        client_ip: clientIP,
        client_user_agent: userAgent,
      })
      .eq('token', token)

    if (updateTokenError) {
      console.error('Error updating token:', updateTokenError)
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao processar aprovação' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 3. Update proposal status to 'approved'
    const { error: updateProposalError } = await supabase
      .from('proposals')
      .update({
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('id', tokenData.proposal_id)

    if (updateProposalError) {
      console.error('Error updating proposal:', updateProposalError)
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao atualizar status da proposta' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 4. Log the approval in proposal_changes
    const { error: logError } = await supabase
      .from('proposal_changes')
      .insert({
        proposal_id: tokenData.proposal_id,
        user_id: '00000000-0000-0000-0000-000000000000', // System user for client actions
        field_changed: 'status',
        old_value: 'sent',
        new_value: 'approved',
        change_type: 'approved'
      })

    if (logError) {
      console.error('Error logging change:', logError)
      // Don't fail the request for logging errors
    }

    // Success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Proposta aprovada com sucesso!',
        proposalId: tokenData.proposal_id
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in approve-proposal function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erro interno do servidor' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})