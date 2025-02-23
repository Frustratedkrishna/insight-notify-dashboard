
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import FacultyAuth from "./pages/FacultyAuth";
import FacultyDashboard from "./pages/faculty/Dashboard";
import FacultyNotifications from "./pages/faculty/Notifications";
import ViewStudent from "./pages/faculty/viewstudent";
import ViewFeedbacks from "./pages/faculty/Viewfeedbacks";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/faculty-auth" element={<FacultyAuth />} />
        <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
        <Route path="/faculty/notifications" element={<FacultyNotifications />} />
        <Route path="/faculty/viewstudent" element={<ViewStudent/>} />
        <Route path="/faculty/viewfeedbacks" element={<ViewFeedbacks/>}/>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
