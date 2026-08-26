import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Get ONLY the exact data sent from your React frontend payload
    const body = await req.json()
    const { email, password, firstName, lastName, whatsapp, avatarUrl, role, level, unit } = body

    // 2. Safely connect to Supabase
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 3. Create the Auth User AND feed the SQL trigger its required data
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        role: role,
        level: level,
        unit: unit
      }
    })

    if (authError) throw authError

    // 4. Update ONLY the fields that the frontend actually sent and the trigger missed
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        whatsapp: whatsapp,
        avatar_url: avatarUrl
      })
      .eq('id', authData.user.id)

    if (profileError) throw profileError

    // 5. Tell the frontend it was a success!
    return new Response(
      JSON.stringify({ message: 'Account securely created!' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    // This logs the exact failure reason to the Supabase Edge Function console
    console.error("EDGE FUNCTION ERROR:", error.message)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})