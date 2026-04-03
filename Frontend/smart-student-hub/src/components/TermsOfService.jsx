import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const TermsOfService = () => {
  const navigate = useNavigate();

  const terms = [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing and using the Smart Student Hub platform, you accept and agree to be bound by the terms, conditions, and notices contained or referenced in this agreement. If you do not agree to abide by these Terms of Service, please do not use this service.",
      icon: "✅"
    },
    {
      title: "2. Use License",
      content: "Permission is granted to temporarily access the materials (information or content) on Smart Student Hub for personal, educational, non-commercial transitory viewing only. You agree that you will not use this site in any way that: (a) violates any applicable laws or regulations; (b) infringes upon intellectual property rights; (c) harasses or causes distress or inconvenience to others.",
      icon: "📜"
    },
    {
      title: "3. Disclaimer of Warranties",
      content: "The materials on Smart Student Hub's website are provided on an 'as is' basis without warranties of any kind, either express or implied. Smart Student Hub disclaims all warranties, including, but not limited to, warranties of merchantability, fitness for a particular purpose, and non-infringement.",
      icon: "⚠️"
    },
    {
      title: "4. Limitations of Liability",
      content: "In no event shall Smart Student Hub or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Smart Student Hub.",
      icon: "🚫"
    },
    {
      title: "5. Accuracy of Materials",
      content: "The materials appearing on Smart Student Hub's website could include technical, typographical, or photographic errors. Smart Student Hub does not warrant that any of the materials on its website are accurate, complete, or current. Smart Student Hub may make changes to the materials contained on its website at any time without notice.",
      icon: "🔍"
    },
    {
      title: "6. Materials Copyright",
      content: "The materials on Smart Student Hub's website are protected by copyright. Except as otherwise provided in these conditions and terms, none of the materials on Smart Student Hub's website may be copied, reproduced, republished, uploaded, posted, transmitted, or distributed in any way without the prior written permission of Smart Student Hub.",
      icon: "©️"
    },
    {
      title: "7. User Accounts and Passwords",
      content: "You are responsible for maintaining the confidentiality of your account information and password. You agree to accept responsibility for all activities that occur under your account. You must notify Smart Student Hub immediately of any unauthorized use of your account. Smart Student Hub is not liable for any loss or damage arising from unauthorized use of your account.",
      icon: "🔐"
    },
    {
      title: "8. User-Generated Content",
      content: "You retain all rights to any content you submit to Smart Student Hub. By submitting content, you grant Smart Student Hub a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute such content. You agree that your content will not contain any content that is unlawful, offensive, abusive, or violates the rights of any third party.",
      icon: "📄"
    },
    {
      title: "9. Termination of Use",
      content: "Smart Student Hub may terminate or suspend your account and access to its services without prior notice or liability if you breach any terms or conditions. Upon termination, your right to use the services will immediately cease.",
      icon: "🛑"
    },
    {
      title: "10. Links to Third-Party Sites",
      content: "Smart Student Hub has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Smart Student Hub of the site. Use of any such linked website is at the user's own risk.",
      icon: "🔗"
    },
    {
      title: "11. Modifications to Terms",
      content: "Smart Student Hub may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.",
      icon: "📝"
    },
    {
      title: "12. Governing Law",
      content: "These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in that location.",
      icon: "⚖️"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Back Button */}
      <div className="fixed top-6 left-6 z-40">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
        >
          ← Back to Home
        </button>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative pt-32 pb-20 px-6 sm:px-8"
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-full">
            <p className="text-purple-300 text-sm font-semibold">Legal Agreement</p>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Please read these terms carefully before using Smart Student Hub. Your use of our platform constitutes acceptance of these terms.
          </p>
          <p className="text-gray-500 mt-4 text-sm">Last updated: April 2026</p>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 sm:px-8 pb-20">
        <div className="grid gap-8">
          {terms.map((term, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:border-purple-500/30 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="flex items-start gap-4">
                  <span className="text-4xl flex-shrink-0">{term.icon}</span>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-3">{term.title}</h2>
                    <p className="text-gray-300 leading-relaxed text-lg">{term.content}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="border-t border-white/10 mt-20 py-12 px-6"
      >
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-400 mb-4">Have questions about our Terms of Service?</p>
          <button
            onClick={() => navigate("/contact")}
            className="inline-block px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Get in Touch
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default TermsOfService;
