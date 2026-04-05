import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { question, resource, files } = await req.json()
    // files = [{ file_url, file_type, extracted_text }]

    // Combine all extracted text from all files
    const combinedText = files
      ?.map((f: any, i: number) => `--- File ${i + 1} ---\n${f.extracted_text || ''}`)
      .filter((t: string) => t.trim().length > 10)
      .join('\n\n') || ''

    const hasExtractedText = combinedText.trim().length > 0

    const prompt = `You are an academic assistant helping a student understand content from their course material.

Resource: ${resource.title}
Course Code: ${resource.course_code}
Instructor: ${resource.instructor}
Year: ${resource.year ?? 'N/A'}
${resource.description ? `Description: ${resource.description}` : ''}

${hasExtractedText
  ? `The following is the full extracted content from the resource files:\n\n${combinedText}`
  : `No text could be extracted from this resource. Answer based on the course metadata and your knowledge of this subject area.`
}

Student's question: ${question}

Please provide a clear, detailed, and helpful answer based on the resource content above.`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
      })
    })

    const data = await response.json()
    console.log('Groq response status:', response.status)

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.error?.message || 'Groq API error' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status,
      })
    }

    const text = data.choices?.[0]?.message?.content

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})