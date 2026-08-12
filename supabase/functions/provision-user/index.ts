import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS (This lets your website talk to this secure server)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Get the data sent from your React frontend
    const body = await req.json()
    const { email, password, firstName, lastName, whatsapp, username, avatarUrl, role, level, unit, discount, credits, cefr, rate, bioUrl, adminLevel } = body

    // 2. Safely connect to Supabase using hidden internal environment variables (No hardcoded keys!)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 3. Create the Auth User
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true 
    })

    if (authError) throw authError

    // 4. Insert their profile data into the custom 'profiles' table
    const { error: profileError } = await supabaseAdmin.from('profiles').insert([
      {
        id: authData.user.id,
        role: role,
        first_name: firstName,
        last_name: lastName,
        email: email,
        whatsapp: whatsapp,
        username: username,
        avatar_url: avatarUrl,
        level: level,
        unit: unit,
        discount: parseFloat(discount) || 0,
        credits: parseFloat(credits) || 0,
        cefr: cefr,
        rate: rate,
        bio_url: bioUrl,
        admin_level: adminLevel
      }
    ])

    if (profileError) throw profileError

    // 5. Tell the frontend it was a success!
    return new Response(
      JSON.stringify({ message: 'Account securely created!' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})