import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const StudentRegister = ({ onRegister }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    college: "gmrit",
    department: "",
    year: "",
    semester: "",
    rollNumber: "",
  });

  const [message, setMessage] = useState("");
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingColleges, setLoadingColleges] = useState(true);

  // Fetch colleges and departments from database
  useEffect(() => {
    const fetchCollegesAndDepartments = async () => {
      try {
        setLoadingColleges(true);
        // Fetch all students and teachers to get available colleges/departments
        const [studentsRes, teachersRes] = await Promise.all([
          api.get('/api/admin/students'),
          api.get('/api/admin/teachers')
        ]);

        const students = Array.isArray(studentsRes.data) ? studentsRes.data : [];
        const teachers = Array.isArray(teachersRes.data) ? teachersRes.data : [];

        // Only gmrit
        setColleges(['gmrit']);

        // Extract unique departments (uppercase, deduplicate by uppercase version)
        const deptMap = new Map();
        students.forEach(s => {
          if (s.department) {
            const upperDept = String(s.department).trim().toUpperCase();
            if (!deptMap.has(upperDept)) {
              deptMap.set(upperDept, upperDept);
            }
          }
        });
        teachers.forEach(t => {
          if (t.department) {
            const upperDept = String(t.department).trim().toUpperCase();
            if (!deptMap.has(upperDept)) {
              deptMap.set(upperDept, upperDept);
            }
          }
        });

        setDepartments(Array.from(deptMap.values()).sort());
        setLoadingColleges(false);
      } catch (err) {
        console.error('Error fetching colleges/departments:', err);
        setLoadingColleges(false);
      }
    };

    fetchCollegesAndDepartments();
  }, []);

  const filteredDepartments = formData.college ? departments : [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'college') {
      // Reset department when college changes
      setFormData((prev) => ({
        ...prev,
        college: value,
        department: ''
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: ["year", "semester"].includes(name)
          ? parseInt(value) || ""
          : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validate passwords match before sending
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      // ✅ Remove confirmPassword (no need to send to backend)
      const { confirmPassword, ...submitData } = formData;

      const res = await api.post("/api/register", submitData);
      setMessage(`✅ Success! ID: ${res.data.studentId}`);

      // Persist the full student profile locally so resume generation has education details
      const {
        studentId,
        name,
        email,
        college,
        department,
        year,
        semester,
        rollNumber,
      } = res.data;

      onRegister({
        studentId,
        name: name || formData.name,
        email,
        college,
        department,
        year,
        semester,
        rollNumber,
      });

      navigate("/dashboard");
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setMessage(`❌ Error: ${errorMsg}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-5 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center">
          Student Registration
        </h2>
        <p className="text-sm sm:text-base text-gray-600 text-center mb-6">
          Join the smart student community
        </p>

        {message && (
          <div
            className={`mb-6 p-3 sm:p-4 rounded-xl border-l-4 text-sm sm:text-base ${
              message.includes("Success")
                ? "bg-green-50 border-green-400 text-green-700"
                : "bg-red-50 border-red-400 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border rounded-xl"
          />
          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border rounded-xl"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              className="px-4 py-3 border rounded-xl"
            />
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="px-4 py-3 border rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="px-4 py-3 border rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-900 font-semibold">
              gmrit
            </div>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select Department --</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              name="year"
              type="number"
              placeholder="Year (1-4)"
              value={formData.year}
              onChange={handleChange}
              min="1"
              max="4"
              required
              className="px-4 py-3 border rounded-xl"
            />
            <input
              name="semester"
              type="number"
              placeholder="Semester (1-8)"
              value={formData.semester}
              onChange={handleChange}
              min="1"
              max="8"
              required
              className="px-4 py-3 border rounded-xl"
            />
            <input
              name="rollNumber"
              placeholder="Roll Number"
              value={formData.rollNumber}
              onChange={handleChange}
              required
              className="px-4 py-3 border rounded-xl"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:scale-105 transition"
          >
            Create Account
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate("/login")}
            className="text-blue-600 hover:underline"
          >
            Already registered? Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentRegister;
