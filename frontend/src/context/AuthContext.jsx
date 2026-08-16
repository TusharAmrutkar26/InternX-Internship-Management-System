/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react'
const AuthContext = createContext(null)
const demoUsers = { STUDENT:{name:'Som Chitte',role:'STUDENT',studentId:'SVKM-DS-2026-0042',course:'B.Tech Data Science',year:'3rd Year'}, FACULTY:{name:'Dr. Ananya Mehta',role:'FACULTY',department:'Data Science Department'}, COMPANY:{name:'Priya Shah',role:'COMPANY',company:'Nexora Technologies'} }
export function AuthProvider({children}){const [user,setUser]=useState(()=>{try{return JSON.parse(sessionStorage.getItem('internx-user'))}catch{return null}});const login=role=>{const next=demoUsers[role];setUser(next);sessionStorage.setItem('internx-user',JSON.stringify(next));return next};const logout=()=>{setUser(null);sessionStorage.removeItem('internx-user')};const value=useMemo(()=>({user,loading:false,isAuthenticated:Boolean(user),login,logout}),[user]);return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>}
export const useAuth=()=>useContext(AuthContext)
