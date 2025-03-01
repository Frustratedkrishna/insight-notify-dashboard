import { Routes, Route } from "react-router-dom";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import FacultyAuth from "./pages/FacultyAuth";
import FacultyDashboard from "./pages/faculty/Dashboard";
import ViewStudents from "./pages/faculty/viewstudent";
import Notifications from "./pages/Notifications";
import StudentAttendance from "./pages/StudentAttendance";
import Attendance from "./pages/Attendance";
import Marks from "./pages/Marks";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import FacultyNotifications from "./pages/faculty/Notifications";
import AddAttendance from "./pages/faculty/addattendance";
import ViewFeedbacks from "./pages/faculty/Viewfeedbacks";
import Developer from "./pages/Developer"; // Add this import

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/faculty-auth" element={<FacultyAuth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/attendance" element={<StudentAttendance />} />
        <Route path="/marks" element={<Marks />} />
        <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
        <Route path="/faculty/viewstudent" element={<ViewStudents />} />
        <Route path="/faculty/notifications" element={<FacultyNotifications />} />
        <Route path="/faculty/attendance" element={<AddAttendance />} />
        <Route path="/faculty/viewfeedbacks" element={<ViewFeedbacks />} />
        <Route path="/developer" element={<Developer />} /> {/* Add this route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
