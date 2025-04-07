
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import FacultyAuth from "./pages/FacultyAuth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import StudentAttendance from "./pages/StudentAttendance";
import Notifications from "./pages/Notifications";
import Marks from "./pages/Marks";
import Attendance from "./pages/Attendance";
import FacultyDashboard from "./pages/faculty/Dashboard";
import FacultyNotifications from "./pages/faculty/Notifications";
import ViewStudents from "./pages/faculty/viewstudent";
import AddAttendance from "./pages/faculty/addattendance";
import ViewFeedbacks from "./pages/faculty/Viewfeedbacks";
import ApproveStudents from "./pages/faculty/ApproveStudents";
import Announcements from "./pages/faculty/Announcements";
import AdminSettings from "./pages/faculty/AdminSettings";
import ApproveFaculty from "./pages/faculty/ApproveFaculty";

// Faculty Protected Route component
const FacultyProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Check if faculty is authenticated
    const checkFacultyAuth = () => {
      try {
        const facultyStr = localStorage.getItem('faculty');
        if (facultyStr) {
          const faculty = JSON.parse(facultyStr);
          if (faculty && faculty.employee_id) {
            setIsAuthenticated(true);
            return;
          }
        }
        setIsAuthenticated(false);
      } catch (error) {
        console.error("Error checking faculty auth:", error);
        setIsAuthenticated(false);
      }
    };

    checkFacultyAuth();
  }, []);

  if (isAuthenticated === null) {
    // Still checking authentication
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to faculty auth page with return URL
    return <Navigate to="/faculty-auth" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/faculty-auth" element={<FacultyAuth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/attendance" element={<StudentAttendance />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/marks" element={<Marks />} />
          
          {/* Faculty protected routes */}
          <Route path="/faculty/dashboard" element={
            <FacultyProtectedRoute>
              <FacultyDashboard />
            </FacultyProtectedRoute>
          } />
          <Route path="/faculty/notifications" element={
            <FacultyProtectedRoute>
              <FacultyNotifications />
            </FacultyProtectedRoute>
          } />
          <Route path="/faculty/viewstudent" element={
            <FacultyProtectedRoute>
              <ViewStudents />
            </FacultyProtectedRoute>
          } />
          <Route path="/faculty/attendance" element={
            <FacultyProtectedRoute>
              <Attendance />
            </FacultyProtectedRoute>
          } />
          <Route path="/faculty/addattendance" element={
            <FacultyProtectedRoute>
              <AddAttendance />
            </FacultyProtectedRoute>
          } />
          <Route path="/faculty/viewfeedbacks" element={
            <FacultyProtectedRoute>
              <ViewFeedbacks />
            </FacultyProtectedRoute>
          } />
          <Route path="/faculty/approve-students" element={
            <FacultyProtectedRoute>
              <ApproveStudents />
            </FacultyProtectedRoute>
          } />
          <Route path="/faculty/announcements" element={
            <FacultyProtectedRoute>
              <Announcements />
            </FacultyProtectedRoute>
          } />
          <Route path="/faculty/admin-settings" element={
            <FacultyProtectedRoute>
              <AdminSettings />
            </FacultyProtectedRoute>
          } />
          <Route path="/faculty/approve-faculty" element={
            <FacultyProtectedRoute>
              <ApproveFaculty />
            </FacultyProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </>
  );
}

export default App;
