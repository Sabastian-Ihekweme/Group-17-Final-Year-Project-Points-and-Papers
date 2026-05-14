import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { context, resource, files, noteLength, formatStyle } = await req.json()

    const combinedText = files
      ?.map((f: any, i: number) => `--- File ${i + 1} ---\n${f.extracted_text || ''}`)
      .filter((t: string) => t.trim().length > 10)
      .join('\n\n') || ''

    const hasExtractedText = combinedText.trim().length > 0

    const formatInstructions = {
      'bullet points': 'Format the notes as clear bullet points using "•" symbols.',
      'paragraphs': 'Format the notes as well-structured paragraphs.',
      'mind map outline': 'Format the notes as a mind map outline using indentation and "→" symbols for sub-points.'
    }

    const lengthInstructions = {
      'Concise': 'Keep the notes brief and to the point — only the most essential information.',
      'Moderate': 'Provide a balanced level of detail — cover the key points without being too brief or too long.',
      'Detailed': 'Provide comprehensive, detailed notes covering all important points thoroughly.'
    }

    const prompt = `You are an academic assistant helping a student create study notes from their course material.

Resource: ${resource.title}
Course Code: ${resource.course_code}
Instructor: ${resource.instructor}
Year: ${resource.year ?? 'N/A'}
${resource.description ? `Description: ${resource.description}` : ''}

${hasExtractedText
  ? `The following is the full extracted content from the resource files:\n\n${combinedText}`
  : `No text could be extracted from this resource. Generate notes based on the course metadata and your knowledge of this subject area.`
}

Student's request: ${context}

Instructions:
- ${formatInstructions[formatStyle] || formatInstructions['bullet points']}
- ${lengthInstructions[noteLength] || lengthInstructions['Moderate']}
- Focus specifically on what the student asked for
- Make the notes clear, accurate, and useful for studying`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
      })
    })

    const data = await response.json()

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

