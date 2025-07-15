
-- Create a table for storing marks uploads/batches
CREATE TABLE public.marks_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  faculty_id UUID NOT NULL REFERENCES public.faculty_profiles(id),
  course_name TEXT NOT NULL,
  section TEXT NOT NULL,
  year INTEGER NOT NULL,
  exam_type TEXT NOT NULL, -- 'Mid Term', 'Final Term', 'Internal Assessment', etc.
  minimum_marks INTEGER NOT NULL DEFAULT 40,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table for individual student marks
CREATE TABLE public.student_marks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id UUID NOT NULL REFERENCES public.marks_batches(id) ON DELETE CASCADE,
  enrollment_number TEXT NOT NULL,
  student_name TEXT NOT NULL,
  subject_marks JSONB NOT NULL, -- Store marks for each subject as JSON
  total_marks INTEGER,
  percentage DECIMAL(5,2),
  result_status TEXT DEFAULT 'PASS', -- 'PASS', 'FAIL', 'RE_EXAMINATION'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_student_marks_enrollment ON public.student_marks(enrollment_number);
CREATE INDEX idx_student_marks_batch ON public.student_marks(batch_id);
CREATE INDEX idx_marks_batches_faculty ON public.marks_batches(faculty_id);
CREATE INDEX idx_marks_batches_class ON public.marks_batches(course_name, section, year);

-- Enable RLS
ALTER TABLE public.marks_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_marks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marks_batches
CREATE POLICY "Faculty can view their own marks batches" 
ON public.marks_batches 
FOR SELECT 
USING (
  faculty_id IN (
    SELECT id FROM public.faculty_profiles 
    WHERE employee_id = (auth.uid())::text
  )
);

CREATE POLICY "Class coordinators can insert marks batches" 
ON public.marks_batches 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.faculty_profiles 
    WHERE id = faculty_id 
    AND employee_id = (auth.uid())::text
    AND role IN ('class_coordinator', 'admin')
  )
);

CREATE POLICY "Faculty can update their own marks batches" 
ON public.marks_batches 
FOR UPDATE 
USING (
  faculty_id IN (
    SELECT id FROM public.faculty_profiles 
    WHERE employee_id = (auth.uid())::text
  )
);

CREATE POLICY "Faculty can delete their own marks batches" 
ON public.marks_batches 
FOR DELETE 
USING (
  faculty_id IN (
    SELECT id FROM public.faculty_profiles 
    WHERE employee_id = (auth.uid())::text
  )
);

-- RLS Policies for student_marks
CREATE POLICY "Anyone can view student marks" 
ON public.student_marks 
FOR SELECT 
USING (true);

CREATE POLICY "Faculty can insert student marks" 
ON public.student_marks 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.marks_batches mb
    JOIN public.faculty_profiles fp ON mb.faculty_id = fp.id
    WHERE mb.id = batch_id 
    AND fp.employee_id = (auth.uid())::text
  )
);

CREATE POLICY "Faculty can update student marks" 
ON public.student_marks 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.marks_batches mb
    JOIN public.faculty_profiles fp ON mb.faculty_id = fp.id
    WHERE mb.id = batch_id 
    AND fp.employee_id = (auth.uid())::text
  )
);

CREATE POLICY "Faculty can delete student marks" 
ON public.student_marks 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.marks_batches mb
    JOIN public.faculty_profiles fp ON mb.faculty_id = fp.id
    WHERE mb.id = batch_id 
    AND fp.employee_id = (auth.uid())::text
  )
);
