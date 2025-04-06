
import React, { useEffect, useState } from 'react';
import { FacultyNavbar } from '@/components/FacultyNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettings() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminStatus = () => {
      try {
        const facultyStr = localStorage.getItem('faculty');
        if (!facultyStr) {
          setIsAdmin(false);
          return;
        }
        
        const faculty = JSON.parse(facultyStr);
        setIsAdmin(faculty.role === 'admin');
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  const handleCreateAdmin = async () => {
    try {
      setLoading(true);
      const response = await supabase.functions.invoke('create-admin-user');
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to create admin user');
      }
      
      toast({
        title: "Admin Creation Status",
        description: response.data.message,
      });
    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create admin user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <FacultyNavbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p>You do not have permission to view this page.</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <FacultyNavbar role="admin" />
      <main className="flex-1 container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Admin Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Admin Account</h3>
              <p className="text-sm text-gray-500 mb-2">
                Ensure the admin account exists in the system
              </p>
              <Button 
                onClick={handleCreateAdmin}
                disabled={loading}
              >
                {loading ? "Processing..." : "Create/Verify Admin Account"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};
