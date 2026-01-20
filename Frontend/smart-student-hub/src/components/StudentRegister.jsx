import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const StudentRegister = ({ onRegister }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    college: "",
    department: "",
    year: "",
    semester: "",
    rollNumber: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["year", "semester"].includes(name)
        ? parseInt(value) || ""
        : value,
    }));
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center">
          Student Registration
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Join the smart student community
        </p>

        {message && (
          <div
            className={`mb-6 p-4 rounded-xl border-l-4 ${
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

          <div className="grid grid-cols-2 gap-4">
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

          <div className="grid grid-cols-2 gap-4">
            <input
              name="college"
              placeholder="College Name"
              value={formData.college}
              onChange={handleChange}
              required
              className="px-4 py-3 border rounded-xl"
            />
            <input
              name="department"
              placeholder="Department"
              value={formData.department}
              onChange={handleChange}
              required
              className="px-4 py-3 border rounded-xl"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
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
