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

    // Fetch the file and convert to base64
    const fileResponse = await fetch(fileUrl)
    const arrayBuffer = await fileResponse.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

    let extractedText = ''

    if (fileType === 'image') {
      // Groq vision model for images
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: { url: `data:image/jpeg;base64,${base64}` }
                },
                {
                  type: "text",
                  text: "Transcribe ALL text visible in this image exactly as it appears. Include every question, answer, heading, and piece of text. Do not summarize — transcribe everything word for word."
                }
              ]
            }
          ],
          max_tokens: 4000,
        })
      })
      const groqData = await groqRes.json()
      extractedText = groqData.choices?.[0]?.message?.content ?? ''

    } else if (fileType === 'pdf') {
      // Gemini for PDF extraction
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${Deno.env.get('GEMINI_API_KEY')}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { inline_data: { mime_type: "application/pdf", data: base64 } },
                { text: "Transcribe ALL text in this PDF exactly as it appears. Include every question, answer, heading, and piece of text. Do not summarize — transcribe everything word for word." }
              ]
            }]
          })
        }
      )
      const geminiData = await geminiRes.json()
      extractedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    }

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


