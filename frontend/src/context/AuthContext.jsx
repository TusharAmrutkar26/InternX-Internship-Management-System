/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as auth from '../services/auth'
const AuthContext = createContext(null)
export function AuthProvider({children}){const [user,setUser]=useState(null),[loading,setLoading]=useState(true);useEffect(()=>{auth.me().then(({user:currentUser})=>setUser(currentUser)).catch(()=>setUser(null)).finally(()=>setLoading(false))},[]);const login=useCallback(async(email,password)=>{const result=await auth.login(email,password);setUser(result.user);return result.user},[]);const register=useCallback(async payload=>{const result=await auth.register(payload);setUser(result.user);return result.user},[]);const logout=useCallback(async()=>{try{await auth.logout()}finally{setUser(null)}},[]);const value=useMemo(()=>({user,loading,isAuthenticated:Boolean(user),login,register,logout}),[user,loading,login,register,logout]);return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>}
export const useAuth=()=>useContext(AuthContext)
