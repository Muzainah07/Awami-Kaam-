import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { WORKER_PROFILE_PROMPT } from "../_shared/prompts.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const startMs = Date.now();
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: authHeader } } });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid JWT' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body = await req.json();
    const { audioBase64, mimeType = 'audio/webm' } = body;

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY secret not set in Supabase');
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          parts: [
            { text: WORKER_PROFILE_PROMPT },
            {
              inlineData: {
                mimeType: mimeType,
                data: audioBase64
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    };

    let response;
    let attempts = 0;
    while (attempts < 2) {
      attempts++;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (response.ok) break;
      } catch (err) {
        if (attempts >= 2) throw err;
      }
    }

    if (!response || !response.ok) {
      throw new Error(`Gemini API failed with status ${response?.status}`);
    }

    const resultJson = await response.json();
    const textOutput = resultJson.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const parsedData = JSON.parse(textOutput);

    // If confidence < 0.6 or fields missing, generate followup
    if (parsedData.confidence < 0.6 || !parsedData.primary_skill || !parsedData.area) {
      parsedData.followup_question = parsedData.followup_question || "Bhai aap kis ilaqay mein rehte hain aur aap ka hunar kya hai?";
    }

    const latency = Date.now() - startMs;
    const tokens = resultJson.usageMetadata?.totalTokenCount || 250;

    // Log ai_usage
    await supabase.from('ai_usage').insert({
      user_id: user.id,
      function_name: 'transcribe-profile',
      tokens_used: tokens,
      latency_ms: latency,
      success: true
    });

    return new Response(JSON.stringify(parsedData), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
