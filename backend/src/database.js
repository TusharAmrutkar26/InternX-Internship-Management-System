import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import bcrypt from 'bcryptjs'
import { config } from './config.js'

const require = createRequire(import.meta.url)
const Database = require('better-sqlite3')
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDirectory = path.resolve(__dirname, '..', 'data')
fs.mkdirSync(dataDirectory, { recursive: true })

export const db = new Database(path.join(dataDirectory, 'internx.db'))
db.pragma('foreign_keys = ON')
db.pragma('journal_mode = WAL')

export async function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('STUDENT', 'INDUSTRY', 'ADMIN')),
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS student_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      student_id TEXT UNIQUE,
      college_name TEXT,
      course TEXT,
      graduation_year INTEGER,
      skills TEXT NOT NULL DEFAULT '',
      bio TEXT NOT NULL DEFAULT '',
      phone TEXT,
      resume_url TEXT,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS industry_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      company_name TEXT NOT NULL,
      website TEXT,
      location TEXT,
      description TEXT NOT NULL DEFAULT '',
      is_verified INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS internships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      industry_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT NOT NULL,
      work_mode TEXT NOT NULL CHECK(work_mode IN ('REMOTE', 'ONSITE', 'HYBRID')),
      duration_weeks INTEGER NOT NULL,
      stipend INTEGER,
      skills TEXT NOT NULL DEFAULT '',
      eligibility_criteria TEXT NOT NULL DEFAULT '',
      application_deadline TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL' CHECK(status IN ('DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'REJECTED')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      interview_at TEXT,
      interview_notes TEXT NOT NULL DEFAULT '',
      offer_details TEXT NOT NULL DEFAULT '',
      offer_status TEXT NOT NULL DEFAULT 'NONE' CHECK(offer_status IN ('NONE','OFFERED','ACCEPTED','DECLINED')),
      completion_status TEXT NOT NULL DEFAULT 'NOT_STARTED' CHECK(completion_status IN ('NOT_STARTED','IN_PROGRESS','COMPLETED')),
      FOREIGN KEY (industry_id) REFERENCES industry_profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      internship_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      cover_letter TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'SHORTLISTED', 'REJECTED', 'SELECTED')),
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(internship_id, student_id),
      FOREIGN KEY (internship_id) REFERENCES internships(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS academic_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      institution TEXT NOT NULL,
      qualification TEXT NOT NULL,
      field_of_study TEXT,
      start_year INTEGER,
      end_year INTEGER,
      grade TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS student_skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      name TEXT NOT NULL COLLATE NOCASE,
      proficiency TEXT NOT NULL DEFAULT 'BEGINNER' CHECK(proficiency IN ('BEGINNER','INTERMEDIATE','ADVANCED')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, name),
      FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS internship_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER NOT NULL,
      progress_percent INTEGER NOT NULL DEFAULT 0 CHECK(progress_percent BETWEEN 0 AND 100),
      note TEXT NOT NULL DEFAULT '',
      recorded_by_user_id INTEGER NOT NULL,
      recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
      FOREIGN KEY (recorded_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
    );
    CREATE TABLE IF NOT EXISTS evaluations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER NOT NULL UNIQUE,
      rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      feedback TEXT NOT NULL,
      evaluator_user_id INTEGER NOT NULL,
      evaluated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
      FOREIGN KEY (evaluator_user_id) REFERENCES users(id) ON DELETE RESTRICT
    );
    CREATE TABLE IF NOT EXISTS certificates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      certificate_code TEXT NOT NULL UNIQUE,
      application_id INTEGER NOT NULL UNIQUE,
      issued_by_user_id INTEGER NOT NULL,
      issued_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      title TEXT NOT NULL,
      FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE RESTRICT,
      FOREIGN KEY (issued_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
    );
    CREATE TABLE IF NOT EXISTS certificate_verifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      certificate_id INTEGER NOT NULL,
      verification_status TEXT NOT NULL CHECK(verification_status IN ('VALID','REVOKED')),
      verified_by_user_id INTEGER,
      note TEXT NOT NULL DEFAULT '',
      verified_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (certificate_id) REFERENCES certificates(id) ON DELETE CASCADE,
      FOREIGN KEY (verified_by_user_id) REFERENCES users(id) ON DELETE SET NULL
    );
    CREATE TABLE IF NOT EXISTS moderation_actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_user_id INTEGER NOT NULL,
      target_type TEXT NOT NULL CHECK(target_type IN ('INTERNSHIP','USER','CERTIFICATE')),
      target_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE RESTRICT
    );
    CREATE INDEX IF NOT EXISTS applications_student_id_idx ON applications(student_id);
    CREATE INDEX IF NOT EXISTS applications_internship_id_idx ON applications(internship_id);
    CREATE INDEX IF NOT EXISTS internships_industry_status_idx ON internships(industry_id,status);
    CREATE INDEX IF NOT EXISTS internships_status_idx ON internships(status);
    CREATE INDEX IF NOT EXISTS academic_records_student_id_idx ON academic_records(student_id);
    CREATE INDEX IF NOT EXISTS progress_application_id_idx ON internship_progress(application_id);
    CREATE INDEX IF NOT EXISTS moderation_target_idx ON moderation_actions(target_type,target_id);
  `)

  // SQLite does not add columns to existing tables through CREATE TABLE IF NOT EXISTS.
  // This keeps databases created during Phase 1 compatible with the Student module.
  const studentProfileColumns = db.prepare('PRAGMA table_info(student_profiles)').all().map((column) => column.name)
  if (!studentProfileColumns.includes('student_id')) {
    db.exec('ALTER TABLE student_profiles ADD COLUMN student_id TEXT')
    db.exec('CREATE UNIQUE INDEX IF NOT EXISTS student_profiles_student_id_unique ON student_profiles(student_id) WHERE student_id IS NOT NULL')
  }

  const addColumn = (table, column, definition) => {
    const columns = db.prepare(`PRAGMA table_info(${table})`).all().map((item) => item.name)
    if (!columns.includes(column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${definition}`)
  }
  addColumn('internships', 'eligibility_criteria', "eligibility_criteria TEXT NOT NULL DEFAULT ''")
  addColumn('applications', 'interview_at', 'interview_at TEXT')
  addColumn('applications', 'interview_notes', "interview_notes TEXT NOT NULL DEFAULT ''")
  addColumn('applications', 'offer_details', "offer_details TEXT NOT NULL DEFAULT ''")
  addColumn('applications', 'offer_status', "offer_status TEXT NOT NULL DEFAULT 'NONE'")
  addColumn('applications', 'completion_status', "completion_status TEXT NOT NULL DEFAULT 'NOT_STARTED'")

  const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(config.adminEmail)
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(config.adminPassword, 12)
    db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)')
      .run('InternX Administrator', config.adminEmail, passwordHash, 'ADMIN')
    console.log(`Seeded development admin: ${config.adminEmail}`)
  }

  const demoUsers = [
    ['Aarav Student', 'student1@internx.demo', 'STUDENT'], ['Diya Student', 'student2@internx.demo', 'STUDENT'],
    ['TechNova HR', 'industry1@internx.demo', 'INDUSTRY'], ['GreenLeaf HR', 'industry2@internx.demo', 'INDUSTRY'],
  ]
  for (const [name, email, role] of demoUsers) {
    if (!db.prepare('SELECT id FROM users WHERE email=?').get(email)) {
      const passwordHash = await bcrypt.hash('Demo@123', 12)
      const result = db.prepare('INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,?)').run(name,email,passwordHash,role)
      if (role === 'STUDENT') db.prepare('INSERT INTO student_profiles (user_id,student_id,college_name,course,graduation_year,skills,bio,phone) VALUES (?,?,?,?,?,?,?,?)').run(result.lastInsertRowid, email.startsWith('student1')?'STU-1001':'STU-1002','InternX College','Computer Science',2027,role==='STUDENT'?'React, JavaScript, SQL':'','InternX demo student','9876543210')
      else db.prepare('INSERT INTO industry_profiles (user_id,company_name,location,description,is_verified) VALUES (?,?,?,?,1)').run(result.lastInsertRowid,email.startsWith('industry1')?'TechNova Labs':'GreenLeaf Systems',email.startsWith('industry1')?'Bengaluru':'Pune','InternX demo company')
    }
  }
  if (!db.prepare('SELECT id FROM internships LIMIT 1').get()) {
    const tech = db.prepare('SELECT ip.id FROM industry_profiles ip JOIN users u ON u.id=ip.user_id WHERE u.email=?').get('industry1@internx.demo').id
    const green = db.prepare('SELECT ip.id FROM industry_profiles ip JOIN users u ON u.id=ip.user_id WHERE u.email=?').get('industry2@internx.demo').id
    const create = db.prepare('INSERT INTO internships (industry_id,title,description,location,work_mode,duration_weeks,stipend,skills,status) VALUES (?,?,?,?,?,?,?,?,?)')
    const internships = [[tech,'Frontend Developer Intern','Build polished React interfaces with our product team.','Bengaluru','HYBRID',12,18000,'React, JavaScript, CSS','PUBLISHED'],[tech,'Backend Node.js Intern','Help build reliable REST APIs and data services.','Remote','REMOTE',16,20000,'Node.js, Express, SQL','PUBLISHED'],[green,'Data Analyst Intern','Work with data pipelines and operational dashboards.','Pune','ONSITE',12,15000,'Python, SQL, Excel','PUBLISHED'],[green,'UX Design Intern','Design accessible workflow experiences for web products.','Remote','REMOTE',10,12000,'Figma, UX Research','PUBLISHED'],[tech,'Cloud Operations Intern','Assist with our cloud infrastructure and observability.','Bengaluru','HYBRID',14,18000,'Linux, Docker, AWS','PENDING_APPROVAL']]
    for (const row of internships) create.run(...row)
    const studentOne=db.prepare('SELECT id FROM student_profiles sp JOIN users u ON u.id=sp.user_id WHERE u.email=?').get('student1@internx.demo').id
    const studentTwo=db.prepare('SELECT id FROM student_profiles sp JOIN users u ON u.id=sp.user_id WHERE u.email=?').get('student2@internx.demo').id
    const ids=db.prepare('SELECT id FROM internships ORDER BY id').all().map(r=>r.id)
    db.prepare('INSERT INTO applications (internship_id,student_id,cover_letter,status) VALUES (?,?,?,?)').run(ids[0],studentOne,'Excited to contribute to TechNova.','SHORTLISTED')
    db.prepare('INSERT INTO applications (internship_id,student_id,cover_letter,status) VALUES (?,?,?,?)').run(ids[1],studentTwo,'I enjoy backend development.','PENDING')
    db.prepare('INSERT INTO applications (internship_id,student_id,cover_letter,status) VALUES (?,?,?,?)').run(ids[2],studentOne,'Data analysis is a core interest.','SELECTED')
  }
}
