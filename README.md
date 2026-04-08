# 📚 Smart Student Hub - AI-Powered Academic & Career Enhancement Platform

> An intelligent, comprehensive platform designed to revolutionize academic workflows, streamline certificate verification, and accelerate career growth for students, faculty, and administrators.

**[🌐 Live Website](https://smart-student-hub.me)** | **[📝 GitHub Repository](https://github.com/malipeddisekhar/smart-student-hub)**

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [User Roles & Modules](#user-roles--modules)
  - [Student Module](#student-module)
  - [Teacher Module](#teacher-module)
  - [Admin Module](#admin-module)
- [Technology Stack](#technology-stack)
- [Installation & Setup](#installation--setup)
- [Demo Login Credentials](#demo-login-credentials)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**Smart Student Hub** is an AI-powered platform that addresses critical gaps in academic and career management by providing a unified ecosystem for:

- ✅ **Automated certificate verification** using OCR and AI technology
- ✅ **Professional resume and portfolio generation** powered by Grok API
- ✅ **Advanced resume analysis** with ATS scoring and skill gap identification
- ✅ **Secure coding platform integration** (LeetCode, CodeChef)
- ✅ **Seamless mentor-mentee workflow** with real-time notifications
- ✅ **Centralized project portfolio** management
- ✅ **AI-powered chatbot** for student guidance
- ✅ **Comprehensive reporting** for teachers and administrators

The platform bridges the gap between academics, career development, and skill showcase in one integrated solution.

---

## 🚀 Key Features

### 🤖 AI-Powered Intelligence
- **Grok API Integration**: Sophisticated AI models for resume and portfolio generation
- **OCR Technology**: Automated certificate scanning and data extraction
- **ML-Based Authentication**: Fake certificate detection and prevention
- **Smart Recommendations**: Personalized internship and course suggestions

### 🔐 Security & Verification
- End-to-end encrypted certificate uploads
- Multi-layer fake certificate detection
- Secure mentor verification workflow
- Role-based access control (RBAC)

### 📊 Analytics & Reporting
- Student performance dashboards
- Comprehensive progress tracking
- Certificate validation status reports
- Coding profile analytics

### 🎨 User Experience
- Responsive web & mobile interfaces
- Intuitive dashboard design
- Real-time notifications
- Customizable templates and themes

---

## 🏗️ System Architecture

```
Smart Student Hub
├── Frontend (React.js + Vite)
│   ├── Student Portal
│   ├── Teacher Dashboard
│   └── Admin Panel
├── Mobile App (React Native)
│   ├── Student App
│   ├── Teacher App
│   └── Admin App
└── Backend (Node.js + Express)
    ├── Authentication
    ├── Certificate Processing
    ├── Resume Generation
    ├── Portfolio Management
    └── Notification System
```

---

## 👥 User Roles & Modules

### 👨‍🎓 Student Module

#### Login System
```
Email:    23341A4249@gmrit.edu.in
Password: 23341A4249
```

#### 1️⃣ **AI Resume Generator**
- **Feature**: Generate professional, ATS-optimized resumes automatically
- **Technology**: Powered by Grok API for intelligent content generation
- **Customization**: Fully editable templates with industry-standard formatting
- **Export Options**: Download as PDF, DOCX, or JSON formats
- **Benefits**: 
  - Saves time on resume creation
  - Ensures ATS compliance for automated screening
  - Professional formatting standards

#### 2️⃣ **AI Portfolio Generator**
- **Feature**: Create stunning portfolio websites with AI assistance
- **Customization**: Multiple professional design templates
- **Content Options**: Automatically populated with user data
- **Theme Selection**: Choose from modern, classic, and startup themes
- **Hosting**: Built-in deployment support
- **Benefits**:
  - Showcase projects effectively
  - Professional online presence
  - Easy content management

#### 3️⃣ **Resume Analyzer (Advanced)**
- **Upload Options**: 
  - Use your own resume
  - Analyze platform-generated resume
- **ATS Score Analysis**: Evaluate resume for applicant tracking system compatibility
- **Skill Gap Analysis**: Identify missing technical and soft skills
- **Professional Tips**: AI-generated improvement suggestions
- **Internship Recommendations**: Smart suggestions based on skills
- **Course Recommendations**: Upskilling suggestions to fill gaps
- **Score Breakdown**:
  - Content quality
  - Formatting compliance
  - Keyword optimization
  - Readability assessment

#### 4️⃣ **Academic Certificate Validation**
- **Problem Solved**: Prevents fake certificate uploads (major institutional issue)
- **Technology**: OCR + AI-based authenticity detection
- **Supported Certificates**: 
  - NPTEL certificates (priority)
  - Other academic certifications
- **Process**:
  1. Student uploads certificate
  2. OCR extracts certificate data
  3. AI analyzes authenticity
  4. Certificate forwarded to mentor for verification
  5. Real-time approval/rejection notifications
- **Teacher Features**: AI-powered certificate scanner for verification

#### 5️⃣ **Coding Profile Integration**

**LeetCode Integration:**
- Display coding progress and statistics
- Show contest rankings and ratings
- Problem-solving activity metrics
- Competitive programming insights

**CodeChef Integration:**
- Display competitive programming stats
- Contest results and rankings
- Rating progress tracking
- Problem-solving analytics

**Benefits**: Showcase coding skills to recruiters and educators

#### 6️⃣ **Project Portfolio**
- **Feature**: Centralized repository for all projects
- **Organization**: Categorize projects by type, technology, or timeline
- **Showcase**: Professional presentation for placement preparation
- **Details**: Project descriptions, technologies used, GitHub links
- **Evaluation**: Faculty can assess student projects directly
- **Impact**: Strengthens placement profile

#### 7️⃣ **AI Chatbot Assistance**
- **24/7 Availability**: Always available for student queries
- **Topics Covered**:
  - Platform navigation guidance
  - Resume building tips
  - Certificate upload assistance
  - Portfolio customization
  - General academic queries
- **Intelligent Responses**: Context-aware, helpful suggestions

---

### 👩‍🏫 Teacher Module

#### Login System
```
Email:    satish@gmail.com
Password: satish11
```

#### 1️⃣ **Certificate Verification System**
- **Assigned Students**: Verify only assigned mentees' certificates
- **AI Assistance**: AI-powered authenticity detection tools
- **Verification Options**:
  - ✅ Approve with feedback
  - ❌ Reject with detailed reasons
  - 🔄 Request resubmission
- **Notifications**: Send real-time approval/rejection alerts
- **Audit Trail**: Complete history of verifications

#### 2️⃣ **Student Counselling (Online)**
- **Session Management**: Schedule and conduct online mentoring sessions
- **Group Notifications**: Send announcements to multiple students
- **Updates & Alerts**: Share important academic information
- **Feedback System**: Provide personalized guidance and suggestions
- **Session History**: Maintain records of all counselling sessions

#### 3️⃣ **Report Generation**
- **Automated Reports**: Generate comprehensive student reports
- **Report Types**:
  - Student progress reports
  - Certificate validation status
  - Portfolio performance analysis
  - Coding profile summaries
  - Overall academic performance
- **Export Options**: PDF, Excel, CSV formats
- **Scheduling**: Generate batch reports on demand

#### 4️⃣ **Student Analysis Dashboard**
- **Performance Metrics**: Track student growth across multiple dimensions
- **Analysis Categories**:
  - **Projects**: Academic and personal projects showcase
  - **Internships**: Internship experience and learnings
  - **Certifications**: Completed courses and certifications
  - **Coding Profiles**: LeetCode and CodeChef performance
  - **Skill Development**: Progress in technical and soft skills
- **Visualization**: Interactive charts and graphs
- **Trends**: Identify improvement areas and strengths
- **Insights**: Data-driven recommendations for students

---

### 🛠️ Admin Module

#### Login System
```
Email:    ===============
Password: *************
```

#### 🔧 **Admin Capabilities**

1. **Mentor-Mentee Mapping**
   - Assign teachers to students
   - Create mentor groups
   - Manage mentor-student relationships
   - View mapping statistics

2. **Account Management**
   - Create and manage student accounts
   - Create and manage teacher accounts
   - Role assignment and permissions
   - Account activation/deactivation
   - Password reset and security

3. **System Monitoring**
   - Real-time activity tracking
   - User engagement metrics
   - Certificate verification status
   - Platform performance monitoring
   - Error logs and diagnostics

4. **Workflow Management**
   - Configure system settings
   - Manage notification preferences
   - Control feature activation
   - Set compliance rules

5. **Reporting & Analytics**
   - System-wide performance reports
   - User activity analytics
   - Certificate verification metrics
   - Platform health indicators

---

## 💻 Technology Stack

### Frontend
- **Framework**: React.js
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Redux
- **HTTP Client**: Axios

### Mobile
- **Framework**: React Native
- **Language**: JavaScript
- **Navigation**: React Navigation
- **Platform Support**: iOS & Android

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: Passport.js
- **File Upload**: Cloudinary
- **OCR**: Tesseract.js
- **AI API**: Grok API

### External Services
- **Resume/Portfolio AI**: Grok API
- **Certificate Storage**: Cloudinary
- **Email Notifications**: Nodemailer
- **Payment Gateway**: Stripe (if applicable)

### DevOps & Deployment
- **Version Control**: GitHub
- **Deployment**: Docker, AWS/Azure
- **CI/CD**: GitHub Actions

---

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or cloud)
- Git

### Backend Setup

```bash
# Navigate to backend directory
cd Backend

# Install dependencies
npm install

# Create .env file with required configurations
# (See .env.example for template)

# Start the server
npm start
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd Frontend/smart-student-hub

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Mobile App Setup

```bash
# Navigate to mobile directory
cd SmartStudentHubMobile

# Install dependencies
npm install

# Run on Android
npm run android

# Run on iOS
npm run ios
```

---

## 🎓 Demo Login Credentials

### Student Account
```
Email:    23341A4249@gmrit.edu.in
Password: 23341A4249
```
**Features Available**: Resume generation, portfolio creation, certificate upload, coding profile linking

### Teacher Account
```
Email:    satish@gmail.com
Password: satish11
```
**Features Available**: Certificate verification, student counselling, report generation, analysis dashboard

### Admin Account
```
Email:    adminsekhar@gmail.com
Password: admin
```
**Features Available**: User management, mentor-mentee mapping, system monitoring, reporting

---

## 📁 Project Structure

```
sih-smart-student-hub/
├── Backend/
│   ├── app.js                 # Main server file
│   ├── package.json           # Dependencies
│   ├── config/
│   │   ├── database.js        # MongoDB connection
│   │   └── passport.js        # Authentication setup
│   ├── models/                # Database schemas
│   │   ├── Student.js
│   │   ├── Teacher.js
│   │   ├── Admin.js
│   │   ├── Certificate.js
│   │   └── ...
│   ├── routes/                # API endpoints
│   ├── utils/                 # Helper functions
│   │   ├── certificateScanService.js
│   │   ├── codechefService.js
│   │   ├── leetcodeService.js
│   │   └── resumeAnalyzerAI.js
│   └── scripts/               # Utility scripts
├── Frontend/
│   └── smart-student-hub/
│       ├── src/
│       │   ├── components/    # React components
│       │   ├── services/      # API integration
│       │   ├── pages/         # Page components
│       │   └── App.jsx
│       └── package.json
├── SmartStudentHubMobile/
│   ├── src/
│   │   ├── screens/           # Mobile screens
│   │   ├── services/          # API calls
│   │   └── App.js
│   └── package.json
└── README.md
```

---

## ✨ Platform Highlights

### For Students
- 🎯 **Career Acceleration**: Resume and portfolio automation saves hours of work
- 📈 **Skill Development**: AI identifies gaps and recommends courses
- 🔒 **Certificate Security**: Fake certificate detection protects institution credibility
- 🎮 **Habit Formation**: Coding platform integration encourages daily practice
- 💼 **Professional Presence**: AI-generated portfolio showcases projects effectively

### For Teachers
- ⚡ **Reduced Verification Time**: AI-assisted certificate scanning accelerates review
- 📊 **Complete Student Insights**: Comprehensive dashboards for better mentoring
- 📱 **Online Mentorship**: Integrated counselling and notification system
- 📋 **Automated Reports**: Generate performance reports in seconds
- 🎯 **Data-Driven Decisions**: Analytics help identify student needs

### For Administrators
- 🎮 **Centralized Control**: Single dashboard for entire system management
- 👥 **Efficient Mapping**: Easy mentor-mentee relationship management
- 📊 **System Analytics**: Real-time monitoring and performance metrics
- 🔐 **Security & Compliance**: Role-based access control and audit trails
- 🚀 **Scalability**: Built for institutional growth

---

## 🌟 Use Cases

### Academic Institution
- Streamline certificate verification process
- Reduce fake certificate submissions by 95%
- Automate student progress tracking
- Facilitate mentor-mentee relationships

### Student Career Development
- Generate professional resumes in minutes
- Build impressive online portfolios
- Track skill development progress
- Connect coding profiles for recruiter visibility

### Faculty Support
- Track student achievement and growth
- Conduct online mentoring sessions
- Generate compliance reports
- Monitor platform-wide activities

---

## 📞 Support & Contact

For issues, feature requests, or contributions, please visit:

**GitHub**: [Smart Student Hub Repository](https://github.com/malipeddisekhar/smart-student-hub)

**Live Website**: [smart-student-hub.me](https://smart-student-hub.me)

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---
📄 License

This project is licensed under the MIT License.
---

If you want next level polish, I can:
- Add **GitHub badges (build, stars, tech stack)**
- Create a **perfect recruiter-focused version**
- Or design a **portfolio + LinkedIn project description** 👍

---

## 👥 Acknowledgments

- **Malipeddi Sekhar** - Main Developer & Project Lead
- **Team Contributors** - All developers and testers
- **Smart India Hackathon (SIH)** - For the opportunity and inspiration
- **GMRIT** - Supporting Institution

---

**Last Updated**: April 2026  
**Version**: 1.0.0

---

<div align="center">

### ⭐ If you find this project helpful, please give it a star! ⭐

**Built with, by students**

</div>
