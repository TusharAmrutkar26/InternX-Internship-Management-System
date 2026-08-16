import { api } from '../api/client'
export const getStudentProfile=()=>api('/students/profile')
export const updateStudentProfile=payload=>api('/students/profile',{method:'PATCH',body:JSON.stringify(payload)})
export const getStudentApplications=()=>api('/students/applications')
export const getStudentCertificates=()=>api('/students/certificates')
