import { Router } from 'express'
import { z } from 'zod'
import { db } from '../database.js'
import { authenticate, authorize } from '../middleware/authenticate.js'

const router = Router()
router.use(authenticate, authorize('STUDENT'))

const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().email().max(254).optional(),
  studentId: z.string().trim().min(2).max(50).optional(),
  phone: z.string().trim().min(7).max(30).nullable().optional(),
  collegeName: z.string().trim().min(2).max(150).nullable().optional(),
  course: z.string().trim().min(2).max(150).nullable().optional(),
  graduationYear: z.coerce.number().int().min(1950).max(2100).nullable().optional(),
  skills: z.string().trim().max(1000).optional(),
  bio: z.string().trim().max(2000).optional(),
  resumeUrl: z.string().trim().url().max(2048).nullable().optional(),
}).refine((value) => Object.keys(value).length > 0, { message: 'Provide at least one profile field to update.' })

const internshipQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  company: z.string().trim().max(150).optional(),
  location: z.string().trim().max(150).optional(),
  skills: z.string().trim().max(100).optional(),
  workMode: z.enum(['REMOTE', 'ONSITE', 'HYBRID']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

const applicationSchema = z.object({ coverLetter: z.string().trim().max(3000).optional().default('') })
const idSchema = z.coerce.number().int().positive()

function toProfile(row) {
  return {
    id: row.id,
    fullName: row.name,
    email: row.email,
    studentId: row.student_id,
    phone: row.phone,
    collegeName: row.college_name,
    course: row.course,
    graduationYear: row.graduation_year,
    skills: row.skills,
    bio: row.bio,
    resumeUrl: row.resume_url,
    updatedAt: row.updated_at,
  }
}

function toInternship(row, includeDescription = false) {
  const internship = {
    id: row.id,
    title: row.title,
    companyName: row.company_name,
    companyWebsite: row.website,
    companyLocation: row.company_location,
    location: row.location,
    workMode: row.work_mode,
    durationWeeks: row.duration_weeks,
    stipend: row.stipend,
    skills: row.skills,
    applicationDeadline: row.application_deadline,
    createdAt: row.created_at,
  }
  if (includeDescription) internship.description = row.description
  return internship
}

const internshipSelect = `
  SELECT i.*, ip.company_name, ip.website, ip.location AS company_location
  FROM internships i
  JOIN industry_profiles ip ON ip.id = i.industry_id
`

router.get('/profile', (request, response) => {
  const row = db.prepare(`
    SELECT u.id, u.name, u.email, sp.student_id, sp.phone, sp.college_name, sp.course,
           sp.graduation_year, sp.skills, sp.bio, sp.resume_url, sp.updated_at
    FROM users u JOIN student_profiles sp ON sp.user_id = u.id WHERE u.id = ?
  `).get(request.user.id)
  response.json({ profile: toProfile(row) })
})

router.patch('/profile', (request, response, next) => {
  try {
    const input = profileSchema.parse(request.body)
    const updateProfile = db.transaction(() => {
      if (input.email !== undefined || input.fullName !== undefined) {
        const name = input.fullName ?? request.user.name
        const email = input.email?.toLowerCase() ?? request.user.email
        const sameEmailOwner = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, request.user.id)
        if (sameEmailOwner) {
          const error = new Error('An account with this email already exists.')
          error.status = 409
          throw error
        }
        db.prepare("UPDATE users SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(name, email, request.user.id)
      }

      const fields = {
        student_id: input.studentId,
        phone: input.phone,
        college_name: input.collegeName,
        course: input.course,
        graduation_year: input.graduationYear,
        skills: input.skills,
        bio: input.bio,
        resume_url: input.resumeUrl,
      }
      const entries = Object.entries(fields).filter(([, value]) => value !== undefined)
      if (entries.length) {
        const assignment = entries.map(([column]) => `${column} = ?`).join(', ')
        db.prepare(`UPDATE student_profiles SET ${assignment}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`)
          .run(...entries.map(([, value]) => value), request.user.id)
      }
    })
    updateProfile()
    const row = db.prepare(`
      SELECT u.id, u.name, u.email, sp.student_id, sp.phone, sp.college_name, sp.course,
             sp.graduation_year, sp.skills, sp.bio, sp.resume_url, sp.updated_at
      FROM users u JOIN student_profiles sp ON sp.user_id = u.id WHERE u.id = ?
    `).get(request.user.id)
    response.json({ message: 'Profile updated successfully.', profile: toProfile(row) })
  } catch (error) { next(error) }
})

router.get('/internships', (request, response, next) => {
  try {
    const filters = internshipQuerySchema.parse(request.query)
    const clauses = ["i.status = 'PUBLISHED'"]
    const values = []
    if (filters.search) {
      clauses.push('(i.title LIKE ? OR i.description LIKE ? OR ip.company_name LIKE ?)')
      const pattern = `%${filters.search}%`
      values.push(pattern, pattern, pattern)
    }
    if (filters.company) { clauses.push('ip.company_name LIKE ?'); values.push(`%${filters.company}%`) }
    if (filters.location) { clauses.push('(i.location LIKE ? OR ip.location LIKE ?)'); values.push(`%${filters.location}%`, `%${filters.location}%`) }
    if (filters.skills) { clauses.push('i.skills LIKE ?'); values.push(`%${filters.skills}%`) }
    if (filters.workMode) { clauses.push('i.work_mode = ?'); values.push(filters.workMode) }
    values.push(filters.limit)
    const rows = db.prepare(`${internshipSelect} WHERE ${clauses.join(' AND ')} ORDER BY i.created_at DESC LIMIT ?`).all(...values)
    response.json({ internships: rows.map((row) => toInternship(row)), count: rows.length })
  } catch (error) { next(error) }
})

router.get('/internships/:internshipId', (request, response, next) => {
  try {
    const internshipId = idSchema.parse(request.params.internshipId)
    const row = db.prepare(`${internshipSelect} WHERE i.id = ? AND i.status = 'PUBLISHED'`).get(internshipId)
    if (!row) return response.status(404).json({ message: 'Internship not found or is not available.' })
    return response.json({ internship: toInternship(row, true) })
  } catch (error) { next(error) }
})

router.post('/internships/:internshipId/applications', (request, response, next) => {
  try {
    const internshipId = idSchema.parse(request.params.internshipId)
    const { coverLetter } = applicationSchema.parse(request.body)
    const student = db.prepare('SELECT id FROM student_profiles WHERE user_id = ?').get(request.user.id)
    const internship = db.prepare("SELECT id FROM internships WHERE id = ? AND status = 'PUBLISHED'").get(internshipId)
    if (!internship) return response.status(404).json({ message: 'Internship not found or is not available.' })
    const existing = db.prepare('SELECT id FROM applications WHERE internship_id = ? AND student_id = ?').get(internshipId, student.id)
    if (existing) return response.status(409).json({ message: 'You have already applied for this internship.' })
    const result = db.prepare('INSERT INTO applications (internship_id, student_id, cover_letter) VALUES (?, ?, ?)').run(internshipId, student.id, coverLetter)
    return response.status(201).json({
      message: 'Application submitted successfully.',
      application: { id: Number(result.lastInsertRowid), internshipId, status: 'PENDING', coverLetter },
    })
  } catch (error) { next(error) }
})

router.get('/applications', (request, response) => {
  const rows = db.prepare(`
    SELECT a.id, a.status, a.cover_letter, a.applied_at, a.updated_at,
           i.id AS internship_id, i.title, i.location, i.work_mode, i.duration_weeks, i.stipend,
           ip.company_name
    FROM applications a
    JOIN student_profiles sp ON sp.id = a.student_id
    JOIN internships i ON i.id = a.internship_id
    JOIN industry_profiles ip ON ip.id = i.industry_id
    WHERE sp.user_id = ? ORDER BY a.applied_at DESC
  `).all(request.user.id)
  response.json({ applications: rows.map((row) => ({
    id: row.id,
    status: row.status,
    coverLetter: row.cover_letter,
    appliedAt: row.applied_at,
    updatedAt: row.updated_at,
    interviewAt: row.interview_at,
    interviewNotes: row.interview_notes,
    offerDetails: row.offer_details,
    offerStatus: row.offer_status,
    completionStatus: row.completion_status,
    internship: {
      id: row.internship_id,
      title: row.title,
      companyName: row.company_name,
      location: row.location,
      workMode: row.work_mode,
      durationWeeks: row.duration_weeks,
      stipend: row.stipend,
    },
  })), count: rows.length })
})

router.patch('/applications/:applicationId/offer', (request,response,next)=>{try{const applicationId=idSchema.parse(request.params.applicationId);const {accept}=z.object({accept:z.boolean()}).parse(request.body);const student=db.prepare('SELECT id FROM student_profiles WHERE user_id=?').get(request.user.id);const r=db.prepare("UPDATE applications SET offer_status=?,completion_status=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND student_id=? AND offer_status='OFFERED'").run(accept?'ACCEPTED':'DECLINED',accept?'IN_PROGRESS':'NOT_STARTED',applicationId,student.id);if(!r.changes)return response.status(400).json({message:'There is no pending offer for this application.'});response.json({message:accept?'Offer accepted.':'Offer declined.'})}catch(e){next(e)}})

export default router
