
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FacultyProfile } from "@/types/supabase";

type FacultyRole = "admin" | "chairman" | "director" | "hod" | "class_coordinator";

const FacultyAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showAdminMessage, setShowAdminMessage] = useState(false);
  
  // Check if faculty is already logged in
  useEffect(() => {
    const checkAuth = () => {
      const facultyStr = localStorage.getItem('faculty');
      if (facultyStr) {
        try {
          const faculty = JSON.parse(facultyStr);
          if (faculty.employee_id) {
            navigate('/faculty/dashboard');
          } else {
            localStorage.removeItem('faculty');
          }
        } catch (error) {
          localStorage.removeItem('faculty');
        }
      }
    };

    checkAuth();
  }, [navigate]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [facultyRole, setFacultyRole] = useState<FacultyRole | "">("");
  const [department, setDepartment] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!firstName || !lastName || !employeeId || !password || !facultyRole) {
        throw new Error("Please fill in all required fields");
      }

      // Check if employee ID already exists
      const { data: existingFaculty } = await supabase
        .from('faculty_profiles')
        .select('employee_id')
        .eq('employee_id', employeeId)
        .maybeSingle();

      if (existingFaculty) {
        throw new Error("A faculty member with this employee ID already exists");
      }

      // Create faculty profile
      const { data: faculty, error: facultyError } = await supabase
        .from('faculty_profiles')
        .insert({
          employee_id: employeeId,
          password: password,
          first_name: firstName,
          last_name: lastName,
          role: facultyRole as FacultyRole,
          department: department || null,
          course_name: course || null,
          year: year ? parseInt(year) : null,
          section: section || null
        })
        .select()
        .single();

      if (facultyError) throw facultyError;

      // Handle profile image upload if provided
      if (profileImage && faculty.id) {
        const fileExt = profileImage.name.split('.').pop();
        const fileName = `${faculty.id}/profile.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(fileName, profileImage);

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast({
            title: "Warning",
            description: "Profile created but failed to upload profile image. You can try uploading it later.",
            variant: "destructive",
          });
        } else {
          // Update profile with image URL
          const { data: { publicUrl } } = supabase.storage
            .from('profile-images')
            .getPublicUrl(fileName);

          await supabase
            .from('faculty_profiles')
            .update({ profile_image_url: publicUrl })
            .eq('id', faculty.id);
        }
      }

      toast({
        title: "Registration successful!",
        description: "You can now login with your employee ID and password.",
      });

      // Clear form
      setFirstName("");
      setLastName("");
      setEmployeeId("");
      setPassword("");
      setFacultyRole("");
      setDepartment("");
      setCourse("");
      setYear("");
      setSection("");
      setProfileImage(null);
      setImagePreview(null);

    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowAdminMessage(false);

    try {
      if (!employeeId || !password) {
        throw new Error("Please fill in all required fields");
      }

      console.log('Attempting faculty login with employee ID:', employeeId);

      // Check credentials directly against faculty_profiles table
      const { data: faculty, error: facultyError } = await supabase
        .from('faculty_profiles')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('password', password)
        .maybeSingle();

      if (facultyError) {
        console.error('Login error:', facultyError);
        throw new Error("Failed to verify credentials");
      }

      if (!faculty) {
        setShowAdminMessage(true);
        throw new Error("Invalid credentials");
      }

      console.log('Faculty login successful:', faculty);

      // Store the faculty data in localStorage for session management
      localStorage.setItem('faculty', JSON.stringify(faculty));

      toast({
        title: "Welcome back!",
        description: `Logged in as ${faculty.first_name} ${faculty.last_name}`,
      });

      // Navigate to faculty dashboard with replace to prevent back navigation
      navigate("/faculty/dashboard", { replace: true });
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Faculty Portal - DBIT SIMS
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Student? <a href="/" className="font-medium text-indigo-600 hover:text-indigo-500">Login here</a>
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            {showAdminMessage && (
              <Alert variant="destructive">
                <AlertDescription>
                  Your faculty profile has not been set up yet. Please contact the administrator to get your profile created.
                </AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="login-employee-id">Employee ID</Label>
                <Input
                  id="login-employee-id"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Loading..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={imagePreview || ""} />
                    <AvatarFallback>Upload</AvatarFallback>
                  </Avatar>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password (min. 6 characters)</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div>
                <Label htmlFor="facultyRole">Role</Label>
                <Select 
                  value={facultyRole} 
                  onValueChange={(value: FacultyRole) => setFacultyRole(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="chairman">Chairman</SelectItem>
                    <SelectItem value="director">Director</SelectItem>
                    <SelectItem value="hod">HOD</SelectItem>
                    <SelectItem value="class_coordinator">Class Coordinator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {facultyRole === 'hod' && (
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                  />
                </div>
              )}

              {facultyRole === 'class_coordinator' && (
                <>
                  <div>
                    <Label htmlFor="course">Course</Label>
                    <Input
                      id="course"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      min="1"
                      max="4"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="section">Section</Label>
                    <Input
                      id="section"
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Loading..." : "Sign Up"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FacultyAuth;
