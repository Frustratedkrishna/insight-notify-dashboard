
import { useEffect, useState } from "react";
import { FacultyNavbar } from "@/components/FacultyNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ViewFeedbacks() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(false);
    };

    fetchFeedbacks();
  }, []);

  return (
    <div className="min-h-screen">
      <FacultyNavbar />
      <main className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Feedbacks</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading feedbacks...</p>
            ) : (
              <p>No feedbacks available.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
