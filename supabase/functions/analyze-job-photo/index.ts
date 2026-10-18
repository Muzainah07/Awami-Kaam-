import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const ANALYZE_PHOTO_PROMPT = `You are the AI Vision and Quote Engine for "Awami Kam" (عوامی کام), a daily-wage marketplace in Pakistan.
Analyze the provided photo(s) of a repair or home service task along with any optional hirer note.
Classify the job into one of these skills: painter, plumber, electrician, carpenter, mason, helper, ac_technician, cleaner, laborer, tile_worker, welder.
If the images do NOT show a valid repair, construction, or home service task (e.g. selfies, food, random objects, scenery), set is_job to false and provide a polite clarification_question in Urdu/English asking for a valid work photo.

Return a JSON object matching this exact schema:
{
  "is_job": boolean,
  "clarification_question": string | null,
  "job_type": string,
  "skill_needed": string,
  "severity": "low" | "medium" | "high",
  "estimated_size": { "value": number, "unit": string },
  "estimated_hours": number,
  "materials_hint": string[],
  "workers_needed": number,
  "urgency": "normal" | "urgent",
  "confidence": number,
  "explanation_short": string
}
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const startMs = Date.now();
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });

    const supabase = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_ANON_KEY') || '', { global: { headers: { Authorization: authHeader } } });
    const { images, note } = await req.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return new Response(JSON.stringify({ error: 'No images provided' }), { status: 400, headers: corsHeaders });
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const parts: any[] = [
      { text: ANALYZE_PHOTO_PROMPT },
      { text: `Hirer additional note: ${note || 'None'}` }
    ];

    for (const imgData of images.slice(0, 3)) {
      // Expecting base64 data string (e.g. data:image/jpeg;base64,...)
      const matches = imgData.match(/^data:(.+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        parts.push({
          inlineData: {
            mimeType: matches[1],
            data: matches[2]
          }
        });
      }
    }

    const res = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.2 }
      })
    });

    const json = await res.json();
    const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    let parsed = {};
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = { is_job: false, clarification_question: "Could not analyze photo. Please try uploading a clearer image of the repair." };
    }

    await supabase.from('ai_usage').insert({
      function_name: 'analyze-job-photo',
      tokens_used: json.usageMetadata?.totalTokenCount || 300,
      latency_ms: Date.now() - startMs
    });

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
