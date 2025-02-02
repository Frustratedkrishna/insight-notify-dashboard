import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isStudent, setIsStudent] = useState(true);
  
  // Common fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [password, setPassword] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Student fields
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [abcId, setAbcId] = useState("");

  // Faculty fields
  const [facultyRole, setFacultyRole] = useState<string>("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [qualification, setQualification] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [specialization, setSpecialization] = useState("");

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
      if (!firstName || !lastName || !enrollmentNumber || !password) {
        throw new Error("Please fill in all required fields");
      }

      const { data: { user }, error: authError } = await supabase.auth.signUp({
        email: `${enrollmentNumber}@temp.com`,
        password: password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            enrollment_number: enrollmentNumber,
            role: isStudent ? 'student' : 'faculty',
            course_name: course,
            year: year ? parseInt(year) : null,
            section,
            aadhar_number: aadharNumber,
            abc_id: abcId,
          }
        }
      });

      if (authError) throw authError;
      if (!user?.id) throw new Error("Failed to create user");

      let profileImageUrl = null;
      if (profileImage) {
        const fileExt = profileImage.name.split('.').pop();
        const filePath = `${user.id}/profile.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(filePath, profileImage);

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast({
            title: "Warning",
            description: "Failed to upload profile image. You can try uploading it later.",
            variant: "destructive",
          });
        } else {
          profileImageUrl = filePath;
        }
      }

      if (!isStudent) {
        // Ensure facultyRole is of the correct type
        const validFacultyRole = facultyRole as "admin" | "chairman" | "director" | "hod" | "class_coordinator";
        
        const { error: facultyError } = await supabase
          .from('faculty_profiles')
          .insert({
            id: user.id,
            role: validFacultyRole,
            department,
            designation,
            qualification,
            experience_years: experienceYears ? parseInt(experienceYears) : null,
            specialization
          });

        if (facultyError) throw facultyError;
      }

      toast({
        title: "Registration successful!",
        description: "You can now login with your enrollment number and password.",
      });

      // Clear form
      setFirstName("");
      setLastName("");
      setEnrollmentNumber("");
      setPassword("");
      setCourse("");
      setYear("");
      setSection("");
      setAadharNumber("");
      setAbcId("");
      setProfileImage(null);
      setImagePreview(null);
      setFacultyRole("");
      setDepartment("");
      setDesignation("");
      setQualification("");
      setExperienceYears("");
      setSpecialization("");

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

    try {
      const { data: userId, error: checkError } = await supabase
        .rpc('check_password', {
          p_enrollment_number: enrollmentNumber,
          p_password: password
        });

      if (checkError) throw checkError;
      if (!userId) throw new Error("Invalid enrollment number or password");

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*, faculty_profiles(*)')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      if (!profile) throw new Error("Profile not found");

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: `${enrollmentNumber}@temp.com`,
        password: password
      });

      if (signInError) throw signInError;

      toast({
        title: "Welcome back!",
        description: `Logged in as ${profile.first_name} ${profile.last_name}`,
      });

      navigate("/dashboard");
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
            Welcome to DBIT SIMS
          </h2>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="login-enrollment">Enrollment/Employee Number</Label>
                <Input
                  id="login-enrollment"
                  value={enrollmentNumber}
                  onChange={(e) => setEnrollmentNumber(e.target.value)}
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

              <div className="space-y-2">
                <Label>Registration Type</Label>
                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant={isStudent ? "default" : "outline"}
                    onClick={() => setIsStudent(true)}
                  >
                    Student
                  </Button>
                  <Button
                    type="button"
                    variant={!isStudent ? "default" : "outline"}
                    onClick={() => setIsStudent(false)}
                  >
                    Faculty
                  </Button>
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
                <Label htmlFor="enrollmentNumber">
                  {isStudent ? "Enrollment Number" : "Employee Number"}
                </Label>
                <Input
                  id="enrollmentNumber"
                  value={enrollmentNumber}
                  onChange={(e) => setEnrollmentNumber(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {isStudent ? (
                <>
                  <div>
                    <Label htmlFor="course">Course</Label>
                    <Input
                      id="course"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        type="number"
                        min="1"
                        max="4"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="section">Section</Label>
                      <Input
                        id="section"
                        value={section}
                        onChange={(e) => setSection(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="aadharNumber">Aadhar Number</Label>
                    <Input
                      id="aadharNumber"
                      value={aadharNumber}
                      onChange={(e) => setAadharNumber(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="abcId">ABC ID</Label>
                    <Input
                      id="abcId"
                      value={abcId}
                      onChange={(e) => setAbcId(e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="facultyRole">Role</Label>
                    <Select value={facultyRole} onValueChange={setFacultyRole}>
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

                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="designation">Designation</Label>
                    <Input
                      id="designation"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="qualification">Qualification</Label>
                    <Input
                      id="qualification"
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="experienceYears">Years of Experience</Label>
                    <Input
                      id="experienceYears"
                      type="number"
                      min="0"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input
                      id="specialization"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
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

export default Auth;