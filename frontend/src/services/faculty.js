import { api } from '../api/client'
export const getStudents=()=>api('/faculty/students')
export const getFacultyAnalytics=()=>api('/faculty/analytics')
export const getFacultyProfile=()=>api('/faculty/profile')
export const updateFacultyProfile=payload=>api('/faculty/profile',{method:'PATCH',body:JSON.stringify(payload)})
export const verifyCertificate=payload=>api('/certificates/verify',{method:'POST',body:JSON.stringify(payload)})
