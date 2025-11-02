import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FacultyNavbar } from "@/components/FacultyNavbar";
import { Footer } from "@/components/Footer";
import AdminRoleCheck from "@/components/faculty/AdminRoleCheck";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Trophy, Edit, Trash2, Users, BarChart3 } from "lucide-react";
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

interface VoteCount {
  candidate_id: string;
  candidate_name: string;
  votes: number;
}

export default function ManageElections() {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [showElectionDialog, setShowElectionDialog] = useState(false);
  const [showCandidateDialog, setShowCandidateDialog] = useState(false);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [selectedElection, setSelectedElection] = useState<string | null>(null);
  const [voteResults, setVoteResults] = useState<VoteCount[]>([]);
  
  const [electionForm, setElectionForm] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: ""
  });

  const [candidateForm, setCandidateForm] = useState({
    name: "",
    description: "",
    photo_url: ""
  });

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('elections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setElections(data || []);
    } catch (error: any) {
      console.error('Error fetching elections:', error);
      toast.error('Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateElection = async () => {
    try {
      const { error } = await supabase
        .from('elections')
        .insert([electionForm]);

      if (error) throw error;

      toast.success('Election created successfully');
      setShowElectionDialog(false);
      setElectionForm({ title: "", description: "", start_date: "", end_date: "" });
      fetchElections();
    } catch (error: any) {
      console.error('Error creating election:', error);
      toast.error('Failed to create election');
    }
  };

  const handleDeleteElection = async (id: string) => {
    if (!confirm('Are you sure you want to delete this election?')) return;

    try {
      const { error } = await supabase
        .from('elections')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Election deleted successfully');
      fetchElections();
    } catch (error: any) {
      console.error('Error deleting election:', error);
      toast.error('Failed to delete election');
    }
  };

  const handleAddCandidate = async () => {
    if (!selectedElection) return;

    try {
      const { error } = await supabase
        .from('candidates')
        .insert([{
          ...candidateForm,
          election_id: selectedElection
        }]);

      if (error) throw error;

      toast.success('Candidate added successfully');
      setShowCandidateDialog(false);
      setCandidateForm({ name: "", description: "", photo_url: "" });
    } catch (error: any) {
      console.error('Error adding candidate:', error);
      toast.error('Failed to add candidate');
    }
  };

  const handleViewResults = async (electionId: string) => {
    try {
      // Fetch candidates
      const { data: candidates, error: candidatesError } = await supabase
        .from('candidates')
        .select('id, name')
        .eq('election_id', electionId);

      if (candidatesError) throw candidatesError;

      // Fetch vote counts
      const { data: votes, error: votesError } = await supabase
        .from('votes')
        .select('candidate_id')
        .eq('election_id', electionId);

      if (votesError) throw votesError;

      // Count votes per candidate
      const voteCounts: Record<string, number> = {};
      votes?.forEach(vote => {
        voteCounts[vote.candidate_id] = (voteCounts[vote.candidate_id] || 0) + 1;
      });

      const results: VoteCount[] = (candidates || []).map(candidate => ({
        candidate_id: candidate.id,
        candidate_name: candidate.name,
        votes: voteCounts[candidate.id] || 0
      }));

      results.sort((a, b) => b.votes - a.votes);

      setVoteResults(results);
      setSelectedElection(electionId);
      setShowResultsDialog(true);
    } catch (error: any) {
      console.error('Error fetching results:', error);
      toast.error('Failed to load results');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'upcoming':
        return <Badge variant="secondary">Upcoming</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <AdminRoleCheck>
        <div className="min-h-screen flex flex-col">
          <FacultyNavbar />
          <main className="flex-1 container mx-auto p-6">
            <Skeleton className="h-96 w-full" />
          </main>
          <Footer />
        </div>
      </AdminRoleCheck>
    );
  }

  return (
    <AdminRoleCheck>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
        <FacultyNavbar />
        
        <main className="flex-1 container mx-auto p-6">
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <Trophy className="w-8 h-8 text-primary" />
                    Manage Elections
                  </CardTitle>
                  <CardDescription>Create and manage college club elections</CardDescription>
                </div>
                <Dialog open={showElectionDialog} onOpenChange={setShowElectionDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Election
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Election</DialogTitle>
                      <DialogDescription>Add a new club election</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={electionForm.title}
                          onChange={(e) => setElectionForm({...electionForm, title: e.target.value})}
                          placeholder="e.g., Tech Club President Election"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={electionForm.description}
                          onChange={(e) => setElectionForm({...electionForm, description: e.target.value})}
                          placeholder="Election details..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="start_date">Start Date</Label>
                        <Input
                          id="start_date"
                          type="datetime-local"
                          value={electionForm.start_date}
                          onChange={(e) => setElectionForm({...electionForm, start_date: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="end_date">End Date</Label>
                        <Input
                          id="end_date"
                          type="datetime-local"
                          value={electionForm.end_date}
                          onChange={(e) => setElectionForm({...electionForm, end_date: e.target.value})}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreateElection}>Create Election</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {elections.map((election) => (
                    <TableRow key={election.id}>
                      <TableCell className="font-medium">{election.title}</TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(election.start_date), 'PP')} - {format(new Date(election.end_date), 'PP')}
                      </TableCell>
                      <TableCell>{getStatusBadge(election.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedElection(election.id);
                              setShowCandidateDialog(true);
                            }}
                          >
                            <Users className="w-4 h-4 mr-1" />
                            Add Candidate
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewResults(election.id)}
                          >
                            <BarChart3 className="w-4 h-4 mr-1" />
                            Results
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteElection(election.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {elections.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No elections created yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>

        {/* Add Candidate Dialog */}
        <Dialog open={showCandidateDialog} onOpenChange={setShowCandidateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Candidate</DialogTitle>
              <DialogDescription>Add a new candidate to the election</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="candidate_name">Name</Label>
                <Input
                  id="candidate_name"
                  value={candidateForm.name}
                  onChange={(e) => setCandidateForm({...candidateForm, name: e.target.value})}
                  placeholder="Candidate name"
                />
              </div>
              <div>
                <Label htmlFor="candidate_description">Description</Label>
                <Textarea
                  id="candidate_description"
                  value={candidateForm.description}
                  onChange={(e) => setCandidateForm({...candidateForm, description: e.target.value})}
                  placeholder="Brief description..."
                />
              </div>
              <div>
                <Label htmlFor="photo_url">Photo URL</Label>
                <Input
                  id="photo_url"
                  value={candidateForm.photo_url}
                  onChange={(e) => setCandidateForm({...candidateForm, photo_url: e.target.value})}
                  placeholder="https://..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddCandidate}>Add Candidate</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Results Dialog */}
        <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Election Results</DialogTitle>
              <DialogDescription>Vote counts for all candidates</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {voteResults.map((result, index) => (
                <div key={result.candidate_id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`text-2xl font-bold ${index === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{result.candidate_name}</p>
                      <p className="text-sm text-muted-foreground">{result.votes} votes</p>
                    </div>
                  </div>
                  {index === 0 && (
                    <Trophy className="w-6 h-6 text-primary" />
                  )}
                </div>
              ))}
              {voteResults.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">No votes yet</p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Footer />
      </div>
    </AdminRoleCheck>
  );
}