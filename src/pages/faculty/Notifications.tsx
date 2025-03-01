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

interface Notification {
  id: string;
  title: string;
  content: string;
  type: string;
  department?: string;
  semester?: number;
  created_at: string;
}

interface FacultyProfile {
  role: string;
  course_name?: string;
  section?: string;
  department?: string;
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof notificationSchema>>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session) {
          navigate("/faculty-auth");
          return;
        }

        const employeeId = session.user.user_metadata.employee_id;
        
        if (!employeeId) {
          throw new Error("Employee ID not found in session");
        }

        // Fetch faculty profile
        const { data: facultyData, error: facultyError } = await supabase
          .from('faculty_profiles')
          .select('role, course_name, section, department')
          .eq('employee_id', employeeId)
          .maybeSingle();

        if (facultyError) throw facultyError;
        if (!facultyData) {
          throw new Error("Faculty profile not found");
        }

        setFacultyProfile(facultyData);

        // Fetch notifications based on role
        let query = supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false });

        if (facultyData.role === 'class_coordinator') {
          // Class coordinators see notifications for their specific class
          query = query.or(`type.eq.general,and(type.eq.course_specific,department.eq.${facultyData.course_name},semester.eq.${facultyData.section})`);
        } else if (facultyData.role === 'hod') {
          // HODs see notifications for their department
          query = query.or(`type.eq.general,and(type.eq.course_specific,department.eq.${facultyData.course_name})`);
        }

        const { data: notificationsData, error: notificationsError } = await query;

        if (notificationsError) throw notificationsError;

        setNotifications(notificationsData);
      } catch (error: any) {
        console.error("Error:", error);
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
      if (!facultyProfile) return;

      const notificationData = {
        title: values.title,
        content: values.content,
        type: 'course_specific',
        department: facultyProfile.course_name,
        semester: facultyProfile.role === 'class_coordinator' ? parseInt(facultyProfile.section || '0') : null,
        created_by: (await supabase.auth.getSession()).data.session?.user.id,
      };

      const { error } = await supabase
        .from('notifications')
        .insert(notificationData);

      if (error) throw error;

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
      setNotifications(newNotifications);

    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error creating announcement",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const canCreateAnnouncements = facultyProfile?.role === 'class_coordinator' || facultyProfile?.role === 'hod';

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
                      ? `This announcement will be visible to ${facultyProfile.course_name} - Section ${facultyProfile.section}`
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
        {loading ? (
          <div>Loading...</div>
        ) : (
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
                />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}