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
    const { fileUrl, fileName, enrollmentNumber, studentId, documentId } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    console.log('Fetching file from storage:', fileUrl);
    
    // Download file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('study-materials')
      .download(fileUrl);

    if (downloadError) {
      console.error('Download error:', downloadError);
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    // Extract text from PDF
    const text = await fileData.text();
    console.log('Extracted text length:', text.length);

    // Split into chunks (approximately 500 characters each)
    const chunks: string[] = [];
    const chunkSize = 500;
    let currentChunk = '';
    const sentences = text.split(/[.!?]\s+/);

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    console.log(`Split into ${chunks.length} chunks`);

    // Generate embeddings and store chunks
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      // Generate embedding using Gemini
      const embeddingResponse = await fetch('https://ai.gateway.lovable.dev/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-004',
          input: chunk
        }),
      });

      if (!embeddingResponse.ok) {
        const errorText = await embeddingResponse.text();
        console.error('Embedding error:', embeddingResponse.status, errorText);
        throw new Error(`Failed to generate embedding: ${errorText}`);
      }

      const embeddingData = await embeddingResponse.json();
      const embedding = embeddingData.data[0].embedding;

      // Store chunk with embedding
      const { error: insertError } = await supabase
        .from('document_chunks')
        .insert({
          document_id: documentId,
          chunk_text: chunk,
          chunk_index: i,
          embedding: embedding
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error(`Failed to store chunk: ${insertError.message}`);
      }
    }

    console.log('Successfully processed document');

    return new Response(
      JSON.stringify({ 
        success: true, 
        chunksProcessed: chunks.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing document:', error);
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