# Phase 1 Database/Auth Setup Guide

## Prerequisites

You need PostgreSQL 12+ running locally before proceeding.

### Option 1: Windows PostgreSQL Installation (Recommended)
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer
3. During setup, remember the **superuser password** (default user: `postgres`)
4. Install on default port **5432**
5. After installation, verify PostgreSQL is running:
   ```bash
   psql --version
   ```

### Option 2: Docker (Alternative)
If Docker is available on your system:
```bash
docker run --name internx-postgres -e POSTGRES_PASSWORD=postgres -d -p 5432:5432 postgres:latest
```

---

## Setup Steps (After PostgreSQL is Running)

### 1. Install NPM Dependencies
```bash
cd backend
npm install
```

### 2. Configure Database URL
Edit `.env` file (already created):
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/internx?schema=public"
```

Change `postgres` password if you set a different one during PostgreSQL installation.

### 3. Generate Prisma Client
```bash
npm run prisma:generate
```

### 4. Run Database Migration
This creates all tables automatically:
```bash
npm run prisma:migrate -- --name init
```

You should see:
```
✔ Your database is now in sync with your schema.
✔ Generated Prisma Client (v5.x.0)
```

### 5. Seed Demo Users
```bash
node scripts/seed.js
```

You should see:
```
Seed completed: {
  student: 'student@internx.demo',
  faculty: 'faculty@internx.demo',
  company: 'company@internx.demo'
}
```

### 6. Start the Backend Server
```bash
npm run dev
```

Server runs on `http://localhost:4000`

---

## Verify Installation

### Test Login (Demo Account)
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@internx.demo",
    "password": "Demo123!"
  }'
```

### Expected Response
```json
{
  "message": "Logged in successfully.",
  "user": {
    "id": 1,
    "name": "Aarav Student",
    "email": "student@internx.demo",
    "role": "STUDENT",
    "createdAt": "2026-08-16T..."
  }
}
```

---

## Troubleshooting

### "Can't reach database server at localhost:5432"
- PostgreSQL is not running
- **Windows**: Start PostgreSQL service via Services app
- **Docker**: Run `docker start internx-postgres`

### "password authentication failed"
- Wrong password in `.env` DATABASE_URL
- Check the password you set during PostgreSQL installation

### "Role 'postgres' does not exist"
- PostgreSQL is not fully installed
- Reinstall PostgreSQL from scratch

### "database 'internx' does not exist"
- Migration hasn't been run yet
- Run: `npm run prisma:migrate -- --name init`

---

## Files Created/Updated

- ✅ `backend/prisma/schema.prisma` - Database schema
- ✅ `backend/src/lib/prisma.js` - Prisma client initialization
- ✅ `backend/src/routes/auth.js` - Auth endpoints (Prisma-backed)
- ✅ `backend/src/middleware/authenticate.js` - Auth middleware (Prisma-backed)
- ✅ `backend/package.json` - Updated with Prisma dependencies
- ✅ `backend/.env` - Database configuration
- ✅ `backend/scripts/seed.js` - Demo user seeding
- ✅ `backend/API.md` - API documentation

---

## Next Steps After Setup Complete

1. Test all auth endpoints with the provided cURL examples
2. Verify role-based access control works
3. Create additional users as needed
4. Move to Phase 2 (internships, applications, etc.)

---

## Phase 1 Database Schema

The following tables are created:
- `User` - Authentication and user records
- `StudentProfile` - Student-specific details
- `FacultyProfile` - Faculty-specific details
- `CompanyProfile` - Company-specific details

See `API.md` for full schema documentation.
