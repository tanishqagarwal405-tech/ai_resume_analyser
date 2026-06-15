🚀 AI Resume & LinkedIn Analyzer
📌 Overview

AI Resume & LinkedIn Analyzer is a full-stack MERN application that helps job seekers optimize their resumes and LinkedIn profiles using Artificial Intelligence.

The platform analyzes uploaded resumes, evaluates LinkedIn profile content, identifies weaknesses, and provides personalized suggestions to improve ATS scores and recruiter visibility.

✨ Features
📄 Resume Analysis
Upload Resume (PDF/DOCX)
AI-powered Resume Review
ATS Score Calculation
Skill Gap Detection
Resume Strengths & Weaknesses
Keyword Optimization Suggestions
💼 LinkedIn Profile Analysis
Profile Content Evaluation
Headline Optimization
About Section Improvement
Skills Recommendation
Recruiter Visibility Score
🤖 AI Insights
Smart Career Suggestions
Industry-specific Recommendations
Missing Skills Identification
Personalized Improvement Roadmap
🔐 Authentication
User Registration
Login & Logout
JWT Authentication
Secure Password Hashing
📊 Dashboard
Analysis History
Performance Tracking
User Profile Management
🛠️ Tech Stack
Frontend
React.js
Tailwind CSS
Axios
React Router
Backend
Node.js
Express.js
JWT Authentication
Multer
Database
MongoDB Atlas
Mongoose
AI Integration
Google Gemini API / OpenAI API
📂 Project Structure
AI-Resume-Analyzer/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── server.js
│
├── uploads/
├── .env
├── package.json
└── README.md
⚙️ Installation
Clone Repository
git clone https://github.com/yourusername/AI-Resume-Analyzer.git
cd AI-Resume-Analyzer
Install Dependencies
Backend
cd server
npm install
Frontend
cd client
npm install
🔑 Environment Variables

Create a .env file inside the server directory.

PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

GEMINI_API_KEY=your_gemini_api_key
▶️ Run Project
Start Backend
npm run dev
Start Frontend
npm start

Application:

Frontend : http://localhost:3000
Backend  : http://localhost:5000
📸 Screenshots
Home Page

(Add Screenshot Here)

Resume Analysis

(Add Screenshot Here)

LinkedIn Analysis

(Add Screenshot Here)

Dashboard

(Add Screenshot Here)

🎯 Future Enhancements
Resume Builder
Job Recommendation Engine
Cover Letter Generator
Interview Question Generator
AI Career Coach
Multi-language Support
