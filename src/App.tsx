
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import FacultyAuth from "@/pages/FacultyAuth";
import Attendance from "@/pages/Attendance";
import Marks from "@/pages/Marks";
import Notifications from "@/pages/Notifications";
import NotFound from "@/pages/NotFound";
import FacultyDashboard from "@/pages/faculty/Dashboard";
import FacultyNotifications from "@/pages/faculty/Notifications";
import ViewStudents from "@/pages/faculty/viewstudent";
import ViewFeedbacks from "@/pages/faculty/Viewfeedbacks";
import AddAttendance from "@/pages/faculty/addattendance";
import StudentAttendance from "@/pages/StudentAttendance";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/faculty-auth" element={<FacultyAuth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/attendance" element={<StudentAttendance />} />
        <Route path="/marks" element={<Marks />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
        <Route path="/faculty/attendance" element={<AddAttendance />} />
        <Route path="/faculty/notifications" element={<FacultyNotifications />} />
        <Route path="/faculty/viewstudent" element={<ViewStudents />} />
        <Route path="/faculty/viewfeedbacks" element={<ViewFeedbacks />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
