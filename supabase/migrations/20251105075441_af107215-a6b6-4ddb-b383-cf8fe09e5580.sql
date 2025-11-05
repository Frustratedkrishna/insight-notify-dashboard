-- Drop existing RLS policies on votes table that use auth.uid()
DROP POLICY IF EXISTS "Users can insert their own votes" ON public.votes;
DROP POLICY IF EXISTS "Users can view their own votes" ON public.votes;
DROP POLICY IF EXISTS "Admins can view all votes" ON public.votes;

-- Add enrollment_number column to votes table to track student votes
ALTER TABLE public.votes ADD COLUMN IF NOT EXISTS enrollment_number text;

-- Create new RLS policies that work without auth
CREATE POLICY "Anyone can vote"
ON public.votes
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Users can view votes"
ON public.votes
FOR SELECT
TO public
USING (true);

-- Add unique constraint to prevent duplicate votes per election per student
ALTER TABLE public.votes DROP CONSTRAINT IF EXISTS unique_vote_per_election_enrollment;
ALTER TABLE public.votes ADD CONSTRAINT unique_vote_per_election_enrollment 
UNIQUE (election_id, enrollment_number);