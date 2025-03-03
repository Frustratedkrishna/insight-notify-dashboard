
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
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
          <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
          <Route path="/faculty/notifications" element={<FacultyNotifications />} />
          <Route path="/faculty/viewstudent" element={<ViewStudents />} />
          <Route path="/faculty/attendance" element={<Attendance />} />
          <Route path="/faculty/addattendance" element={<AddAttendance />} />
          <Route path="/faculty/viewfeedbacks" element={<ViewFeedbacks />} />
          <Route path="/faculty/approve-students" element={<ApproveStudents />} />
          <Route path="/faculty/announcements" element={<Announcements />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </>
  );
}

export default App;
