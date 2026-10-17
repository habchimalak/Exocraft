import { useState } from 'react'
import './index.css'
import './App.css'

import { AuthProvider, useAuth } from './store/authContext'
import { EtabProvider } from './store/etablissementContext'
import type { EtablissementType } from './data/etablissements'

import Login from './pages/Login'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Matieres from './pages/Matieres'
import Promos from './pages/Promos'
import Associations from './pages/Associations'
import Archives from './pages/Archives'
import Profile from './pages/Profile'

type Page = 'dashboard' | 'users' | 'matieres' | 'promos' | 'associations' | 'archives' | 'profile'

function AdminApp({ etabType, onLogout }: { etabType: EtablissementType; onLogout: () => void }) {
  const [activePage, setActivePage] = useState<Page>('dashboard')

  function renderPage() {
    switch (activePage) {
      case 'dashboard':    return <Dashboard />
      case 'users':        return <Users />
      case 'matieres':     return <Matieres />
      case 'promos':       return <Promos />
      case 'associations': return <Associations />
      case 'archives':     return <Archives />
      case 'profile':      return <Profile />
      default:             return <Dashboard />
    }
  }

  return (
    <EtabProvider type={etabType}>
      <div className="app-layout">
        <Sidebar
          activePage={activePage}
          onNavigate={(p) => setActivePage(p as Page)}
          onLogout={onLogout}
        />
        <div className="main-content">
          <Topbar activePage={activePage} onNavigate={(p) => setActivePage(p as Page)} />
          <div className="page-content">
            {renderPage()}
          </div>
        </div>
      </div>
    </EtabProvider>
  )
}

function AppInner() {
  const { user, isLoading, logout } = useAuth()
  const [sessionType, setSessionType] = useState<EtablissementType | null>(null)

  // Restore session from stored user on load
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0f0c29',
      }}>
        <div style={{
          width: 40, height: 40, border: '3px solid rgba(108,92,231,0.3)',
          borderTopColor: '#6c5ce7', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const effectiveType = sessionType ?? (user?.etablissementType as EtablissementType | null)

  if (!user || !effectiveType) {
    return (
      <Login onLogin={(type) => setSessionType(type)} />
    )
  }

  return (
    <AdminApp
      etabType={effectiveType}
      onLogout={async () => {
        await logout()
        setSessionType(null)
      }}
    />
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
