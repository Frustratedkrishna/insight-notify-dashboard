
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface AdminRoleCheckProps {
  children: React.ReactNode;
}

const AdminRoleCheck: React.FC<AdminRoleCheckProps> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      setLoading(true);
      const facultyStr = localStorage.getItem('faculty');
      
      if (!facultyStr) {
        console.error("No faculty found in localStorage");
        setIsAdmin(false);
        toast({
          title: "Authentication Error",
          description: "Please login again",
          variant: "destructive",
        });
        navigate("/faculty-auth");
        return;
      }
      
      const faculty = JSON.parse(facultyStr);
      console.log("Faculty from localStorage:", faculty);
      
      if (faculty.role !== 'admin') {
        console.error("Faculty is not admin, role:", faculty.role);
        setIsAdmin(false);
        toast({
          title: "Access Denied",
          description: "Only administrators can access this page",
          variant: "destructive",
        });
        navigate("/faculty/dashboard");
        return;
      }
      
      setIsAdmin(true);
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
      toast({
        title: "Error",
        description: "Failed to verify administrator privileges",
        variant: "destructive",
      });
      navigate("/faculty/dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <p>Loading faculty data...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex-1 container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You do not have permission to view this page.</p>
            <Button 
              className="mt-4" 
              onClick={() => navigate("/faculty/dashboard")}
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRoleCheck;
