import { api } from '../api/client'
export const getInternships=()=>api('/internships')
export const getInternship=id=>api(`/internships/${id}`)
export const createInternship=payload=>api('/company/internships',{method:'POST',body:JSON.stringify(payload)})
