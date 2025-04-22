# Demo Video -> https://drive.google.com/file/d/1ONMHQeLmNvL8zUGC4qhFAiuKZnf12hxJ/view?usp=sharing
# Job Track AI – AI-Powered Job Application Tracker

Job Track AI is a smart, full-stack job application management platform that empowers job seekers to organize, track, and optimize their job search journey. Powered by Google Gemini AI, the platform offers intelligent resume analysis, skill gap insights, interview preparation, and automated cover letter generation.

---

## 🌟 Features

### 🔐 Secure User Authentication
- Encrypted password storage
- Session-based authentication

### ⏰ Interview Reminders & Alerts
- Get automatic reminders 1 day before your scheduled interviews via email

### 📱 Mobile-First Responsive Design
- Built using **Tailwind CSS**
- Seamless experience across desktops, tablets, and smartphones

### 🗒️ Job Application Tracker
- Add job details: company, role, skills, and interview date
- Update statuses: `Offered`, `Rejected`, `Interviewing`, `Ongoing`

### 🧠 AI-Powered Interview Tips
- Personalized mock questions
- Career advice and role-specific interview strategies via **Gemini AI**

### 📄 Resume Analyzer
- Upload resume and receive:
  - Career summary
  - Suggested job roles
  - Strengths and weaknesses
  - Keywords and optimization tips

### ✉️ Cover Letter Generator
- Automatically generate tailored cover letters for specific roles and companies

### 🔧 Skill Set Management
- Add existing skills and job interests
- Receive skill improvement and upskilling recommendations

### 🔒 Data Security
- All data is securely stored with modern encryption and access controls

---

## 🛠️ Tech Stack Overview

### 🖥️ Frontend: React.js + Tailwind CSS
- Responsive design using Tailwind CSS
- Data visualizations with Chart.js
- Email notifications via EmailJS
- Resume parsing with pdftotext

#### Frontend Modules
```
npm install react-router-dom@5 chart.js @emailjs/browser axios pdftotext
```

#### Run Frontend
```
cd frontend/aijobapp
npm run dev
```

### 🌐 Backend: Node.js + Express + MongoDB Atlas
- RESTful APIs
- Authentication, CRUD operations, file uploads

#### Backend Modules
```
npm install express mongoose cors dotenv jsonwebtoken multer mongodb
```

#### Run Backend
```
cd database
node server.js
```

### 🧑‍🧐 AI API: Python + Flask + Gemini AI
- Handles resume analysis, interview tips, skill suggestions, and cover letter generation

#### Python Modules
```
pip install flask flask-cors google-generativeai
```

#### Run Flask API
```
cd flask-api
python app.py
```

---

## 📂 Project Structure
```
JobTrackAI/
│
├── frontend/
│   └── aijobapp/      # React app (Tailwind, Chart.js, EmailJS)
│
├── database/          # Node.js + MongoDB backend
│   └── server.js
│
├── flask-api/         # Flask API with Gemini AI
│   └── app.py
│
└── README.md
```

---

## 🚀 Getting Started

1. **Clone the Repository**
```
git clone https://github.com/your-username/JobTrackAI.git
```

2. **Install Frontend Dependencies**
```
cd frontend/aijobapp
npm install
```

3. **Install Backend Dependencies**
```
cd ../../database
npm install
```

4. **Install Flask API Dependencies**
```
cd ../flask-api
pip install -r requirements.txt
```

5. **Run All Servers**
- Flask AI API: `python app.py`
- Node.js Backend: `node server.js`
- React Frontend: `npm run dev`

---

## 📧 Contact

For questions, support, or feedback:
**Email:** haripragateesh7@gmail.com

---


