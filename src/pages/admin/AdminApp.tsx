/**
 * AdminApp — panneau admin intégré dans le frontend unifié
 * Reçoit l'utilisateur connecté depuis AuthContext (unified)
 * et gère la navigation interne admin
 */

import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { EtabProvider } from '../../store/etablissementContext'
import type { EtablissementType } from '../../data/etablissements'

import Sidebar from '../../components/admin/Sidebar'
import Topbar  from '../../components/admin/Topbar'
import Dashboard   from './Dashboard'
import Users       from './Users'
import Matieres    from './Matieres'
import Promos      from './Promos'
import Associations from './Associations'
import Archives    from './Archives'
import Profile     from './Profile'

type Page = 'dashboard' | 'users' | 'matieres' | 'promos' | 'associations' | 'archives' | 'profile'

export default function AdminApp() {
  const { user, logout } = useAuth()
  const [activePage, setActivePage] = useState<Page>('dashboard')

  const etabType = (user?.etablissementType ?? 'cycle_ing') as EtablissementType

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
          onLogout={logout}
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
