import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Leaderboard = ({ studentData }) => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [platform, setPlatform] = useState("leetcode");
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("leaderboard-dark-mode");
    return saved !== null ? saved === "true" : true; // default dark
  });

  const platformMeta = {
    leetcode: {
      title: "LeetCode Leaderboard",
      subtitle: "Top students by problems solved",
      gradient: "from-orange-500 to-red-600",
      usernameLabel: "LeetCode Username",
      emptyLabel: "LeetCode",
      linkPrefix: "https://leetcode.com/",
    },
    codechef: {
      title: "CodeChef Leaderboard",
      subtitle: "Top students by solved challenge count",
      gradient: "from-amber-500 to-yellow-600",
      usernameLabel: "CodeChef Username",
      emptyLabel: "CodeChef",
      linkPrefix: "https://www.codechef.com/users/",
    },
  };

  const activeMeta = platformMeta[platform];
  const getScore = (student) =>
    platform === "leetcode"
      ? student?.problemsSolved || 0
      : student?.codechefProblemsSolved || 0;
  const getUsername = (student) =>
    platform === "leetcode"
      ? student?.leetcodeUsername
      : student?.codechefUsername;

  const averageScore =
    leaderboard.length > 0
      ? Math.round(leaderboard.reduce((sum, s) => sum + getScore(s), 0) / leaderboard.length)
      : 0;

  const topThree = leaderboard.slice(0, 3);
  const topScore = getScore(leaderboard[0]);
  const nextPlatform = platform === "leetcode" ? "codechef" : "leetcode";

  const motivationalQuote =
    leaderboard.length > 0
      ? `"Your campus champion solved ${topScore} problems. Consistency can put your name here next."`
      : `"The board is waiting. Start your ${activeMeta.emptyLabel} journey and become your campus benchmark."`;

  const interactivePrompt = leaderboard.length > 0
    ? `Can you beat the current campus average of ${averageScore}?`
    : `Be the first competitive student from your campus to enter this leaderboard.`;

  const fetchLeaderboard = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const endpoint = platform === "leetcode"
        ? "/api/leaderboard/leetcode"
        : "/api/leaderboard/codechef";
      const response = await api.get(endpoint);
      setLeaderboard(Array.isArray(response.data) ? response.data : []);
      setError(null);
      setLastSyncedAt(new Date());
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setError("Failed to load leaderboard. Please try again later.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [platform]);

  useEffect(() => {
    localStorage.setItem("leaderboard-dark-mode", dark);
  }, [dark]);

  useEffect(() => {
    fetchLeaderboard(false);
  }, [fetchLeaderboard]);

  const handleLogout = () => {
    sessionStorage.removeItem("studentData");
    navigate("/");
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${dark ? "bg-gradient-to-br from-gray-950 via-slate-900 to-gray-900" : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"}`}>
      {/* Navbar */}
      {studentData && (
        <nav className={`shadow-2xl border-b transition-colors duration-500 ${dark ? "bg-slate-900/90 backdrop-blur-xl border-white/5 text-white" : "bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white border-white/10"}`}>
          <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                </div>
                <h1 className="hidden sm:block text-xl md:text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent">
                  Smart Student Hub
                </h1>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Dark Mode Toggle */}
                <button
                  onClick={() => setDark(!dark)}
                  className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none ${dark ? "bg-indigo-600" : "bg-gray-300"}`}
                  title={dark ? "Switch to light mode" : "Switch to dark mode"}
                >
                  <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300 ${dark ? "translate-x-7" : "translate-x-0"}`}>
                    {dark ? (
                      <svg className="w-3.5 h-3.5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
                    ) : (
                      <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
                    )}
                  </span>
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="bg-white/10 backdrop-blur-md hover:bg-white/20 px-3 sm:px-6 py-2 rounded-xl transition-all duration-300 border border-white/20 text-white font-medium text-sm"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 px-3 sm:px-6 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-6 py-6 sm:py-12">
        <div className={`backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 border mb-6 sm:mb-8 transition-colors duration-500 ${dark ? "bg-slate-800/70 border-slate-700/50" : "bg-white/70 border-white/30"}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className={`text-2xl sm:text-3xl md:text-5xl font-bold bg-clip-text text-transparent mb-2 ${dark ? "bg-gradient-to-r from-white via-blue-200 to-indigo-300" : "bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800"}`}>
                {activeMeta.title}
              </h1>
              <p className={`text-lg ${dark ? "text-gray-400" : "text-gray-600"}`}>
                {activeMeta.subtitle}
              </p>
            </div>
            {/* Dark mode toggle for non-logged-in users (no navbar) */}
            {!studentData && (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setDark(!dark)}
                  className={`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none ${dark ? "bg-indigo-600" : "bg-gray-300"}`}
                  title={dark ? "Switch to light mode" : "Switch to dark mode"}
                >
                  <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300 ${dark ? "translate-x-7" : "translate-x-0"}`}>
                    {dark ? (
                      <svg className="w-3.5 h-3.5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
                    ) : (
                      <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
                    )}
                  </span>
                </button>
              </div>
            )}
            {studentData && (
            <div className={`hidden sm:block w-24 h-24 bg-gradient-to-br ${
              platform === "leetcode" 
                ? "from-orange-500 to-red-600" 
                : "from-amber-500 to-yellow-600"
            } rounded-2xl flex items-center justify-center shadow-xl`}>
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>
            )}
          </div>

          {/* Platform Toggle */}
          <div className="mb-6">
            <div className={`flex flex-wrap items-center gap-2 sm:gap-4 p-2 rounded-2xl transition-colors duration-500 ${dark ? "bg-slate-700/60" : "bg-gradient-to-r from-slate-100 to-blue-100"}`}>
              <button
                onClick={() => setPlatform("leetcode")}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  platform === "leetcode"
                    ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg scale-105"
                    : dark ? "bg-transparent text-gray-400 hover:bg-slate-600/50" : "bg-transparent text-gray-600 hover:bg-white/50"
                }`}
              >
                LeetCode
              </button>
              <button
                onClick={() => setPlatform("codechef")}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  platform === "codechef"
                    ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-lg scale-105"
                    : dark ? "bg-transparent text-gray-400 hover:bg-slate-600/50" : "bg-transparent text-gray-600 hover:bg-white/50"
                }`}
              >
                CodeChef
              </button>
              <button
                onClick={() => fetchLeaderboard(true)}
                disabled={refreshing}
                className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-sm font-semibold transition-all duration-300 border ${dark ? "border-white/15 text-gray-200 hover:bg-white/10" : "border-slate-200 text-slate-700 hover:bg-white"} disabled:opacity-60`}
                title="Refresh leaderboard"
              >
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
            {lastSyncedAt && (
              <p className={`mt-3 text-xs font-medium ${dark ? "text-gray-400" : "text-slate-500"}`}>
                Last synced at {lastSyncedAt.toLocaleTimeString()}
              </p>
            )}
          </div>

          {/* Top 3 Spotlight */}
          {topThree.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {topThree.map((student, i) => (
                <div
                  key={`spotlight-${student._id || student.studentId || i}`}
                  className={`rounded-2xl p-4 border transition-all duration-300 ${
                    i === 0
                      ? dark
                        ? "bg-yellow-500/10 border-yellow-400/30"
                        : "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200"
                      : dark
                      ? "bg-white/[0.04] border-white/10"
                      : "bg-white/70 border-white/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className={`text-xs uppercase tracking-[0.14em] font-bold ${dark ? "text-gray-400" : "text-slate-500"}`}>
                      {i === 0 ? "Champion" : i === 1 ? "Runner Up" : "Third Place"}
                    </p>
                    <span className="text-lg">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</span>
                  </div>
                  <p className={`mt-2 text-sm font-semibold truncate ${dark ? "text-gray-100" : "text-slate-800"}`}>
                    {student.name}
                  </p>
                  <p className={`text-xs ${dark ? "text-gray-400" : "text-slate-500"}`}>{student.college || "-"}</p>
                  <p className={`mt-3 text-2xl font-black ${platform === "leetcode" ? "text-orange-500" : "text-amber-500"}`}>
                    {getScore(student)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Motivational Quote + Interactive Prompt */}
          <div className={`mb-6 rounded-2xl border p-5 md:p-6 ${dark ? "bg-gradient-to-r from-slate-900/70 to-indigo-900/40 border-white/10" : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100"}`}>
            <p className={`text-sm uppercase tracking-[0.18em] font-bold ${dark ? "text-blue-300" : "text-blue-700"}`}>
              Campus Competitive Pulse
            </p>
            <p className={`mt-2 text-base md:text-lg font-semibold leading-relaxed ${dark ? "text-gray-100" : "text-slate-800"}`}>
              {motivationalQuote}
            </p>
            <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <p className={`${dark ? "text-gray-300" : "text-slate-600"}`}>
                {interactivePrompt}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPlatform(nextPlatform)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${dark ? "bg-white/10 text-gray-100 hover:bg-white/20" : "bg-white text-slate-700 border border-blue-100 hover:bg-blue-50"}`}
                >
                  Explore {platformMeta[nextPlatform].emptyLabel}
                </button>
                {studentData ? (
                  <button
                    onClick={() => navigate("/dashboard")}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r ${activeMeta.gradient}`}
                  >
                    Improve My Rank
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/")}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r ${activeMeta.gradient}`}
                  >
                    Join Competition
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* CodeChef Info Note */}
          {platform === "codechef" && (
            <div className={`mb-6 border rounded-2xl p-4 flex items-start gap-3 transition-colors duration-500 ${dark ? "bg-yellow-900/20 border-yellow-700/40" : "bg-yellow-50 border-yellow-200"}`}>
              <svg
                className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <p className={`text-sm ${dark ? "text-yellow-300" : "text-yellow-800"}`}>
                <strong>Note:</strong> CodeChef rankings may be delayed due to platform restrictions. Private profiles will show "—" for problems solved.
              </p>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className={`backdrop-blur-2xl rounded-3xl shadow-2xl p-12 border text-center transition-colors duration-500 ${dark ? "bg-slate-800/70 border-slate-700/50" : "bg-white/70 border-white/30"}`}>
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className={`w-16 h-16 border-4 rounded-full animate-spin ${dark ? "border-indigo-800 border-t-indigo-400" : "border-indigo-200 border-t-indigo-600"}`}></div>
              <p className={`text-xl font-medium ${dark ? "text-gray-400" : "text-gray-600"}`}>
                Loading leaderboard...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className={`border-2 rounded-3xl shadow-lg p-8 ${dark ? "bg-red-900/20 border-red-800/40" : "bg-red-50 border-red-200"}`}>
            <div className="flex items-center space-x-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className={`text-lg font-medium ${dark ? "text-red-300" : "text-red-800"}`}>{error}</p>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        {!loading && !error && (
          <div className={`backdrop-blur-2xl rounded-3xl shadow-2xl border overflow-hidden transition-colors duration-500 ${dark ? "bg-slate-800/70 border-slate-700/50" : "bg-white/70 border-white/30"}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`text-white ${dark ? "bg-gradient-to-r from-slate-800 via-indigo-900 to-slate-800" : "bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900"}`}>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-bold text-sm">Rank</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-left font-bold text-sm">Student Name</th>
                    <th className="hidden md:table-cell px-6 py-4 text-left font-bold text-sm">College</th>
                    <th className="hidden sm:table-cell px-6 py-4 text-center font-bold text-sm">
                      {activeMeta.usernameLabel}
                    </th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-center font-bold text-sm">
                      Problems Solved
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.length > 0 ? (
                    leaderboard.map((student, index) => {
                      const isCurrentUser =
                        studentData &&
                        studentData.studentId === student.studentId;

                      return (
                        <tr
                          key={student._id}
                          className={`border-b transition-all duration-300 ${
                            isCurrentUser
                              ? dark
                                ? "bg-gradient-to-r from-yellow-900/30 via-orange-900/20 to-yellow-900/30 hover:from-yellow-900/40 border-yellow-800/30"
                                : "bg-gradient-to-r from-yellow-100 via-orange-50 to-yellow-50 hover:from-yellow-150 hover:to-orange-100 border-gray-100"
                              : dark
                                ? `hover:bg-slate-700/50 border-slate-700/40 ${index % 2 === 0 ? "bg-slate-800/30" : ""}`
                                : `hover:bg-gray-50 border-gray-100 ${index % 2 === 0 ? "bg-gray-50/30" : ""}`
                          }`}
                        >
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div className="flex items-center space-x-3">
                              {student.rank <= 3 && (
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                                    student.rank === 1
                                      ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                                      : student.rank === 2
                                      ? "bg-gradient-to-br from-gray-400 to-gray-600"
                                      : "bg-gradient-to-br from-orange-400 to-orange-600"
                                  }`}
                                >
                                  {student.rank === 1 && "🥇"}
                                  {student.rank === 2 && "🥈"}
                                  {student.rank === 3 && "🥉"}
                                </div>
                              )}
                              {student.rank > 3 && (
                                <span className={`text-lg font-bold w-10 text-center ${dark ? "text-gray-300" : "text-gray-700"}`}>
                                  {student.rank}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <span
                              className={`font-semibold ${
                                isCurrentUser
                                  ? "text-orange-500"
                                  : dark ? "text-gray-200" : "text-gray-800"
                              }`}
                            >
                              {student.name}
                              {isCurrentUser && (
                                <span className={`ml-2 text-xs px-3 py-1 rounded-full font-medium ${dark ? "bg-orange-900/40 text-orange-300" : "bg-orange-200 text-orange-800"}`}>
                                  You
                                </span>
                              )}
                            </span>
                          </td>
                          <td className={`hidden md:table-cell px-6 py-4 ${dark ? "text-gray-400" : "text-gray-600"}`}>
                            {student.college}
                          </td>
                          <td className="hidden sm:table-cell px-6 py-4 text-center">
                            {platform === "leetcode" ? (
                              getUsername(student) ? (
                                <a
                                  href={`${activeMeta.linkPrefix}${getUsername(student)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-orange-600 hover:text-orange-800 font-medium underline transition-colors"
                                >
                                  @{getUsername(student)}
                                </a>
                              ) : (
                                <span className="text-gray-400 text-sm">—</span>
                              )
                            ) : (
                              getUsername(student) ? (
                                <a
                                  href={`${activeMeta.linkPrefix}${getUsername(student)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-amber-600 hover:text-amber-800 font-medium underline transition-colors"
                                >
                                  @{getUsername(student)}
                                </a>
                              ) : (
                                <span className="text-gray-400 text-sm">—</span>
                              )
                            )}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              {getScore(student) > 0 ? (
                                <>
                                  <span className={`text-2xl font-bold ${platform === "leetcode" ? "text-orange-600" : "text-amber-600"}`}>
                                    {getScore(student)}
                                  </span>
                                  <svg
                                    className={`w-6 h-6 ${platform === "leetcode" ? "text-orange-600" : "text-amber-600"}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                </>
                              ) : (
                                <span className="text-gray-400 text-lg">—</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <svg
                            className="w-16 h-16 text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                            />
                          </svg>
                          <p className={`text-lg font-medium ${dark ? "text-gray-500" : "text-gray-500"}`}>
                            No students have submitted {activeMeta.emptyLabel} credentials yet
                          </p>
                          {studentData && (
                            <p className={`${dark ? "text-gray-600" : "text-gray-400"}`}>
                              Be the first to add your LeetCode username on your
                              dashboard!
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Leaderboard Stats */}
            {leaderboard.length > 0 && (
              <div className={`grid grid-cols-3 gap-2 sm:gap-4 p-4 sm:p-6 border-t transition-colors duration-500 ${dark ? "bg-slate-800/50 border-slate-700/40" : "bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 border-gray-100"}`}>
                <div className="text-center">
                  <p className={`text-sm font-medium ${dark ? "text-gray-500" : "text-gray-600"}`}>
                    Total Students
                  </p>
                  <p className={`text-3xl font-bold ${dark ? "text-indigo-400" : "text-indigo-600"}`}>
                    {leaderboard.length}
                  </p>
                </div>
                <div className="text-center">
                  <p className={`text-sm font-medium ${dark ? "text-gray-500" : "text-gray-600"}`}>
                    Average Problems
                  </p>
                  <p className={`text-3xl font-bold ${dark ? "text-indigo-400" : "text-indigo-600"}`}>
                    {averageScore}
                  </p>
                </div>
                <div className="text-center">
                  <p className={`text-sm font-medium ${dark ? "text-gray-500" : "text-gray-600"}`}>
                    Highest Score
                  </p>
                  <p className={`text-3xl font-bold ${dark ? "text-indigo-400" : "text-indigo-600"}`}>
                    {getScore(leaderboard[0])}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
