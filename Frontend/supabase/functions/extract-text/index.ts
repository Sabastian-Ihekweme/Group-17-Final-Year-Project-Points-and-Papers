import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { fileUrl, fileType, resourceId, fileId } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

// Fetch file and convert to base64 in chunks (no stack overflow)
const fileResponse = await fetch(fileUrl)
if (!fileResponse.ok) throw new Error(`Fetch failed: ${fileResponse.status}`)
const bytes = new Uint8Array(await fileResponse.arrayBuffer())

let binary = ''
const CHUNK = 0x8000 // 32KB
for (let i = 0; i < bytes.length; i += CHUNK) {
  binary += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK) as unknown as number[])
}
const base64 = btoa(binary)

let extractedText = ''

if (fileType === 'image') {
  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
    },
    body: JSON.stringify({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [{
        role: "user",
        content: [
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64}` } },
          { type: "text", text: "Transcribe ALL text visible in this image exactly as it appears, word for word." }
        ]
      }],
      max_tokens: 4000,
    })
  })
  const groqData = await groqRes.json()
  if (!groqRes.ok) throw new Error(`Groq: ${JSON.stringify(groqData)}`)
  extractedText = groqData.choices?.[0]?.message?.content ?? ''

} else if (fileType === 'pdf') {
  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${Deno.env.get('GEMINI_API_KEY')}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inline_data: { mime_type: "application/pdf", data: base64 } },
            { text: "Transcribe ALL text in this PDF exactly as it appears, word for word." }
          ]
        }]
      })
    }
  )
  const geminiData = await geminiRes.json()
  if (!geminiRes.ok) throw new Error(`Gemini: ${JSON.stringify(geminiData)}`)
  extractedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

if (!extractedText) throw new Error('Extraction returned empty text')


    // Save to resource_files if fileId provided, otherwise to resources
    if (fileId) {
      await supabase.from('resource_files').update({ extracted_text: extractedText }).eq('id', fileId)
    } else {
      await supabase.from('resources').update({ extracted_text: extractedText }).eq('id', resourceId)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})


