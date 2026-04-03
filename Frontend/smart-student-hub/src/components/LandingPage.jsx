import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import HowItWorks from "./HowItWorks";

const LandingPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showSystemFeatures, setShowSystemFeatures] = useState(false);
  const searchRef = useRef(null);
  const systemFeaturesRef = useRef(null);

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
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Soft background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-25" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-3"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                Smart Student Hub
              </h1>
            </motion.div>

            {/* Login Buttons */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-1.5 sm:space-x-2"
            >
              <button
                onClick={() => navigate("/login")}
                className="btn-ripple bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium"
              >
                Student
              </button>
              <button
                onClick={() => navigate("/leaderboard")}
                className="btn-ripple bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium shadow-md"
              >
                Leaderboard
              </button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="dashboard-hero py-14 md:py-20 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 hero-premium-bg" />
          <div className="absolute -top-28 -left-24 w-72 h-72 rounded-full bg-blue-200/30 blur-3xl" />
          <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-sky-200/30 blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 w-80 h-80 rounded-full bg-indigo-100/30 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="hero-grid-layout">
            <div className="text-center lg:text-left lg:pr-10">
              <motion.p
                initial={{ opacity: 0, x: -28 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200 bg-white/75 text-xs font-bold tracking-[0.12em] uppercase text-blue-600 mb-6"
              >
                New Dashboard Experience
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, x: -42 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 mb-7 leading-[1.05] tracking-tight"
                style={{ fontFamily: "Poppins, Inter, system-ui, -apple-system, sans-serif" }}
              >
                Centralized Digital Platform for
                <span className="block mt-2 hero-highlight-text">Smart Student Hub</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, x: -34 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="text-base md:text-lg text-slate-600/95 mb-8 md:mb-9 max-w-2xl leading-relaxed font-normal"
              >
                A complete digital workspace for students, teachers, and administrators
                to organize records, monitor progress, and manage academic operations
                from one interactive dashboard.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, x: -26 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.75, delay: 0.24 }}
                className="max-w-2xl mb-8 md:mb-9"
                ref={searchRef}
              >
                <div className="hero-search-shell group">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search for student by ID, name, or roll number..."
                      value={searchQuery}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      className="w-full px-6 py-4 pl-14 pr-4 text-base md:text-lg border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/70 shadow-xl hero-search-input placeholder-slate-500/85"
                    />
                    <svg
                      className="absolute left-5 top-4.5 h-6 w-6 text-slate-500"
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
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                      </div>
                    )}
                  </div>
                </div>

                {showResults && (
                  <div className="mt-4 glass rounded-2xl shadow-2xl max-h-96 overflow-y-auto animate-fadeInUp">
                    {searchResults.length > 0 ? (
                      <div className="divide-y divide-gray-100/50">
                        {searchResults.map((student) => (
                          <div
                            key={student._id}
                            className="p-6 hover:bg-blue-50/40 transition-all duration-300 cursor-pointer"
                            onClick={() => navigate(`/student/${student.studentId}`)}
                          >
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0">
                                {student.profile?.profileImage ? (
                                  <img
                                    src={student.profile.profileImage}
                                    alt={student.name}
                                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-200 shadow-md"
                                  />
                                ) : (
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center shadow-lg">
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
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-blue-700">
                                    Semester {student.semester}
                                  </span>
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-blue-700">
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
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start"
              >
                <button
                  onClick={() => navigate("/login")}
                  className="w-full sm:w-auto btn-ripple hero-login-btn text-white px-7 py-3.5 rounded-2xl text-base font-semibold"
                >
                  Student Login
                </button>
                <button
                  onClick={() => navigate("/teacher/login")}
                  className="w-full sm:w-auto btn-ripple hero-login-btn text-white px-7 py-3.5 rounded-2xl text-base font-semibold"
                >
                  Teacher Login
                </button>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 24 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
              className="relative w-full max-w-[560px] mx-auto lg:mx-0"
            >
              <motion.div
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className="hero-future-shell"
              >
                <img
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=80"
                  alt="Students collaborating in a modern learning environment"
                  className="hero-dashboard-photo"
                />
                <div className="hero-photo-overlay" />

                <div className="hero-feed-card hero-feed-card-main">
                  <p className="hero-feed-title">Live Dashboard Feed</p>
                  <div className="hero-feed-lines">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
                <div className="hero-feed-card hero-feed-card-sub">
                  <p className="hero-feed-title">Calendar + Analytics</p>
                  <div className="hero-feed-pill-row">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>

              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <HowItWorks />

      {/* Feature Blocks */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <p className="text-sm font-semibold tracking-[0.18em] uppercase text-blue-600 mb-4">
              Platform Highlights
            </p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Built as a Unified Campus Dashboard
            </h2>
            <p className="text-lg text-slate-500 font-light max-w-3xl mx-auto">
              Role-based tools, visual widgets, and fast workflows designed for modern institutions.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-7">
            {[
              {
                title: "Student Workspace",
                color: "from-blue-600 to-blue-400",
                image: "https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg?auto=compress&cs=tinysrgb&w=1200",
                imageAlt: "Student using a laptop dashboard in study workspace",
                items: ["Achievement tracking", "Digital portfolio", "Certificate timeline", "Progress overview"],
              },
              {
                title: "Faculty Console",
                color: "from-blue-700 to-sky-500",
                image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1200",
                imageAlt: "Faculty team reviewing reports and student workflow",
                items: ["Verification queues", "Student oversight", "Approval pipelines", "Academic insights"],
              },
              {
                title: "Admin Control Center",
                color: "from-indigo-600 to-blue-500",
                image: "https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?auto=compress&cs=tinysrgb&w=1200",
                imageAlt: "Administrator analyzing data dashboards on laptop",
                items: ["Institution-wide analytics", "User governance", "Audit-ready records", "Data visibility"],
              },
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.45, delay: i * 0.12 }}
                whileHover={{ y: -3 }}
                className="feature-panel rounded-3xl p-7 md:p-8"
              >
                <div className="feature-image-wrap mb-6">
                  <img
                    src={card.image}
                    alt={card.imageAlt}
                    className="feature-image"
                    loading="lazy"
                  />
                  <div className="feature-image-overlay" />
                  <span className="feature-image-badge">Dashboard Module</span>
                </div>
                <div className="feature-surface-lines" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
                <div className={`h-1.5 w-28 rounded-full bg-gradient-to-r ${card.color} mb-5`} />
                <h3 className="text-2xl font-bold text-slate-900 mb-5">{card.title}</h3>
                <ul className="space-y-3">
                  {card.items.map((item) => (
                    <li key={item} className="flex items-center text-slate-600">
                      <span className="h-2 w-2 rounded-full bg-blue-500 mr-3" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <span className="feature-cta-chip">Explore Dashboard</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <button
              onClick={() => {
                setShowSystemFeatures(true);
                setTimeout(() => {
                  systemFeaturesRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }, 80);
              }}
              className="explore-more-btn"
            >
              Explore More
            </button>
          </div>
        </div>
      </section>

      {showSystemFeatures && (
        <section ref={systemFeaturesRef} className="py-16 md:py-20 bg-white border-t border-blue-100/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 md:mb-12">
              <p className="text-xs font-semibold tracking-[0.18em] uppercase text-blue-600 mb-3">
                System Features
              </p>
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                Platform Capabilities Overview
              </h2>
              <p className="mt-3 text-slate-600 max-w-3xl mx-auto">
                A dedicated view of core system strengths with clear feature insights and related visual context.
              </p>
            </div>

            <div className="space-y-6 md:space-y-8">
              {[
                {
                  value: "100%",
                  label: "Digital Student Records",
                  title: "Complete Digital Record Management",
                  description:
                    "All student records are organized in one secure system with quick retrieval, structured history, and clean workflows for institutions.",
                  image:
                    "https://images.pexels.com/photos/1181359/pexels-photo-1181359.jpeg?auto=compress&cs=tinysrgb&w=1400",
                  imageAlt: "Student records and documents on digital dashboard",
                },
                {
                  value: "24/7",
                  label: "Role-based Access",
                  title: "Access Anytime with Role Control",
                  description:
                    "Students, teachers, and admins get dedicated access to exactly what they need with role-based permissions and always-on availability.",
                  image:
                    "https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=1400",
                  imageAlt: "People working on laptops with always-on cloud access",
                },
                {
                  value: "Secure",
                  label: "Cloud-ready Storage",
                  title: "Secure and Scalable Storage",
                  description:
                    "Academic data remains protected with modern security standards and cloud-ready architecture that scales with institution growth.",
                  image:
                    "https://images.pexels.com/photos/2881229/pexels-photo-2881229.jpeg?auto=compress&cs=tinysrgb&w=1400",
                  imageAlt: "Cloud infrastructure concept with secure systems",
                },
                {
                  value: "NAAC",
                  label: "Compliance Ready",
                  title: "Compliance-ready Academic Operations",
                  description:
                    "Designed to support reporting, audit readiness, and evidence collection for compliance-focused higher education ecosystems.",
                  image:
                    "https://images.pexels.com/photos/669619/pexels-photo-669619.jpeg?auto=compress&cs=tinysrgb&w=1400",
                  imageAlt: "Compliance and reporting documents in a professional setup",
                },
              ].map((item, idx) => (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.38, delay: idx * 0.08 }}
                  className={`system-feature-card ${idx % 2 === 1 ? "system-feature-row-reverse system-feature-card-red" : ""}`}
                >
                  <div className="system-feature-media-wrap">
                    <img
                      src={item.image}
                      alt={item.imageAlt}
                      className="system-feature-media"
                      loading="lazy"
                    />
                  </div>

                  <div className="system-feature-meta">
                    <div className="system-feature-pill-row">
                      <span className="system-feature-pill-value">{item.value}</span>
                      <span className="system-feature-pill-label">{item.label}</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 mt-4">{item.title}</h3>
                    <p className="text-slate-600 mt-2 leading-relaxed">{item.description}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="footer-premium footer-compact text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-7 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h3 className="text-base md:text-lg font-semibold text-white">
                Smart Student Hub
              </h3>
              <p className="text-gray-400 text-xs md:text-sm">
                Smart India Hackathon 2025 - Problem Statement #25093
              </p>
            </div>
            <div className="flex flex-wrap gap-4 md:gap-6">
              {["Privacy Policy", "Terms of Service"].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-xs md:text-sm"
                >
                  {link}
                </a>
              ))}
              <button
                onClick={() => navigate("/contact")}
                className="text-gray-400 hover:text-white transition-colors duration-200 text-xs md:text-sm"
              >
                Contact
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
