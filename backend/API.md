# InternX Phase 1 API Documentation

## Base URL
```
http://localhost:4000/api
```

## Authentication

### POST /auth/register
Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "STUDENT"
}
```

**Roles:** `STUDENT`, `FACULTY`, `COMPANY`

**Response (201 Created):**
```json
{
  "message": "Account created successfully.",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STUDENT",
    "createdAt": "2026-08-16T10:00:00Z"
  }
}
```

---

### POST /auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (200 OK):**
```json
{
  "message": "Logged in successfully.",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STUDENT",
    "createdAt": "2026-08-16T10:00:00Z"
  }
}
```

**Note:** JWT token is set as `internx_token` cookie (httpOnly).

---

### GET /auth/me
Get the current authenticated user.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STUDENT",
    "createdAt": "2026-08-16T10:00:00Z"
  }
}
```

**Error (401 Unauthorized):**
```json
{
  "message": "Authentication is required."
}
```

---

### POST /auth/logout
Clear the authentication session.

**Response (204 No Content)**

---

## Demo Accounts

Use these pre-seeded accounts to test authentication:

| Email | Password | Role |
|-------|----------|------|
| `student@internx.demo` | `Demo123!` | STUDENT |
| `faculty@internx.demo` | `Demo123!` | FACULTY |
| `company@internx.demo` | `Demo123!` | COMPANY |

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Validation error details"
}
```

### 401 Unauthorized
```json
{
  "message": "Invalid email or password."
}
```

### 403 Forbidden
```json
{
  "message": "This account has been disabled."
}
```

### 409 Conflict
```json
{
  "message": "An account with this email already exists."
}
```

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123",
    "role": "STUDENT"
  }'
```

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@internx.demo",
    "password": "Demo123!"
  }'
```

### Get Current User (with token)
```bash
curl -X GET http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### Logout
```bash
curl -X POST http://localhost:4000/api/auth/logout
```

---

## Database Schema (Phase 1)

### User Table
- `id` (INT, PK)
- `name` (VARCHAR)
- `email` (VARCHAR, UNIQUE)
- `passwordHash` (VARCHAR)
- `role` (ENUM: STUDENT, FACULTY, COMPANY)
- `isActive` (BOOLEAN)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

### StudentProfile Table
- `id` (INT, PK)
- `userId` (INT, FK)
- `studentId` (VARCHAR, UNIQUE)
- `collegeName` (VARCHAR)
- `course` (VARCHAR)
- `graduationYear` (INT)
- `skills` (TEXT)
- `bio` (TEXT)
- `phone` (VARCHAR)
- `resumeUrl` (VARCHAR)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

### FacultyProfile Table
- `id` (INT, PK)
- `userId` (INT, FK)
- `department` (VARCHAR)
- `designation` (VARCHAR)
- `institution` (VARCHAR)
- `phone` (VARCHAR)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

### CompanyProfile Table
- `id` (INT, PK)
- `userId` (INT, FK)
- `companyName` (VARCHAR)
- `website` (VARCHAR)
- `location` (VARCHAR)
- `description` (TEXT)
- `isVerified` (BOOLEAN)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

---

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up `.env` file with PostgreSQL connection:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/internx"
   JWT_SECRET="your-secret-key"
   ```

3. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

4. Run database migration:
   ```bash
   npm run prisma:migrate -- --name init
   ```

5. Seed demo users:
   ```bash
   node scripts/seed.js
   ```

6. Start server:
   ```bash
   npm run dev
   ```

Server runs on `http://localhost:4000`
