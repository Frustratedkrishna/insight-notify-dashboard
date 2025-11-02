-- Create elections table
CREATE TABLE public.elections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create candidates table
CREATE TABLE public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID REFERENCES public.elections(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  photo_url TEXT,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create votes table
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID REFERENCES public.elections(id) ON DELETE CASCADE NOT NULL,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(election_id, user_id)
);

-- Enable RLS
ALTER TABLE public.elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.faculty_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- RLS Policies for elections (everyone can view)
CREATE POLICY "Anyone can view elections"
  ON public.elections FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert elections"
  ON public.elections FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update elections"
  ON public.elections FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Only admins can delete elections"
  ON public.elections FOR DELETE
  USING (public.is_admin());

-- RLS Policies for candidates (everyone can view)
CREATE POLICY "Anyone can view candidates"
  ON public.candidates FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert candidates"
  ON public.candidates FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update candidates"
  ON public.candidates FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Only admins can delete candidates"
  ON public.candidates FOR DELETE
  USING (public.is_admin());

-- RLS Policies for votes
CREATE POLICY "Users can view their own votes"
  ON public.votes FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own votes"
  ON public.votes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all votes"
  ON public.votes FOR SELECT
  USING (public.is_admin());

-- Create function to update election status
CREATE OR REPLACE FUNCTION public.update_election_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.elections
  SET status = CASE
    WHEN NOW() < start_date THEN 'upcoming'
    WHEN NOW() >= start_date AND NOW() <= end_date THEN 'active'
    ELSE 'completed'
  END
  WHERE status != 'completed' OR (status = 'completed' AND NOW() <= end_date);
END;
$$;

-- Create indexes for better performance
CREATE INDEX idx_votes_election_id ON public.votes(election_id);
CREATE INDEX idx_votes_candidate_id ON public.votes(candidate_id);
CREATE INDEX idx_votes_user_id ON public.votes(user_id);
CREATE INDEX idx_candidates_election_id ON public.candidates(election_id);
CREATE INDEX idx_elections_status ON public.elections(status);