# Backend Developer Checklist - InternX

## 🎯 Your Mission: Build & Maintain Backend API

Your job is to ensure all API endpoints work correctly and Frontend can consume them seamlessly.

---

## ✅ Phase 1: Setup & Testing (This Week)

### Environment Setup
- [ ] Copy `backend/.env.example` to `backend/.env`
- [ ] Set a unique `JWT_SECRET` in `.env`
- [ ] Run `npm install` in backend folder
- [ ] Run `npm run dev` and verify server starts on port 4000

### Health Check
- [ ] Test: `curl http://localhost:4000/api/health`
- [ ] Should return: `{ "status": "ok" }`

### Database Setup
- [ ] Run `npm run seed` to create demo data
- [ ] Verify `backend/data/internx.db` exists
- [ ] Check database has users, internships, applications

---

## 🔐 Phase 2: Authentication Endpoints (Week 1-2)

### Test Registration
- [ ] `POST /api/auth/register`
  - Create a student account
  - Create an industry account
  - Verify both work
  - Test error cases (duplicate email, weak password)

### Test Login
- [ ] `POST /api/auth/login`
  - Login as student
  - Login as industry user
  - Verify JWT token returned
  - Test with wrong password (should fail)

### Test Profile Retrieval
- [ ] `GET /api/auth/me`
  - Test with valid token (should work)
  - Test without token (should fail with 401)
  - Verify returned user object matches logged-in user

### Test Logout
- [ ] `POST /api/auth/logout`
  - Logout should clear session/token
  - Subsequent calls without token should fail

---

## 👤 Phase 3: Student Endpoints (Week 2-3)

### Profile Management
- [ ] `GET /api/students/profile` - Returns logged-in student's profile
- [ ] `PATCH /api/students/profile` - Update name, skills, work mode
- [ ] Test auth required (non-students can't access)

### Internship Browse
- [ ] `GET /api/students/internships` - List all internships
- [ ] Test filters: `?search=&company=&location=&skills=&workMode=`
- [ ] Pagination if implemented

### Application Management
- [ ] `POST /api/students/internships/:id/applications` - Apply to internship
- [ ] `GET /api/students/applications` - View all applications
- [ ] Test can't apply twice to same internship

---

## 🏢 Phase 4: Industry Endpoints (Week 3-4)

### Internship Management
- [ ] Create internship (if endpoint exists)
- [ ] Update internship
- [ ] View applications received
- [ ] Filter applications by status

### Application Review
- [ ] `PUT /api/industry/applications/:id/evaluation` - Rate/evaluate student
- [ ] Update application status (accepted/rejected)

### Certificate Issuance
- [ ] `POST /api/industry/applications/:id/certificate` - Issue certificate
- [ ] `GET /api/public/certificates/:code` - Public verification

---

## 📚 Phase 5: Academic Records & Skills (Week 4)

### Academic Records
- [ ] `GET|POST /api/students/academic-records`
- [ ] `PATCH|DELETE /api/students/academic-records/:id`
- [ ] Test validation (GPA range, valid subjects, etc.)

### Skills Management
- [ ] `GET|POST /api/students/skills`
- [ ] `DELETE /api/students/skills/:id`
- [ ] Ensure skills match predefined list (optional)

---

## 🛡️ Testing Checklist (For All Endpoints)

For **each endpoint**, verify:

- [ ] **Success case** - Works with valid data
- [ ] **Auth required** - Returns 401 if not logged in (if applicable)
- [ ] **Validation** - Rejects invalid input
- [ ] **Permissions** - Students can't access industry endpoints, vice versa
- [ ] **Error messages** - Clear error responses
- [ ] **Database state** - Data persists after server restart

---

## 🔧 Tools You'll Need

### Postman (Recommended for Beginners)
1. Download Postman: https://www.postman.com/downloads/
2. Import API collection
3. Create requests for each endpoint
4. Share with team

### cURL (Alternative)
```bash
# Test health
curl http://localhost:4000/api/health

# Test auth
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### VS Code REST Client Extension
```rest
### Get Health
GET http://localhost:4000/api/health

### Login
POST http://localhost:4000/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

---

## 📞 Communication With Team

### Tell Frontend Developer:
- [ ] Which endpoints are working
- [ ] Which need mock data
- [ ] Any changes to endpoint response format

### Tell Database/DevOps Person:
- [ ] If schema needs changes
- [ ] If migrations needed
- [ ] Database performance issues

### Weekly Sync Points:
- Monday: Review what each person will work on
- Wednesday: Share progress, flag blockers
- Friday: Demo working features

---

## 🚀 First Task (Start Here!)

1. Copy `.env.example` to `.env`
2. Set `JWT_SECRET=your-secret-key`
3. Run `npm install` && `npm run dev`
4. Test `http://localhost:4000/api/health`
5. Commit your changes: `git checkout -b feature/backend-auth-testing`
6. Test auth endpoints with Postman
7. Document findings
8. Push & create PR

---

## 📝 Your First Pull Request

```bash
# Create branch
git checkout -b feature/backend-auth-testing

# Make changes, test, commit
git add .
git commit -m "Backend: Verify auth endpoints and database seeding working"

# Push
git push -u origin feature/backend-auth-testing

# Go to GitHub, create Pull Request with findings
# Ask team to review before merging to develop
```

---

**Remember**: Keep it simple, test often, communicate with team! 🚀
