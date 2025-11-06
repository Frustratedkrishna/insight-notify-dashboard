-- Create function for matching document chunks using vector similarity
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  student_enrollment text
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  chunk_text text,
  chunk_index int,
  similarity float,
  file_name text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    dc.chunk_text,
    dc.chunk_index,
    1 - (dc.embedding <=> query_embedding) as similarity,
    sd.file_name
  FROM document_chunks dc
  JOIN study_documents sd ON sd.id = dc.document_id
  WHERE sd.enrollment_number = student_enrollment
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;