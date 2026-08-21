import { api } from '../api/client'

export const getStudentProfile = () => api('/students/profile')
export const getStudentApplications = () => api('/students/applications')
export const getStudentCertificates = () => api('/students/certificates')
export const getAcademicRecords = () => api('/students/academic-records')
export const createAcademicRecord = (payload) => api('/students/academic-records', { method: 'POST', body: JSON.stringify(payload) })

export function updateStudentProfile(payload) {
  const cleaned = Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== '' && value !== null && value !== undefined))
  if (cleaned.graduationYear !== undefined) cleaned.graduationYear = Number(cleaned.graduationYear)
  return api('/students/profile', { method: 'PATCH', body: JSON.stringify(cleaned) })
}
