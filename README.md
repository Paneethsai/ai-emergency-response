# 🚨 AI Emergency Response System

> A full-stack, AI-powered emergency dispatch and response platform built with React, Node.js, MongoDB, Firebase Auth, and Google Gemini AI.


link:https://ai-emergency-response-frontend.vercel.app/login

![AI Emergency Response](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Gemini AI](https://img.shields.io/badge/Google-Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)

---

## 📸 Overview

The **AI Emergency Response System** is a real-time, role-based emergency management platform connecting citizens, first responders (Police, Fire, Ambulance), and government authorities under one unified interface.

Citizens can **report emergencies** with AI-powered severity analysis, responders get **real-time dispatch maps** with full citizen contact details, and government officials access **live analytics dashboards** with incident trend charts and a searchable dispatch log.

---

## ✨ Features

### 🏙️ For Citizens
- **Report Incidents** — File emergency reports with AI-powered severity classification
- **Interactive Map Picker** — Click-to-pin location selection on Leaflet map
- **Incident History** — View all past reports with status tracking and AI tags
- **Live Map** — See all active incidents in the city on a color-coded map
- **Real-time Notifications** — Get alerts when your incident status changes
- **Profile Management** — Update your contact details visible to responders

### 👮 For Responders (Police / Fire / Ambulance)
- **Dispatch Dashboard** — Full agency-filtered incident queue with severity and status
- **Citizen Details** — Name, email, and phone of every reporting citizen
- **Live Incident Map** — All pending incidents pinned on an integrated Leaflet map
- **AI Action Protocol** — Gemini-generated step-by-step response instructions per incident
- **Status Updates** — Accept, dispatch, and resolve incidents in real time

### 🏛️ For Government Officers
- **City Overview Analytics** — Stats cards + Bar chart + Pie chart (by severity)
- **Recent Activity Log** — Live scrollable feed of all recent incidents
- **Detailed Dispatch Log Table** — Searchable, filterable table with citizen info

### 🛡️ For Admins
- **User Management** — View all registered users with role, email, phone
- **System Statistics** — Platform-wide KPIs

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + TypeScript + Vite |
| **Styling** | Tailwind CSS + Custom Glassmorphism |
| **Maps** | Leaflet.js + React-Leaflet |
| **Charts** | Recharts |
| **Backend** | Node.js + Express + TypeScript |
| **Database** | MongoDB Atlas + Mongoose |
| **Auth** | Firebase Authentication + JWT |
| **AI** | Google Gemini 1.5 Pro |
| **Container** | Docker + Docker Compose |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB Atlas account
- Firebase project
- Google Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/paneethsai/ai-emergency-response.git
cd ai-emergency-response
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in your MongoDB URI, JWT Secret, Firebase credentials, and Gemini API key
npm install
npm run dev
```

**Required `.env` variables:**
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/emergency-db
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_gemini_api_key

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
```

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env
# Fill in your Firebase web config
npm install
npm run dev
```

**Required `.env` variables:**
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Docker (Optional)

```bash
docker-compose up --build
```

---

## 👥 User Roles

| Role | Access |
|---|---|
| `citizen` | Report incidents, view own history, live map |
| `police` | Police dispatch queue, map, AI protocol |
| `fire` | Fire dispatch queue, map, AI protocol |
| `ambulance` | Ambulance dispatch queue, map, AI protocol |
| `government_officer` | City analytics, all incidents, dispatch log |
| `admin` | Full system access, user management |

### 🔧 Developer Bypass Login (No Firebase)
On the login page, use the **"Developer Bypass"** button and select any role to bypass Firebase and test with a mock session.

---

## 📁 Project Structure

```
ai-emergency-response/
├── backend/
│   ├── src/
│   │   ├── config/          # DB & Firebase config
│   │   ├── controllers/     # Route handlers
│   │   ├── middlewares/     # Auth middleware (protect, authorize)
│   │   ├── models/          # Mongoose schemas (User, Incident, Notification)
│   │   ├── routes/          # Express routers
│   │   └── services/
│   │       └── ai/          # Gemini AI service
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # AuthContext
│   │   ├── pages/
│   │   │   ├── auth/        # Login page
│   │   │   └── dashboard/
│   │   │       ├── citizen/         # CitizenHome, ReportIncident, LiveMap, IncidentHistory, Profile
│   │   │       ├── responder/       # ResponderDashboard (with embedded map + AI protocol)
│   │   │       ├── government/      # GovernmentDashboard (analytics + dispatch log)
│   │   │       ├── admin/           # AdminDashboard
│   │   │       └── notifications/   # Notifications
│   │   ├── services/        # API + auth services
│   │   └── config/          # Firebase config
│   ├── .env.example
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## 🤖 AI Features

### Incident Severity Analysis
When a citizen submits an incident report, the **Google Gemini 1.5 Pro** model automatically:
- Classifies severity: `Critical` / `High` / `Medium` / `Low`
- Generates a concise AI summary
- Extracts relevant tags for the incident type

### AI Action Protocol
Responders can click **"Generate AI Protocol"** on any incident to receive:
- Step-by-step response instructions tailored to the specific emergency
- Situation assessment based on citizen's description
- Safety precautions and coordination guidance

---

## 🔒 Security

- All routes protected by JWT Bearer authentication
- Role-based access control via `authorize()` middleware
- Firebase Admin SDK validates ID tokens server-side
- Environment variables never committed to git

---

## 📄 License

MIT License — © 2026 Paneeth Sai

---

## 🙏 Acknowledgements

- [Google Gemini](https://deepmind.google/technologies/gemini/) for AI capabilities
- [Firebase](https://firebase.google.com/) for authentication
- [OpenStreetMap](https://www.openstreetmap.org/) & [Leaflet.js](https://leafletjs.com/) for maps
- [Recharts](https://recharts.org/) for data visualization
- [MongoDB Atlas](https://www.mongodb.com/atlas) for cloud database

---

<p align="center">Built with ❤️ by <strong>Paneeth Sai</strong></p>
