import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const SystemFeaturesPage = () => {
  const navigate = useNavigate();

  const featureCards = [
    {
      value: "100%",
      label: "Digital Student Records",
      title: "Complete Digital Record Management",
      description:
        "All student records are organized in one secure system with quick retrieval, structured history, and clean workflows for institutions.",
      image:
        "https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg?auto=compress&cs=tinysrgb&w=1400",
      imageAlt: "Student records and documents on digital dashboard",
    },
    {
      value: "24/7",
      label: "Role-based Access",
      title: "Access Anytime with Role Control",
      description:
        "Students, teachers, and admins get dedicated access to exactly what they need with role-based permissions and always-on availability.",
      image:
        "https://images.pexels.com/photos/7681091/pexels-photo-7681091.jpeg?auto=compress&cs=tinysrgb&w=1400",
      imageAlt: "People working on laptops with always-on cloud access",
    },
    {
      value: "Secure",
      label: "Cloud-ready Storage",
      title: "Secure and Scalable Storage",
      description:
        "Academic data remains protected with modern security standards and cloud-ready architecture that scales with institution growth.",
      image:
        "https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg?auto=compress&cs=tinysrgb&w=1400",
      imageAlt: "Cloud infrastructure concept with secure systems",
    },
    {
      value: "NAAC",
      label: "Compliance Ready",
      title: "Compliance-ready Academic Operations",
      description:
        "Designed to support reporting, audit readiness, and evidence collection for compliance-focused higher education ecosystems.",
      image:
        "https://images.pexels.com/photos/5816297/pexels-photo-5816297.jpeg?auto=compress&cs=tinysrgb&w=1400",
      imageAlt: "Compliance and reporting documents in a professional setup",
    },
  ];

  return (
    <div className="min-h-screen bg-white py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10 md:mb-12">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-blue-600 mb-3">
              System Features
            </p>
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Platform Capabilities Overview
            </h1>
            <p className="mt-3 text-slate-600 max-w-2xl">
              A dedicated view of core system strengths with clear feature insights and related visual context.
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="self-start md:self-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200"
          >
            Back to Home
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {featureCards.map((item, idx) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38, delay: idx * 0.08 }}
              className="system-feature-card"
            >
              <div className="system-feature-media-wrap">
                <img
                  src={item.image}
                  alt={item.imageAlt}
                  className="system-feature-media"
                  loading="lazy"
                />
              </div>

              <div className="system-feature-meta">
                <div className="system-feature-pill-row">
                  <span className="system-feature-pill-value">{item.value}</span>
                  <span className="system-feature-pill-label">{item.label}</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 mt-4">{item.title}</h2>
                <p className="text-slate-600 mt-2 leading-relaxed">{item.description}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemFeaturesPage;
