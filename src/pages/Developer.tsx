
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Code, Github, Mail, FileCode, Server, Database, BookOpen } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function Developer() {
  const [activeTab, setActiveTab] = useState("about");

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-primary">Developer</h1>
        <p className="text-muted-foreground">Technical information and documentation</p>
      </header>

      <Tabs defaultValue="about" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="mr-2 h-5 w-5 text-primary" />
                Development Team
              </CardTitle>
              <CardDescription>Meet the team behind this application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarImage src="/placeholder.svg" alt="Developer" />
                  <AvatarFallback className="bg-primary/10 text-primary">LD</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">Lead Developer</h3>
                  <p className="text-sm text-muted-foreground">Full Stack Engineer</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="bg-accent text-accent-foreground">React</Badge>
                    <Badge variant="outline" className="bg-accent text-accent-foreground">Supabase</Badge>
                    <Badge variant="outline" className="bg-accent text-accent-foreground">TypeScript</Badge>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold mb-2">About This Project</h3>
                <p className="text-muted-foreground mb-4">
                  This student management system is built with modern web technologies to provide 
                  an efficient and user-friendly experience for both students and faculty members.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <FileCode className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Frontend</h4>
                      <p className="text-sm text-muted-foreground">React, TypeScript, Tailwind CSS</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Server className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium">Backend</h4>
                      <p className="text-sm text-muted-foreground">Supabase, PostgreSQL</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-accent/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Github className="h-5 w-5 text-primary" />
                  <span className="font-medium">Github Repository</span>
                </div>
                <a href="https://github.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  github.com/student-management-system
                </a>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="mr-2 h-5 w-5 text-primary" />
                Contact
              </CardTitle>
              <CardDescription>Get in touch with the development team</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">For technical support or feature requests, please contact our development team:</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>developer@studentmanagementsystem.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Github className="h-4 w-4 text-primary" />
                  <span>github.com/student-management-system/issues</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5 text-primary" />
                API Documentation
              </CardTitle>
              <CardDescription>Technical details about our API endpoints</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-md">
                  <h3 className="text-lg font-semibold mb-2">Authentication</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Our application uses Supabase authentication to manage user sessions and roles.
                  </p>
                  <div className="bg-accent/10 p-3 rounded-md overflow-x-auto">
                    <pre className="text-xs">
                      <code>
{`// Sign in with email and password
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})`}
                      </code>
                    </pre>
                  </div>
                </div>
                
                <div className="p-4 border rounded-md">
                  <h3 className="text-lg font-semibold mb-2">Student Records</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Fetch and manipulate student data through our database API.
                  </p>
                  <div className="bg-accent/10 p-3 rounded-md overflow-x-auto">
                    <pre className="text-xs">
                      <code>
{`// Get all students
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('role', 'student')`}
                      </code>
                    </pre>
                  </div>
                </div>
                
                <div className="p-4 border rounded-md">
                  <h3 className="text-lg font-semibold mb-2">Attendance Records</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Manage attendance data through our API endpoints.
                  </p>
                  <div className="bg-accent/10 p-3 rounded-md overflow-x-auto">
                    <pre className="text-xs">
                      <code>
{`// Insert attendance records
const { data, error } = await supabase
  .from('attendance')
  .insert([
    { student_id: '123', date: '2023-09-01', status: 'present' }
  ])`}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="docs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5 text-primary" />
                Documentation
              </CardTitle>
              <CardDescription>User guides and technical documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Student Guide</h3>
                  <p className="text-muted-foreground mb-3">
                    Learn how to use the student dashboard, view attendance, and manage your profile.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Accessing your dashboard</li>
                    <li>Viewing attendance records</li>
                    <li>Updating personal information</li>
                    <li>Viewing notifications</li>
                  </ul>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Faculty Guide</h3>
                  <p className="text-muted-foreground mb-3">
                    Step-by-step instructions for faculty members to manage students and courses.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Managing student records</li>
                    <li>Taking attendance</li>
                    <li>Uploading attendance data</li>
                    <li>Creating notifications</li>
                    <li>Viewing feedback</li>
                  </ul>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">System Requirements</h3>
                  <p className="text-muted-foreground mb-3">
                    Technical requirements and supported browsers.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium">Supported Browsers</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Chrome (latest)</li>
                        <li>Firefox (latest)</li>
                        <li>Safari (latest)</li>
                        <li>Edge (latest)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium">Recommended</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Stable internet connection</li>
                        <li>Screen resolution: 1280x720 or higher</li>
                        <li>JavaScript enabled</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
