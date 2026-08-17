import { api } from '../api/client'
export const getStudents=()=>api('/faculty/students')
export const getFacultyAnalytics=()=>api('/analytics/overview')
export const verifyCertificate=payload=>api('/certificates/verify',{method:'POST',body:JSON.stringify(payload)})
