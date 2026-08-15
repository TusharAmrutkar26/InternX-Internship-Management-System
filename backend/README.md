# InternX backend

## Run locally

1. Copy `.env.example` to `.env` and set a long `JWT_SECRET`.
2. Run `npm install`.
3. Run `npm run dev`.

The API starts on `http://localhost:4000` and creates a persistent SQLite database at `data/internx.db` automatically. The development Admin account is seeded from `ADMIN_EMAIL` and `ADMIN_PASSWORD` (the sample values are for local development only).

## Database lifecycle

- `npm start` or `npm run dev` creates/migrates `backend/data/internx.db` automatically.
- `npm run seed` is safe and repeatable: it only inserts missing demo accounts/data and never removes existing records.
- `npm run reset-db` deletes only `backend/data/internx.db` and its SQLite WAL files, then a subsequent `npm run seed` (or start) creates a fresh demo database. Stop the backend before resetting.

The database is persistent; it is not frontend state or localStorage. The `data/` directory is intentionally git-ignored because it can contain real local data.

## Phase 1 endpoints

- `GET /api/health`
- `POST /api/auth/register` — accepts Student or Industry accounts
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

## Student endpoints

All Student endpoints require a logged-in Student cookie (or `Authorization: Bearer <token>`).

- `GET /api/students/profile`
- `PATCH /api/students/profile`
- `GET /api/students/internships?search=&company=&location=&skills=&workMode=`
- `GET /api/students/internships/:internshipId`
- `POST /api/students/internships/:internshipId/applications`
- `GET /api/students/applications`

## Academic, progress, evaluation, and certificate endpoints

- `GET|POST /api/students/academic-records`
- `PATCH|DELETE /api/students/academic-records/:recordId`
- `GET|POST /api/students/skills`
- `DELETE /api/students/skills/:skillId`
- `GET /api/students/applications/:applicationId/progress`
- `GET /api/students/certificates`
- `POST /api/industry/applications/:applicationId/progress`
- `PUT /api/industry/applications/:applicationId/evaluation`
- `POST /api/industry/applications/:applicationId/certificate` (selected applications only)
- `GET /api/public/certificates/:code` (public verification)
