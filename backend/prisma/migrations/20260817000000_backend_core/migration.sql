-- Complete the initial identity schema with the InternX workflow domain.
CREATE TYPE "WorkMode" AS ENUM ('REMOTE', 'ONSITE', 'HYBRID');
CREATE TYPE "InternshipStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'ACTIVE', 'COMPLETED');
CREATE TYPE "ApplicationStatus" AS ENUM ('APPLIED', 'SHORTLISTED', 'SELECTED', 'REJECTED');
CREATE TYPE "CompletionStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');
CREATE TYPE "Proficiency" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
CREATE TYPE "SubmissionStatus" AS ENUM ('NOT_SUBMITTED', 'SUBMITTED', 'APPROVED', 'REJECTED');
CREATE TYPE "CertificateStatus" AS ENUM ('VALID', 'INVALID');

UPDATE "StudentProfile"
SET "studentId" = CONCAT('STU-', LPAD("id"::text, 6, '0'))
WHERE "studentId" IS NULL;
ALTER TABLE "StudentProfile" ALTER COLUMN "studentId" SET NOT NULL;

UPDATE "CompanyProfile" SET "companyName" = 'Unnamed Company' WHERE "companyName" IS NULL;
ALTER TABLE "CompanyProfile" ALTER COLUMN "companyName" SET NOT NULL;
ALTER TABLE "CompanyProfile" ADD COLUMN "isSuspicious" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "Internship" (
  "id" SERIAL NOT NULL,
  "companyId" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "workMode" "WorkMode" NOT NULL,
  "durationWeeks" INTEGER NOT NULL,
  "stipend" INTEGER,
  "requiredSkills" TEXT NOT NULL DEFAULT '',
  "eligibilityCriteria" TEXT NOT NULL DEFAULT '',
  "applicationDeadline" TIMESTAMP(3),
  "startDate" TIMESTAMP(3),
  "endDate" TIMESTAMP(3),
  "status" "InternshipStatus" NOT NULL DEFAULT 'DRAFT',
  "isSuspicious" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Internship_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Application" (
  "id" SERIAL NOT NULL,
  "internshipId" INTEGER NOT NULL,
  "studentId" INTEGER NOT NULL,
  "coverLetter" TEXT NOT NULL DEFAULT '',
  "status" "ApplicationStatus" NOT NULL DEFAULT 'APPLIED',
  "interviewAt" TIMESTAMP(3),
  "interviewNotes" TEXT NOT NULL DEFAULT '',
  "offerDetails" TEXT NOT NULL DEFAULT '',
  "completionStatus" "CompletionStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "reportUrl" TEXT,
  "certificateFileUrl" TEXT,
  "certificateSubmissionStatus" "SubmissionStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AcademicRecord" (
  "id" SERIAL NOT NULL,
  "studentId" INTEGER NOT NULL,
  "institution" TEXT NOT NULL,
  "qualification" TEXT NOT NULL,
  "fieldOfStudy" TEXT,
  "startYear" INTEGER,
  "endYear" INTEGER,
  "grade" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AcademicRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StudentSkill" (
  "id" SERIAL NOT NULL,
  "studentId" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "proficiency" "Proficiency" NOT NULL DEFAULT 'BEGINNER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudentSkill_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InternshipProgress" (
  "id" SERIAL NOT NULL,
  "applicationId" INTEGER NOT NULL,
  "progressPercent" INTEGER NOT NULL,
  "note" TEXT NOT NULL DEFAULT '',
  "recordedByUserId" INTEGER NOT NULL,
  "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InternshipProgress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Certificate" (
  "id" SERIAL NOT NULL,
  "certificateCode" TEXT NOT NULL,
  "applicationId" INTEGER NOT NULL,
  "issuedByUserId" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "qrPayload" TEXT NOT NULL,
  "status" "CertificateStatus" NOT NULL DEFAULT 'VALID',
  "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PlacementRecord" (
  "id" SERIAL NOT NULL,
  "studentId" INTEGER NOT NULL,
  "companyName" TEXT NOT NULL,
  "roleTitle" TEXT NOT NULL,
  "placementDate" TIMESTAMP(3),
  "notes" TEXT NOT NULL DEFAULT '',
  "recordedByUserId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PlacementRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Evaluation" (
  "id" SERIAL NOT NULL,
  "applicationId" INTEGER NOT NULL,
  "rating" INTEGER NOT NULL,
  "feedback" TEXT NOT NULL,
  "evaluatorUserId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Application_internshipId_studentId_key" ON "Application"("internshipId", "studentId");
CREATE UNIQUE INDEX "StudentSkill_studentId_name_key" ON "StudentSkill"("studentId", "name");
CREATE UNIQUE INDEX "Certificate_certificateCode_key" ON "Certificate"("certificateCode");
CREATE UNIQUE INDEX "Certificate_applicationId_key" ON "Certificate"("applicationId");
CREATE UNIQUE INDEX "Certificate_qrPayload_key" ON "Certificate"("qrPayload");
CREATE UNIQUE INDEX "Evaluation_applicationId_key" ON "Evaluation"("applicationId");
CREATE INDEX "StudentProfile_collegeName_idx" ON "StudentProfile"("collegeName");
CREATE INDEX "CompanyProfile_isVerified_isSuspicious_idx" ON "CompanyProfile"("isVerified", "isSuspicious");
CREATE INDEX "Internship_companyId_status_idx" ON "Internship"("companyId", "status");
CREATE INDEX "Internship_status_applicationDeadline_idx" ON "Internship"("status", "applicationDeadline");
CREATE INDEX "Application_studentId_status_idx" ON "Application"("studentId", "status");
CREATE INDEX "Application_internshipId_status_idx" ON "Application"("internshipId", "status");
CREATE INDEX "AcademicRecord_studentId_endYear_idx" ON "AcademicRecord"("studentId", "endYear");
CREATE INDEX "InternshipProgress_applicationId_recordedAt_idx" ON "InternshipProgress"("applicationId", "recordedAt");
CREATE INDEX "PlacementRecord_studentId_placementDate_idx" ON "PlacementRecord"("studentId", "placementDate");

-- Preserve legacy comma-separated student skills before removing the obsolete column.
INSERT INTO "StudentSkill" ("studentId", "name", "proficiency")
SELECT profile."id", BTRIM(skill), 'BEGINNER'::"Proficiency"
FROM "StudentProfile" AS profile
CROSS JOIN LATERAL regexp_split_to_table(profile."skills", '\\s*,\\s*') AS skill
WHERE BTRIM(skill) <> ''
ON CONFLICT ("studentId", "name") DO NOTHING;
ALTER TABLE "StudentProfile" DROP COLUMN "skills";

ALTER TABLE "Internship" ADD CONSTRAINT "Internship_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "CompanyProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Application" ADD CONSTRAINT "Application_internshipId_fkey" FOREIGN KEY ("internshipId") REFERENCES "Internship"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Application" ADD CONSTRAINT "Application_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AcademicRecord" ADD CONSTRAINT "AcademicRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentSkill" ADD CONSTRAINT "StudentSkill_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InternshipProgress" ADD CONSTRAINT "InternshipProgress_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InternshipProgress" ADD CONSTRAINT "InternshipProgress_recordedByUserId_fkey" FOREIGN KEY ("recordedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_issuedByUserId_fkey" FOREIGN KEY ("issuedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_evaluatorUserId_fkey" FOREIGN KEY ("evaluatorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PlacementRecord" ADD CONSTRAINT "PlacementRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlacementRecord" ADD CONSTRAINT "PlacementRecord_recordedByUserId_fkey" FOREIGN KEY ("recordedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
