import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import LandingPage from "./components/LandingPage";
import StudentLogin from "./components/StudentLogin";
import StudentRegister from "./components/StudentRegister";
import Dashboard from "./components/Dashboard";
import StudentProfile from "./components/StudentProfile";
import ViewProfile from "./components/ViewProfile";
import Projects from "./components/Projects";
import AcademicCertificatesNew from "./components/AcademicCertificatesNew";
import ProfessionalPortfolio from "./components/ProfessionalPortfolio";
import ResumePortfolioEditor from "./components/ResumePortfolioEditor";
import ResumeAnalyzer from "./components/ResumeAnalyzer";
import TeacherLogin from "./components/TeacherLogin";
import TeacherRegister from "./components/TeacherRegister";
import TeacherDashboard from "./components/TeacherDashboard";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import StudentDetails from "./components/StudentDetails";
import Leaderboard from "./components/Leaderboard";
import SystemFeaturesPage from "./components/SystemFeaturesPage";
import ContactPage from "./components/ContactPage";
import api from "./services/api";

// Page transition wrapper
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
  >
    {children}
  </motion.div>
);

// Animated routes component (needs useLocation inside Router)
const AnimatedRoutes = ({ studentData, teacherData, adminData, handleLogin, handleTeacherLogin, handleLogout, handleTeacherLogout, handleTeacherUpdate, handleAdminLogin, handleAdminLogout, handleAdminUpdate }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={studentData ? <Navigate to="/dashboard" /> : <PageTransition><LandingPage /></PageTransition>}
        />
        <Route
          path="/student/:studentId"
          element={<PageTransition><StudentDetails /></PageTransition>}
        />
        <Route
          path="/leaderboard"
          element={<PageTransition><Leaderboard studentData={studentData} /></PageTransition>}
        />
        <Route
          path="/system-features"
          element={<PageTransition><SystemFeaturesPage /></PageTransition>}
        />
        <Route
          path="/contact"
          element={<PageTransition><ContactPage /></PageTransition>}
        />
        <Route
          path="/login"
          element={
            studentData ? (
              <Navigate to="/dashboard" />
            ) : (
              <PageTransition><StudentLogin onLogin={handleLogin} /></PageTransition>
            )
          }
        />
        <Route
          path="/student-login"
          element={<PageTransition><StudentLogin onLogin={handleLogin} /></PageTransition>}
        />
        <Route
          path="/register"
          element={
            studentData ? (
              <Navigate to="/dashboard" />
            ) : (
              <PageTransition><StudentRegister onRegister={handleLogin} /></PageTransition>
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            studentData ? (
              <PageTransition><Dashboard studentData={studentData} onLogout={handleLogout} /></PageTransition>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/profile"
          element={
            studentData ? (
              <PageTransition><StudentProfile studentData={studentData} /></PageTransition>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/view-profile"
          element={
            studentData ? (
              <PageTransition><ViewProfile studentData={studentData} /></PageTransition>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/projects"
          element={
            studentData ? (
              <PageTransition><Projects studentData={studentData} /></PageTransition>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/academic-certificates"
          element={
            studentData ? (
              <PageTransition><AcademicCertificatesNew studentData={studentData} /></PageTransition>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/professional-portfolio"
          element={
            studentData ? (
              <PageTransition><ProfessionalPortfolio studentData={studentData} /></PageTransition>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/resume-editor"
          element={
            studentData ? (
              <PageTransition><ResumePortfolioEditor studentData={studentData} /></PageTransition>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/resume-analyzer"
          element={
            studentData ? (
              <PageTransition><ResumeAnalyzer studentData={studentData} /></PageTransition>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/teacher/login"
          element={
            teacherData ? (
              <Navigate to="/teacher/dashboard" />
            ) : (
              <PageTransition><TeacherLogin onLogin={handleTeacherLogin} /></PageTransition>
            )
          }
        />
        <Route
          path="/teacher/register"
          element={
            teacherData ? (
              <Navigate to="/teacher/dashboard" />
            ) : (
              <PageTransition><TeacherRegister onRegister={handleTeacherLogin} /></PageTransition>
            )
          }
        />
        <Route
          path="/teacher/dashboard"
          element={
            teacherData ? (
              <PageTransition><TeacherDashboard teacherData={teacherData} onLogout={handleTeacherLogout} onTeacherUpdate={handleTeacherUpdate} /></PageTransition>
            ) : (
              <Navigate to="/teacher/login" />
            )
          }
        />
        <Route
          path="/admin/login"
          element={
            adminData ? (
              <Navigate to="/admin/dashboard" />
            ) : (
              <PageTransition><AdminLogin onLogin={handleAdminLogin} /></PageTransition>
            )
          }
        />
        <Route
          path="/admin/register"
          element={
            adminData ? (
              <Navigate to="/admin/dashboard" />
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            adminData ? (
              <PageTransition><AdminDashboard adminData={adminData} onLogout={handleAdminLogout} onAdminUpdate={handleAdminUpdate} /></PageTransition>
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const [studentData, setStudentData] = useState(null);
  const [teacherData, setTeacherData] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🚀 App.jsx mounting, checking for stored user...');
    
    // Check both sessionStorage and localStorage for user data
    const savedStudentData = sessionStorage.getItem("studentData") || localStorage.getItem("user");
    const savedTeacherData = sessionStorage.getItem("teacherData");
    const savedAdminData = sessionStorage.getItem("adminData");
    
    console.log('Stored student data:', savedStudentData ? 'Found' : 'Not found');
    console.log('Stored teacher data:', savedTeacherData ? 'Found' : 'Not found');
    console.log('Stored admin data:', savedAdminData ? 'Found' : 'Not found');
    
    if (savedStudentData) {
      const user = JSON.parse(savedStudentData);
      console.log('✅ Loading student from storage:', user);
      setStudentData(user);
    }
    if (savedTeacherData) {
      setTeacherData(JSON.parse(savedTeacherData));
    }
    if (savedAdminData) {
      setAdminData(JSON.parse(savedAdminData));
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (data) => {
    console.log('📢 handleLogin called with:', data);
    setStudentData(data);
    sessionStorage.setItem("studentData", JSON.stringify(data));
    localStorage.setItem("user", JSON.stringify(data)); // Also save to localStorage for OAuth
    console.log('💾 Student data saved to storage');
  };

  const handleTeacherLogin = (data) => {
    setTeacherData(data);
    sessionStorage.setItem("teacherData", JSON.stringify(data));
  };

  const handleLogout = () => {
    setStudentData(null);
    sessionStorage.removeItem("studentData");
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
  };

  const handleTeacherLogout = () => {
    setTeacherData(null);
    sessionStorage.removeItem("teacherData");
  };

  const handleTeacherUpdate = (data) => {
    setTeacherData(data);
    sessionStorage.setItem("teacherData", JSON.stringify(data));
  };

  const handleAdminLogin = (data) => {
    setAdminData(data);
    sessionStorage.setItem("adminData", JSON.stringify(data));
  };

  const handleAdminLogout = () => {
    setAdminData(null);
    sessionStorage.removeItem("adminData");
  };

  const handleAdminUpdate = (data) => {
    setAdminData(data);
    sessionStorage.setItem("adminData", JSON.stringify(data));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 animate-gradientShift">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
          </div>
          <p className="text-gray-500 font-medium tracking-wide">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <Router>
      <AnimatedRoutes
        studentData={studentData}
        teacherData={teacherData}
        adminData={adminData}
        handleLogin={handleLogin}
        handleTeacherLogin={handleTeacherLogin}
        handleLogout={handleLogout}
        handleTeacherLogout={handleTeacherLogout}
        handleTeacherUpdate={handleTeacherUpdate}
        handleAdminLogin={handleAdminLogin}
        handleAdminLogout={handleAdminLogout}
        handleAdminUpdate={handleAdminUpdate}
      />
    </Router>
  );
}

export default App;
