import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const PrivacyPolicyLight = () => {
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState(null);

  const handleSectionClick = (section) => {
    setSelectedSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sections = [
    {
      id: 1,
      title: "Introduction",
      icon: "📋",
      content:
        "Smart Student Hub is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our platform.",
      details: "We understand that privacy is fundamental to building trust with our users. Our platform handles sensitive student data including academic records, personal information, and learning progress. We take every precaution to ensure this data is protected with industry-leading security measures."
    },
    {
      id: 2,
      title: "Information We Collect",
      icon: "📊",
      content:
        "We collect information you provide directly such as name, email, and academic details. We also collect usage data, device information, and cookies to improve your experience.",
      details: "Direct Information: Name, email, phone, educational background, academic records. Indirect Information: Browser type, device information, IP address, pages visited, time spent on site. Automatically Collected: Cookies, web beacons, and analytics data to understand user behavior and enhance functionality."
    },
    {
      id: 3,
      title: "Security Measures",
      icon: "🔒",
      content:
        "Your data is protected using industry-standard encryption and secure servers. We implement multiple layers of security to ensure your information remains confidential and safe.",
      details: "We employ 256-bit SSL encryption for all data transmission. Passwords are hashed using industry-standard algorithms. Regular security audits and penetration testing are conducted. Data is stored on secure, redundant servers with automatic backups. Access is restricted to authorized personnel only."
    },
    {
      id: 4,
      title: "Cookies & Tracking",
      icon: "🍪",
      content:
        "We use cookies to remember your preferences and enhance functionality. You can control cookie settings in your browser. Analytics may track your interactions to improve our services.",
      details: "Essential Cookies: Required for platform functionality and security. Preference Cookies: Remember your settings and choices. Analytics Cookies: Google Analytics to understand usage patterns. You can disable cookies in your browser settings, but this may limit functionality."
    },
    {
      id: 5,
      title: "Third-Party Services",
      icon: "🔗",
      content:
        "We may share information with trusted third parties like OAuth providers and analytics services. All third parties comply with strict data protection standards.",
      details: "We use Microsoft OAuth for secure authentication. Google Analytics for platform improvements. Cloudinary for secure file storage. All third parties have signed Data Processing Agreements and comply with GDPR/CCPA regulations. We never sell your data to marketers or advertisers."
    },
    {
      id: 6,
      title: "Children's Privacy",
      icon: "👨‍👧‍👦",
      content:
        "Our platform is designed for students, but we comply with COPPA regulations. Parents can request removal of their child's data at any time.",
      details: "We comply with Children's Online Privacy Protection Act (COPPA) for users under 13. Parents/guardians have the right to request access, modify, or delete their child's information. We do not knowingly collect personal information from children under 13 without parental consent."
    },
    {
      id: 7,
      title: "Your Rights",
      icon: "⚖️",
      content:
        "You have the right to access, modify, or delete your personal data. Contact us to exercise your rights. We respond to requests within 30 days.",
      details: "Right to Access: View all data we hold about you. Right to Rectification: Correct inaccurate information. Right to Erasure: Request deletion of your data (subject to legal obligations). Right to Portability: Export your data in standard format. Right to Object: Opt-out of data processing. All requests are processed within 30 days."
    },
    {
      id: 8,
      title: "Contact Us",
      icon: "📞",
      content:
        "For privacy concerns, email us at privacy@smartstudenthub.edu or contact our Data Protection Officer. We're here to help.",
      details: "Privacy Inquiries: privacy@smartstudenthub.edu | Data Protection Officer: dpo@smartstudenthub.edu | General Support: support@smartstudenthub.edu | Phone: +91 9876 543 210 | Response Time: Within 2 business days"
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

      {/* Selected Section Top Display */}
      <AnimatePresence>
        {selectedSection && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-50 via-white to-slate-50 border-b-2 border-blue-200 shadow-lg"
          >
            <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-start gap-6 flex-1">
                  <div className="text-5xl flex-shrink-0">{selectedSection.icon}</div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">{selectedSection.title}</h2>
                    <p className="text-slate-700 mb-4 leading-relaxed">{selectedSection.details}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSection(null)}
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
      <div className={selectedSection ? "pt-80" : "pt-0"}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative pt-32 pb-20 px-6 sm:px-8 bg-gradient-to-b from-blue-50 to-white"
        >
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-block mb-6 px-4 py-2 bg-blue-100 border border-blue-200 rounded-full">
              <p className="text-blue-700 text-sm font-semibold">Privacy</p>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Privacy Policy
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Your privacy is important to us. Learn how we collect, use, and protect your data. Click on any section to learn more.
            </p>
          </div>
        </motion.div>

        {/* Content Sections - Clickable */}
        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8 mb-16"
          >
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.08 }}
                onClick={() => handleSectionClick(section)}
                className="group bg-white border-2 border-slate-200 rounded-2xl p-8 hover:shadow-xl hover:border-blue-300 transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">{section.icon}</div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">
                      {section.title}
                    </h2>
                    <p className="text-slate-600 leading-relaxed text-lg mb-3">
                      {section.content}
                    </p>
                    <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span>Click to view details</span>
                      <span>→</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="max-w-5xl mx-auto px-6 sm:px-8 py-12"
        >
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 md:p-10">
            <div className="flex items-start gap-4">
              <div className="text-3xl flex-shrink-0">⚠️</div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Important Notice
                </h3>
                <p className="text-slate-700">
                  This Privacy Policy is subject to change without notice. We recommend reviewing this page periodically to stay informed about how we protect your information. Last updated: April 2026.
                </p>
              </div>
            </div>
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
                onClick={() => navigate("/terms")}
                className="text-slate-600 hover:text-slate-900 transition-colors font-medium"
              >
                Terms of Service
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

export default PrivacyPolicyLight;
