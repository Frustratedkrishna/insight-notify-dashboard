import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardNav } from "@/components/DashboardNav";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Vote, Trophy, Calendar, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";

interface Election {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: string;
}

interface Candidate {
  id: string;
  election_id: string;
  name: string;
  description: string | null;
  photo_url: string | null;
}

interface UserVote {
  election_id: string;
  candidate_id: string;
}

export default function Voting() {
  const [elections, setElections] = useState<Election[]>([]);
  const [candidates, setCandidates] = useState<Record<string, Candidate[]>>({});
  const [userVotes, setUserVotes] = useState<UserVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingInProgress, setVotingInProgress] = useState<string | null>(null);

  useEffect(() => {
    fetchElectionsAndVotes();
  }, []);

  const fetchElectionsAndVotes = async () => {
    try {
      setLoading(true);

      // Update election statuses
      await supabase.rpc('update_election_status');

      // Fetch elections
      const { data: electionsData, error: electionsError } = await supabase
        .from('elections')
        .select('*')
        .order('start_date', { ascending: false });

      if (electionsError) throw electionsError;

      setElections(electionsData || []);

      // Fetch candidates for each election
      if (electionsData) {
        const candidatesData: Record<string, Candidate[]> = {};
        
        for (const election of electionsData) {
          const { data: electionCandidates, error: candidatesError } = await supabase
            .from('candidates')
            .select('*')
            .eq('election_id', election.id)
            .order('position');

          if (candidatesError) throw candidatesError;
          candidatesData[election.id] = electionCandidates || [];
        }

        setCandidates(candidatesData);
      }

      // Fetch user's votes
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: votesData, error: votesError } = await supabase
          .from('votes')
          .select('election_id, candidate_id')
          .eq('user_id', user.id);

        if (votesError) throw votesError;
        setUserVotes(votesData || []);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (electionId: string, candidateId: string) => {
    try {
      setVotingInProgress(electionId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to vote');
        return;
      }

      const { error } = await supabase
        .from('votes')
        .insert({
          election_id: electionId,
          candidate_id: candidateId,
          user_id: user.id
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('You have already voted in this election');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Vote submitted successfully!');
      fetchElectionsAndVotes();
    } catch (error: any) {
      console.error('Error voting:', error);
      toast.error('Failed to submit vote');
    } finally {
      setVotingInProgress(null);
    }
  };

  const hasVoted = (electionId: string) => {
    return userVotes.some(vote => vote.election_id === electionId);
  };

  const getVotedCandidate = (electionId: string) => {
    return userVotes.find(vote => vote.election_id === electionId)?.candidate_id;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500"><Clock className="w-3 h-3 mr-1" /> Active</Badge>;
      case 'upcoming':
        return <Badge variant="secondary"><Calendar className="w-3 h-3 mr-1" /> Upcoming</Badge>;
      case 'completed':
        return <Badge variant="outline"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
        <DashboardNav />
        <main className="flex-1 container mx-auto p-6">
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <DashboardNav />
      
      <main className="flex-1 container mx-auto p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              College Elections
            </h1>
            <p className="text-muted-foreground">
              Vote for your favorite candidates in club elections
            </p>
          </div>

          {/* Elections List */}
          {elections.length === 0 ? (
            <Card className="border-2">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Trophy className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-xl font-semibold mb-2">No Elections Available</p>
                <p className="text-muted-foreground">Check back later for upcoming elections</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {elections.map((election) => {
                const voted = hasVoted(election.id);
                const votedCandidateId = getVotedCandidate(election.id);
                const isActive = election.status === 'active';

                return (
                  <Card key={election.id} className="border-2 hover:border-primary/50 transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <CardTitle className="text-2xl flex items-center gap-2">
                            <Trophy className="w-6 h-6 text-primary" />
                            {election.title}
                          </CardTitle>
                          <CardDescription className="text-base">
                            {election.description}
                          </CardDescription>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Start: {format(new Date(election.start_date), 'PPP')}</span>
                            <span>End: {format(new Date(election.end_date), 'PPP')}</span>
                          </div>
                        </div>
                        {getStatusBadge(election.status)}
                      </div>
                    </CardHeader>

                    <CardContent>
                      {voted && (
                        <div className="mb-4 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 rounded-lg">
                          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="font-semibold">You have voted in this election</span>
                          </div>
                        </div>
                      )}

                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {candidates[election.id]?.map((candidate) => {
                          const isVotedCandidate = votedCandidateId === candidate.id;
                          
                          return (
                            <Card 
                              key={candidate.id}
                              className={`border-2 ${isVotedCandidate ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'hover:border-primary/50'} transition-all`}
                            >
                              <CardContent className="p-4 space-y-3">
                                {candidate.photo_url && (
                                  <img
                                    src={candidate.photo_url}
                                    alt={candidate.name}
                                    className="w-full h-32 object-cover rounded-lg"
                                  />
                                )}
                                <div>
                                  <h3 className="font-bold text-lg">{candidate.name}</h3>
                                  {candidate.description && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {candidate.description}
                                    </p>
                                  )}
                                </div>
                                
                                {isVotedCandidate ? (
                                  <Button className="w-full" variant="outline" disabled>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Your Vote
                                  </Button>
                                ) : (
                                  <Button
                                    className="w-full"
                                    onClick={() => handleVote(election.id, candidate.id)}
                                    disabled={!isActive || voted || votingInProgress === election.id}
                                  >
                                    <Vote className="w-4 h-4 mr-2" />
                                    {voted ? 'Already Voted' : 'Vote'}
                                  </Button>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>

                      {(!candidates[election.id] || candidates[election.id].length === 0) && (
                        <p className="text-center text-muted-foreground py-8">
                          No candidates added yet
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}