import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";

const Globe3D = lazy(() => import("./Globe3D"));

const LandingPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  const handleSearch = async (query) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await api.get(
        `/api/search/students?query=${encodeURIComponent(query)}`
      );
      setSearchResults(response.data);
      setShowResults(true);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Debounce search to avoid too many API calls
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      handleSearch(value);
    }, 300);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && searchResults.length > 0) {
      navigate(`/student/${searchResults[0].studentId}`);
      setShowResults(false);
      setSearchQuery('');
    }
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        setShowResults(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
      // Clear timeout on cleanup
      clearTimeout(window.searchTimeout);
    };
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob" style={{ animationDelay: '4s' }} />
      </div>

      {/* Navigation — Glassmorphism */}
      <nav className="sticky top-0 z-50 glass-dark shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-3"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Smart Student Hub
              </h1>
            </motion.div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8 relative" ref={searchRef}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search student details..."
                  value={searchQuery}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-2 pl-10 pr-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/15 transition-all duration-300 backdrop-blur-sm text-sm"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-white/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {isSearching && (
                  <div className="absolute right-3 top-2.5">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-400 border-t-transparent"></div>
                  </div>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showResults && (
                <div className="absolute top-full left-0 right-0 mt-2 glass rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto animate-fadeInDown">
                  {searchResults.length > 0 ? (
                    searchResults.map((student) => (
                      <div
                        key={student._id}
                        className="p-4 border-b border-gray-100/50 hover:bg-indigo-50/50 cursor-pointer transition-all duration-200"
                        onClick={() => {
                          navigate(`/student/${student.studentId}`);
                          setShowResults(false);
                          setSearchQuery("");
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {student.profile?.profileImage ? (
                              <img
                                src={student.profile.profileImage}
                                alt={student.name}
                                className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-100"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                                <span className="text-white font-semibold text-lg">
                                  {student.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {student.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {student.studentId} • {student.department}, {student.college}
                            </p>
                            <p className="text-xs text-gray-400">
                              Year {student.year} • CGPA: {student.cgpa || "N/A"}
                            </p>
                          </div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                            Sem {student.semester}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No students found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Login Buttons */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-2"
            >
              <button
                onClick={() => navigate("/login")}
                className="btn-ripple bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium border border-white/20 backdrop-blur-sm"
              >
                Student
              </button>
              <button
                onClick={() => navigate("/leaderboard")}
                className="btn-ripple bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg shadow-orange-500/25"
              >
                Leaderboard
              </button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        {/* Dark gradient backdrop for globe area */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-slate-900/90 via-slate-900/50 to-transparent pointer-events-none hidden lg:block" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-4">

            {/* Left column — text + search + buttons */}
            <div className="flex-1 text-center lg:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-8 leading-tight tracking-tight"
            >
              Centralized Digital Platform for
              <span className="gradient-text-animated block mt-2">Student Excellence</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg md:text-xl text-gray-500 mb-10 max-w-3xl leading-relaxed font-light"
            >
              Track, manage, and showcase student achievements, activities, and
              portfolios in one comprehensive platform designed for Higher
              Education Institutions.
            </motion.p>

            {/* Enhanced Search Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="max-w-2xl mb-10"
              ref={searchRef}
            >
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur-sm opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for student by ID, name, or roll number..."
                    value={searchQuery}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    className="w-full px-6 py-4 pl-14 pr-4 text-lg border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-xl glass font-light placeholder-gray-400"
                  />
                  <svg
                    className="absolute left-5 top-4.5 h-6 w-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  {isSearching && (
                    <div className="absolute right-5 top-4.5">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-500 border-t-transparent"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Main Search Results */}
              {showResults && (
                <div className="mt-4 glass rounded-2xl shadow-2xl max-h-96 overflow-y-auto animate-fadeInUp">
                  {searchResults.length > 0 ? (
                    <div className="divide-y divide-gray-100/50">
                      {searchResults.map((student) => (
                        <div
                          key={student._id}
                          className="p-6 hover:bg-indigo-50/40 transition-all duration-300 cursor-pointer"
                          onClick={() => navigate(`/student/${student.studentId}`)}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              {student.profile?.profileImage ? (
                                <img
                                  src={student.profile.profileImage}
                                  alt={student.name}
                                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-200 shadow-md"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                  <span className="text-white font-bold text-xl">
                                    {student.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {student.name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Student ID: {student.studentId}
                              </p>
                              <p className="text-sm text-gray-500">
                                Roll Number: {student.rollNumber}
                              </p>
                              <p className="text-sm text-gray-500">
                                {student.department}, {student.college}
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                  Year {student.year}
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                  Semester {student.semester}
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                  CGPA: {student.cgpa || "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <div className="text-gray-300 mb-3">
                        <svg
                          className="mx-auto h-12 w-12"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-500">
                        No students found matching "{searchQuery}"
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Try searching by name, student ID, roll number, or college
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <button
                onClick={() => navigate("/login")}
                className="btn-ripple bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/30 hover:-translate-y-0.5"
              >
                Student Login
              </button>
              <button
                onClick={() => navigate("/teacher/login")}
                className="btn-ripple bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/30 hover:-translate-y-0.5"
              >
                Teacher Login
              </button>
              <button
                onClick={() => navigate("/admin/login")}
                className="btn-ripple bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-xl shadow-purple-500/25 hover:shadow-2xl hover:shadow-purple-500/30 hover:-translate-y-0.5"
              >
                Admin Login
              </button>
            </motion.div>
            </div>{/* end left column */}

            {/* Right column — 3D Globe */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 w-full lg:w-auto hidden md:block"
              style={{ minHeight: 420 }}
            >
              <div className="relative w-full h-[420px] lg:h-[500px]">
                {/* Soft blue glow behind globe */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl" />
                </div>
                <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Loading 3D...</div>}>
                  <Globe3D />
                </Suspense>
              </div>
            </motion.div>

          </div>{/* end flex row */}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Comprehensive Solutions for Everyone
            </h2>
            <p className="text-lg text-gray-500 font-light">
              Tailored features for students, faculty, and administrators
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "For Students",
                color: "from-blue-500 to-cyan-500",
                bgColor: "from-blue-50 to-cyan-50",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                ),
                items: ["Dynamic Dashboard", "Achievement Tracker", "Digital Portfolio", "Activity Management", "Progress Monitoring"],
              },
              {
                title: "For Faculty",
                color: "from-emerald-500 to-green-500",
                bgColor: "from-emerald-50 to-green-50",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                ),
                items: ["Approval Panel", "Student Oversight", "Bulk Operations", "Verification System", "Reporting Tools"],
              },
              {
                title: "For Administrators",
                color: "from-purple-500 to-pink-500",
                bgColor: "from-purple-50 to-pink-50",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                ),
                items: ["System Analytics", "User Management", "Institutional Reports", "Dashboard Overview"],
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className={`glass hover-glow rounded-3xl p-8 cursor-default group`}
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${card.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {card.icon}
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{card.title}</h3>
                <ul className="space-y-2.5">
                  {card.items.map((item) => (
                    <li key={item} className="flex items-center text-gray-600 text-sm">
                      <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 animate-gradientShift" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: "100%", label: "Digital Records" },
              { value: "24/7", label: "Access" },
              { value: "Secure", label: "Data Storage" },
              { value: "NAAC", label: "Compliant" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group"
              >
                <div className="text-5xl font-extrabold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </div>
                <div className="text-indigo-200 font-medium tracking-wide">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Smart Student Hub
            </h3>
            <p className="text-gray-500 mb-8 font-light">
              Smart India Hackathon 2025 - Problem Statement #25093
            </p>
            <div className="flex justify-center space-x-8">
              {["Privacy Policy", "Terms of Service", "Contact"].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-gray-500 hover:text-indigo-400 transition-all duration-300 text-sm font-medium hover:-translate-y-0.5"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
