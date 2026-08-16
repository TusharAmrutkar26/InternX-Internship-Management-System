import { api } from '../api/client'
export const verifyCertificate=payload=>api('/certificates/verify',{method:'POST',body:JSON.stringify(payload)})
export const getCertificate=id=>api(`/certificates/${id}`)
