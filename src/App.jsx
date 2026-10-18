/**
 * App.jsx — Router unifié ExoCraft
 *
 * Solution A : Login universel → redirection par rôle
 *   /login       → page de connexion commune
 *   /register    → inscription enseignant
 *   /admin       → panneau admin (admin seulement)
 *   /dashboard   → espace enseignant (enseignant seulement)
 *   /ai, /quiz, /contents, /archives → pages enseignant
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// ── Page commune ──
import Login    from './pages/Login'
import Register from './pages/teacher/register'

// ── Pages enseignant (Rami) ──
import TeacherDashboard  from './pages/teacher/Dashboard'
import AiGenerator       from './pages/teacher/AiGenerator'
import QuizManager       from './pages/teacher/QuizManager'
import ContentManager    from './pages/teacher/ContentManager'
import ArchivesAdmin     from './pages/teacher/ArchivesAdmin'
import TeacherSettings   from './pages/teacher/Settings'

// ── Pages admin (Malak) ──
import AdminApp from './pages/admin/AdminApp'

// ── CSS ──
import './index.css'       // CSS admin
import './teacher.css'     // CSS enseignant (Rami)

// ── Guards ────────────────────────────────────────────────────────────────

/** Route protégée : redirige vers /login si pas connecté */
function PrivateRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

/** Route admin only : redirige si pas admin */
function AdminRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

/** Route enseignant only : redirige si admin */
function TeacherRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin') return <Navigate to="/admin" replace />
  return children
}

// ── App ────────────────────────────────────────────────────────────────────
function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* ── Racine : redirection selon rôle ── */}
      <Route path="/" element={
        user
          ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
          : <Navigate to="/login" replace />
      } />

      {/* ── Auth publique ── */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ── Admin panel (Malak) ── */}
      <Route path="/admin/*" element={
        <AdminRoute>
          <AdminApp />
        </AdminRoute>
      } />

      {/* ── Espace enseignant (Rami) ── */}
      <Route path="/dashboard" element={<TeacherRoute><TeacherDashboard /></TeacherRoute>} />
      <Route path="/ai"        element={<TeacherRoute><AiGenerator /></TeacherRoute>} />
      <Route path="/quiz"      element={<TeacherRoute><QuizManager /></TeacherRoute>} />
      <Route path="/contents"  element={<TeacherRoute><ContentManager /></TeacherRoute>} />
      <Route path="/archives"  element={<TeacherRoute><ArchivesAdmin /></TeacherRoute>} />
      <Route path="/settings"  element={<TeacherRoute><TeacherSettings /></TeacherRoute>} />

      {/* ── Fallback ── */}
      <Route path="*" element={
        user
          ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
          : <Navigate to="/login" replace />
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
