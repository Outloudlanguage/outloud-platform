import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const ZOOM_ACCOUNT_ID = Deno.env.get('ZOOM_ACCOUNT_ID')
const ZOOM_CLIENT_ID = Deno.env.get('ZOOM_CLIENT_ID')
const ZOOM_CLIENT_SECRET = Deno.env.get('ZOOM_CLIENT_SECRET')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { sessionId, topic } = await req.json()

    // 1. Get Zoom Access Token
    const authHeader = btoa(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`)
    const tokenResponse = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`
      }
    })
    
    const { access_token } = await tokenResponse.json()

    // 2. Create the Meeting
    const meetingResponse = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: topic || 'Live Session',
        type: 2, // Scheduled meeting
        duration: 60,
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          waiting_room: true
        }
      })
    })

    const meetingData = await meetingResponse.json()

    return new Response(JSON.stringify({ 
      startUrl: meetingData.start_url, 
      joinUrl: meetingData.join_url 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})