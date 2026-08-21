import { api } from '../api/client'
export const getCompanyProfile=()=>api('/companies/profile')
export const updateCompanyProfile=payload=>api('/companies/profile',{method:'PATCH',body:JSON.stringify(payload)})
export const getCompanyApplications=()=>api('/companies/applications')
export const getCompanyDashboard=()=>api('/companies/dashboard')
export const getCompanyInternships=()=>api('/companies/internships')
