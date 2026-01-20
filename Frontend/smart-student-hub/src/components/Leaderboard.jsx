import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Leaderboard = ({ studentData }) => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [platform, setPlatform] = useState("leetcode"); // "leetcode" or "codechef"

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const endpoint = platform === "leetcode" 
          ? "/api/leaderboard/leetcode" 
          : "/api/leaderboard/codechef";
        const response = await api.get(endpoint);
        setLeaderboard(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError("Failed to load leaderboard. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [platform]);

  const handleLogout = () => {
    sessionStorage.removeItem("studentData");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navbar */}
      {studentData && (
        <nav className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white shadow-2xl border-b border-white/10">
          <div className="container mx-auto px-6 py-4">
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
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent">
                  Smart Student Hub
                </h1>
              </div>
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="bg-white/10 backdrop-blur-md hover:bg-white/20 px-6 py-2 rounded-xl transition-all duration-300 border border-white/20 text-white font-medium"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 px-6 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/30 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
                {platform === "leetcode" ? "LeetCode" : "CodeChef"} Leaderboard
              </h1>
              <p className="text-gray-600 text-lg">
                Top students by problems solved
              </p>
            </div>
            <div className={`w-24 h-24 bg-gradient-to-br ${
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
          </div>

          {/* Platform Toggle */}
          <div className="mb-6">
            <div className="flex items-center gap-4 bg-gradient-to-r from-slate-100 to-blue-100 p-2 rounded-2xl w-fit">
              <button
                onClick={() => setPlatform("leetcode")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  platform === "leetcode"
                    ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg scale-105"
                    : "bg-transparent text-gray-600 hover:bg-white/50"
                }`}
              >
                LeetCode
              </button>
              <button
                onClick={() => setPlatform("codechef")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  platform === "codechef"
                    ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-lg scale-105"
                    : "bg-transparent text-gray-600 hover:bg-white/50"
                }`}
              >
                CodeChef
              </button>
            </div>
          </div>

          {/* CodeChef Info Note */}
          {platform === "codechef" && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
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
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> CodeChef rankings may be delayed due to platform restrictions. Private profiles will show "—" for problems solved.
              </p>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl p-12 border border-white/30 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-xl text-gray-600 font-medium">
                Loading leaderboard...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border-2 border-red-200 rounded-3xl shadow-lg p-8">
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
              <p className="text-red-800 text-lg font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        {!loading && !error && (
          <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white">
                    <th className="px-6 py-4 text-left font-bold">Rank</th>
                    <th className="px-6 py-4 text-left font-bold">Student Name</th>
                    <th className="px-6 py-4 text-left font-bold">College</th>
                    <th className="px-6 py-4 text-center font-bold">
                      {platform === "leetcode" ? "LeetCode Username" : "CodeChef Username"}
                    </th>
                    <th className="px-6 py-4 text-center font-bold">
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
                          className={`border-b border-gray-100 transition-all duration-300 ${
                            isCurrentUser
                              ? "bg-gradient-to-r from-yellow-100 via-orange-50 to-yellow-50 hover:from-yellow-150 hover:to-orange-100"
                              : "hover:bg-gray-50"
                          } ${index % 2 === 0 ? "bg-gray-50/30" : ""}`}
                        >
                          <td className="px-6 py-4">
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
                                <span className="text-lg font-bold text-gray-700 w-10 text-center">
                                  {student.rank}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`font-semibold ${
                                isCurrentUser
                                  ? "text-orange-700"
                                  : "text-gray-800"
                              }`}
                            >
                              {student.name}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs bg-orange-200 text-orange-800 px-3 py-1 rounded-full font-medium">
                                  You
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {student.college}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {platform === "leetcode" ? (
                              student.leetcodeUsername ? (
                                <a
                                  href={`https://leetcode.com/${student.leetcodeUsername}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-orange-600 hover:text-orange-800 font-medium underline transition-colors"
                                >
                                  @{student.leetcodeUsername}
                                </a>
                              ) : (
                                <span className="text-gray-400 text-sm">—</span>
                              )
                            ) : (
                              student.codechefUsername ? (
                                <a
                                  href={`https://www.codechef.com/users/${student.codechefUsername}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-amber-600 hover:text-amber-800 font-medium underline transition-colors"
                                >
                                  @{student.codechefUsername}
                                </a>
                              ) : (
                                <span className="text-gray-400 text-sm">—</span>
                              )
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              {platform === "leetcode" ? (
                                student.problemsSolved > 0 ? (
                                  <>
                                    <span className="text-2xl font-bold text-orange-600">
                                      {student.problemsSolved}
                                    </span>
                                    <svg
                                      className="w-6 h-6 text-orange-600"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  </>
                                ) : (
                                  <span className="text-gray-400 text-lg">—</span>
                                )
                              ) : (
                                student.codechefProblemsSolved > 0 ? (
                                  <>
                                    <span className="text-2xl font-bold text-amber-600">
                                      {student.codechefProblemsSolved}
                                    </span>
                                    <svg
                                      className="w-6 h-6 text-amber-600"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  </>
                                ) : (
                                  <span className="text-gray-400 text-lg">—</span>
                                )
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
                          <p className="text-gray-500 text-lg font-medium">
                            No students have submitted {platform === "leetcode" ? "LeetCode" : "CodeChef"} credentials yet
                          </p>
                          {studentData && (
                            <p className="text-gray-400">
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
              <div className="grid grid-cols-3 gap-4 bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 p-6 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-gray-600 text-sm font-medium">
                    Total Students
                  </p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {leaderboard.length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 text-sm font-medium">
                    Average Problems
                  </p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {platform === "leetcode" 
                      ? Math.round(
                          leaderboard.reduce((sum, s) => sum + (s.problemsSolved || 0), 0) /
                            leaderboard.length
                        )
                      : Math.round(
                          leaderboard.reduce((sum, s) => sum + (s.codechefProblemsSolved || 0), 0) /
                            leaderboard.length
                        )
                    }
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 text-sm font-medium">
                    Highest Score
                  </p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {platform === "leetcode" 
                      ? (leaderboard[0]?.problemsSolved || 0)
                      : (leaderboard[0]?.codechefProblemsSolved || 0)
                    }
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
