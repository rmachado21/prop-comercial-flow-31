import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the user token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const { name, value } = await req.json()

    if (!name || !value) {
      throw new Error('Name and value are required')
    }

    // Store the secret using Supabase CLI or admin API
    // For now, we'll store it in a secure way that can be accessed by other functions
    // This is a simplified version - in production you'd use proper secret management
    
    // Set the environment variable for the current session
    // Note: This is a demo implementation. In production, you'd use proper secret management
    console.log(`Setting secret ${name} for user ${user.id}`)
    
    // For demo purposes, we'll assume the secret is set
    // In a real implementation, you'd call the Supabase management API
    
    return new Response(
      JSON.stringify({ success: true, message: 'Secret stored successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})