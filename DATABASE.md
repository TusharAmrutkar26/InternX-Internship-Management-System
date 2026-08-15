# InternX MongoDB Day 1 foundation

## Database
- Database name: `internx`

## Collections

### `users`
Stores the shared auth/account record for all roles.

Fields:
- `_id`: Mongo ObjectId
- `name`: full display name
- `email`: unique login email, stored lowercase
- `password_hash`: bcrypt hash, never plain text
- `role`: one of `student`, `faculty`, or `company`
- `organization`: organization or institution name
- `is_verified`: boolean verification flag
- `created_at`: ISO date
- `updated_at`: ISO date

### `student_profiles`
Extends a student user with academic and profile details.

Fields:
- `user_id`: reference to `users._id`
- `student_id`: institution-generated student identifier
- `college`: college name
- `branch`: department or branch
- `year`: student year
- `skills`: skill array
- `profile_completion`: percentage value

### `company_profiles`
Extends a company user with marketing and verification data.

Fields:
- `user_id`: reference to `users._id`
- `company_name`: company display name
- `industry`: business domain
- `website`: company website or null
- `is_verified`: boolean verification state

### `internships`
Represents internship listings created by companies.

Fields:
- `company_id`: reference to `company_profiles._id`
- `title`: internship title
- `description`: detailed description
- `skills_required`: array of required skills
- `location`: work location
- `status`: internship lifecycle state
- `created_at`: ISO date

### `applications`
Tracks which student applied to which internship.

Fields:
- `student_id`: reference to `student_profiles._id`
- `internship_id`: reference to `internships._id`
- `status`: application state
- `applied_at`: ISO date

## Relationship overview
- `users` is the central auth table.
- `student_profiles.user_id` references a user with `role = student`.
- `company_profiles.user_id` references a user with `role = company`.
- `internships.company_id` references a company profile.
- `applications.student_id` and `applications.internship_id` connect individual students to specific internship posts.

## Indexes
Unique indexes:
- `users.email`
- `student_profiles.user_id`
- `company_profiles.user_id`

Useful query indexes:
- `internships.company_id`
- `internships.status`
- `applications.student_id`
- `applications.internship_id`

## Demo users
Only the user collection is seeded at this stage. Demo accounts are:
- `student@internx.demo`
- `faculty@internx.demo`
- `company@internx.demo`

All passwords are stored as `bcrypt` hashes, not plain text. The shared demo password is `Demo123!`.

## Mongo connection example
```js
import { MongoClient } from 'mongodb'

const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017')
const db = client.db(process.env.MONGODB_DB_NAME || 'internx')

await client.connect()
console.log('Connected to MongoDB:', db.databaseName)
```
