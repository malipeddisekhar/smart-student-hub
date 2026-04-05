import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: "1. Introduction",
      content: "Smart Student Hub ('we', 'us', 'our', or 'Company') operates the Smart Student Hub website and application. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.",
      icon: "📋"
    },
    {
      title: "2. Information Collection and Use",
      content: "We collect several different types of information for various purposes to provide and improve our Service to you. This includes personal identification information (name, email address, phone number), educational data (grades, certificates, projects), OAuth data (Microsoft/Google accounts), and usage analytics.",
      icon: "📊"
    },
    {
      title: "3. Security of Data",
      content: "The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.",
      icon: "🔒"
    },
    {
      title: "4. Cookies and Tracking",
      content: "We use cookies and similar tracking technologies to track activity on our Service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.",
      icon: "🍪"
    },
    {
      title: "5. Third-Party Services",
      content: "Our Service may contain links to third-party sites that are not operated by us. This Privacy Policy does not apply to third-party websites, and we are not responsible for their privacy practices. We encourage you to review the privacy policies of any third-party services before accessing them.",
      icon: "🔗"
    },
    {
      title: "6. Children's Privacy",
      content: "Our Service does not address anyone under the age of 18. We do not knowingly collect personally identifiable information from children under 18. If we become aware that a child under 18 has provided us with personal data, we immediately delete such information and terminate the child's account.",
      icon: "👨‍👧"
    },
    {
      title: "7. Changes to This Privacy Policy",
      content: "We may update our Privacy Policy from time to time. You will be notified of any changes by posting the new Privacy Policy on this page and updating the 'effective date' at the top of this post.",
      icon: "📝"
    },
    {
      title: "8. Contact Us",
      content: "If you have any questions about this Privacy Policy, please contact us at privacy@smartstudenthub.edu or visit our Contact page for more information.",
      icon: "📧"
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
          <div className="inline-block mb-6 px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-full">
            <p className="text-blue-300 text-sm font-semibold">Privacy & Security</p>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Your privacy is important to us. Learn how Smart Student Hub protects and manages your data.
          </p>
          <p className="text-gray-500 mt-4 text-sm">Last updated: April 2026</p>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 sm:px-8 pb-20">
        <div className="grid gap-8">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:border-blue-500/30 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="flex items-start gap-4">
                  <span className="text-4xl flex-shrink-0">{section.icon}</span>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-3">{section.title}</h2>
                    <p className="text-gray-300 leading-relaxed text-lg">{section.content}</p>
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
          <p className="text-gray-400 mb-4">Questions about our Privacy Policy?</p>
          <button
            onClick={() => navigate("/contact")}
            className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Contact Us
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;
