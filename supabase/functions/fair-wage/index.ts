import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { FAIR_WAGE_PROMPT } from "../_shared/prompts.ts";

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

    const body = await req.json();
    const { skill, city = 'Karachi', area, jobSize, urgency = 'normal', offeredRatePkr } = body;

    // Fetch source of truth from wage_benchmarks table
    const { data: benchmark } = await supabase
      .from('wage_benchmarks')
      .select('*')
      .eq('skill', skill)
      .eq('city', city)
      .single();

    const baseMin = benchmark?.min_pkr || 3000;
    const baseMax = benchmark?.max_pkr || 5000;
    const baseAvg = benchmark?.avg_pkr || 4000;

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) throw new Error('GEMINI_API_KEY secret not set');

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const prompt = `${FAIR_WAGE_PROMPT}\nBenchmark for ${skill} in ${city}: Min PKR ${baseMin}, Max PKR ${baseMax}, Avg PKR ${baseAvg}.\nJob Size: ${jobSize}, Urgency: ${urgency}, Offered Rate: ${offeredRatePkr || 'Not specified'}. Adjust within +/-25% and return JSON.`;

    const res = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.2 }
      })
    });

    const resultJson = await res.json();
    const textOut = resultJson.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const parsed = JSON.parse(textOut);

    // Clamp results within +/-25% of base limits
    const clampedMin = Math.max(Math.round(baseMin * 0.75), parsed.min_rate_pkr || baseMin);
    const clampedMax = Math.min(Math.round(baseMax * 1.25), parsed.max_rate_pkr || baseMax);
    const recommended = Math.round((clampedMin + clampedMax) / 2);

    const offered = offeredRatePkr || recommended;
    const is_fair = offered >= clampedMin * 0.9;
    const diff = Math.round(((offered - recommended) / recommended) * 100);

    const responsePayload = {
      skill,
      city,
      area,
      min_rate_pkr: clampedMin,
      max_rate_pkr: clampedMax,
      recommended_pkr: recommended,
      market_average_pkr: recommended,
      is_fair,
      difference_percentage: diff,
      reason: parsed.reason || `Based on 2026 Karachi benchmarks for ${skill}.`,
      worker_voice_warning_ur: parsed.worker_voice_warning_ur || `یہ ریٹ منصفانہ ہے (${recommended} روپے)۔`,
      worker_voice_warning_en: parsed.worker_voice_warning_en || `This rate is fair (Recommended PKR ${recommended}).`
    };

    const latency = Date.now() - startMs;
    await supabase.from('ai_usage').insert({
      function_name: 'fair-wage',
      tokens_used: resultJson.usageMetadata?.totalTokenCount || 150,
      latency_ms: latency,
      success: true
    });

    return new Response(JSON.stringify(responsePayload), {
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
