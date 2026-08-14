import { Router } from 'express'
import { db } from '../database.js'
const router=Router()
router.get('/certificates/:code',(req,res)=>{const certificate=db.prepare(`SELECT c.certificate_code,c.title,c.issued_at,u.name student_name,i.title internship_title,(SELECT verification_status FROM certificate_verifications WHERE certificate_id=c.id ORDER BY verified_at DESC,id DESC LIMIT 1) status FROM certificates c JOIN applications a ON a.id=c.application_id JOIN student_profiles sp ON sp.id=a.student_id JOIN users u ON u.id=sp.user_id JOIN internships i ON i.id=a.internship_id WHERE c.certificate_code=?`).get(req.params.code);if(!certificate)return res.status(404).json({message:'Certificate not found.'});res.json({certificate})})
export default router
