-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create study_documents table for uploaded files
CREATE TABLE public.study_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  enrollment_number TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create document_chunks table for text chunks with embeddings
CREATE TABLE public.document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.study_documents(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  page_number INTEGER,
  embedding vector(768),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for vector similarity search
CREATE INDEX document_chunks_embedding_idx ON public.document_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Enable RLS
ALTER TABLE public.study_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for study_documents
CREATE POLICY "Students can view their own documents"
  ON public.study_documents FOR SELECT
  USING (enrollment_number = current_setting('request.jwt.claims', true)::json->>'enrollment_number');

CREATE POLICY "Students can insert their own documents"
  ON public.study_documents FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Students can delete their own documents"
  ON public.study_documents FOR DELETE
  USING (enrollment_number = current_setting('request.jwt.claims', true)::json->>'enrollment_number');

-- RLS Policies for document_chunks
CREATE POLICY "Students can view chunks of their documents"
  ON public.document_chunks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.study_documents
      WHERE study_documents.id = document_chunks.document_id
      AND study_documents.enrollment_number = current_setting('request.jwt.claims', true)::json->>'enrollment_number'
    )
  );

CREATE POLICY "Allow insert for document chunks"
  ON public.document_chunks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Students can delete chunks of their documents"
  ON public.document_chunks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.study_documents
      WHERE study_documents.id = document_chunks.document_id
      AND study_documents.enrollment_number = current_setting('request.jwt.claims', true)::json->>'enrollment_number'
    )
  );

-- Create storage bucket for study materials
INSERT INTO storage.buckets (id, name, public)
VALUES ('study-materials', 'study-materials', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Students can upload their study materials"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'study-materials' AND auth.uid() IS NOT NULL);

CREATE POLICY "Students can view their study materials"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'study-materials');

CREATE POLICY "Students can delete their study materials"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'study-materials' AND auth.uid() IS NOT NULL);