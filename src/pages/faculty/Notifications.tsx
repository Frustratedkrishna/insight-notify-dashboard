
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FacultyNavbar } from "@/components/FacultyNavbar";
import { NotificationCard } from "@/components/NotificationCard";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Notification } from "@/types/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FacultyProfile {
  id: string;
  role: string;
  course_name?: string;
  section?: string;
  department?: string;
  year?: number;
}

const notificationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

export default function FacultyNotifications() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [facultyProfile, setFacultyProfile] = useState<FacultyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof notificationSchema>>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  useEffect(() => {
    console.log("FacultyNotifications component mounted");
    const fetchData = async () => {
      try {
        // Check localStorage for faculty data
        const facultyStr = localStorage.getItem('faculty');
        
        if (!facultyStr) {
          console.log("No faculty data in localStorage, redirecting to faculty-auth");
          setError("Authentication required. Please login again.");
          navigate("/faculty-auth");
          return;
        }
        
        // Parse the faculty data
        const faculty = JSON.parse(facultyStr);
        setFacultyProfile(faculty);
        
        console.log("Faculty profile loaded from localStorage:", faculty);

        // Fetch notifications based on role
        let query = supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false });

        // Adjust query based on faculty role
        if (faculty.role === 'class_coordinator') {
          // Class coordinators see notifications for their specific class
          query = query.or(`type.eq.general,and(type.eq.course_specific,department.eq.${faculty.course_name},semester.eq.${faculty.year ? String(faculty.year * 2) : ''},section.eq.${faculty.section || ''})`);
        } else if (faculty.role === 'hod') {
          // HODs see notifications for their department
          query = query.or(`type.eq.general,and(type.eq.course_specific,department.eq.${faculty.course_name})`);
        }

        const { data: notificationsData, error: notificationsError } = await query;

        if (notificationsError) {
          console.error("Notifications error:", notificationsError);
          throw notificationsError;
        }

        setNotifications(notificationsData || []);
        console.log("Notifications loaded:", notificationsData);
      } catch (error: any) {
        console.error("Error fetching notifications:", error);
        setError(error.message);
        toast({
          title: "Error loading notifications",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, toast]);

  const onSubmit = async (values: z.infer<typeof notificationSchema>) => {
    try {
      if (!facultyProfile) {
        toast({
          title: "Error",
          description: "Faculty profile not found. Please login again.",
          variant: "destructive",
        });
        return;
      }

      console.log("Creating notification with data:", {
        title: values.title,
        content: values.content,
        faculty: facultyProfile
      });

      // Prepare notification data based on faculty role
      const notificationData: {
        title: string;
        content: string;
        type: string;
        department?: string; 
        semester?: string;
        section?: string;
      } = {
        title: values.title,
        content: values.content,
        type: 'course_specific',
      };
      
      // Set appropriate fields based on faculty role
      if (facultyProfile.role === 'class_coordinator' && facultyProfile.course_name) {
        // Class coordinator - specific to course, year+semester, and section
        notificationData.department = facultyProfile.course_name;
        
        if (facultyProfile.year) {
          const semester = String(facultyProfile.year * 2);
          notificationData.semester = semester;
        }
        
        if (facultyProfile.section) {
          notificationData.section = facultyProfile.section;
        }
      } else if (facultyProfile.role === 'hod' && facultyProfile.course_name) {
        // HOD - specific to course only (all years, all sections)
        notificationData.department = facultyProfile.course_name;
      }

      console.log("Notification data prepared:", notificationData);

      const { data, error } = await supabase
        .from('notifications')
        .insert(notificationData)
        .select();

      if (error) {
        console.error("Error creating notification:", error);
        throw error;
      }

      console.log("Notification created successfully:", data);

      toast({
        title: "Success",
        description: "Announcement created successfully",
      });

      form.reset();
      setIsDialogOpen(false);

      // Refresh notifications
      const { data: newNotifications, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setNotifications(newNotifications || []);

    } catch (error: any) {
      console.error("Error creating announcement:", error);
      toast({
        title: "Error creating announcement",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const canCreateAnnouncements = facultyProfile?.role === 'class_coordinator' || facultyProfile?.role === 'hod';

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col w-full">
        <FacultyNavbar role={facultyProfile?.role} />
        <main className="flex-1 container mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-10 w-40" />
          </div>
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="mb-4 border rounded-lg p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))}
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col w-full">
        <FacultyNavbar role={facultyProfile?.role} />
        <main className="flex-1 container mx-auto p-6">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => navigate("/faculty-auth")}>
            Go to Login
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col w-full">
      <FacultyNavbar role={facultyProfile?.role} />
      <main className="flex-1 container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {canCreateAnnouncements && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Create Announcement</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Announcement</DialogTitle>
                  <DialogDescription>
                    {facultyProfile?.role === 'class_coordinator' 
                      ? `This announcement will be visible to ${facultyProfile.course_name} - Year ${facultyProfile.year} Section ${facultyProfile.section}`
                      : `This announcement will be visible to all ${facultyProfile?.course_name} students`}
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Create</Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <p className="text-muted-foreground">No notifications to display</p>
          ) : (
            notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                title={notification.title}
                content={notification.content}
                createdAt={notification.created_at}
                type={notification.type}
                department={notification.department}
                semester={notification.semester}
                section={notification.section}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
