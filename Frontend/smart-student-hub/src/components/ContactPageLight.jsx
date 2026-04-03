import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const ContactPageLight = () => {
  const navigate = useNavigate();
  const [selectedMember, setSelectedMember] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const teamMembers = [
    {
      id: 1,
      name: "Error Squad X",
      role: "Development Team Lead",
      description: "Leading the Smart Student Hub development with innovative solutions and cutting-edge technology.",
      icon: "👨‍💼",
      color: "blue",
      fullDescription: "Error Squad X is the primary development team leading the initiative. With expertise in full-stack development, system architecture, and innovative problem-solving, they drive the platform's vision forward.",
      expertise: ["Full-Stack Development", "System Architecture", "Project Leadership"],
      email: "lead@smartstudenthub.edu"
    },
    {
      id: 2,
      name: "Prasad Kattunga",
      role: "Backend Developer",
      description: "Expert in building scalable backend systems and database architecture for educational platforms.",
      icon: "💻",
      color: "green",
      fullDescription: "Prasad specializes in building robust backend systems and managing complex database architectures. His expertise ensures our platform runs smoothly and securely.",
      expertise: ["Express.js", "MongoDB", "API Design", "Database Optimization"],
      email: "prasad@smartstudenthub.edu"
    },
    {
      id: 3,
      name: "Sekhar",
      role: "Frontend Developer",
      description: "Crafting beautiful and responsive user interfaces with modern React and Tailwind CSS.",
      icon: "🎨",
      color: "purple",
      fullDescription: "Sekhar brings beautiful design and smooth interactions to life. With modern React practices and Tailwind CSS expertise, they create engaging user experiences.",
      expertise: ["React.js", "Tailwind CSS", "UI/UX Design", "Animation"],
      email: "sekhar@smartstudenthub.edu"
    }
  ];

  const contactChannels = [
    {
      title: "General Inquiries",
      description: "For product information and general questions",
      contact: "contact@smartstudenthub.edu",
      icon: "📧",
      color: "blue"
    },
    {
      title: "Technical Support",
      description: "For technical issues and platform support",
      contact: "+91 9876 543 210",
      icon: "🔧",
      color: "green"
    },
    {
      title: "Institutional Setup",
      description: "For college/university integration and setup",
      contact: "setup@smartstudenthub.edu",
      icon: "🏫",
      color: "purple"
    },
    {
      title: "Feedback & Suggestions",
      description: "Share your ideas to improve our platform",
      contact: "feedback@smartstudenthub.edu",
      icon: "💡",
      color: "orange"
    }
  ];

  const handleMemberClick = (member) => {
    setSelectedMember(member);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("Thank you for reaching out! We'll get back to you soon.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

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

      {/* Selected Member Top Display */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-50 via-white to-slate-50 border-b-2 border-blue-200 shadow-lg"
          >
            <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
              <div className="flex items-start justify-between gap-6">
                <div className="flex items-start gap-6">
                  <div className="text-6xl">{selectedMember.icon}</div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-slate-900">{selectedMember.name}</h2>
                    <p className="text-blue-600 font-semibold text-lg mb-2">{selectedMember.role}</p>
                    <p className="text-slate-700 mb-4">{selectedMember.fullDescription}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedMember.expertise.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <p className="text-slate-600 text-sm">📧 {selectedMember.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMember(null)}
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
      <div className={selectedMember ? "pt-80" : "pt-0"}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative pt-32 pb-20 px-6 sm:px-8 bg-gradient-to-b from-blue-50 to-white"
        >
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-block mb-6 px-4 py-2 bg-blue-100 border border-blue-200 rounded-full">
              <p className="text-blue-700 text-sm font-semibold">Get In Touch</p>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Contact Smart Student Hub
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Have questions or suggestions? We'd love to hear from you. Click on a team member to learn more!
            </p>
          </div>
        </motion.div>

        {/* Contact Channels */}
        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            {contactChannels.map((channel, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-white border-2 border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{channel.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{channel.title}</h3>
                <p className="text-slate-600 text-sm mb-4">{channel.description}</p>
                <p className="text-blue-700 font-semibold text-sm break-all">{channel.contact}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Teams Section - Clickable Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-5xl mx-auto px-6 sm:px-8 py-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Meet Our Team</h2>
            <p className="text-slate-600 text-lg">Click on any team member to learn more</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                onClick={() => handleMemberClick(member)}
                className="group relative bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 rounded-2xl p-8 hover:shadow-xl hover:border-blue-300 transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
              >
                <div className="relative">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">{member.icon}</div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{member.name}</h3>
                  <p className="text-blue-600 font-semibold mb-4">
                    {member.role}
                  </p>
                  <p className="text-slate-600 leading-relaxed mb-4">{member.description}</p>
                  
                  {/* Hover Indicator */}
                  <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Click to view details</span>
                    <span>→</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Error Squad X Highlight */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-16 relative bg-gradient-to-br from-blue-50 to-slate-50 border-2 border-blue-200 rounded-3xl p-12 text-center hover:shadow-lg transition-all duration-300"
          >
            <div className="relative">
              <p className="text-blue-700 text-sm font-semibold tracking-widest mb-4">🎯 DEVELOPMENT TEAM</p>
              <h3 className="text-4xl font-bold text-slate-900 mb-4">Error Squad X</h3>
              <p className="text-slate-700 max-w-2xl mx-auto text-lg">
                A passionate team of developers, designers, and innovators dedicated to revolutionizing student management systems. We combine cutting-edge technology with user-centric design to create an exceptional platform.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <a href="#" className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-300 font-medium">
                  GitHub
                </a>
                <a href="#" className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-300 font-medium">
                  LinkedIn
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Contact Form Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="max-w-3xl mx-auto px-6 sm:px-8 py-16"
        >
          <div className="bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 rounded-3xl p-8 md:p-12 shadow-lg">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Send us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-900 font-semibold mb-2">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-slate-900 font-semibold mb-2">Your Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-900 font-semibold mb-2">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="What is this about?"
                />
              </div>

              <div>
                <label className="block text-slate-900 font-semibold mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                  placeholder="Type your message here..."
                />
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-lg transition-all duration-300 shadow-lg"
              >
                Send Message
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="border-t border-slate-200 mt-20 py-12 px-6 bg-slate-50"
        >
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-slate-600 mb-6">© 2026 Smart Student Hub. All rights reserved.</p>
            <div className="flex justify-center gap-6">
              <button onClick={() => navigate("/privacy")} className="text-slate-600 hover:text-slate-900 transition-colors font-medium">Privacy Policy</button>
              <button onClick={() => navigate("/terms")} className="text-slate-600 hover:text-slate-900 transition-colors font-medium">Terms of Service</button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPageLight;
