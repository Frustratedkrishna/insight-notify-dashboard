-- Drop existing policies
DROP POLICY IF EXISTS "Only admins can insert elections" ON public.elections;
DROP POLICY IF EXISTS "Only admins can update elections" ON public.elections;
DROP POLICY IF EXISTS "Only admins can delete elections" ON public.elections;
DROP POLICY IF EXISTS "Only admins can insert candidates" ON public.candidates;
DROP POLICY IF EXISTS "Only admins can update candidates" ON public.candidates;
DROP POLICY IF EXISTS "Only admins can delete candidates" ON public.candidates;

-- Create new policies that allow all faculty with admin role
CREATE POLICY "Admins can insert elections"
ON public.elections
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.faculty_profiles
    WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can update elections"
ON public.elections
FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.faculty_profiles
    WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can delete elections"
ON public.elections
FOR DELETE
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.faculty_profiles
    WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can insert candidates"
ON public.candidates
FOR INSERT
TO public
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.faculty_profiles
    WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can update candidates"
ON public.candidates
FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.faculty_profiles
    WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can delete candidates"
ON public.candidates
FOR DELETE
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.faculty_profiles
    WHERE role = 'admin'
  )
);