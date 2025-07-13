# 🖥️ Comsy – Computer Lab Management System

A full-stack web application designed to streamline the reporting and management of technical issues in computer labs. Built for real-time tracking, role-based access, and offline support within a college campus.

---

## 🚀 Features

- 🧾 **Issue Reporting** – Students can report hardware/software issues with a simple, interactive UI
- 👨‍🏫 **Role-Based Dashboards** – Separate views for Admin, Faculty, and Students
- 🔐 **Secure Login** – JWT-based authentication with session management
- 🌐 **Real-Time Updates** – Dynamic status tracking of lab issues
- 💾 **MongoDB Integration** – Stores user roles, issue logs, and lab system details
- 🖧 **Offline LAN Access** – Electron.js integration allows usage without internet
- 📊 **Admin Control Panel** – Monitor, assign, and resolve issues with filtering

---

## 🛠️ Tech Stack

**Frontend**  
- HTML5, CSS3, JavaScript  
- DOM Manipulation  
- Responsive Design

**Backend**  
- Node.js  
- Express.js  
- JWT Authentication

**Database**  
- MongoDB (Mongoose ODM)

**Others**  
- Electron.js (for LAN-based offline use)  
- Git & GitHub  
- Postman (API Testing)

---

## 🧑‍💻 How It Works

1. **Student** logs in and submits a lab issue (e.g., "Monitor not working").
2. **Faculty/Admin** reviews and changes status (Pending → In Progress → Resolved).
3. **Electron app** ensures the system works within LAN labs, even without internet.
4. **All data** is securely stored in MongoDB and fetched via REST APIs.

---

## 🏗️ Folder Structure
comsy/
├── client/                      # Frontend source code
│   ├── index.html               # Main HTML file
│   ├── styles/                  # CSS stylesheets
│   └── scripts/                 # JavaScript files
│       └── main.js              # Entry point for frontend logic
│
├── server/                      # Backend (Node.js + Express)
│   ├── controllers/             # Route logic (e.g., issueController.js)
│   ├── models/                  # Mongoose schemas (e.g., user.js, issue.js)
│   ├── routes/                  # API routes (e.g., authRoutes.js)
│   ├── middleware/              # JWT auth middleware
│   ├── config/                  # DB config and env setup
│   └── server.js                # Entry point (Express app)
│
├── electron-app/                # LAN-based desktop app (Electron.js)
│   ├── main.js                  # Electron entry point
│   └── preload.js               # Secure access layer between UI and backend
│
├── public/                      # Shared static assets (icons, logos)
│
├── .env.example                 # Sample environment variables
├── README.md                    # Project documentation
├── package.json                 # Node dependencies & scripts
└── LICENSE                      # Open-source license
