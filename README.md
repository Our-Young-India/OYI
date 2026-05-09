# 🇮🇳 Our Young India - Child-Led Inspiration Platform

> **India's First Child-Led Digital Inspiration Platform**  
> Founded by 9-year-old Sharanya Mena

---

## 🎯 Project Overview

**Our Young India** is a vibrant digital platform where young achievers (ages 6-17) share their inspiring journeys. Through video interviews and detailed stories, we showcase the real paths kids take to achieve their dreams—complete with struggles, resources, costs, and actionable advice.

### Key Features
- 📹 Video interviews with young achievers
- 📚 Detailed journey breakdowns (how they started, what they sacrificed, who helped)
- 💰 Real cost breakdowns and free resources
- 🎨 Vibrant, patriotic Indian tricolor design
- 👥 Admin dashboard for content management
- 📝 Public nomination form for new stories
- 🔍 Search and filter by field, age, location

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite
- **Styling:** TailwindCSS + Custom CSS
- **UI Components:** Shadcn UI
- **Routing:** React Router v7
- **HTTP Client:** Axios

### Backend
- **Framework:** FastAPI (Python)
- **Database:** MongoDB Atlas (Cloud)
- **Authentication:** JWT + bcrypt
- **Async Driver:** Motor (PyMongo async)

### Infrastructure
- **Frontend Hosting:** Vercel (global CDN)
- **Backend Hosting:** Render (Python runtime)
- **Database:** MongoDB Atlas (cloud database)
- **Deployment:** Git-based CI/CD

---

## 🚀 Quick Start Deployment

### Option 1: Follow Quick Deploy Guide
See `QUICK_DEPLOY.md` for step-by-step deployment commands.

### Option 2: Manual Deployment

#### 1. Deploy Backend to Render
- Create account at https://render.com
- Connect GitHub repository
- Configure: Python runtime, root directory `backend`
- Add environment variables (see DEPLOYMENT_GUIDE.md)
- Deploy

#### 2. Deploy Frontend to Vercel
```bash
cd frontend
vercel --prod
```

#### 3. Test Your Deployment
```bash
# Test backend
curl https://your-backend.onrender.com/api/health

# Open frontend
https://your-frontend.vercel.app
```

**📖 Complete Guide:** See `DEPLOYMENT_GUIDE.md`

---

## 📊 Current Status

### ✅ Database (MongoDB Atlas)
- **Status:** LIVE & CONFIGURED
- **Database:** ouryoungindia
- **Stories:** 3 sample stories
- **Nominations:** 2 pending nominations
- **Admin:** 1 admin account

### ✅ Backend (FastAPI)
- **Status:** READY FOR DEPLOYMENT
- **Configuration:** render.yaml created
- **Health Check:** /api/health endpoint added
- **Target:** Render (https://ouryoungindia-api.onrender.com)

### ✅ Frontend (React)
- **Status:** READY FOR DEPLOYMENT
- **Configuration:** vercel.json created
- **Build:** Optimized for production
- **Target:** Vercel (https://your-project.vercel.app)

---

## 🗂️ Documentation

| Document | Description |
|----------|-------------|
| **README.md** | This file - project overview |
| **DEPLOYMENT_GUIDE.md** | Complete step-by-step deployment guide |
| **QUICK_DEPLOY.md** | Fast deployment commands |
| **MIGRATION_SUMMARY.md** | Migration details from Emergent |

---

## 🔐 Test Credentials

**Admin Panel Access:**
- URL: `/admin/login`
- Email: `admin@ouryoungindia.in`
- Password: `Admin@123`

**⚠️ IMPORTANT:** Change password after first deployment!

---

## 🌟 Pages & Features

### Public Pages
1. **Home** (`/`) - Hero, stats, featured carousel
2. **Journeys** (`/journeys`) - Story listing with search/filters
3. **Journey Detail** (`/journeys/:slug`) - Individual story with video
4. **About** (`/about`) - 12 comprehensive sections
5. **Nominate** (`/nominate`) - Public nomination form

### Admin Pages (Protected)
1. **Login** (`/admin/login`) - JWT authentication
2. **Dashboard** (`/admin`) - Stories management (CRUD)
3. **Nominations** (`/admin/nominations`) - Workflow pipeline

---

## 🎨 Design System

### Colors
- **Saffron:** #FF6600, #FF9933 (Primary)
- **Green:** #00A651, #138808 (Primary)
- **Gold:** #FFD700 (Accent)
- **Blue:** #2196F3 (Academics)
- **Purple:** #9C27B0 (Arts)
- **Cyan:** #00BCD4 (Technology)

### Typography
- **Headings:** Poppins (Bold)
- **Body:** Montserrat
- **Taglines:** Pacifico

---

## 📈 Roadmap

### ✅ Phase 1: COMPLETED
- Core platform with 5 public pages
- Admin dashboard
- MongoDB Atlas integration
- Search and filters
- Responsive design

### 🔜 Phase 2: NEXT
- Photo upload for nominations
- Email integration
- Comments system
- Reaction emojis

### 🚀 Phase 3: FUTURE
- User accounts
- Multilingual support
- Mobile app
- AI chatbot

---

## 🤝 Contributing

Contributions welcome! Fork, create feature branch, commit, and open PR.

---

## 📞 Support

- **Deployment Help:** See DEPLOYMENT_GUIDE.md
- **Quick Commands:** See QUICK_DEPLOY.md
- **Platform Docs:** Render.com/docs, Vercel.com/docs

---

## 📜 License

Open source for educational and social impact purposes.

---

## 🇮🇳 Mission

> "To inspire every Indian child by showing them real, achievable paths to their dreams—not through luck or privilege, but through passion, persistence, and the right guidance."

---

**Built with ❤️ for India's future achievers 🚀**

---

**Status:** ✅ Ready for Deployment  
**Version:** 1.0  
**Last Updated:** December 2026
