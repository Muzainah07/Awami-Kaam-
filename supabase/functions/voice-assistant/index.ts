import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const VOICE_ASSISTANT_PROMPT = `You are the Awami Kam AI Voice Assistant for daily wage workers in Pakistan.
You listen to the worker's voice query (in Urdu, Roman Urdu, Punjabi, Pashto, Sindhi, or English) and classify their intent and extract parameters.

Valid Intents:
1. my_jobs_today - Check assigned or active jobs today.
2. earnings_today - Check earnings for today.
3. earnings_week - Check earnings for this week.
4. set_online - Set worker online to receive jobs.
5. set_offline - Set worker offline.
6. change_rate - Change expected daily rate (extract amount in PKR).
7. nearby_demand - Check nearby demand in the area.
8. repeat_last_offer - Repeat details of the last offer.
9. help - General help or guidance.
10. unknown - If query is unclear or unrecognized.

Return JSON matching this schema:
{
  "intent": "my_jobs_today" | "earnings_today" | "earnings_week" | "set_online" | "set_offline" | "change_rate" | "nearby_demand" | "repeat_last_offer" | "help" | "unknown",
  "extracted_value": 0, // e.g. new rate amount or target value if applicable
  "requires_confirmation": boolean, // true for state changes like set_offline or change_rate
  "confirmation_prompt_ur": "string", // e.g. "کیا آپ شرح 3,800 روپے کرنا چاہتے ہیں؟"
  "reply_ur": "string", // Natural, warm Urdu reply suitable for TTS
  "reply_en": "string", // English translation
  "confidence": 0.0
}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { audio_base64, transcript_text, language = 'ur' } = await req.json();

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not set in Supabase secrets');
    }

    // Call Gemini 2.5 Flash / 1.5 Flash
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const parts: any[] = [];
    if (audio_base64) {
      parts.push({
        inlineData: {
          mimeType: 'audio/webm',
          data: audio_base64,
        },
      });
    }
    parts.push({
      text: `User transcript or input: ${transcript_text || '(Voice audio provided)'}. Language: ${language}. Classify intent and return JSON.`,
    });

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        systemInstruction: {
          parts: [{ text: VOICE_ASSISTANT_PROMPT }],
        },
        generationConfig: {
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errText}`);
    }

    const geminiResult = await response.json();
    const rawText = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(rawText || '{}');

    // Log intent to admin table or ai_usage
    await supabase.from('ai_usage').insert({
      function_name: 'voice-assistant',
      user_id: user.id,
      tokens_used: geminiResult.usageMetadata?.totalTokenCount || 100,
      latency_ms: 450,
      status: 'success',
    });

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
