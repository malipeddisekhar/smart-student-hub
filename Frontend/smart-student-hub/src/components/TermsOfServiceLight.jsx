import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const TermsOfServiceLight = () => {
  const navigate = useNavigate();
  const [selectedTerm, setSelectedTerm] = useState(null);

  const handleTermClick = (term) => {
    setSelectedTerm(term);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const terms = [
    {
      id: 1,
      title: "Acceptance of Terms",
      icon: "✅",
      content:
        "By accessing Smart Student Hub, you agree to comply with these Terms of Service. If you do not agree with any part of these terms, please discontinue use immediately.",
      details: "These terms constitute a binding legal agreement between you and Smart Student Hub. By accessing, using, or attempting to use the platform, you signify your acceptance of these terms. If you do not agree to be bound by these terms, you should immediately stop using the platform and contact us for assistance."
    },
    {
      id: 2,
      title: "License Grant",
      icon: "📜",
      content:
        "We grant you a personal, non-commercial license to access and use the platform for educational purposes only. You may not reproduce, distribute, or transmit content without permission.",
      details: "Personal License: Non-transferable, revocable license for personal educational use only. Restrictions: No commercial use, no redistribution, no modification of content, no reverse engineering. Termination: We may terminate this license at any time for violation of these terms."
    },
    {
      id: 3,
      title: "Warranties & Disclaimers",
      icon: "❗",
      content:
        "The platform is provided 'as is' without warranties. We do not guarantee uninterrupted service, accuracy of information, or fitness for a particular purpose.",
      details: "AS-IS Disclaimer: The platform is provided without any warranties. NO IMPLIED WARRANTIES of merchantability or fitness for a particular purpose. We do not warrant that the platform will be uninterrupted, error-free, or secure. Use is at your own risk."
    },
    {
      id: 4,
      title: "Limitation of Liability",
      icon: "🛡️",
      content:
        "Smart Student Hub shall not be liable for indirect, incidental, or consequential damages arising from your use of the platform, even if we've been advised of potential damages.",
      details: "Liability Cap: In no event shall our total liability exceed the amount you paid (if any). Excluded Damages: We are not liable for lost profits, data loss, or indirect damages. Even if we're aware of the possibility of such damages, we assume no liability."
    },
    {
      id: 5,
      title: "Accuracy of Information",
      icon: "📝",
      content:
        "You are responsible for maintaining accurate information in your profile. Providing false information may result in account suspension or termination.",
      details: "Your Responsibility: You must provide accurate information. You are responsible for keeping your profile current. Consequences: False information may lead to suspension or permanent account termination. We reserve the right to verify information at any time."
    },
    {
      id: 6,
      title: "Intellectual Property",
      icon: "©️",
      content:
        "All content, including text, graphics, and logos, is the property of Smart Student Hub or its licensors. Unauthorized use is prohibited.",
      details: "Copyright: All platform content is protected by copyright law. Trademarks: All logos and trademarks are the property of Smart Student Hub. License: You may use content only as permitted by these terms. Infringement: Unauthorized use may result in legal action."
    },
    {
      id: 7,
      title: "User Accounts",
      icon: "👤",
      content:
        "You are responsible for maintaining confidentiality of your account credentials and all activities that occur under your account. Notify us immediately of unauthorized access.",
      details: "Your Responsibility: Keep credentials confidential. Account Security: You are liable for activities under your account. Notification: Report unauthorized access immediately to security@smartstudenthub.edu. Two-Factor Authentication: Use 2FA for enhanced security."
    },
    {
      id: 8,
      title: "User-Generated Content",
      icon: "🎨",
      content:
        "You retain rights to content you create but grant Smart Student Hub license to use, modify, and distribute it within the platform for educational and improvement purposes.",
      details: "Your Rights: You retain ownership of content you create. Our License: You grant us a perpetual license to use, display, and improve content within the platform. No Compensation: We do not pay for user-generated content. Removal: You can request content removal anytime."
    },
    {
      id: 9,
      title: "Termination",
      icon: "🚪",
      content:
        "We reserve the right to suspend or terminate your account if you violate these terms or engage in inappropriate behavior. Termination is effective immediately.",
      details: "Grounds: Violation of terms, inappropriate behavior, harassment. Process: Account suspension with notice, then termination if issues persist. Effective: Immediately upon notice. Data: Limited data recovery available post-termination. Appeal: Contact support within 30 days."
    },
    {
      id: 10,
      title: "External Links",
      icon: "🔗",
      content:
        "Our platform may contain links to external websites. We are not responsible for the content, accuracy, or practices of these third-party sites.",
      details: "Disclaimer: We do not endorse external sites. Not Liable: We are not responsible for external content or practices. Verify: Always verify information from external sources. Report: Notify us of broken or inappropriate links."
    },
    {
      id: 11,
      title: "Modifications to Terms",
      icon: "🔄",
      content:
        "We may modify these terms at any time. Continued use of the platform constitutes acceptance of updated terms. Check periodically for changes.",
      details: "Changes: May be made at any time without notice. Acceptance: Continued use = acceptance of new terms. Notification: We may notify you of major changes. Old Terms: Previous terms remain if you stop using the platform."
    },
    {
      id: 12,
      title: "Governing Law",
      icon: "⚖️",
      content:
        "These terms are governed by applicable local laws. Any disputes shall be resolved through arbitration or local courts as permitted by law.",
      details: "Jurisdiction: Governed by applicable local laws. Dispute Resolution: Binding arbitration or local courts. Venue: Disputes handled in appropriate jurisdiction. Contact: legal@smartstudenthub.edu for legal inquiries."
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="fixed top-6 left-6 z-40">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-all duration-300"
        >
          ← Back to Home
        </button>
      </div>

      {/* Selected Term Top Display */}
      <AnimatePresence>
        {selectedTerm && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-50 via-white to-slate-50 border-b-2 border-purple-200 shadow-lg"
          >
            <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-start gap-6 flex-1">
                  <div className="text-5xl flex-shrink-0">{selectedTerm.icon}</div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">{selectedTerm.title}</h2>
                    <p className="text-slate-700 leading-relaxed">{selectedTerm.details}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTerm(null)}
                  className="flex-shrink-0 text-3xl text-slate-400 hover:text-slate-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={selectedTerm ? "pt-80" : "pt-0"}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative pt-32 pb-20 px-6 sm:px-8 bg-gradient-to-b from-purple-50 to-white"
        >
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-block mb-6 px-4 py-2 bg-purple-100 border border-purple-200 rounded-full">
              <p className="text-purple-700 text-sm font-semibold">Legal</p>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Terms of Service
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Please read these terms carefully. Click on any term to learn more.
            </p>
          </div>
        </motion.div>

        {/* Terms Grid - Clickable */}
        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid md:grid-cols-2 gap-6 mb-16"
          >
            {terms.map((term, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.06 }}
                onClick={() => handleTermClick(term)}
                className="group bg-white border-2 border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:border-purple-300 transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{term.icon}</div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {term.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm mb-3">
                    {term.content}
                  </p>
                  <div className="flex items-center gap-2 text-purple-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Click to view details</span>
                    <span>→</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Agreement Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="max-w-5xl mx-auto px-6 sm:px-8 py-12"
        >
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-8 md:p-10 hover:shadow-lg transition-all duration-300">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Agreement Confirmation
            </h3>
            <p className="text-slate-700 mb-4 leading-relaxed">
              By using Smart Student Hub, you acknowledge that you have read, understood, and agree to be bound by all terms and conditions outlined in this agreement. Your continued use of the platform constitutes your acceptance of these terms.
            </p>
            <p className="text-slate-600 text-sm">
              Last updated: April 2026. All terms are subject to change without notice. We recommend reviewing this page periodically.
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="border-t border-slate-200 mt-20 py-12 px-6 bg-slate-50"
        >
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-slate-600 mb-6">
              © 2026 Smart Student Hub. All rights reserved.
            </p>
            <div className="flex justify-center gap-6">
              <button
                onClick={() => navigate("/privacy")}
                className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
              >
                Contact
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfServiceLight;
