import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const ContactPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const teamMembers = [
    {
      name: "Error Squad X",
      role: "Development Team Lead",
      description: "Leading the Smart Student Hub development with innovative solutions and cutting-edge technology.",
      icon: "👨‍💼",
      color: "from-blue-500 to-cyan-500"
    },
    {
      name: "Prasad Kattunga",
      role: "Backend Developer",
      description: "Expert in building scalable backend systems and database architecture for educational platforms.",
      icon: "💻",
      color: "from-green-500 to-emerald-500"
    },
    {
      name: "Sekhar",
      role: "Frontend Developer",
      description: "Crafting beautiful and responsive user interfaces with modern React and Tailwind CSS.",
      icon: "🎨",
      color: "from-purple-500 to-pink-500"
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
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-full">
            <p className="text-red-300 text-sm font-semibold">Get In Touch</p>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Contact Smart Student Hub
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Have questions or suggestions? We'd love to hear from you. Connect with our team today!
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
              className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all duration-300"
            >
              <div className="text-4xl mb-4">{channel.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{channel.title}</h3>
              <p className="text-gray-400 text-sm mb-4">{channel.description}</p>
              <p className="text-white font-semibold text-sm break-all">{channel.contact}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Teams Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="max-w-5xl mx-auto px-6 sm:px-8 py-16"
      >
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Meet Our Team</h2>
          <p className="text-gray-300 text-lg">The talented minds behind Smart Student Hub</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:border-white/30 transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${member.color} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              <div className="relative">
                <div className="text-6xl mb-4">{member.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-2">{member.name}</h3>
                <p className={`text-transparent bg-clip-text bg-gradient-to-r ${member.color} font-semibold mb-4`}>
                  {member.role}
                </p>
                <p className="text-gray-300 leading-relaxed">{member.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Special Highlight for Error Squad X */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 relative bg-gradient-to-br from-red-500/20 via-orange-500/20 to-yellow-500/20 backdrop-blur-md border border-red-500/30 rounded-3xl p-12 text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent rounded-3xl" />
          <div className="relative">
            <p className="text-yellow-300 text-sm font-semibold tracking-widest mb-4">🎯 DEVELOPMENT TEAM</p>
            <h3 className="text-4xl font-bold text-white mb-4">Error Squad X</h3>
            <p className="text-gray-300 max-w-2xl mx-auto text-lg">
              A passionate team of developers, designers, and innovators dedicated to revolutionizing student management systems. We combine cutting-edge technology with user-centric design to create an exceptional platform for students, teachers, and administrators.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <a href="#" className="px-6 py-2 bg-red-500/50 hover:bg-red-500/70 border border-red-500/50 text-white rounded-lg transition-all duration-300">
                GitHub
              </a>
              <a href="#" className="px-6 py-2 bg-red-500/50 hover:bg-red-500/70 border border-red-500/50 text-white rounded-lg transition-all duration-300">
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
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Send us a Message</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white font-semibold mb-2">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Your Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder="What is this about?"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="6"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                placeholder="Type your message here..."
              />
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold rounded-lg transition-all duration-300 shadow-lg"
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
        className="border-t border-white/10 mt-20 py-12 px-6"
      >
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-400 mb-6">© 2026 Smart Student Hub. All rights reserved.</p>
          <div className="flex justify-center gap-6">
            <button onClick={() => navigate("/privacy")} className="text-gray-400 hover:text-white transition-colors">Privacy Policy</button>
            <button onClick={() => navigate("/terms")} className="text-gray-400 hover:text-white transition-colors">Terms of Service</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ContactPage;
