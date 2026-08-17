# InternX backend

InternX is a Node.js, Express, PostgreSQL, and Prisma REST API. It uses bcrypt password hashes, JWT bearer tokens/httpOnly cookies, and role-based access control for `STUDENT`, `FACULTY`, and `COMPANY` users.

## Local setup

1. Copy `.env.example` to `.env` and set a real PostgreSQL `DATABASE_URL` and a long `JWT_SECRET`.
2. Install packages with `npm install`.
3. Generate the client: `npm run prisma:generate`.
4. Apply migrations: `npm run prisma:migrate -- --name initial` for a new database, or `npx prisma migrate deploy` for an existing migrated environment.
5. Seed demo data: `npm run seed`.
6. Start the API: `npm run dev`.

The API listens on `http://localhost:4000`. The development seed accounts are `student@internx.demo`, `faculty@internx.demo`, and `company@internx.demo`; each uses `Demo123!`.

## Endpoint groups

- `/api/auth` — student/company registration, login, logout, current user
- `/api/students` — profiles, internship discovery, applications
- `/api/companies` and `/api/industry` — the company portal (`/industry` remains for frontend compatibility)
- `/api/faculty` — student monitoring, certificate/company verification, placements, analytics
- `/api/public/certificates/:code` — database-backed public certificate verification
- `/api/students/*` (mounted through `/api`) — academic records, skills, progress, submissions, certificates

All protected routes accept `Authorization: Bearer <accessToken>` or the secure `internx_token` cookie returned on login.
