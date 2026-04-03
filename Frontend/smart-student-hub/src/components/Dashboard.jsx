import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../services/api";
import { connectSocket, disconnectSocket } from "../services/socket";
import LeetCodeCard from "./LeetCodeCard";
import CodeChefCard from "./CodeChefCard";
import ChatBot from "./ChatBot";

const Dashboard = ({ studentData, onLogout }) => {
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(false);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showMessages, setShowMessages] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [studentGroups, setStudentGroups] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [toastNotif, setToastNotif] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    cgpa: null,
    projectCount: 0,
    certificateCount: 0,
    semesterCount: 0,
  });
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const socketRef = useRef(null);
  const [dark, setDark] = useState(() => {
    try { return JSON.parse(localStorage.getItem('student-dark-mode')) ?? true; } catch { return true; }
  });
  useEffect(() => { localStorage.setItem('student-dark-mode', JSON.stringify(dark)); }, [dark]);

  // Notification type icon & color map
  const notifMeta = {
    message: { icon: '✉️', color: 'from-blue-500 to-indigo-500', label: 'Message' },
    feedback: { icon: '📝', color: 'from-green-500 to-emerald-500', label: 'Feedback' },
    announcement: { icon: '📢', color: 'from-yellow-500 to-orange-500', label: 'Announcement' },
    certificate: { icon: '🏅', color: 'from-purple-500 to-pink-500', label: 'Certificate' },
    internship: { icon: '💼', color: 'from-teal-500 to-cyan-500', label: 'Internship' },
    system: { icon: '⚙️', color: 'from-gray-500 to-slate-500', label: 'System' },
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Socket.IO connection + real-time listeners
  useEffect(() => {
    if (!studentData?.studentId) return;

    const socket = connectSocket(studentData.studentId);
    socketRef.current = socket;

    // Listen for new notifications (feedback, announcements, internships, etc.)
    socket.on('notification', (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadNotifCount((prev) => prev + 1);
      // Show toast
      setToastNotif(notif);
      setTimeout(() => setToastNotif(null), 5000);
    });

    // Listen for new messages
    socket.on('new-message', (message) => {
      setMessages((prev) => [{ ...message, isRead: false }, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.off('notification');
      socket.off('new-message');
      disconnectSocket();
    };
  }, [studentData?.studentId]);

  const fetchDashboardData = useCallback(async () => {
    if (!studentData?.studentId) {
      return;
    }

    try {
      const results = await Promise.allSettled([
        api.get(`/api/messages/student/${studentData.studentId}`),
        api.get(`/api/messages/unread-count/${studentData.studentId}`),
        api.get(`/api/notifications/${studentData.studentId}`),
        api.get(`/api/notifications/unread-count/${studentData.studentId}`),
        api.get(`/api/profile/${studentData.studentId}`),
        api.get(`/api/projects/${studentData.studentId}`),
        api.get(`/api/certificates/${studentData.studentId}`),
        api.get(`/api/students/${studentData.studentId}/marks`),
        api.get(`/api/student/groups/${studentData.studentId}`),
      ]);

      const pickData = (index, fallback) =>
        results[index]?.status === 'fulfilled' ? results[index].value?.data : fallback;

      const messagesData = pickData(0, []);
      const unreadMessagesData = pickData(1, {});
      const notificationsData = pickData(2, []);
      const unreadNotificationsData = pickData(3, {});
      const profileDataResponse = pickData(4, {});
      const projectsData = pickData(5, []);
      const certificatesData = pickData(6, []);
      const marksData = pickData(7, {});
      const groupsData = pickData(8, []);

      setMessages(Array.isArray(messagesData) ? messagesData : []);
      setUnreadCount(unreadMessagesData?.unreadCount || 0);
      setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
      setUnreadNotifCount(unreadNotificationsData?.unreadCount || 0);
      setProfileData(profileDataResponse || {});
      setStudentGroups(Array.isArray(groupsData) ? groupsData : []);
      setDashboardStats({
        cgpa: marksData?.cgpa ?? null,
        projectCount: Array.isArray(projectsData) ? projectsData.length : 0,
        certificateCount: Array.isArray(certificatesData) ? certificatesData.length : 0,
        semesterCount: Array.isArray(marksData?.semesterMarks) ? marksData.semesterMarks.length : 0,
      });
      setLastSyncedAt(new Date());
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  }, [studentData?.studentId]);

  useEffect(() => {
    fetchDashboardData();

    const intervalId = setInterval(fetchDashboardData, 10000);
    const onFocus = () => fetchDashboardData();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchDashboardData]);

  const markNotificationRead = async (notifId) => {
    try {
      await api.put(`/api/notifications/${notifId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notifId ? { ...n, isRead: true, readAt: new Date() } : n))
      );
      setUnreadNotifCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification read:", error);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.put(`/api/notifications/mark-all-read/${studentData.studentId}`);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: new Date() })));
      setUnreadNotifCount(0);
    } catch (error) {
      console.error("Error marking all notifications read:", error);
    }
  };

  const handleLogout = () => {
    onLogout();
  };

  

  return (
    <div className={`min-h-screen bg-gradient-to-br ${dark ? 'from-gray-950 via-slate-900 to-gray-900' : 'from-slate-50 via-blue-50 to-indigo-100'}`}>
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
            <div className="flex items-center space-x-3">
              <div className="relative">
                <button
                  onClick={() => {
                    setShowMessages(!showMessages);
                    setShowNotification(false);
                  }}
                  className="relative bg-white/10 backdrop-blur-md hover:bg-white/20 p-3 rounded-xl transition-all duration-300 group border border-white/20"
                >
                  <svg
                    className="w-5 h-5 text-white group-hover:scale-110 transition-transform"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowNotification(!showNotification);
                    setShowMessages(false);
                  }}
                  className="relative bg-white/10 backdrop-blur-md hover:bg-white/20 p-3 rounded-xl transition-all duration-300 group border border-white/20"
                >
                  <svg
                    className="w-5 h-5 text-white group-hover:scale-110 transition-transform"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                  {unreadNotifCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
                      {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
                    </span>
                  )}
                </button>
                {showNotification && (
                  <div className="absolute right-0 mt-3 w-96 bg-white/95 backdrop-blur-xl text-black rounded-2xl shadow-2xl border border-white/20 z-50 max-h-[28rem] overflow-hidden animate-slideUp">
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-800 text-lg">Notifications</h3>
                        <div className="flex items-center space-x-2">
                          {unreadNotifCount > 0 && (
                            <button
                              onClick={markAllNotificationsRead}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
                            >
                              Mark all read
                            </button>
                          )}
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {unreadNotifCount} new
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                            </svg>
                          </div>
                          <p className="font-medium">No notifications yet</p>
                          <p className="text-sm text-gray-400 mt-1">You'll be notified about feedback, messages & more</p>
                        </div>
                      ) : (
                        notifications.map((notif) => {
                          const meta = notifMeta[notif.type] || notifMeta.system;
                          return (
                            <div
                              key={notif._id}
                              className={`p-4 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-all duration-200 ${
                                !notif.isRead ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500" : ""
                              }`}
                              onClick={() => {
                                if (!notif.isRead) markNotificationRead(notif._id);
                              }}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`w-10 h-10 bg-gradient-to-br ${meta.color} rounded-full flex items-center justify-center text-white text-lg shadow-md flex-shrink-0`}>
                                  {meta.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{meta.label}</span>
                                    <span className="text-xs text-gray-400">{timeAgo(notif.createdAt)}</span>
                                  </div>
                                  <p className="font-semibold text-gray-800 text-sm truncate">{notif.title}</p>
                                  <p className="text-sm text-gray-600 line-clamp-2 mt-0.5">{notif.body}</p>
                                  {notif.senderName && (
                                    <p className="text-xs text-gray-400 mt-1">From: {notif.senderName}</p>
                                  )}
                                </div>
                                {!notif.isRead && (
                                  <span className="inline-block w-2.5 h-2.5 bg-blue-500 rounded-full mt-1 animate-pulse flex-shrink-0"></span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
                {showMessages && (
                  <div className="absolute right-0 mt-3 w-96 bg-white/95 backdrop-blur-xl text-black rounded-2xl shadow-2xl border border-white/20 z-50 max-h-96 overflow-hidden animate-slideUp">
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-800 text-lg">
                          Messages
                        </h3>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {messages.length} total
                        </span>
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {messages.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                              className="w-8 h-8 text-gray-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                          </div>
                          <p className="font-medium">No messages yet</p>
                          <p className="text-sm text-gray-400 mt-1">
                            Messages from teachers will appear here
                          </p>
                        </div>
                      ) : (
                        messages.map((message) => (
                          <div
                            key={message._id}
                            className={`p-4 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-all duration-200 ${
                              !message.isRead
                                ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500"
                                : ""
                            }`}
                            onClick={async () => {
                              if (!message.isRead) {
                                try {
                                  await api.put(
                                    `/api/messages/${message._id}/read/${studentData.studentId}`
                                  );
                                  setMessages((prev) =>
                                    prev.map((m) =>
                                      m._id === message._id
                                        ? {
                                            ...m,
                                            isRead: true,
                                            readAt: new Date(),
                                          }
                                        : m
                                    )
                                  );
                                  setUnreadCount((prev) =>
                                    Math.max(0, prev - 1)
                                  );
                                } catch (error) {
                                  console.error(
                                    "Error marking message as read:",
                                    error
                                  );
                                }
                              }
                            }}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                                  {message.senderName.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-800">
                                    {message.senderName}
                                  </p>
                                  <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    {message.groupName}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">
                                  {new Date(
                                    message.createdAt
                                  ).toLocaleDateString()}
                                </p>
                                {!message.isRead && (
                                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-1 animate-pulse"></span>
                                )}
                              </div>
                            </div>
                            <h4 className="font-semibold text-gray-800 mb-2">
                              {message.subject}
                            </h4>
                            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                              {message.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setDark(!dark)}
                className="bg-white/10 backdrop-blur-md hover:bg-white/20 p-3 rounded-xl transition-all duration-300 border border-white/20"
                title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {dark ? (
                  <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/></svg>
                ) : (
                  <svg className="w-5 h-5 text-blue-200" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>
                )}
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

      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={`backdrop-blur-2xl rounded-3xl shadow-2xl p-8 mb-10 border relative overflow-hidden ${dark ? 'bg-white/5 border-white/10' : 'bg-white/70 border-white/30'}`}
        >
          <div className={`absolute inset-0 ${dark ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10' : 'bg-gradient-to-r from-blue-500/5 to-indigo-500/5'}`}></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-6 lg:space-y-0">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  {profileData?.profileImage ? (
                    <img
                      src={profileData.profileImage}
                      alt="Profile"
                      className="w-24 h-24 rounded-2xl object-cover shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300 border-4 border-white"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                      {studentData?.name?.charAt(0) || "S"}
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h2 className={`text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-3 ${dark ? 'from-white via-blue-200 to-indigo-300' : 'from-slate-800 via-blue-800 to-indigo-800'}`}>
                    Welcome back, {studentData?.name || "Student"}!
                  </h2>
                  <div className="flex items-center space-x-4">
                    <div className={`px-4 py-2 rounded-full ${dark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                      <p className={`font-semibold text-sm ${dark ? 'text-blue-300' : 'text-blue-800'}`}>
                        ID: {studentData?.studentId}
                      </p>
                    </div>
                    <div className={`px-4 py-2 rounded-full ${dark ? 'bg-green-500/20' : 'bg-green-100'}`}>
                      <p className={`font-semibold text-sm ${dark ? 'text-green-300' : 'text-green-800'}`}>
                        Active Student
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => navigate("/profile")}
                  className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center space-x-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={() => navigate("/view-profile")}
                  className="bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center space-x-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>View Profile</span>
                </button>
              </div>
            </div>
            {lastSyncedAt && (
              <div className="mt-6">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${dark ? "bg-blue-500/20 text-blue-200" : "bg-blue-100 text-blue-700"}`}>
                  Last Sync: {lastSyncedAt.toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className={`rounded-2xl p-4 border ${dark ? "bg-white/[0.04] border-white/10" : "bg-white/70 border-white/30"}`}>
            <p className={`text-xs font-medium uppercase ${dark ? "text-gray-400" : "text-gray-500"}`}>CGPA</p>
            <p className="text-2xl font-bold text-emerald-500">{dashboardStats.cgpa ?? "N/A"}</p>
          </div>
          <div className={`rounded-2xl p-4 border ${dark ? "bg-white/[0.04] border-white/10" : "bg-white/70 border-white/30"}`}>
            <p className={`text-xs font-medium uppercase ${dark ? "text-gray-400" : "text-gray-500"}`}>Projects</p>
            <p className="text-2xl font-bold text-indigo-500">{dashboardStats.projectCount}</p>
          </div>
          <div className={`rounded-2xl p-4 border ${dark ? "bg-white/[0.04] border-white/10" : "bg-white/70 border-white/30"}`}>
            <p className={`text-xs font-medium uppercase ${dark ? "text-gray-400" : "text-gray-500"}`}>Certificates</p>
            <p className="text-2xl font-bold text-purple-500">{dashboardStats.certificateCount}</p>
          </div>
          <div className={`rounded-2xl p-4 border ${dark ? "bg-white/[0.04] border-white/10" : "bg-white/70 border-white/30"}`}>
            <p className={`text-xs font-medium uppercase ${dark ? "text-gray-400" : "text-gray-500"}`}>Semesters</p>
            <p className="text-2xl font-bold text-orange-500">{dashboardStats.semesterCount}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className={`backdrop-blur-2xl rounded-3xl shadow-xl p-8 border relative overflow-hidden ${dark ? "bg-white/[0.04] border-white/10" : "bg-white/60 border-white/30"}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${dark ? "text-gray-200" : "text-gray-800"}`}>My Groups</h3>
              <p className={`mb-3 ${dark ? "text-gray-400" : "text-gray-600"}`}>Assigned groups update automatically</p>
              <p className="text-2xl font-bold text-violet-600 mb-2">{studentGroups.length}</p>
              <p className={`text-sm ${dark ? "text-gray-400" : "text-gray-600"}`}>
                {studentGroups.length > 0
                  ? studentGroups.slice(0, 2).map((g) => g.name).join(', ')
                  : 'No groups assigned yet'}
              </p>
              {studentGroups.length > 0 && (
                <p className={`text-xs mt-2 ${dark ? "text-blue-300" : "text-blue-700"}`}>
                  Mentors: {Array.from(new Set(studentGroups.map((g) => g.teacherName).filter(Boolean))).slice(0, 3).join(', ')}
                </p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`group backdrop-blur-2xl rounded-3xl shadow-xl p-8 border cursor-pointer hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 relative overflow-hidden ${dark ? "bg-white/[0.04] border-white/10 hover:bg-white/[0.08]" : "bg-white/60 border-white/30 hover:bg-white/80"}`}
            onClick={() => navigate("/resume-analyzer")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-600 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-3 transition-colors ${dark ? "text-gray-200 group-hover:text-rose-400" : "text-gray-800 group-hover:text-rose-700"}`}>
                AI Resume Analyzer
              </h3>
              <p className={`leading-relaxed ${dark ? "text-gray-400" : "text-gray-600"}`}>
                AI-powered resume analysis with real internship recommendations from top platforms
              </p>
              <div className="mt-4 flex items-center text-rose-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
                <span className="text-sm">Analyze →</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className={`group backdrop-blur-2xl rounded-3xl shadow-xl p-8 border cursor-pointer hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 relative overflow-hidden ${dark ? "bg-white/[0.04] border-white/10 hover:bg-white/[0.08]" : "bg-white/60 border-white/30 hover:bg-white/80"}`}
            onClick={() => navigate("/profile")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-3 transition-colors ${dark ? "text-gray-200 group-hover:text-purple-400" : "text-gray-800 group-hover:text-purple-700"}`}>
                Profile Management
              </h3>
              <p className={`leading-relaxed ${dark ? "text-gray-400" : "text-gray-600"}`}>
                Update your personal details and documents
              </p>
              <div className="mt-4 flex items-center text-purple-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
                <span className="text-sm">Edit →</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className={`group backdrop-blur-2xl rounded-3xl shadow-xl p-8 border cursor-pointer hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 relative overflow-hidden ${dark ? "bg-white/[0.04] border-white/10 hover:bg-white/[0.08]" : "bg-white/60 border-white/30 hover:bg-white/80"}`}
            onClick={() => navigate("/projects")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-3 transition-colors ${dark ? "text-gray-200 group-hover:text-indigo-400" : "text-gray-800 group-hover:text-indigo-700"}`}>
                Project Portfolio
              </h3>
              <p className={`leading-relaxed ${dark ? "text-gray-400" : "text-gray-600"}`}>
                Showcase your projects and technical work
              </p>
              <div className="mt-4 flex items-center text-indigo-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
                <span className="text-sm">Add →</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className={`group backdrop-blur-2xl rounded-3xl shadow-xl p-8 border cursor-pointer hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 relative overflow-hidden ${dark ? "bg-white/[0.04] border-white/10 hover:bg-white/[0.08]" : "bg-white/60 border-white/30 hover:bg-white/80"}`}
            onClick={() => navigate("/professional-portfolio")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-3 transition-colors ${dark ? "text-gray-200 group-hover:text-purple-400" : "text-gray-800 group-hover:text-purple-700"}`}>
                Professional Portfolio
              </h3>
              <p className={`leading-relaxed ${dark ? "text-gray-400" : "text-gray-600"}`}>
                Generate professional portfolios and resumes with certifications, skills & projects
              </p>
              <div className="mt-4 flex items-center text-purple-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
                <span className="text-sm">Generate →</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className={`group backdrop-blur-2xl rounded-3xl shadow-xl p-8 border cursor-pointer hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 relative overflow-hidden ${dark ? "bg-white/[0.04] border-white/10 hover:bg-white/[0.08]" : "bg-white/60 border-white/30 hover:bg-white/80"}`}
            onClick={() => navigate("/resume-editor")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-3 transition-colors ${dark ? "text-gray-200 group-hover:text-teal-400" : "text-gray-800 group-hover:text-teal-700"}`}>
                Resume & Portfolio Editor
              </h3>
              <p className={`leading-relaxed ${dark ? "text-gray-400" : "text-gray-600"}`}>
                Edit your resume & portfolio content in one place — changes reflect everywhere
              </p>
              <div className="mt-4 flex items-center text-teal-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
                <span className="text-sm">Edit →</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className={`group backdrop-blur-2xl rounded-3xl shadow-xl p-8 border cursor-pointer hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 relative overflow-hidden ${dark ? "bg-white/[0.04] border-white/10 hover:bg-white/[0.08]" : "bg-white/60 border-white/30 hover:bg-white/80"}`}
            onClick={() => navigate("/academic-certificates")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 713.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 713.138-3.138z"
                  />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-3 transition-colors ${dark ? "text-gray-200 group-hover:text-green-400" : "text-gray-800 group-hover:text-green-700"}`}>
                Academic Certificates
              </h3>
              <p className={`leading-relaxed ${dark ? "text-gray-400" : "text-gray-600"}`}>
                Manage and showcase your academic achievements
              </p>
              <div className="mt-4 flex items-center text-green-600 font-medium group-hover:translate-x-2 transition-transform duration-300">
                <span className="text-sm">Manage →</span>
              </div>
            </div>
          </motion.div>

          <LeetCodeCard studentData={studentData} dark={dark} />
          <CodeChefCard studentData={studentData} dark={dark} />

        </div>
      </div>

      {/* Toast notification popup */}
      {toastNotif && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-[100]"
        >
          <div className={`rounded-2xl shadow-2xl border p-4 max-w-sm flex items-start space-x-3 ${dark ? "bg-gray-900 border-white/10" : "bg-white border-gray-200"}`}>
            <div className={`w-10 h-10 bg-gradient-to-br ${(notifMeta[toastNotif.type] || notifMeta.system).color} rounded-full flex items-center justify-center text-white text-lg shadow-md flex-shrink-0`}>
              {(notifMeta[toastNotif.type] || notifMeta.system).icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm ${dark ? "text-gray-100" : "text-gray-800"}`}>{toastNotif.title}</p>
              <p className={`text-sm line-clamp-2 mt-0.5 ${dark ? "text-gray-300" : "text-gray-600"}`}>{toastNotif.body}</p>
              {toastNotif.senderName && (
                <p className={`text-xs mt-1 ${dark ? "text-gray-400" : "text-gray-400"}`}>From: {toastNotif.senderName}</p>
              )}
            </div>
            <button
              onClick={() => setToastNotif(null)}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}

      {/* AI Chatbot */}
      <ChatBot studentData={studentData} />
    </div>
  );
};

export default Dashboard;
