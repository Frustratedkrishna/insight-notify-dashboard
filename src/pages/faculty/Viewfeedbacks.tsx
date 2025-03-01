
import { useEffect, useState } from "react";
import { FacultyNavbar } from "@/components/FacultyNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Inbox, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ViewFeedbacks() {
  const [loading, setLoading] = useState(true);
  const [facultyProfile, setFacultyProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeedbacks = async () => {
      // Check if faculty is logged in
      const facultyStr = localStorage.getItem('faculty');
      if (!facultyStr) {
        navigate("/faculty-auth");
        return;
      }
      
      setFacultyProfile(JSON.parse(facultyStr));
      setLoading(false);
    };

    fetchFeedbacks();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <FacultyNavbar role={facultyProfile?.role} />
      <main className="container mx-auto p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-6 text-primary flex items-center">
          <MessageSquare className="h-6 w-6 mr-2" />
          Student Feedbacks
        </h1>
        
        <Card className="shadow-sm border-accent/20">
          <CardHeader className="bg-accent/10">
            <CardTitle className="text-primary flex items-center gap-2">
              <Inbox className="h-5 w-5" />
              Feedbacks Inbox
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-pulse flex space-x-4">
                  <div className="rounded-full bg-secondary/20 h-10 w-10"></div>
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-secondary/20 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-secondary/20 rounded"></div>
                      <div className="h-4 bg-secondary/20 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/30 text-primary mb-4">
                  <Inbox className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-medium mb-2">No feedbacks available yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  When students provide feedback on your teaching or materials, it will appear here.
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  Check back regularly as students can submit feedback at any time.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
