import { Link, useLocation } from "react-router-dom"

export default function Sidebar({ user, onLogout }) {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <aside className="sidebar">
      <Link to="/events" className="sidebar-brand">
        <span className="brand-mark">E</span>
        <span>Møteplass</span>
      </Link>

      <nav className="sidebar-nav" aria-label="Hovedmeny">
        <Link className={isActive("/events") ? "active" : ""} to="/events">
          <span className="sidebar-nav__icon" aria-hidden="true">E</span>
          Arrangementer
        </Link>
        <Link className={isActive("/profile") ? "active" : ""} to="/profile">
          <span className="sidebar-nav__icon" aria-hidden="true">P</span>
          Profil
        </Link>
        <Link
          className={`sidebar-create ${isActive("/create") ? "active" : ""}`}
          to="/create"
        >
          <span className="sidebar-nav__icon" aria-hidden="true">+</span>
          Opprett arrangement
        </Link>
      </nav>

      <div className={`sidebar-footer ${user ? "" : "sidebar-footer--login"}`}>
        {user ? (
          <>
            <div className="sidebar-user">
              <div className="sidebar-avatar">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                <strong>{user.name}</strong>
                <span>Arrangør</span>
              </div>
            </div>
            <button className="sidebar-logout" onClick={onLogout}>
              Logg ut
            </button>
          </>
        ) : (
          <Link to="/login" className="button-primary sidebar-login">
            Logg inn
          </Link>
        )}
      </div>
    </aside>
  )
}
