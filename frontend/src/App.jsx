import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AuthPage, ForgotPasswordPage, RegisterPage } from './pages/AuthPages'
import { PublicVerifyPage } from './pages/PublicVerifyPage'
import { StudentPortal } from './pages/StudentPortal'
import { FacultyPortal } from './pages/FacultyPortal'
import { CompanyPortal } from './pages/CompanyPortal'
import { PortalLayout } from './layouts/PortalLayout'
import './App.css'

function Protected({ role, children }) { const { user, loading } = useAuth(); if (loading) return <div className="app-loading">Loading InternX…</div>; if (!user) return <Navigate to="/login" replace />; if (user.role !== role) return <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace />; return children }
function RoleArea({ role, children }) { return <Protected role={role}><PortalLayout>{children}</PortalLayout></Protected> }
export default function App(){ return <BrowserRouter><AuthProvider><Routes>
  <Route path="/" element={<Navigate to="/login" replace />} /><Route path="/login" element={<AuthPage />} /><Route path="/register" element={<RegisterPage />} /><Route path="/forgot-password" element={<ForgotPasswordPage />} /><Route path="/verify-certificate" element={<PublicVerifyPage />} />
  <Route path="/student/*" element={<RoleArea role="STUDENT"><StudentPortal /></RoleArea>} /><Route path="/faculty/*" element={<RoleArea role="FACULTY"><FacultyPortal /></RoleArea>} /><Route path="/company/*" element={<RoleArea role="COMPANY"><CompanyPortal /></RoleArea>} /><Route path="*" element={<Navigate to="/" replace />} />
</Routes></AuthProvider></BrowserRouter> }
