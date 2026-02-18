import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const CodeChefCard = ({ studentData }) => {
  const navigate = useNavigate();
  const [codechefUsername, setCodechefUsername] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [warning, setWarning] = useState("");
  const [problemsSolved, setProblemsSolved] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Format time ago
  const timeAgo = (date) => {
    if (!date) return "";
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  // Fetch current CodeChef data on component mount
  const fetchCodeChefData = async () => {
    if (studentData?.studentId) {
      try {
        const response = await api.get(
          `/api/codechef/${studentData.studentId}`
        );
        if (response.data.codechefUsername) {
          setCodechefUsername(response.data.codechefUsername);
          setProblemsSolved(response.data.codechefProblemsSolved || 0);
          setLastUpdated(response.data.codechefUpdatedAt);
        }
      } catch (err) {
        console.error("Error fetching CodeChef data:", err);
      }
    }
  };

  useEffect(() => {
    fetchCodeChefData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchCodeChefData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [studentData]);

  // Manual refresh button handler
  const handleRefresh = async () => {
    if (!codechefUsername || refreshing) return;
    setRefreshing(true);
    try {
      const response = await api.post(
        `/api/codechef/refresh/${studentData.studentId}`
      );
      setProblemsSolved(response.data.codechefProblemsSolved);
      setLastUpdated(response.data.codechefUpdatedAt);
      setSuccess("Stats refreshed!");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate input
    if (!inputValue.trim()) {
      setError("Username cannot be empty");
      return;
    }

    if (inputValue.trim().length < 2) {
      setError("Username must be at least 2 characters");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setWarning("");

    try {
      const response = await api.post("/api/codechef/update-username", {
        studentId: studentData.studentId,
        username: inputValue.trim(),
      });

      setCodechefUsername(response.data.codechefUsername);
      setProblemsSolved(response.data.codechefProblemsSolved);
      
      // Check if there's a warning (e.g., private profile)
      if (response.data.warning) {
        setWarning(response.data.warning);
      } else if (response.data.fromCache) {
        setSuccess("CodeChef profile loaded from cache!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setSuccess("CodeChef profile saved successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
      
      setInputValue("");
      setIsEditing(false);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || 
        "Failed to update CodeChef profile. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group bg-white/60 backdrop-blur-2xl rounded-3xl shadow-xl p-8 border border-white/30 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:bg-white/80 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-4.41 0-8-3.59-8-8V8.18l8-4.35 8 4.35V12c0 4.41-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
          </div>
          <button
            onClick={() => navigate("/leaderboard")}
            className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
          >
            View Leaderboard →
          </button>
        </div>

        <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-amber-700 transition-colors">
          CodeChef Credentials
        </h3>
        <p className="text-gray-600 mb-6">
          Connect your CodeChef account and compete on the leaderboard
        </p>

        {/* Current Status */}
        {codechefUsername && !isEditing && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600">Current CodeChef Username</p>
                <p className="text-lg font-bold text-gray-800">
                  {codechefUsername}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Problems Solved</p>
                <p className="text-2xl font-bold text-amber-600">
                  {problemsSolved}
                </p>
              </div>
            </div>
            {/* Last updated + refresh */}
            <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
              <span>{lastUpdated ? `Updated ${timeAgo(lastUpdated)}` : ''}</span>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-1 text-amber-600 hover:text-amber-700 font-medium disabled:opacity-50"
                title="Refresh stats now"
              >
                <svg className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            <div className="flex gap-3">
              <a
                href={`https://www.codechef.com/users/${codechefUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 text-center"
              >
                View Profile
              </a>
              <button
                onClick={() => {
                  setIsEditing(true);
                  setInputValue(codechefUsername);
                }}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
              >
                Update
              </button>
            </div>
          </div>
        )}

        {/* Edit/Add Form */}
        {isEditing && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CodeChef Username
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setError("");
                }}
                placeholder="Enter your CodeChef username"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-amber-500 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-2">
                Your CodeChef username (case-sensitive)
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-3">
                <svg
                  className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start space-x-3">
                <svg
                  className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            {warning && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start space-x-3">
                <svg
                  className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-yellow-700">{warning}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Save</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setInputValue("");
                  setError("");
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Initial state */}
        {!codechefUsername && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-semibold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Add CodeChef Username
          </button>
        )}
      </div>
    </div>
  );
};

export default CodeChefCard;
