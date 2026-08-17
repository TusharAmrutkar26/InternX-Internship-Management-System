import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

const router = Router()
router.get('/certificates/:code', async (req, res, next) => {
  try {
    const certificate = await prisma.certificate.findUnique({ where: { certificateCode: req.params.code }, include: { application: { include: { student: { include: { user: true } }, internship: { include: { company: true } } } } } })
    if (!certificate || certificate.status !== 'VALID') return res.status(404).json({ verification: 'INVALID', message: 'Certificate was not found or is invalid.' })
    res.json({ verification: 'AUTHENTIC', certificate: { certificateCode: certificate.certificateCode, title: certificate.title, issuedAt: certificate.issuedAt, studentName: certificate.application.student.user.name, studentId: certificate.application.student.studentId, internshipTitle: certificate.application.internship.title, companyName: certificate.application.internship.company.companyName, qrPayload: certificate.qrPayload } })
  } catch (error) { next(error) }
})
export default router
