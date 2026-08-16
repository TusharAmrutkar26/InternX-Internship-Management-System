import { prisma } from '../src/lib/prisma.js'
import bcrypt from 'bcryptjs'

async function main() {
  const demoPassword = await bcrypt.hash('Demo123!', 12)

  const student = await prisma.user.upsert({
    where: { email: 'student@internx.demo' },
    update: {},
    create: {
      name: 'Aarav Student',
      email: 'student@internx.demo',
      passwordHash: demoPassword,
      role: 'STUDENT',
      isActive: true,
      studentProfile: { create: { collegeName: 'InternX Academy', graduationYear: 2025 } },
    },
  })

  const faculty = await prisma.user.upsert({
    where: { email: 'faculty@internx.demo' },
    update: {},
    create: {
      name: 'Ishita Faculty',
      email: 'faculty@internx.demo',
      passwordHash: demoPassword,
      role: 'FACULTY',
      isActive: true,
      facultyProfile: { create: { department: 'Engineering', institution: 'InternX University' } },
    },
  })

  const company = await prisma.user.upsert({
    where: { email: 'company@internx.demo' },
    update: {},
    create: {
      name: 'TechNova HR',
      email: 'company@internx.demo',
      passwordHash: demoPassword,
      role: 'COMPANY',
      isActive: true,
      companyProfile: { create: { companyName: 'TechNova Labs', location: 'Bengaluru' } },
    },
  })

  console.log('Seed completed:', { student: student.email, faculty: faculty.email, company: company.email })
}

main().catch(console.error).finally(() => prisma.$disconnect())

