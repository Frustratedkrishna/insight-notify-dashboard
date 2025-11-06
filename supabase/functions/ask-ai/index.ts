import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, enrollmentNumber } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    console.log('Processing question:', question);

    // Generate embedding for the question
    const embeddingResponse = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-004',
        input: question
      }),
    });

    if (!embeddingResponse.ok) {
      const errorText = await embeddingResponse.text();
      console.error('Embedding error:', embeddingResponse.status, errorText);
      
      if (embeddingResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (embeddingResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please contact administrator.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`Failed to generate embedding: ${errorText}`);
    }

    const embeddingData = await embeddingResponse.json();
    const questionEmbedding = embeddingData.data[0].embedding;

    // Search for similar chunks using pgvector
    const { data: similarChunks, error: searchError } = await supabase.rpc('match_document_chunks', {
      query_embedding: questionEmbedding,
      match_threshold: 0.5,
      match_count: 5,
      student_enrollment: enrollmentNumber
    });

    if (searchError) {
      console.error('Search error:', searchError);
      throw new Error(`Failed to search documents: ${searchError.message}`);
    }

    console.log('Found similar chunks:', similarChunks?.length || 0);

    if (!similarChunks || similarChunks.length === 0) {
      return new Response(
        JSON.stringify({ 
          answer: 'Yeh information aapke notes me available nahi hai. Kripya aur documents upload karein.',
          sources: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare context from chunks
    const context = similarChunks
      .map((chunk: any) => `${chunk.chunk_text}`)
      .join('\n\n');

    // Generate answer using Gemini
    const chatResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a friendly study assistant. Answer questions only using the provided document context. 
            If the information is not clearly present in the context, say: "Yeh information notes me available nahi hai."
            Keep answers short, simple, and friendly. You can respond in English or Hinglish based on the question.
            Always be helpful and encouraging to students.`
          },
          {
            role: 'user',
            content: `Context from study materials:\n${context}\n\nQuestion: ${question}`
          }
        ],
      }),
    });

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      console.error('Chat error:', chatResponse.status, errorText);
      
      if (chatResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (chatResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please contact administrator.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`Failed to generate answer: ${errorText}`);
    }

    const chatData = await chatResponse.json();
    const answer = chatData.choices[0].message.content;

    // Prepare sources
    const sources = similarChunks.map((chunk: any) => ({
      fileName: chunk.file_name,
      text: chunk.chunk_text.substring(0, 150) + '...'
    }));

    return new Response(
      JSON.stringify({ answer, sources }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ask-ai:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});