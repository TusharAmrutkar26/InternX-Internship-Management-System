import bcrypt from 'bcryptjs'
import { prisma } from '../src/lib/prisma.js'

const passwordHash = await bcrypt.hash('Demo123!', 12)
async function user(data) {
  return prisma.user.upsert({ where: { email: data.email }, update: {}, create: { ...data, passwordHash } })
}

async function main() {
  const student = await user({ name: 'Aarav Student', email: 'student@internx.demo', role: 'STUDENT', studentProfile: { create: { studentId: 'STU-2026-DEMO01', collegeName: 'InternX Academy', course: 'Computer Science', graduationYear: 2027 } } })
  const faculty = await user({ name: 'Ishita Faculty', email: 'faculty@internx.demo', role: 'FACULTY', facultyProfile: { create: { department: 'Engineering', designation: 'Faculty Mentor', institution: 'InternX University' } } })
  const company = await user({ name: 'TechNova HR', email: 'company@internx.demo', role: 'COMPANY', companyProfile: { create: { companyName: 'TechNova Labs', location: 'Bengaluru', description: 'Product engineering internship partner.', isVerified: true } } })
  const companyProfile = await prisma.companyProfile.findUnique({ where: { userId: company.id } })
  await prisma.internship.upsert({ where: { id: 1 }, update: {}, create: { companyId: companyProfile.id, title: 'Backend Engineering Intern', description: 'Build secure, reliable APIs with the InternX engineering team.', location: 'Bengaluru', workMode: 'HYBRID', durationWeeks: 12, stipend: 18000, requiredSkills: 'Node.js, Express, PostgreSQL', eligibilityCriteria: 'Students with software development fundamentals.', status: 'OPEN' } })
  console.log('Seed completed:', { student: student.email, faculty: faculty.email, company: company.email })
}

main().catch((error) => { console.error(error); process.exitCode = 1 }).finally(() => prisma.$disconnect())
