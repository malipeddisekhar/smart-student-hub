import React, { useState, useRef, useEffect } from "react";
import api from "../services/api";

/* Tech-style AI robot mascot SVG */
const AIMascot = ({ size = 40, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="headGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#818CF8" />
        <stop offset="100%" stopColor="#6366F1" />
      </linearGradient>
      <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#4F46E5" />
        <stop offset="100%" stopColor="#3730A3" />
      </linearGradient>
      <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1E1B4B" />
        <stop offset="100%" stopColor="#312E81" />
      </linearGradient>
    </defs>
    {/* Antenna */}
    <line x1="60" y1="12" x2="60" y2="22" stroke="#818CF8" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="60" cy="9" r="4" fill="#34D399" className="animate-pulse" />
    <circle cx="60" cy="9" r="2" fill="#6EE7B7" />
    {/* Head */}
    <rect x="28" y="22" width="64" height="48" rx="14" fill="url(#headGrad)" />
    {/* Screen face */}
    <rect x="34" y="28" width="52" height="36" rx="10" fill="url(#screenGrad)" />
    {/* Left eye — glowing */}
    <circle cx="47" cy="44" r="7" fill="#0F172A" />
    <circle cx="47" cy="44" r="5" fill="#38BDF8" />
    <circle cx="47" cy="44" r="2.5" fill="#F0F9FF" />
    {/* Right eye — glowing */}
    <circle cx="73" cy="44" r="7" fill="#0F172A" />
    <circle cx="73" cy="44" r="5" fill="#38BDF8" />
    <circle cx="73" cy="44" r="2.5" fill="#F0F9FF" />
    {/* Mouth — LED smile */}
    <rect x="48" y="54" width="4" height="3" rx="1" fill="#34D399" />
    <rect x="54" y="54" width="4" height="3" rx="1" fill="#34D399" />
    <rect x="60" y="54" width="4" height="3" rx="1" fill="#34D399" />
    <rect x="66" y="54" width="4" height="3" rx="1" fill="#34D399" />
    {/* Ear panels */}
    <rect x="20" y="36" width="8" height="16" rx="4" fill="#6366F1" />
    <rect x="92" y="36" width="8" height="16" rx="4" fill="#6366F1" />
    <circle cx="24" cy="44" r="2" fill="#38BDF8" />
    <circle cx="96" cy="44" r="2" fill="#38BDF8" />
    {/* Neck */}
    <rect x="52" y="70" width="16" height="6" rx="3" fill="#4F46E5" />
    {/* Body */}
    <rect x="34" y="76" width="52" height="30" rx="10" fill="url(#bodyGrad)" />
    {/* Chest plate / circuit lines */}
    <circle cx="60" cy="88" r="8" fill="none" stroke="#818CF8" strokeWidth="1.5" opacity="0.6" />
    <circle cx="60" cy="88" r="4" fill="#38BDF8" opacity="0.8" />
    <line x1="52" y1="88" x2="40" y2="88" stroke="#818CF8" strokeWidth="1" opacity="0.4" />
    <line x1="68" y1="88" x2="80" y2="88" stroke="#818CF8" strokeWidth="1" opacity="0.4" />
    <line x1="60" y1="80" x2="60" y2="76" stroke="#818CF8" strokeWidth="1" opacity="0.4" />
    {/* Code brackets on body */}
    <text x="44" y="98" fontSize="10" fill="#C7D2FE" fontFamily="monospace" opacity="0.7">{"</>"}</text>
    <text x="68" y="98" fontSize="10" fill="#C7D2FE" fontFamily="monospace" opacity="0.7">{"{ }"}</text>
  </svg>
);

/* Small mascot for message bubbles */
const MascotSmall = () => (
  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-100 to-cyan-100 flex items-center justify-center flex-shrink-0 shadow-sm border border-indigo-200">
    <AIMascot size={22} />
  </div>
);

const ChatBot = ({ studentData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hey there! 👋 I'm **Nova** — your AI-powered campus assistant! Ask me anything about academics, certificates, placements, or coding practice!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Auto-hide greeting bubble after 5 seconds
  useEffect(() => {
    if (showGreeting && !isOpen) {
      const timer = setTimeout(() => setShowGreeting(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [showGreeting, isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg = { role: "user", content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await api.post("/api/chatbot", {
        messages: updatedMessages.filter((m) => m.role !== "system"),
        studentContext: studentData
          ? {
              name: studentData.name,
              studentId: studentData.studentId,
              department: studentData.department,
              college: studentData.college,
              year: studentData.year,
              semester: studentData.semester,
            }
          : null,
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.data.reply },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Oops! 😅 I'm having trouble connecting. Please try again in a moment!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Fresh start! ✨ What would you like to know?",
      },
    ]);
  };

  const fireQuickQuestion = (q) => {
    const userMsg = { role: "user", content: q };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);
    api
      .post("/api/chatbot", {
        messages: updatedMessages,
        studentContext: studentData
          ? {
              name: studentData.name,
              studentId: studentData.studentId,
              department: studentData.department,
              college: studentData.college,
              year: studentData.year,
              semester: studentData.semester,
            }
          : null,
      })
      .then((response) => {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: response.data.reply },
        ]);
      })
      .catch(() => {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry, please try again." },
        ]);
      })
      .finally(() => setIsLoading(false));
  };

  // Markdown-lite rendering
  const renderContent = (text) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\n)/g);
    return parts.map((part, i) => {
      if (part === "\n") return <br key={i} />;
      if (part.startsWith("**") && part.endsWith("**"))
        return (
          <strong key={i} className="font-semibold text-purple-800">
            {part.slice(2, -2)}
          </strong>
        );
      if (part.startsWith("`") && part.endsWith("`"))
        return (
          <code
            key={i}
            className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-xs font-mono"
          >
            {part.slice(1, -1)}
          </code>
        );
      return <span key={i}>{part}</span>;
    });
  };

  const quickQuestions = [
    { emoji: "📜", text: "How to upload certificates?" },
    { emoji: "📊", text: "Tips to improve CGPA" },
    { emoji: "💼", text: "Placement preparation tips" },
    { emoji: "💻", text: "Best LeetCode strategy?" },
  ];

  const studentName = studentData?.name?.split(" ")[0] || "Student";

  return (
    <>
      {/* Greeting bubble when not open */}
      {!isOpen && showGreeting && (
        <div className="fixed bottom-24 right-6 z-50 animate-fadeInUp">
          <div className="bg-white rounded-2xl rounded-br-md shadow-xl border border-purple-100 px-4 py-3 max-w-[220px]">
            <p className="text-sm text-gray-700">
              Hi {studentName}! 👋 Need help?
              <br />
              <span className="text-indigo-600 font-medium">Ask Nova!</span>
            </p>
          </div>
        </div>
      )}

      {/* Floating Chat Button — Mascot */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowGreeting(false);
        }}
        className="fixed bottom-6 right-6 z-50 group"
      >
        <div
          className={`relative w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 transform hover:scale-105 ${
            isOpen
              ? "bg-gradient-to-br from-rose-400 to-pink-500"
              : "bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500"
          }`}
          style={{ boxShadow: isOpen ? "0 4px 20px rgba(244,63,94,0.4)" : "0 4px 25px rgba(99,102,241,0.5)" }}
        >
          {isOpen ? (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <AIMascot size={44} />
          )}
          {/* Online pulse dot */}
          {!isOpen && (
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full animate-pulse" />
          )}
        </div>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-[5.5rem] right-6 z-50 w-[400px] h-[560px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          style={{
            animation: "chatSlideUp 0.35s cubic-bezier(0.16,1,0.3,1)",
            boxShadow: "0 10px 50px rgba(99,102,241,0.25), 0 2px 10px rgba(0,0,0,0.08)",
          }}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 px-5 py-4 flex-shrink-0 overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-3 -right-3 w-20 h-20 rounded-full bg-white/10" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                  <AIMascot size={32} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base tracking-tight">
                    Nova
                  </h3>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-white/60 text-[11px] font-medium tracking-wide uppercase">
                      AI Tech Assistant
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={clearChat}
                  className="text-white/50 hover:text-white hover:bg-white/10 transition-all p-2 rounded-xl"
                  title="Clear chat"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/50 hover:text-white hover:bg-white/10 transition-all p-2 rounded-xl"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ background: "linear-gradient(180deg, #F5F3FF 0%, #EEF2FF 40%, #FFFFFF 100%)" }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-end gap-2 ${
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
                {msg.role === "assistant" ? (
                  <MascotSmall />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm text-white text-[10px] font-bold">
                    {studentName[0]}
                  </div>
                )}

                {/* Message bubble */}
                <div
                  className={`max-w-[80%] px-4 py-3 text-[13px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl rounded-br-sm shadow-md"
                      : "bg-white text-gray-700 rounded-2xl rounded-bl-sm shadow-sm border border-purple-100/60"
                  }`}
                >
                  {renderContent(msg.content)}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex items-end gap-2">
                <MascotSmall />
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-purple-100/60">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 2 && !isLoading && (
            <div className="px-4 py-3 border-t border-purple-100/50 bg-gradient-to-r from-purple-50/50 to-indigo-50/50 flex-shrink-0">
              <p className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider mb-2">
                Try asking
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => fireQuickQuestion(q.text)}
                    className="text-[11px] bg-white border border-purple-100 text-gray-600 px-3 py-2 rounded-xl hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all text-left flex items-center gap-1.5 group"
                  >
                    <span className="text-sm group-hover:scale-110 transition-transform">
                      {q.emoji}
                    </span>
                    <span className="truncate">{q.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-gray-100 bg-white/80 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Nova anything..."
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 pr-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent focus:bg-white disabled:bg-gray-100 disabled:text-gray-400 transition-all placeholder:text-gray-400"
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-2.5 rounded-2xl hover:from-purple-600 hover:to-indigo-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0 shadow-md hover:shadow-lg active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
            <p className="text-[9px] text-gray-300 text-center mt-1.5 tracking-wide">
              Powered by Nova — Smart Student Hub
            </p>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.4s ease-out;
        }
      `}</style>
    </>
  );
};

export default ChatBot;
