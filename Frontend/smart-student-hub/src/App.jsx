import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LandingPage from "./components/LandingPage";
import StudentLogin from "./components/StudentLogin";
import StudentRegister from "./components/StudentRegister";
import Dashboard from "./components/Dashboard";
import PersonalAchievements from "./components/PersonalAchievements";
import StudentProfile from "./components/StudentProfile";
import ViewProfile from "./components/ViewProfile";
import Projects from "./components/Projects";
import AcademicRecords from "./components/AcademicRecords";
import AcademicCertificatesNew from "./components/AcademicCertificatesNew";
import ProfessionalPortfolio from "./components/ProfessionalPortfolio";
import ResumePortfolioEditor from "./components/ResumePortfolioEditor";
import ResumeAnalyzer from "./components/ResumeAnalyzer";
import TeacherLogin from "./components/TeacherLogin";
import TeacherRegister from "./components/TeacherRegister";
import TeacherDashboard from "./components/TeacherDashboard";
import AdminLogin from "./components/AdminLogin";
import AdminRegister from "./components/AdminRegister";
import AdminDashboard from "./components/AdminDashboard";
import StudentDetails from "./components/StudentDetails";
import Leaderboard from "./components/Leaderboard";
import api from "./services/api";

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

  const handleAdminLogin = (data) => {
    setAdminData(data);
    sessionStorage.setItem("adminData", JSON.stringify(data));
  };

  const handleAdminLogout = () => {
    setAdminData(null);
    sessionStorage.removeItem("adminData");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={studentData ? <Navigate to="/dashboard" /> : <LandingPage />}
        />
        <Route
          path="/student/:studentId"
          element={<StudentDetails />}
        />
        <Route
          path="/leaderboard"
          element={<Leaderboard studentData={studentData} />}
        />
        <Route
          path="/login"
          element={
            studentData ? (
              <Navigate to="/dashboard" />
            ) : (
              <StudentLogin onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/student-login"
          element={<StudentLogin onLogin={handleLogin} />}
        />
        <Route
          path="/register"
          element={
            studentData ? (
              <Navigate to="/dashboard" />
            ) : (
              <StudentRegister onRegister={handleLogin} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            studentData ? (
              <Dashboard studentData={studentData} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/personal-achievements"
          element={
            studentData ? (
              <PersonalAchievements studentData={studentData} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/profile"
          element={
            studentData ? (
              <StudentProfile studentData={studentData} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/view-profile"
          element={
            studentData ? (
              <ViewProfile studentData={studentData} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/projects"
          element={
            studentData ? (
              <Projects studentData={studentData} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/academic-records"
          element={
            studentData ? (
              <AcademicRecords studentData={studentData} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/academic-certificates"
          element={
            studentData ? (
              <AcademicCertificatesNew studentData={studentData} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/professional-portfolio"
          element={
            studentData ? (
              <ProfessionalPortfolio studentData={studentData} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/resume-editor"
          element={
            studentData ? (
              <ResumePortfolioEditor studentData={studentData} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/resume-analyzer"
          element={
            studentData ? (
              <ResumeAnalyzer studentData={studentData} />
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
              <TeacherLogin onLogin={handleTeacherLogin} />
            )
          }
        />
        <Route
          path="/teacher/register"
          element={
            teacherData ? (
              <Navigate to="/teacher/dashboard" />
            ) : (
              <TeacherRegister onRegister={handleTeacherLogin} />
            )
          }
        />
        <Route
          path="/teacher/dashboard"
          element={
            teacherData ? (
              <TeacherDashboard teacherData={teacherData} onLogout={handleTeacherLogout} />
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
              <AdminLogin onLogin={handleAdminLogin} />
            )
          }
        />
        <Route
          path="/admin/register"
          element={
            adminData ? (
              <Navigate to="/admin/dashboard" />
            ) : (
              <AdminRegister onRegister={handleAdminLogin} />
            )
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            adminData ? (
              <AdminDashboard adminData={adminData} onLogout={handleAdminLogout} />
            ) : (
              <Navigate to="/admin/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
