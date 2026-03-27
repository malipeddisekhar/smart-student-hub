# Smart Student Hub (Mini Project)

Smart Student Hub is a full-stack mini project for Higher Education Institutions (HEIs). It provides a centralized platform to manage student activity records, academic proofs, coding profile growth, and communication between students, teachers, and admins.

This project combines a web application, backend API, and a React Native mobile app to digitize records that are usually scattered across departments or paperwork.

## Live Project Links

The project also has a live deployment setup for quick evaluation and demo use.

- Live Application: `https://sih-smart-student-hub-2.onrender.com`
- Live API Health Check: `https://sih-smart-student-hub-2.onrender.com/api/test`

### How to test the live project
1. Open the live application link.
2. Use Student/Teacher/Admin login modules from the UI.
3. Verify major flows: profile, certificates, projects, and role-based dashboards.
4. Test coding integrations from student workflow (LeetCode/CodeChef username linking).
5. Validate backend availability through the API test endpoint.

### Demo-ready feature checklist on live link
- Role-based authentication for Student/Teacher/Admin
- Academic certificate submission and review flow
- Personal certificates and project portfolio handling
- Coding profile integrations and leaderboard support
- Messaging/notification-enabled platform behavior

## Mini Project Context

This repository is built as a mini project focused on solving the problem of fragmented student achievement data.

### Core objective
- Create a single source of truth for student academic and co-curricular data.
- Enable role-based workflows for Students, Teachers, and Admins.
- Support verification and review of certificates.
- Generate profile/portfolio-ready student data.

### Why this project matters
- Reduces manual tracking effort.
- Improves transparency in review and approval.
- Helps institutes prepare data for audits, accreditation, and reporting.
- Encourages students to maintain updated digital portfolios.

## Solution Overview

The project has three main parts:

1. Backend (Node.js + Express + MongoDB)
2. Frontend Web App (React + Vite + Tailwind)
3. Mobile App (React Native + Expo)

### High-level architecture
- The web and mobile clients call REST APIs from the backend.
- Backend manages authentication, file uploads, business logic, and role-based flows.
- MongoDB stores user records, certificates, projects, groups, messages, and notifications.
- Cloudinary stores uploaded media.
- Socket.IO supports real-time notifications/messaging updates.

## Major Features

### 1. Multi-role authentication and access
- Student login/register
- Teacher login/register
- Admin login/register
- Google OAuth token verification endpoint
- Microsoft OAuth route integration (via auth routes)

### 2. Student profile and portfolio management
- Profile create/update with personal/academic details
- Personal certificates upload and listing
- Academic certificate submission for review workflow
- Projects management for portfolio
- Portfolio data endpoints for professional profile building

### 3. Academic certificate review workflow
- Teachers/Admins can review pending academic certificates
- Approve/reject actions with status updates
- Scan-based verification endpoints for certificate confidence checks
- Teacher-specific certificate statistics

### 4. Competitive coding integration
- LeetCode username linking and stats sync
- CodeChef username linking and stats sync
- Dedicated refresh endpoints for latest coding metrics
- Leaderboard endpoints (overall, LeetCode, CodeChef)

### 5. AI-assisted functionality
- Resume upload and text extraction
- Resume profile analysis endpoint
- AI chatbot endpoint for support/assistance

### 6. Real-time communication layer
- Socket.IO-based user room joining
- Notification and unread count endpoints
- Student message inbox and read-state tracking
- Feedback sending endpoint with real-time updates

### 7. Administration and institutional control
- College and department listing
- Group creation/assignment flows
- Admin-level student/teacher management (view/edit/delete)
- Teacher group and student mapping

## Tech Stack

### Backend
- Node.js, Express.js
- MongoDB + Mongoose
- Socket.IO
- Multer + Cloudinary
- Passport (including Microsoft strategy)
- Google auth library
- bcrypt, jsonwebtoken
- OCR/Parsing libs: tesseract.js, pdf-parse, jimp, jsqr

