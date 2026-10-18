import { useRef, useState } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import logo from "../../assets/exocraft-logo.svg"

const BASE_ITEMS = [
  { path: "/dashboard", page: "dashboard", icon: "★",  label: "Tableau de bord" },
  { path: "/ai",        page: "ai",        icon: "🤖", label: "Assistant IA" },
  { path: "/quiz",      page: "quiz",      icon: "📝", label: "Mes Exercices" },
  { path: "/contents",  page: "contents",  icon: "📚", label: "Mes Cours" },
  { path: "/archives",  page: "archives",  icon: "🗄", label: "Archives" },
]

export default function DashboardLayout({ children, activePage, groups = [], selectedGroup = null, onSelectGroup }) {
  const navigate  = useNavigate()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButton = useRef(null)

  const signOut = () => {
    logout()
    navigate("/login", { replace: true })
  }

  const closeMenu = () => {
    setMenuOpen(false)
    menuButton.current?.focus()
  }

  const navigation = (mobile = false) => (
    <>
      <p className="sidebar-title">MENU PRINCIPAL</p>
      <nav className="sidebar-menu" aria-label="Navigation principale">
        {BASE_ITEMS.map(({ path, page, icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `sidebar-item${isActive || activePage === page ? " active" : ""}`}
            onClick={mobile ? closeMenu : undefined}
          >
            <span className="sidebar-icon" aria-hidden="true">{icon}</span>
            <span className="sidebar-text">{label}</span>
          </NavLink>
        ))}
      </nav>

      {groups.length > 0 && (
        <div className="sidebar-groups" aria-label="Classes et sections">
          <p className="sidebar-title">MES CLASSES</p>
          <button
            type="button"
            className={`sidebar-group-button${selectedGroup === "all" ? " active" : ""}`}
            onClick={() => { onSelectGroup?.("all"); if (mobile) closeMenu() }}
          >
            Toutes les classes
          </button>
          {groups.map((group) => {
            const key = `${group.className} / ${group.section}`
            const isActive = selectedGroup?.className === group.className && selectedGroup?.section === group.section
            return (
              <button
                key={key}
                type="button"
                className={`sidebar-group-button${isActive ? " active" : ""}`}
                onClick={() => { onSelectGroup?.(group); if (mobile) closeMenu() }}
              >
                <span>{group.className}</span>
                <small>{group.section}</small>
              </button>
            )
          })}
        </div>
      )}

      <button type="button" className="sidebar-item sidebar-logout" onClick={signOut}>
        <span className="sidebar-icon" aria-hidden="true">↩</span>
        <span className="sidebar-text">Se déconnecter</span>
      </button>
    </>
  )

  return (
    <div className="dashboard-page" onKeyDown={(e) => { if (menuOpen && e.key === "Escape") closeMenu() }}>
      <a className="skip-link" href="#main-content">Aller au contenu</a>

      <aside className="sidebar" aria-label="Menu latéral">
        <Link to="/dashboard" className="sidebar-logo" aria-label="ExoCraft — Tableau de bord">
          <img src={logo} alt="ExoCraft" className="exocraft-logo" />
        </Link>
        <div className="sidebar-section">{navigation()}</div>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="dashboard-topbar-brand">
            <button
              ref={menuButton}
              type="button"
              className="dashboard-menu-toggle"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span aria-hidden="true">{menuOpen ? "✕" : "☰"}</span>
            </button>
            <Link to="/dashboard" className="dashboard-brand-link">ExoCraft</Link>
            {selectedGroup && selectedGroup !== "all" && (
              <span className="dashboard-context-breadcrumb">
                {selectedGroup.className} / {selectedGroup.section}
              </span>
            )}
          </div>
          <div className="dashboard-user">
            <div className="dashboard-user-info">
              <span className="dashboard-user-label">ESPACE ENSEIGNANT</span>
              <span className="dashboard-user-email" title={user?.email}>
                {user?.email || "Utilisateur"}
              </span>
            </div>
            <Link to="/settings" className="dashboard-user-avatar" aria-label="Mon profil et mes paramètres">
              {user?.email ? user.email.charAt(0).toUpperCase() : "U"}
            </Link>
          </div>
        </header>

        <div id="mobile-navigation" className="dashboard-mobile-menu" hidden={!menuOpen}>
          {navigation(true)}
        </div>

        <main id="main-content" className="dashboard-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  )
}
