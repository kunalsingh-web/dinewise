📌 DineWise – Restaurant Discovery & Rating Platform

A full-stack web application built with React + Node.js + Oracle Database.

🚀 Overview

DineWise is a modern restaurant discovery platform where users can:

Browse restaurants with ratings & cuisines

Filter by city, category, and rating

View detailed restaurant profiles

Add reviews & ratings (authenticated users)

See rating statistics, top restaurants, etc.

Tech Stack
Layer	Technology
Frontend	React 19 + Vite + TailwindCSS
Backend	Node.js + Express.js
Database	Oracle 11g XE
ORM/Driver	oracledb (Thick Mode with Instant Client)
Auth	JWT (JSON Web Tokens)
📂 Project Structure
dinewise_fullstack/
│
├── frontend/              # React Vite UI
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   └── components/
│   ├── index.html
│   ├── tailwind.config.cjs
│   ├── package.json
│   ├── .env               # VITE_API_BASE
│   └── README.md
│
└── backend/               # Node + Express + Oracle backend
    ├── server.js
    ├── package.json
    ├── .env               # DB credentials & JWT secret
    ├── .env.example
    ├── README.md
    └── sql/

🛠️ Backend Setup (Node + Oracle)
✅ 1. Install Node.js 20 LTS

Node 22 is not supported by oracledb yet.

Use NVM:

nvm install 20
nvm use 20


Verify:

node -v

🧩 2. Install Oracle Instant Client (required for Oracle 11g)

Download Instant Client Basic (19.x or 21.x) from:

🔗 https://www.oracle.com/database/technologies/instant-client/winx64-64-downloads.html

Extract to:

C:\oracle\instantclient_21_19

Add this folder to System PATH:
C:\oracle\instantclient_21_19


Verify:

where oci.dll

🔧 3. Configure backend environment variables

Create backend/.env:

DB_USER=DINEWISE_ADMIN
DB_PASSWORD=your_password
DB_CONNECT_STRING=localhost:1521/XE
PORT=4000
JWT_SECRET=your_long_random_secret

🔥 4. Start backend
cd backend
npm install
npm start


Expected console:

Oracle Instant Client initialized…
Oracle pool created
Server listening on 4000


Backend is live at:

👉 http://localhost:4000

🎨 Frontend Setup (React + Vite + Tailwind)
1️⃣ Install dependencies
cd frontend
npm install

2️⃣ Configure environment variables

Create frontend/.env:

VITE_API_BASE=http://localhost:4000

3️⃣ Start frontend
npm run dev


Frontend will run at:

👉 http://localhost:5173

🔗 Connecting Frontend to Backend

Inside src/api.js:

const API_BASE = import.meta.env.VITE_API_BASE;

export async function fetchRestaurants() {
  const r = await fetch(`${API_BASE}/api/restaurants`);
  return r.json();
}


Frontend now pulls live data from the backend.
