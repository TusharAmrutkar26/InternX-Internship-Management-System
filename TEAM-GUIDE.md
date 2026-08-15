# InternX - Team Collaboration Guide

## 👥 Team Structure (3 Members)

| Role | Responsibility | Branch Pattern |
|------|---|---|
| **Backend Developer** (You) | API, authentication, business logic | `feature/backend-*` |
| **Frontend Developer** | UI components, pages, styling | `feature/frontend-*` |
| **Database/DevOps** | Schema, migrations, deployment | `feature/database-*` |

---

## 🔄 Git Workflow (Simple & Beginner-Friendly)

### Setup (Each team member does this once):
```bash
git clone https://github.com/TusharAmrutkar26/InternX-Internship-Management-System.git
cd InternX
git checkout -b develop origin/develop  # or create locally if it doesn't exist
```

### Daily Workflow:
```bash
# 1. Update your local copy
git checkout develop
git pull origin develop

# 2. Create your feature branch
git checkout -b feature/backend-yourfeature

# 3. Make changes and commit
git add .
git commit -m "Backend: Add user authentication endpoint"

# 4. Push to GitHub
git push -u origin feature/backend-yourfeature

# 5. Create a Pull Request on GitHub (ask team to review)
# After approval, merge to develop, then eventually to master
```

---

## 🎯 Backend Priorities (For You)

### Phase 1: Authentication (Start Here)
- [ ] Test `/api/auth/register` endpoint
- [ ] Test `/api/auth/login` endpoint
- [ ] Test `/api/auth/me` endpoint
- [ ] Verify JWT token handling
- [ ] Test logout functionality

### Phase 2: Student Endpoints
- [ ] `GET /api/students/profile`
- [ ] `PATCH /api/students/profile`
- [ ] Internship search filtering
- [ ] Application submission

### Phase 3: Industry Endpoints
- [ ] Internship management
- [ ] Application review & evaluation
- [ ] Certificate issuance

### Phase 4: Admin Features
- [ ] Admin dashboard routes
- [ ] User management
- [ ] System monitoring

---

## 📋 API Contracts (Frontend Will Use These)

### Authentication
```
POST /api/auth/register
{
  "email": "string",
  "password": "string",
  "accountType": "student|industry"
}

POST /api/auth/login
{
  "email": "string",
  "password": "string"
}

GET /api/auth/me
Response: { user object }
```

### Student Profile
```
GET /api/students/profile
PATCH /api/students/profile
{
  "name": "string",
  "skills": ["array"],
  "workMode": "onsite|hybrid|remote"
}
```

---

## 🗄️ Database Info

**File**: `backend/data/internx.db` (SQLite)
**Location**: Git-ignored (local only)

### Setup Database:
```bash
cd backend
npm run seed  # Creates demo data
```

---

## 💬 Communication Tips

1. **Before you start a feature**: Tell your team in chat
2. **After you finish**: Push to your branch + create PR
3. **Merge conflicts?**: Ask team member who worked on that file
4. **If backend breaks**: Tell frontend ASAP so they can mock data

---

## 🚀 Running Locally (All Members Need This)

### Terminal 1 - Backend
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:4000
```

### Terminal 2 - Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## 📌 Important Files to Know

- **Backend Routes**: `backend/src/routes/`
- **Database Schema**: `backend/src/database.js`
- **Frontend API Helper**: `frontend/src/api.js`
- **Environment Variables**: `backend/.env` (copy from `.env.example`)

---

## ✅ Quick Start (You - Backend Developer)

```bash
# 1. Pull latest
git checkout develop
git pull origin develop

# 2. Create your first feature branch
git checkout -b feature/backend-auth-testing

# 3. Go to backend and test endpoints
cd backend
npm install
npm run dev

# 4. Test with curl or Postman
curl http://localhost:4000/api/health

# 5. After testing, commit
git add .
git commit -m "Backend: Verify auth endpoints working"
git push -u origin feature/backend-auth-testing

# 6. Create Pull Request on GitHub
# Merge after team review
```

---

**Next Step**: Create `develop` branch and send this guide to your teammates! 🚀
