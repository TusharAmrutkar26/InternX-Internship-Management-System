export function userSummary(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt }
}

export function internshipSummary(internship) {
  return {
    id: internship.id, title: internship.title, description: internship.description,
    location: internship.location, workMode: internship.workMode, durationWeeks: internship.durationWeeks,
    stipend: internship.stipend, skills: internship.requiredSkills,
    eligibilityCriteria: internship.eligibilityCriteria, applicationDeadline: internship.applicationDeadline,
    startDate: internship.startDate, endDate: internship.endDate, status: internship.status,
    createdAt: internship.createdAt,
    companyName: internship.company?.companyName,
    companyWebsite: internship.company?.website,
    companyLocation: internship.company?.location,
    companyVerified: internship.company?.isVerified,
  }
}
