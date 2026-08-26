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
    const body = await req.json()
    const { email, password, firstName, lastName, whatsapp, avatarUrl, role, level, unit } = body

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Create User and feed the SQL trigger safely
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        role: role,
        level: level,
        unit: String(unit) // Casted to string to prevent strict database type crashes
      }
    })

    if (authError) throw authError

    // 2. Patch the fields that the SQL trigger misses (Crucially: the email)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        email: email,
        whatsapp: whatsapp || null,
        avatar_url: avatarUrl || null
      })
      .eq('id', authData.user.id)

    if (profileError) throw profileError

    return new Response(
      JSON.stringify({ message: 'Success' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})