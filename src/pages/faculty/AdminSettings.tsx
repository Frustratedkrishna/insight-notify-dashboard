
import React, { useEffect, useState } from 'react';
import { FacultyNavbar } from '@/components/FacultyNavbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { fetchRegistrationSettings, updateRegistrationAccess } from '@/utils/facultyApprovalUtils';
import AdminRoleCheck from '@/components/faculty/AdminRoleCheck';

export default function AdminSettings() {
  const [createLoading, setCreateLoading] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [allowFacultyRegistration, setAllowFacultyRegistration] = useState(true);
  const [allowStudentRegistration, setAllowStudentRegistration] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadRegistrationSettings();
  }, []);

  const loadRegistrationSettings = async () => {
    try {
      setRegistrationLoading(true);
      const settings = await fetchRegistrationSettings();
      setAllowFacultyRegistration(settings.allowFacultyRegistration);
      setAllowStudentRegistration(settings.allowStudentRegistration);
    } catch (error) {
      console.error("Error loading registration settings:", error);
    } finally {
      setRegistrationLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    try {
      setCreateLoading(true);
      const { data, error } = await supabase.functions.invoke('create-admin-user');
      
      if (error) {
        throw new Error(error.message || 'Failed to create admin user');
      }
      
      toast({
        title: "Admin Creation Status",
        description: data.message,
      });
      
      if (data.admin) {
        console.log("Admin account details:", data.admin);
      }
    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create admin user",
        variant: "destructive",
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleSaveRegistrationSettings = async () => {
    setRegistrationLoading(true);
    try {
      await updateRegistrationAccess(allowFacultyRegistration, allowStudentRegistration);
    } finally {
      setRegistrationLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <FacultyNavbar role="admin" />
      <main className="flex-1 container mx-auto px-4 py-8 space-y-6">
        <AdminRoleCheck>
          <div className="space-y-6">
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
                    disabled={createLoading}
                  >
                    {createLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Create/Verify Admin Account"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Registration Access Control</CardTitle>
                <CardDescription>Control who can register new accounts in the system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="faculty-registration" className="font-medium">
                        Faculty Registration
                      </Label>
                      <p className="text-sm text-gray-500">
                        Allow new faculty members to register accounts
                      </p>
                    </div>
                    <Switch 
                      id="faculty-registration" 
                      checked={allowFacultyRegistration}
                      onCheckedChange={setAllowFacultyRegistration}
                      disabled={registrationLoading}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="student-registration" className="font-medium">
                        Student Registration
                      </Label>
                      <p className="text-sm text-gray-500">
                        Allow new students to register accounts
                      </p>
                    </div>
                    <Switch 
                      id="student-registration" 
                      checked={allowStudentRegistration}
                      onCheckedChange={setAllowStudentRegistration}
                      disabled={registrationLoading}
                    />
                  </div>

                  <Button 
                    onClick={handleSaveRegistrationSettings}
                    disabled={registrationLoading}
                  >
                    {registrationLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Registration Settings"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </AdminRoleCheck>
      </main>
      <Footer />
    </div>
  );
}
