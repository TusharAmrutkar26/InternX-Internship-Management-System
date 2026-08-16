import { api } from '../api/client'
export const applyToInternship=id=>api(`/internships/${id}/applications`,{method:'POST'})
export const updateApplication=(id,payload)=>api(`/applications/${id}`,{method:'PATCH',body:JSON.stringify(payload)})
