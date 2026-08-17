import test from 'node:test'
import assert from 'node:assert/strict'
import app from '../src/app.js'
import { db } from '../src/database.js'

let server

async function waitForClose() {
  await new Promise((resolve) => setTimeout(resolve, 200))
}

async function startServer() {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error)
        else resolve()
      })
    })
  }
  await waitForClose()
  server = app.listen(4567)
}

async function stopServer() {
  if (!server) return
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error)
      else resolve()
    })
  })
  await waitForClose()
  server = undefined
}

test.before(async () => {
  await startServer()
})

test.after(async () => {
  await stopServer()
})

async function request(pathname, options = {}) {
  const baseUrl = 'http://127.0.0.1:4567'
  const { headers = {}, ...rest } = options
  const response = await fetch(`${baseUrl}${pathname}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  })

  const text = await response.text()
  let body = null
  if (text) {
    try { body = JSON.parse(text) } catch { body = text }
  }

  return { status: response.status, headers: response.headers, body }
}

async function registerUser({ name, email, password, role, companyName }) {
  const response = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role, companyName }),
  })

  const cookie = response.headers.get('set-cookie') || ''
  return { status: response.status, body: response.body, cookie }
}

async function loginUser(email, password) {
  const response = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  return { status: response.status, body: response.body, cookie: response.headers.get('set-cookie') || '' }
}

async function withAuth(cookie, pathname, options = {}) {
  return request(pathname, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Cookie: cookie,
    },
  })
}

test('auth, JWT, logout, and role boundaries work', async () => {
  const unique = Date.now()
  const student = await registerUser({ name: 'Auth Student', email: `authstudent.${unique}@example.com`, password: 'StrongPass123', role: 'STUDENT' })
  assert.equal(student.status, 201)

  const duplicate = await registerUser({ name: 'Auth Student', email: `authstudent.${unique}@example.com`, password: 'StrongPass123', role: 'STUDENT' })
  assert.equal(duplicate.status, 409)

  const invalidRegistration = await registerUser({ name: 'Bad', email: 'bad-email', password: 'short', role: 'STUDENT' })
  assert.equal(invalidRegistration.status, 400)

  const login = await loginUser(`authstudent.${unique}@example.com`, 'StrongPass123')
  assert.equal(login.status, 200)
  assert.ok(login.cookie)

  const wrongPassword = await loginUser(`authstudent.${unique}@example.com`, 'WrongPassword')
  assert.equal(wrongPassword.status, 401)

  const me = await withAuth(login.cookie, '/api/auth/me')
  assert.equal(me.status, 200)
  assert.equal(me.body.user.email, `authstudent.${unique}@example.com`)

  const missingToken = await request('/api/auth/me')
  assert.equal(missingToken.status, 401)

  const logout = await withAuth(login.cookie, '/api/auth/logout', { method: 'POST' })
  assert.equal(logout.status, 204)

  const blockedAfterLogout = await request('/api/auth/me')
  assert.equal(blockedAfterLogout.status, 401)

  const industry = await registerUser({ name: 'Auth Industry', email: `authindustry.${unique}@example.com`, password: 'StrongPass123', role: 'INDUSTRY', companyName: 'Auth Works' })
  assert.equal(industry.status, 201)

  const industryLogin = await loginUser(`authindustry.${unique}@example.com`, 'StrongPass123')
  assert.equal(industryLogin.status, 200)

  const studentForbidden = await withAuth(industryLogin.cookie, '/api/students/profile')
  assert.equal(studentForbidden.status, 403)

  const industryForbidden = await withAuth(student.cookie, '/api/industry/profile')
  assert.equal(industryForbidden.status, 403)
})

test('student profile, internship browse, application, records, skills, and certificate APIs work', async () => {
  const unique = Date.now() + 2
  const student = await registerUser({ name: 'Student API User', email: `studentapi.${unique}@example.com`, password: 'StrongPass123', role: 'STUDENT' })
  const industry = await registerUser({ name: 'Industry API User', email: `industryapi.${unique}@example.com`, password: 'StrongPass123', role: 'INDUSTRY', companyName: 'API Works' })
  assert.equal(student.status, 201)
  assert.equal(industry.status, 201)

  const studentCookie = student.cookie
  const industryCookie = industry.cookie

  const profileBefore = await withAuth(studentCookie, '/api/students/profile')
  assert.equal(profileBefore.status, 200)
  assert.ok(profileBefore.body.profile.studentId)

  const profileUpdate = await withAuth(studentCookie, '/api/students/profile', {
    method: 'PATCH',
    body: JSON.stringify({
      collegeName: 'North Campus',
      course: 'Computer Science',
      graduationYear: 2027,
      phone: '9876543210',
      skills: 'Node.js, Express, SQLite',
      bio: 'Backend-focused student developer.',
    }),
  })
  assert.equal(profileUpdate.status, 200)
  assert.equal(profileUpdate.body.profile.collegeName, 'North Campus')

  const internshipCreate = await withAuth(industryCookie, '/api/industry/internships', {
    method: 'POST',
    body: JSON.stringify({
      title: 'API Intern',
      description: 'Work with backend APIs and internal data services.',
      location: 'Remote',
      workMode: 'REMOTE',
      durationWeeks: 10,
      stipend: 15000,
      skills: 'Node.js, SQL, APIs',
      eligibilityCriteria: 'Must be a student with strong backend fundamentals.',
      applicationDeadline: '2026-12-31',
      status: 'PENDING_APPROVAL',
    }),
  })
  assert.equal(internshipCreate.status, 201)
  const internshipId = internshipCreate.body.internship.id

  const adminCookie = (await loginUser('admin@internx.local', 'Admin@123')).cookie
  const publish = await withAuth(adminCookie, `/api/admin/internships/${internshipId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'PUBLISHED' }),
  })
  assert.equal(publish.status, 200)

  const internshipList = await withAuth(studentCookie, '/api/students/internships?workMode=REMOTE&limit=10')
  assert.equal(internshipList.status, 200)
  assert.ok(Array.isArray(internshipList.body.internships))

  const internshipDetails = await withAuth(studentCookie, `/api/students/internships/${internshipId}`)
  assert.equal(internshipDetails.status, 200)
  assert.equal(internshipDetails.body.internship.id, internshipId)

  const apply = await withAuth(studentCookie, `/api/students/internships/${internshipId}/applications`, {
    method: 'POST',
    body: JSON.stringify({ coverLetter: 'I am excited to contribute to this project.' }),
  })
  assert.equal(apply.status, 201)
  const appId = apply.body.application.id

  const duplicateApply = await withAuth(studentCookie, `/api/students/internships/${internshipId}/applications`, {
    method: 'POST',
    body: JSON.stringify({ coverLetter: 'I am trying again.' }),
  })
  assert.equal(duplicateApply.status, 409)

  const myApplications = await withAuth(studentCookie, '/api/students/applications')
  assert.equal(myApplications.status, 200)
  assert.ok(myApplications.body.applications.some((item) => item.id === appId))

  const academicPost = await withAuth(studentCookie, '/api/students/academic-records', {
    method: 'POST',
    body: JSON.stringify({
      institution: 'North Campus',
      qualification: 'B.Tech',
      fieldOfStudy: 'Computer Science',
      startYear: 2023,
      endYear: 2027,
      grade: 'A',
    }),
  })
  assert.equal(academicPost.status, 201)
  const academicId = academicPost.body.id

  const academicList = await withAuth(studentCookie, '/api/students/academic-records')
  assert.equal(academicList.status, 200)
  assert.ok(academicList.body.records.some((record) => record.id === academicId))

  const academicPatch = await withAuth(studentCookie, `/api/students/academic-records/${academicId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      institution: 'North Campus',
      qualification: 'B.Tech',
      fieldOfStudy: 'Computer Science',
      startYear: 2023,
      endYear: 2027,
      grade: 'A+',
    }),
  })
  assert.equal(academicPatch.status, 200)

  const skillPost = await withAuth(studentCookie, '/api/students/skills', {
    method: 'POST',
    body: JSON.stringify({ name: 'Testing', proficiency: 'INTERMEDIATE' }),
  })
  assert.equal(skillPost.status, 201)
  const skillId = skillPost.body.id

  const skillsList = await withAuth(studentCookie, '/api/students/skills')
  assert.equal(skillsList.status, 200)
  assert.ok(skillsList.body.skills.some((item) => item.id === skillId))

  const deleteSkill = await withAuth(studentCookie, `/api/students/skills/${skillId}`, { method: 'DELETE' })
  assert.equal(deleteSkill.status, 204)

  const deleteAcademic = await withAuth(studentCookie, `/api/students/academic-records/${academicId}`, { method: 'DELETE' })
  assert.equal(deleteAcademic.status, 204)

  const invalidAcademic = await withAuth(studentCookie, '/api/students/academic-records', {
    method: 'POST',
    body: JSON.stringify({ institution: '', qualification: '' }),
  })
  assert.equal(invalidAcademic.status, 400)
})

test('industry lifecycle, application validation, admin moderation, and certificate verification work', async () => {
  const unique = Date.now() + 3
  const student = await registerUser({ name: 'Lifecycle Student', email: `lifecycle.${unique}@example.com`, password: 'StrongPass123', role: 'STUDENT' })
  const industry = await registerUser({ name: 'Lifecycle Industry', email: `lifecycleindustry.${unique}@example.com`, password: 'StrongPass123', role: 'INDUSTRY', companyName: 'Lifecycle Works' })
  const studentCookie = student.cookie
  const industryCookie = industry.cookie

  const industryProfile = await withAuth(industryCookie, '/api/industry/profile')
  assert.equal(industryProfile.status, 200)

  const createInternship = await withAuth(industryCookie, '/api/industry/internships', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Lifecycle Intern',
      description: 'Support product delivery and engineering operations end to end.',
      location: 'Hybrid',
      workMode: 'HYBRID',
      durationWeeks: 12,
      stipend: 20000,
      skills: 'Node.js, SQL, Process',
      eligibilityCriteria: 'Strong communication and systems skills.',
      applicationDeadline: '2026-12-31',
      status: 'PENDING_APPROVAL',
    }),
  })
  assert.equal(createInternship.status, 201)
  const internshipId = createInternship.body.internship.id

  const adminCookie = (await loginUser('admin@internx.local', 'Admin@123')).cookie
  const adminPublish = await withAuth(adminCookie, `/api/admin/internships/${internshipId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'PUBLISHED' }),
  })
  assert.equal(adminPublish.status, 200)

  const apply = await withAuth(studentCookie, `/api/students/internships/${internshipId}/applications`, {
    method: 'POST',
    body: JSON.stringify({ coverLetter: 'I want to work on a high-impact lifecycle project.' }),
  })
  assert.equal(apply.status, 201)
  const appId = apply.body.application.id

  const appList = await withAuth(industryCookie, '/api/industry/applications')
  assert.equal(appList.status, 200)
  assert.ok(appList.body.applications.some((item) => item.id === appId))

  const invalidStatusTransition = await withAuth(industryCookie, `/api/industry/applications/${appId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'COMPLETED' }),
  })
  assert.equal(invalidStatusTransition.status, 400)

  const shortlist = await withAuth(industryCookie, `/api/industry/applications/${appId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'SHORTLISTED' }),
  })
  assert.equal(shortlist.status, 200)

  const interview = await withAuth(industryCookie, `/api/industry/applications/${appId}/interview`, {
    method: 'PATCH',
    body: JSON.stringify({ interviewAt: '2026-09-10T10:00:00.000Z', interviewNotes: 'Round 1 technical discussion.' }),
  })
  assert.equal(interview.status, 200)

  const interviewResult = await withAuth(industryCookie, `/api/industry/applications/${appId}/interview-result`, {
    method: 'PATCH',
    body: JSON.stringify({ result: 'PASSED', notes: 'Strong technical fundamentals.' }),
  })
  assert.equal(interviewResult.status, 200)

  const selected = await withAuth(industryCookie, `/api/industry/applications/${appId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'SELECTED' }),
  })
  assert.equal(selected.status, 200)

  const offer = await withAuth(industryCookie, `/api/industry/applications/${appId}/offer`, {
    method: 'PATCH',
    body: JSON.stringify({ offerDetails: '12-week internship with stipend ₹20,000.' }),
  })
  assert.equal(offer.status, 200)

  const studentOffer = await withAuth(studentCookie, `/api/students/applications/${appId}/offer`, {
    method: 'PATCH',
    body: JSON.stringify({ accept: true }),
  })
  assert.equal(studentOffer.status, 200)

  const progressRecord = await withAuth(industryCookie, `/api/industry/applications/${appId}/progress`, {
    method: 'POST',
    body: JSON.stringify({ progressPercent: 90, note: 'Good progress in sprint work.' }),
  })
  assert.equal(progressRecord.status, 201)

  const evaluation = await withAuth(industryCookie, `/api/industry/applications/${appId}/evaluation`, {
    method: 'PUT',
    body: JSON.stringify({ rating: 5, feedback: 'Strong engineering and communication.' }),
  })
  assert.equal(evaluation.status, 200)

  const completion = await withAuth(industryCookie, `/api/industry/applications/${appId}/completion`, {
    method: 'PATCH',
    body: JSON.stringify({ completionStatus: 'COMPLETED' }),
  })
  assert.equal(completion.status, 200)

  const certificate = await withAuth(industryCookie, `/api/industry/applications/${appId}/certificate`, {
    method: 'POST',
  })
  assert.equal(certificate.status, 201)

  const verification = await request(`/api/public/certificates/${certificate.body.certificateCode}`)
  assert.equal(verification.status, 200)
  assert.equal(verification.body.certificate.certificate_code, certificate.body.certificateCode)

  const studentCertificates = await withAuth(studentCookie, '/api/students/certificates')
  assert.equal(studentCertificates.status, 200)
  assert.ok(studentCertificates.body.certificates.some((item) => item.certificate_code === certificate.body.certificateCode || item.id === certificate.body.id))

  const adminDashboard = await withAuth(adminCookie, '/api/admin/dashboard')
  assert.equal(adminDashboard.status, 200)
  assert.ok(adminDashboard.body.counts)

  const adminStudents = await withAuth(adminCookie, '/api/admin/students')
  assert.equal(adminStudents.status, 200)
  assert.ok(Array.isArray(adminStudents.body.students))

  const adminIndustries = await withAuth(adminCookie, '/api/admin/industries')
  assert.equal(adminIndustries.status, 200)
  assert.ok(Array.isArray(adminIndustries.body.industries))

  const adminApplications = await withAuth(adminCookie, '/api/admin/applications')
  assert.equal(adminApplications.status, 200)
  assert.ok(Array.isArray(adminApplications.body.applications))

  const progressFetch = await withAuth(studentCookie, `/api/students/applications/${appId}/progress`)
  assert.equal(progressFetch.status, 200)
  assert.ok(Array.isArray(progressFetch.body.progress))

  const persistedStatus = db.prepare('SELECT status, offer_status, completion_status FROM applications WHERE id = ?').get(appId)
  assert.equal(persistedStatus.status, 'COMPLETED')
  assert.equal(persistedStatus.offer_status, 'ACCEPTED')
  assert.equal(persistedStatus.completion_status, 'COMPLETED')
})

test('backend persists critical data across a server restart without corruption', async () => {
  const unique = Date.now() + 5
  const student = await registerUser({ name: 'Restart Student', email: `restart.${unique}@example.com`, password: 'StrongPass123', role: 'STUDENT' })
  assert.equal(student.status, 201)

  const cookie = student.cookie
  const beforeProfile = await withAuth(cookie, '/api/students/profile')
  assert.equal(beforeProfile.status, 200)
  assert.ok(beforeProfile.body.profile.studentId)

  await stopServer()
  await startServer()

  const loginAfterRestart = await loginUser(`restart.${unique}@example.com`, 'StrongPass123')
  assert.equal(loginAfterRestart.status, 200)

  const afterRestart = await withAuth(loginAfterRestart.cookie, '/api/students/profile')
  assert.equal(afterRestart.status, 200)
  assert.ok(afterRestart.body.profile.studentId)

  const health = await request('/api/health')
  assert.equal(health.status, 200)
  assert.deepEqual(health.body, { status: 'ok' })
})
