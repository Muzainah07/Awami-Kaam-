import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { PARSE_JOB_PROMPT } from "../_shared/prompts.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const startMs = Date.now();
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });

    const supabase = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_ANON_KEY') || '', { global: { headers: { Authorization: authHeader } } });
    const { text, audioBase64 } = await req.json();

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const parts: any[] = [{ text: PARSE_JOB_PROMPT }, { text: `Job description: ${text || 'Voice input'}` }];
    if (audioBase64) {
      parts.push({ inlineData: { mimeType: 'audio/webm', data: audioBase64 } });
    }

    const res = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }], generationConfig: { responseMimeType: "application/json", temperature: 0.1 } })
    });

    const json = await res.json();
    const parsed = JSON.parse(json.candidates?.[0]?.content?.parts?.[0]?.text || '{}');

    await supabase.from('ai_usage').insert({ function_name: 'parse-job', tokens_used: json.usageMetadata?.totalTokenCount || 200, latency_ms: Date.now() - startMs });

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
