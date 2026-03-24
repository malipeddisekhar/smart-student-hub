import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const ContactPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-semibold transition-colors"
          >
            Back to Home
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-8 md:p-10"
        >
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-blue-600 mb-3">
            Contact Us
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Smart Student Hub Support
          </h1>
          <p className="mt-4 text-slate-600 max-w-3xl leading-relaxed">
            Reach us for platform onboarding, institution setup, technical guidance,
            and support related to student, teacher, and administrative workflows.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">General Enquiry</h2>
            <p className="text-slate-600 text-sm mt-2">For product details and onboarding help.</p>
            <p className="text-blue-700 font-semibold mt-4 text-sm">support@smartstudenthub.edu</p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Institution Help</h2>
            <p className="text-slate-600 text-sm mt-2">For setup, integrations, and admin assistance.</p>
            <p className="text-blue-700 font-semibold mt-4 text-sm">+91 90000 00000</p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Working Hours</h2>
            <p className="text-slate-600 text-sm mt-2">Monday - Saturday</p>
            <p className="text-blue-700 font-semibold mt-4 text-sm">09:00 AM - 07:00 PM IST</p>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6 md:p-7">
          <h3 className="text-lg md:text-xl font-bold text-slate-900">About This Application</h3>
          <p className="text-slate-600 mt-2 leading-relaxed">
            Smart Student Hub is a centralized digital platform for managing student excellence,
            academic records, certificates, portfolio insights, and institutional workflows for
            students, teachers, and administrators.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 text-center">
          <p className="text-sm text-slate-500 mb-4">Administrative Access</p>
          <button
            onClick={() => navigate("/admin/login")}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
          >
            Admin Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
