import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db, generateStudentId } from '../database.js'
import { createToken, setAuthCookie, clearAuthCookie } from '../auth.js'
import { authenticate } from '../middleware/authenticate.js'

const router = Router()
const registrationSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(100),
  email: z.string().trim().email('Enter a valid email address.').max(254),
  password: z.string().min(8, 'Password must be at least 8 characters.').max(128),
  role: z.enum(['STUDENT', 'INDUSTRY']),
  companyName: z.string().trim().min(2).max(150).optional(),
}).superRefine((value, context) => {
  if (value.role === 'INDUSTRY' && !value.companyName) context.addIssue({ code: 'custom', path: ['companyName'], message: 'Company name is required for Industry accounts.' })
})

const loginSchema = z.object({ email: z.string().trim().email(), password: z.string().min(1).max(128) })

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.created_at }
}

router.post('/register', async (request, response, next) => {
  try {
    const input = registrationSchema.parse(request.body)
    const email = input.email.toLowerCase()
    if (db.prepare('SELECT id FROM users WHERE email = ?').get(email)) return response.status(409).json({ message: 'An account with this email already exists.' })
    const passwordHash = await bcrypt.hash(input.password, 12)
    const createAccount = db.transaction(() => {
      const result = db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)').run(input.name, email, passwordHash, input.role)
      if (input.role === 'STUDENT') {
        const studentId = generateStudentId()
        db.prepare('INSERT INTO student_profiles (user_id, student_id) VALUES (?, ?)').run(result.lastInsertRowid, studentId)
      } else {
        db.prepare('INSERT INTO industry_profiles (user_id, company_name) VALUES (?, ?)').run(result.lastInsertRowid, input.companyName)
      }
      return db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(result.lastInsertRowid)
    })
    const user = createAccount()
    setAuthCookie(response, createToken(user))
    return response.status(201).json({ message: 'Account created successfully.', user: publicUser(user) })
  } catch (error) { next(error) }
})

router.post('/login', async (request, response, next) => {
  try {
    const input = loginSchema.parse(request.body)
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(input.email.toLowerCase())
    if (!user || !(await bcrypt.compare(input.password, user.password_hash))) return response.status(401).json({ message: 'Invalid email or password.' })
    if (!user.is_active) return response.status(403).json({ message: 'This account has been disabled.' })
    setAuthCookie(response, createToken(user))
    return response.json({ message: 'Logged in successfully.', user: publicUser(user) })
  } catch (error) { next(error) }
})

router.post('/logout', (request, response) => {
  clearAuthCookie(response)
  response.status(204).send()
})

router.get('/me', authenticate, (request, response) => response.json({ user: publicUser(request.user) }))

export default router