### Frontend (Web)
- React (Vite)
- React Router
- Tailwind CSS
- Framer Motion
- Axios
- Three.js + React Three Fiber + Drei

### Mobile App
- React Native (Expo)
- React Navigation
- Axios
- Expo Document/Image/File modules

## Repository Structure

```text
sih-smart-student-hub/
  Backend/                     # Express API, models, services, scripts
    app.js
    models/
    routes/
    utils/
  Frontend/smart-student-hub/  # React web app
    src/
      components/
      services/
  SmartStudentHubMobile/       # React Native mobile app
    src/
      screens/
      services/
  *.md                         # Integration guides and technical docs
```

## Backend API Coverage (Highlights)

The backend includes endpoints for:
- Auth: student/teacher/admin + OAuth verification
- Profile and student data
- Academic and personal certificates
- Certificate scanning and scan status
- Teacher groups and marks
- Admin user management
- Portfolio and projects
- Resume analysis and chatbot
- Search
- LeetCode and CodeChef sync + leaderboards
- Messaging and notifications

Quick examples:
- `POST /api/register`
- `POST /api/login`
- `POST /api/academic-certificates`
- `GET /api/review/academic-certificates`
- `POST /api/leetcode/update-username`
- `POST /api/codechef/update-username`
- `GET /api/leaderboard`
- `POST /api/messages/send`

## Local Setup Guide

### 1) Clone and install

```bash
# from repository root
cd Backend
npm install

cd ../Frontend/smart-student-hub
npm install

cd ../../SmartStudentHubMobile
npm install
```

### 2) Environment configuration

Create a `.env` file in `Backend/` and configure values such as:
- `PORT`
- `MONGODB_URI`
- `SESSION_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `GOOGLE_CLIENT_ID`
- Microsoft OAuth credentials used by auth config

### 3) Run backend

```bash
cd Backend
npm run dev
```

Backend default URL: `http://localhost:3000`

### 4) Run web frontend

```bash
cd Frontend/smart-student-hub
npm run dev
```

Frontend default URL: `http://localhost:5173`

### 5) Run mobile app (Expo)

```bash
cd SmartStudentHubMobile
npm run start
```

Use Expo Go or emulator to test mobile flows.

## Workflow Summary by Role

### Student
- Register/login
- Update profile
- Upload certificates/projects
- Track approval status
- Connect LeetCode/CodeChef
- View rank/leaderboard

### Teacher
- Register/login
- Manage assigned groups/students
- Review and act on academic certificates
- Monitor student performance and stats

### Admin
- Register/login
- Manage student and teacher records
- Configure groups and institutional data
- Access system-wide data and controls

## Documentation Index (Important)

Use these detailed docs for specific modules:
- `QUICK_START.md`
- `API_DOCUMENTATION.md`
- `COMPONENT_ARCHITECTURE.md`
- `LEETCODE_IMPLEMENTATION.md`
- `CODECHEF_INTEGRATION.md`
- `CERTIFICATE_SCAN_QUICK_START.md`
- `CERTIFICATE_SCAN_IMPLEMENTATION_SUMMARY.md`
- `MICROSOFT_OAUTH_*` docs set
- `README_CERTIFICATE_SCAN.md`

## Current Status and Scope

This mini project already includes:
- Full role-based data flow (Student, Teacher, Admin)
- Web and mobile clients
- Competitive coding integrations
- Certificate scan + review pipeline
- Real-time communication layer

Possible next enhancements:
- Automated test coverage expansion
- CI/CD pipeline integration
- Role-based authorization middleware hardening
- Analytics dashboards and exportable reports
- Production deployment with monitoring

## License

Specify your preferred license here (for example: MIT) before production/public release.

## Maintainer

- GitHub: [malipeddisekhar](https://github.com/malipeddisekhar)

## Author Note

This repository represents a detailed mini project implementation for centralized student activity record management. The architecture and modules are designed to be extensible for larger institutional deployments.

Project profile and updates are maintained through GitHub by [malipeddisekhar](https://github.com/malipeddisekhar).
