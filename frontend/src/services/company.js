import { api } from '../api/client'
export const getCompanyProfile=()=>api('/company/profile')
export const updateCompanyProfile=payload=>api('/company/profile',{method:'PATCH',body:JSON.stringify(payload)})
export const getCompanyApplications=()=>api('/company/applications')
