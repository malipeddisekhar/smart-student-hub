import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const HowItWorks = ({ dark = false }) => {
  const [activeTab, setActiveTab] = useState("student");

  const roles = {
    student: {
      name: "Student",
      description: "Supercharge your career with AI-driven tools",
      color: "blue",
      steps: [
        {
          title: "Seamless Login",
          desc: "Access your personalized dashboard using student credentials.",
          icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
        },
        {
          title: "AI Resume Generator",
          desc: "Generate professional resumes instantly using the Grok-powered engine.",
          isAI: true,
          icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
        },
        {
          title: "Dynamic AI Portfolios",
          desc: "Design stunning web portfolios from modern templates.",
          isAI: true,
          icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
        },
        {
          title: "Smart ATS Analysis",
          desc: "Analyze your resume for skill gaps and job-fit score.",
          isAI: true,
          icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
        },
        {
          title: "OCR Validation",
          desc: "Upload and validate certificates with OCR-based AI verification.",
          isAI: true,
          icon: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12",
        },
        {
          title: "Coding Profile Sync",
          desc: "Display live rankings from LeetCode and CodeChef.",
          icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
        },
        {
          title: "Project Repository",
          desc: "Keep your hard-coded projects safely in your hub profile.",
          icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745V6a2 2 0 012-2h14a2 2 0 012 2v7.255zM12 8a1 1 0 100-2 1 1 0 000 2zM12 11a1 1 0 100-2 1 1 0 000 2z",
        },
        {
          title: "AI Support Chat",
          desc: "Get instant career help from the intelligent chatbot.",
          isAI: true,
          icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
        },
      ],
    },
    teacher: {
      name: "Teacher",
      description: "Manage and empower your student mentees",
      color: "emerald",
      steps: [
        {
          title: "Mentee Login",
          desc: "Sign in to manage and oversee assigned student groups.",
          icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
        },
        {
          title: "AI Certificate Scanner",
          desc: "Review and verify student certifications with AI-aided scanning.",
          isAI: true,
          icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
        },
        {
          title: "Smart Feedback Loop",
          desc: "Provide real-time feedback and broadcast important notifications.",
          icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
        },
        {
          title: "Counseling Hub",
          desc: "Schedule and organize specialized counseling sessions.",
          icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
        },
        {
          title: "Automated Reports",
          desc: "Generate institution-standard performance reports instantly.",
          icon: "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
        },
        {
          title: "Growth Analytics",
          desc: "Review visual data analytics for comprehensive student growth.",
          icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
        },
      ],
    },
    admin: {
      name: "Admin",
      description: "Control institution-wide digital transformation",
      color: "indigo",
      steps: [
        {
          title: "Full Admin Access",
          desc: "Secure login for system-wide control and monitoring.",
          icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
        },
        {
          title: "Strategic Mentor Mapping",
          desc: "Map student groups with faculty mentors for focused results.",
          icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
        },
        {
          title: "Omnichannel User Management",
          desc: "Efficiently manage all student, teacher, and institutional data.",
          icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z",
        },
        {
          title: "Real-time Platform Audit",
          desc: "Monitor all active operations and data pipelines in real-time.",
          icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
        },
      ],
    },
  };

  return (
    <section className="py-24 relative overflow-hidden bg-white/50 backdrop-blur-sm" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-bold tracking-widest text-blue-600 uppercase mb-4"
          >
            Workflow Roadmap
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight"
          >
            How it works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto"
          >
            Explore our comprehensive digital ecosystem designed to transform institutional workflow.
          </motion.p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-20">
          <div className="p-1.5 glass rounded-2xl flex items-center space-x-1 shadow-2xl border border-white/50">
            {Object.entries(roles).map(([id, role]) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`relative px-6 py-3 rounded-xl font-bold transition-all duration-300 transform ${
                  activeTab === id
                    ? `text-white shadow-lg`
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
                }`}
              >
                {activeTab === id && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute inset-0 rounded-xl bg-gradient-to-br ${
                      id === "student"
                        ? "from-blue-600 to-blue-400"
                        : id === "teacher"
                        ? "from-emerald-600 to-green-400"
                        : "from-indigo-600 to-purple-400"
                    }`}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{role.name} Flow</span>
              </button>
            ))}
          </div>
        </div>

        {/* Workflow Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8"
          >
            {roles[activeTab].steps.map((step, idx) => (
              <div key={idx} className="relative group">
                {/* Connector Line (Desktop) */}
                {idx < roles[activeTab].steps.length - 1 && (
                  <div className="hidden lg:block absolute top-[28%] left-[70%] w-[calc(100%-2.5rem)] h-0.5 pointer-events-none">
                    <div className={`h-full opacity-20 bg-gradient-to-r from-${roles[activeTab].color}-500 to-transparent`} />
                    <svg className={`absolute -right-2 top-[-10px] w-6 h-6 text-${roles[activeTab].color}-500/30 animate-pulse`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M10 6L8.59 7.41L13.17 12l-4.58 4.59L10 18l6-6-6-6z" />
                    </svg>
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -8 }}
                  className="flex flex-col h-full glass-modern rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/40 shadow-xl transition-all duration-500 hover:shadow-2xl relative"
                >
                  {/* Step Number Badge */}
                  <div className={`absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-7 h-7 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white shadow-xl flex items-center justify-center font-black text-sm sm:text-lg ${
                    activeTab === "student" ? "text-blue-600" : activeTab === "teacher" ? "text-emerald-600" : "text-indigo-600"
                  } border border-slate-50`}>
                    {idx + 1}
                  </div>

                  <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${
                    activeTab === "student" 
                      ? "from-blue-600/10 to-blue-400/10 text-blue-600" 
                      : activeTab === "teacher" 
                      ? "from-emerald-600/10 to-green-400/10 text-emerald-600" 
                      : "from-indigo-600/10 to-purple-400/10 text-indigo-600"
                  } flex items-center justify-center mb-4 sm:mb-6 ring-1 ring-white/50 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                    <svg className="w-5 h-5 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={step.icon} />
                    </svg>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-sm sm:text-xl font-bold text-slate-900 mb-1.5 sm:mb-3 group-hover:text-blue-600 transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-[10px] sm:text-sm text-slate-600 leading-tight sm:leading-relaxed font-medium">
                      {step.desc}
                    </p>
                  </div>

                  {step.isAI && (
                    <div className="mt-3 sm:mt-5 pt-3 sm:pt-5 border-t border-slate-100/50 flex items-center">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-200/50">
                        <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="text-[8px] sm:text-[10px] uppercase tracking-wider font-extrabold text-blue-700">AI</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .glass-modern {
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(12px) saturate(180%);
          -webkit-backdrop-filter: blur(12px) saturate(180%);
        }
        .hero-premium-bg {
          background: radial-gradient(circle at 100% 0%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
                      radial-gradient(circle at 0% 100%, rgba(139, 92, 246, 0.05) 0%, transparent 50%);
        }
      `}} />
    </section>
  );
};

export default HowItWorks;
