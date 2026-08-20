import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { authenticate, authorize } from '../middleware/authenticate.js'
import { internshipSummary } from '../utils/serializers.js'

const router = Router()
router.use(authenticate, authorize('STUDENT'))
const id = z.coerce.number().int().positive()
const profileSchema = z.object({ name: z.string().trim().min(2).max(100).optional(), email: z.string().trim().email().max(254).optional(), phone: z.string().trim().min(7).max(30).nullable().optional(), collegeName: z.string().trim().min(2).max(150).nullable().optional(), course: z.string().trim().min(2).max(150).nullable().optional(), graduationYear: z.coerce.number().int().min(1950).max(2100).nullable().optional(), bio: z.string().trim().max(2000).optional(), resumeUrl: z.string().trim().url().max(2048).nullable().optional() }).refine((value) => Object.keys(value).length > 0, 'Provide at least one profile field to update.')
const querySchema = z.object({ search: z.string().trim().max(100).optional(), company: z.string().trim().max(150).optional(), location: z.string().trim().max(150).optional(), skills: z.string().trim().max(100).optional(), workMode: z.enum(['REMOTE', 'ONSITE', 'HYBRID']).optional(), limit: z.coerce.number().int().min(1).max(100).default(50) })
const applicationSchema = z.object({ coverLetter: z.string().trim().max(3000).optional().default('') })

async function currentStudent(userId) {
  const profile = await prisma.studentProfile.findUnique({ where: { userId } })
  if (!profile) { const error = new Error('Student profile was not found.'); error.status = 404; throw error }
  return profile
}
function studentProfile(user, profile) { return { id: user.id, fullName: user.name, email: user.email, studentId: profile.studentId, phone: profile.phone, collegeName: profile.collegeName, course: profile.course, graduationYear: profile.graduationYear, bio: profile.bio, resumeUrl: profile.resumeUrl, updatedAt: profile.updatedAt } }

router.get('/profile', async (request, response, next) => { try { const user = await prisma.user.findUnique({ where: { id: request.user.id }, include: { studentProfile: true } }); response.json({ profile: studentProfile(user, user.studentProfile) }) } catch (error) { next(error) } })
router.patch('/profile', async (request, response, next) => {
  try {
    const input = profileSchema.parse(request.body); const profile = await currentStudent(request.user.id); const userData = {}; const profileData = {}
    if (input.name !== undefined) userData.name = input.name
    if (input.email !== undefined) userData.email = input.email.toLowerCase()
    for (const key of ['phone', 'collegeName', 'course', 'graduationYear', 'bio', 'resumeUrl']) if (input[key] !== undefined) profileData[key] = input[key]
    const [user, updatedProfile] = await prisma.$transaction([Object.keys(userData).length ? prisma.user.update({ where: { id: request.user.id }, data: userData }) : prisma.user.findUnique({ where: { id: request.user.id } }), Object.keys(profileData).length ? prisma.studentProfile.update({ where: { id: profile.id }, data: profileData }) : prisma.studentProfile.findUnique({ where: { id: profile.id } })])
    response.json({ message: 'Profile updated successfully.', profile: studentProfile(user, updatedProfile) })
  } catch (error) { next(error) }
})
router.get('/internships', async (request, response, next) => {
  try {
    const filters = querySchema.parse(request.query); const and = [{ status: 'OPEN' }]
    if (filters.search) and.push({ OR: [{ title: { contains: filters.search, mode: 'insensitive' } }, { description: { contains: filters.search, mode: 'insensitive' } }] })
    if (filters.company) and.push({ company: { companyName: { contains: filters.company, mode: 'insensitive' } } })
    if (filters.location) and.push({ location: { contains: filters.location, mode: 'insensitive' } })
    if (filters.skills) and.push({ requiredSkills: { contains: filters.skills, mode: 'insensitive' } })
    if (filters.workMode) and.push({ workMode: filters.workMode })
    const internships = await prisma.internship.findMany({ where: { AND: and }, include: { company: true }, orderBy: { createdAt: 'desc' }, take: filters.limit })
    response.json({ internships: internships.map(internshipSummary), count: internships.length })
  } catch (error) { next(error) }
})
router.get('/internships/:internshipId', async (request, response, next) => { try { const internship = await prisma.internship.findFirst({ where: { id: id.parse(request.params.internshipId), status: 'OPEN' }, include: { company: true } }); if (!internship) return response.status(404).json({ message: 'Internship not found or is not open.' }); response.json({ internship: internshipSummary(internship) }) } catch (error) { next(error) } })
router.post('/internships/:internshipId/applications', async (request, response, next) => { try { const student = await currentStudent(request.user.id); const internshipId = id.parse(request.params.internshipId); const { coverLetter } = applicationSchema.parse(request.body); const internship = await prisma.internship.findFirst({ where: { id: internshipId, status: 'OPEN' } }); if (!internship) return response.status(404).json({ message: 'Internship not found or is not open.' }); if (internship.applicationDeadline && internship.applicationDeadline < new Date()) return response.status(400).json({ message: 'The application deadline has passed.' }); const application = await prisma.application.create({ data: { internshipId, studentId: student.id, coverLetter } }); response.status(201).json({ message: 'Application submitted successfully.', application }) } catch (error) { next(error) } })
router.get('/applications', async (request, response, next) => { try { const applications = await prisma.application.findMany({ where: { student: { userId: request.user.id } }, include: { internship: { include: { company: true } }, certificate: true }, orderBy: { createdAt: 'desc' } }); response.json({ applications: applications.map((application) => ({ ...application, internship: internshipSummary(application.internship) })), count: applications.length }) } catch (error) { next(error) } })

export default router
