import { useState } from 'react'
import './index.css'
import './App.css'

import { EtabProvider } from './store/etablissementContext'
import { StoreProvider } from './store/appStore'
import { ProfileProvider } from './store/profileStore'
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

function AdminApp({
  etabType,
  onLogout,
}: {
  etabType: EtablissementType
  onLogout: () => void
}) {
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
    // ── Isolation complète par type d'établissement ──
    // EtabProvider  → fournit promos/matières selon le type
    // StoreProvider → isole users/générations/documents par espace
    <EtabProvider type={etabType}>
      <StoreProvider etabType={etabType}>
        <ProfileProvider type={etabType}>
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
        </ProfileProvider>
      </StoreProvider>
    </EtabProvider>
  )
}

export default function App() {
  const [session, setSession] = useState<{
    logged: boolean
    type: EtablissementType | null
  }>({ logged: false, type: null })

  if (!session.logged || !session.type) {
    return <Login onLogin={(type) => setSession({ logged: true, type })} />
  }

  return (
    <AdminApp
      etabType={session.type}
      onLogout={() => setSession({ logged: false, type: null })}
    />
  )
}
