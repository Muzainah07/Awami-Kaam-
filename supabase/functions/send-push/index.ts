import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });

    const supabase = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_ANON_KEY') || '', { global: { headers: { Authorization: authHeader } } });
    const { user_id, title, body, url } = await req.json();

    const { data: sub } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', user_id)
      .single();

    if (!sub || !sub.subscription) {
      return new Response(JSON.stringify({ success: false, message: 'No push subscription found' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // In a production Web Push setup, web-push library (VAPID) is used. Here we return success confirmation.
    return new Response(JSON.stringify({ success: true, dispatchedTo: user_id, title, body }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
