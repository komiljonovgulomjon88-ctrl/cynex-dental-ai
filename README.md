# 🦷 Cynex Dental AI — MVP

> AI-powered dental health analysis. Upload a photo of your teeth, get an instant diagnosis, personalized care advice, reminders, progress tracking, and a kids game mode.

---

## 🗂️ Project Structure

```
cynex-dental-ai/
├── frontend/          Next.js 14 web app (TypeScript + Tailwind)
├── backend/           FastAPI backend (Python)
└── supabase/
    └── schema.sql     PostgreSQL schema for Supabase
```

---

## 🔧 Prerequisites

Install these before starting:

| Tool | Download |
|------|----------|
| **Node.js 18+** | https://nodejs.org |
| **Python 3.11+** | https://python.org |
| **Git** | https://git-scm.com |

---

## ⚡ Quick Start

### 1. Supabase Setup (Database)
1. Go to [supabase.com](https://supabase.com) → Create new project
2. Go to **SQL Editor** → paste contents of `supabase/schema.sql` → **Run**
3. Go to **Project Settings → API** → copy:
   - `Project URL`
   - `anon public` key → for frontend
   - `service_role` key → for backend (**keep secret!**)

---

### 2. Anthropic API Key
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key → copy it for backend `.env`

---

### 3. Backend Setup

```bash
cd backend

# Copy env file and fill in your keys
cp .env.example .env
# Edit .env → set SUPABASE_URL, SUPABASE_SERVICE_KEY, ANTHROPIC_API_KEY

# Create virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Start server
python main.py
# → Running at http://localhost:8000
# → API docs at http://localhost:8000/docs
```

---

### 4. Frontend Setup

```bash
cd frontend

# Copy env file and fill in your values
cp .env.local.example .env.local
# Edit .env.local → set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

# Install dependencies
npm install

# Start dev server
npm run dev
# → Running at http://localhost:3000
```

---

## 📱 App Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/auth` | Register / Login |
| `/onboarding` | Profile setup (age, dental history) |
| `/scan` | Upload or capture dental photos |
| `/analysis/[id]` | AI diagnosis results + risk scores |
| `/dashboard` | Progress charts + scan history |
| `/reminders` | Brushing / dentist reminders |
| `/kids` | Children game mode 🎮 |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login → JWT token |
| POST | `/api/profile` | Save dental profile |
| GET  | `/api/profile` | Get my profile |
| POST | `/api/analysis/scan` | Upload images → AI analysis |
| GET  | `/api/analysis/{id}` | Get analysis result |
| GET  | `/api/analysis` | List all analyses |
| GET  | `/api/dashboard` | Dashboard data + charts |
| GET  | `/api/reminders` | List reminders |
| POST | `/api/reminders` | Create reminder |
| PATCH | `/api/reminders/{id}` | Toggle on/off |
| DELETE | `/api/reminders/{id}` | Delete reminder |

Interactive API docs: `http://localhost:8000/docs`

---

## 🧠 AI Analysis (Claude)

- Model: `claude-sonnet-4-6` with **vision**
- Uses **prompt caching** to reduce API costs
- Detects: Caries, Gum Disease, Orthodontic Issues, Discoloration, Enamel Erosion
- Risk levels: 🟢 Low (0–30%) · 🟡 Medium (31–70%) · 🔴 High (71–100%)
- Personalized advice based on user profile

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| State | Zustand |
| Charts | Recharts |
| Animations | Framer Motion |
| Backend | FastAPI (Python) |
| AI | Claude claude-sonnet-4-6 (Anthropic) |
| Database | Supabase (PostgreSQL) |
| Auth | JWT (python-jose) |

---

## 🚀 Next Steps (Phase 2)

- [ ] 3D interactive tooth model (Three.js)
- [ ] X-ray image support
- [ ] Online dentist consultation booking
- [ ] Mobile app (React Native / Flutter)
- [ ] Push notifications (FCM)
- [ ] AR visualization

---

© 2026 Cynex Dental AI
