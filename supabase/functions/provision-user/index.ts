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
    // 1. Catch ALL data sent from the React frontend
    const body = await req.json()
    const { email, password, firstName, lastName, whatsapp, avatarUrl, role, level, unit, cohort } = body

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Create the Auth User
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true
    })

    if (authError) throw authError

    // 3. FORCE UPDATE the blank row the database trigger just made.
    // By using the exact ID, it is mathematically impossible to miss the row.
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        email: email, // This fixes the NULL email permanently
        first_name: firstName,
        last_name: lastName,
        whatsapp: whatsapp,
        avatar_url: avatarUrl,
        role: role,
        level: level,
        unit: unit,
        cohort: cohort,
        assigned_password: password,
        status: 'active',
        available_credits: 0
      })
      .eq('id', authData.user.id) 

    if (profileError) throw profileError

    return new Response(
      JSON.stringify({ message: 'Account securely created and fully mapped!' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    console.error("EDGE FUNCTION ERROR:", error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})