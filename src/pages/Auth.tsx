
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Database } from "@/integrations/supabase/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { fetchRegistrationSettings } from "@/utils/facultyApprovalUtils";

type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [registrationDisabled, setRegistrationDisabled] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(true);
  
  // Check if registration is allowed
  useEffect(() => {
    const checkRegistrationAccess = async () => {
      try {
        setCheckingRegistration(true);
        const settings = await fetchRegistrationSettings();
        setRegistrationDisabled(!settings.allowStudentRegistration);
        
        // Force switch to login tab if registration is disabled
        if (!settings.allowStudentRegistration && activeTab === "register") {
          setActiveTab("login");
        }
      } catch (error) {
        console.error("Error checking registration access:", error);
      } finally {
        setCheckingRegistration(false);
      }
    };
    
    checkRegistrationAccess();
  }, [activeTab]);
  
  useEffect(() => {
    const checkAuth = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.enrollment_number) {
            navigate('/dashboard');
          } else {
            localStorage.removeItem('user');
          }
        } catch (error) {
          localStorage.removeItem('user');
        }
      }
    };

    checkAuth();
  }, [navigate]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [enrollmentNumber, setEnrollmentNumber] = useState("");
  const [password, setPassword] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [abcId, setAbcId] = useState("");

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

      console.log("Starting registration process...");

      const { data: existingStudent, error: checkError } = await supabase
        .from('profiles')
        .select('enrollment_number')
        .eq('enrollment_number', enrollmentNumber)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking enrollment:', checkError);
        throw new Error("Error checking enrollment number: " + checkError.message);
      }

      if (existingStudent) {
        throw new Error("A student with this enrollment number already exists");
      }

      const newId = crypto.randomUUID();
      console.log("Generated new ID:", newId);

      let profileImageUrl = null;

      // Upload image if provided
      if (profileImage) {
        console.log('Preparing to upload profile image...');
        const fileExt = profileImage.name.split('.').pop();
        const fileName = `${newId}/profile.${fileExt}`;
        const filePath = fileName;

        // Check if bucket exists
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        
        if (bucketsError) {
          console.error('Error checking buckets:', bucketsError);
          toast({
            title: "Warning",
            description: "Error checking storage buckets. Will continue with registration.",
            variant: "destructive",
          });
        }

        console.log('Uploading profile image to path:', filePath);
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('profile-images')
          .upload(filePath, profileImage, {
            upsert: true,
            cacheControl: '3600'
          });

        if (uploadError) {
          console.error('Image upload error:', uploadError);
          toast({
            title: "Warning",
            description: "Failed to upload profile image: " + uploadError.message,
            variant: "destructive",
          });
        } else {
          console.log('Image uploaded successfully:', uploadData);
          
          // Get the public URL for the uploaded image
          const { data: { publicUrl } } = supabase.storage
            .from('profile-images')
            .getPublicUrl(filePath);
          
          profileImageUrl = publicUrl;
          console.log('Image public URL:', profileImageUrl);
        }
      }

      // Now create the profile with the image URL if available
      const insertData: ProfileInsert = {
        id: newId,
        first_name: firstName,
        last_name: lastName,
        enrollment_number: enrollmentNumber,
        password,
        course_name: course || null,
        year: year ? parseInt(year) : null,
        section: section || null,
        role: 'student',
        email: null,
        profile_image_url: profileImageUrl, // Set the URL here
        verify: false
      };

      console.log('Attempting to insert profile with data:', insertData);

      const { data, error: profileError } = await supabase
        .from('profiles')
        .insert([insertData])
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error("Failed to create profile: " + profileError.message);
      }

      console.log('Profile created successfully:', data);

      toast({
        title: "Success!",
        description: "Registration successful! Your account now needs to be verified by your class coordinator before you can login.",
      });

      // Reset form fields
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

    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "An unexpected error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setVerificationPending(false);

    try {
      if (!enrollmentNumber || !password) {
        throw new Error("Please fill in all required fields");
      }

      console.log('Attempting login with enrollment:', enrollmentNumber);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('enrollment_number', enrollmentNumber)
        .eq('password', password)
        .maybeSingle();

      if (profileError) {
        console.error('Login error:', profileError);
        throw new Error("Failed to verify credentials");
      }

      if (!profile) {
        throw new Error("Invalid enrollment number or password");
      }

      // Check if the account is verified
      if (!profile.verify) {
        console.log('Account not verified:', profile);
        setVerificationPending(true);
        throw new Error("Your account has not been verified yet. Please contact your class coordinator for approval.");
      }

      console.log('Login successful, profile:', profile);

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(profile));

      toast({
        title: "Welcome back!",
        description: `Logged in as ${profile.first_name} ${profile.last_name}`,
      });

      // Navigate to dashboard with replace to prevent back navigation
      navigate("/dashboard", { replace: true });
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
            Student Portal - DBIT SIMS
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Faculty? <a href="/faculty-auth" className="font-medium text-indigo-600 hover:text-indigo-500">Login here</a>
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register" disabled={registrationDisabled || checkingRegistration}>
              Register {checkingRegistration && <Loader2 className="ml-2 h-3 w-3 animate-spin" />}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            {verificationPending && (
              <Alert className="mb-4">
                <AlertDescription>
                  Your account has not been verified yet. Please contact your class coordinator for approval.
                </AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="login-enrollment">Enrollment Number</Label>
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
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            {registrationDisabled ? (
              <Alert className="mb-4">
                <AlertDescription>
                  Registration is currently disabled by the administrator. Please contact the admin for assistance.
                </AlertDescription>
              </Alert>
            ) : (
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
                  <Label htmlFor="enrollmentNumber">Enrollment Number</Label>
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

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : "Sign Up"}
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
