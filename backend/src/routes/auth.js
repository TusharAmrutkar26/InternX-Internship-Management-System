import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { createToken, setAuthCookie, clearAuthCookie } from '../auth.js'
import { authenticate } from '../middleware/authenticate.js'
import { studentIdentifier } from '../utils/identifiers.js'
import { userSummary } from '../utils/serializers.js'

const router = Router()
const registrationSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(100),
  email: z.string().trim().email('Enter a valid email address.').max(254),
  password: z.string().min(8, 'Password must be at least 8 characters.').max(128)
    .regex(/[a-z]/, 'Password must include a lowercase letter.')
    .regex(/[A-Z]/, 'Password must include an uppercase letter.')
    .regex(/[0-9]/, 'Password must include a number.'),
  role: z.enum(['STUDENT', 'COMPANY']),
  companyName: z.string().trim().min(2).max(150).optional(),
}).superRefine((value, context) => {
  if (value.role === 'COMPANY' && !value.companyName) {
    context.addIssue({ code: 'custom', path: ['companyName'], message: 'Company name is required for Company accounts.' })
  }
})

const loginSchema = z.object({ email: z.string().trim().email(), password: z.string().min(1).max(128) })

router.post('/register', async (request, response, next) => {
  try {
    const input = registrationSchema.parse(request.body)
    const email = input.email.toLowerCase()

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return response.status(409).json({ message: 'An account with this email already exists.' })
    }

    const passwordHash = await bcrypt.hash(input.password, 12)
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email,
        passwordHash,
        role: input.role,
        studentProfile: input.role === 'STUDENT' ? { create: { studentId: studentIdentifier() } } : undefined,
        companyProfile: input.role === 'COMPANY' ? { create: { companyName: input.companyName || '' } } : undefined,
      },
    })

    const accessToken = createToken(user)
    setAuthCookie(response, accessToken)
    return response.status(201).json({ message: 'Account created successfully.', accessToken, user: userSummary(user) })
  } catch (error) { next(error) }
})

router.post('/login', async (request, response, next) => {
  try {
    const input = loginSchema.parse(request.body)
    const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } })

    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      return response.status(401).json({ message: 'Invalid email or password.' })
    }

    if (!user.isActive) {
      return response.status(403).json({ message: 'This account has been disabled.' })
    }

    const accessToken = createToken(user)
    setAuthCookie(response, accessToken)
    return response.json({ message: 'Logged in successfully.', accessToken, user: userSummary(user) })
  } catch (error) { next(error) }
})

router.post('/logout', (request, response) => {
  clearAuthCookie(response)
  response.status(204).send()
})

router.get('/me', authenticate, (request, response) => response.json({ user: userSummary(request.user) }))

export default router
