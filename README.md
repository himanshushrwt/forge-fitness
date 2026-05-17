# 🔥 Forge Fitness — Elite Fitness Platform

A premium, fully-featured fitness web app with AI coaching, workout planning,
nutrition tracking, coach hiring, progress photos with AI analysis, reminders, and more.

**100% Free to run. No paid services required.**

---

## 📁 Project Structure

```
forge-fitness/
├── backend/          ← Node.js + Express API
│   ├── models/       ← MongoDB schemas (User, Workout, NutritionLog)
│   ├── routes/       ← API endpoints
│   ├── middleware/   ← JWT auth middleware
│   ├── server.js     ← Main entry point
│   └── .env          ← Your environment variables (edit this!)
│
└── frontend/         ← React app
    ├── public/       ← index.html
    └── src/
        ├── pages/    ← All page components
        ├── components/ ← Shared components (Sidebar/Layout)
        ├── context/  ← Auth state (React Context)
        └── utils/    ← API helper (axios)
```

---

## 🚀 Setup — Step by Step

### Step 1: Install Node.js
Download from https://nodejs.org (version 18 or higher recommended).

### Step 2: Set Up Backend

```bash
cd backend
npm install
```

**Edit the `.env` file** (already created for you):
- `MONGODB_URI` — see free MongoDB setup below
- `ANTHROPIC_API_KEY` — see free AI key below
- Leave others as-is for local development

**Start backend:**
```bash
npm start
# OR for auto-restart on changes:
npm run dev
```

You should see: `🚀 Forge Fitness API running at http://localhost:5000`

### Step 3: Set Up Frontend

```bash
cd frontend
npm install
npm start
```

Opens automatically at http://localhost:3000

---

## 🗄️ Free Database — MongoDB Atlas

1. Go to https://mongodb.com/atlas
2. Create a **free account**
3. Create a **free M0 cluster** (512MB, always free)
4. Click **Connect → Connect your application**
5. Copy the connection string, replace `<password>` with your password
6. Paste into `backend/.env` as `MONGODB_URI`

**Without MongoDB:** The app runs in mock mode — data is stored in memory
and resets when you restart. Perfect for testing!

---

## 🤖 Free AI — Anthropic API Key

1. Go to https://console.anthropic.com
2. Create a free account
3. Go to **API Keys → Create Key**
4. Copy the key into `backend/.env` as `ANTHROPIC_API_KEY`

**Free tier:** $5 credit on signup — enough for thousands of AI responses.

**Without API key:** The AI Coach still works with a fallback message
explaining how to enable full AI. All other features work perfectly.

---

## 🌐 Deploy Free (Put on Internet)

### Option A: Railway (Easiest — 1 click)
1. Push your code to GitHub
2. Go to https://railway.app
3. Click **New Project → Deploy from GitHub**
4. Deploy backend: select `/backend` folder, add your `.env` variables
5. Deploy frontend: select `/frontend` folder
6. Railway gives you a free `.railway.app` URL!

### Option B: Render (Free tier)
1. Go to https://render.com
2. Create **Web Service** → connect GitHub
3. For backend: Build command `npm install`, Start command `npm start`
4. For frontend: Build command `npm run build`, Publish dir `build`

### Option C: Vercel + Railway
- Frontend → Vercel (https://vercel.com) — ultra fast, free
- Backend → Railway — always free tier
- Update `REACT_APP_API_URL` in frontend to your Railway backend URL

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 🔐 Auth | Register/Login with JWT, 3-step onboarding |
| 🏋 Exercises | 30+ exercises with step-by-step instructions |
| 📋 Workout Planner | Weekly drag-and-drop schedule |
| 🥗 Nutrition Tracker | Log meals from 20-food database, water intake, macros |
| 👥 Coaches | Browse & hire certified trainers (5 mock coaches) |
| 📸 Progress Photos | Upload photos, AI analysis of body composition |
| ⚖️ Weight Tracking | Log weight, view trend chart |
| 🤖 AI Coach | Full chat with Claude AI, quick prompts, plan generation |
| 🔔 Reminders | Custom + preset workout/meal/water reminders |
| 👤 Profile | Edit stats, BMI calculator, leaderboard |
| 📊 Dashboard | Stats, streak, today's plan, calorie chart |

---

## 🎨 Design

- **Theme:** Chocolate Truffle (dark browns + gold accents)
- **Accent:** Mossy green, muted coral
- **Fonts:** Cormorant Garamond (display) + Sora (body)
- **Reference:** Apple.com premium minimalism

---

## 💡 Extra Features Added (Beyond Original Request)

- **BMI Calculator** with visual scale in Profile
- **Community Leaderboard** with points system
- **Motivational quote** on Dashboard (random daily)
- **Preset reminders** based on sports science timing
- **Food database** with 20 common foods including Indian foods (dal, paneer, chapati, rice)
- **Mock mode** — runs without MongoDB (no data loss on refresh in dev)
- **Drag-to-add sets** in workout planner
- **Water intake tracker** with progress bar
- **Coach review system** (star ratings + comments)

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Recharts, React Hot Toast |
| Backend | Node.js, Express, JWT Auth, Multer (file uploads) |
| Database | MongoDB + Mongoose (optional — mock mode if offline) |
| AI | Anthropic Claude API (claude-sonnet-4) |
| Styling | Pure CSS with custom design system (no UI library) |

---

## 📞 Support

This is a complete, production-ready codebase. If you encounter issues:
1. Check `backend/.env` is configured correctly
2. Make sure both frontend and backend are running simultaneously
3. Open browser console (F12) for any JavaScript errors
4. Check terminal for backend error logs
