# InternX API

Base URL: `http://localhost:4000/api`

Authentication responses include `accessToken` and set the `internx_token` httpOnly cookie. Supply the token as `Authorization: Bearer <accessToken>` for Postman requests.

## Authentication

- `POST /auth/register` — registers `STUDENT` or `COMPANY`; student IDs are generated permanently.
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

## Student

- `GET|PATCH /students/profile`
- `GET /students/internships` and `GET /students/internships/:internshipId`
- `POST /students/internships/:internshipId/applications`
- `GET /students/applications`
- `GET|POST /students/academic-records`, `PATCH|DELETE /students/academic-records/:recordId`
- `GET|POST /students/skills`, `DELETE /students/skills/:skillId`
- `GET|POST /students/applications/:applicationId/progress`
- `POST /students/applications/:applicationId/submission`
- `GET /students/certificates`

## Company

Use `/companies` (or the compatibility alias `/industry`).

- `GET|PATCH /companies/profile`
- `GET|POST /companies/internships`, `PATCH|DELETE /companies/internships/:internshipId`
- `PATCH /companies/internships/:internshipId/status|publish|unpublish`
- `GET /companies/applications`, `GET /companies/applications/:applicationId`
- `PATCH /companies/applications/:applicationId/status|interview|offer|completion`
- `POST /companies/applications/:applicationId/progress|certificate`
- `PUT /companies/applications/:applicationId/evaluation`
- `GET /companies/dashboard`

## Faculty and verification

- `GET /faculty/students?studentId=&search=` and `GET /faculty/students/:studentId`
- `GET /faculty/applications/:applicationId/progress`
- `GET /faculty/certificates/:code`, `PATCH /faculty/certificates/:code/status`
- `PATCH /faculty/companies/:companyId/verification`
- `POST /faculty/placements`, `GET /faculty/analytics`
- `GET /public/certificates/:code` returns `AUTHENTIC` or `INVALID` from the database.

Invalid payloads return `400`, unauthenticated calls return `401`, cross-role/ownership violations return `403` or `404`, conflicts return `409`, and unexpected errors return `500` without production internals.
