import { Link, useLocation } from "react-router-dom"
import {
  CalendarDaysIcon,
  PlusIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline"

export default function Sidebar({ user, onLogout }) {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <aside className="sidebar">
      <Link to="/events" className="sidebar-brand">
        <span className="brand-mark">M</span>
        <span>Møteplass</span>
      </Link>

      <div className="sidebar-section-label">Arbeidsområde</div>
      <nav className="sidebar-nav" aria-label="Hovedmeny">
        <Link className={isActive("/events") ? "active" : ""} to="/events">
          <CalendarDaysIcon className="nav-icon" aria-hidden="true" />
          Arrangementer
        </Link>
        <Link className={isActive("/profile") ? "active" : ""} to="/profile">
          <UserCircleIcon className="nav-icon" aria-hidden="true" />
          Profil
        </Link>
        <Link
          className={`sidebar-create ${isActive("/create") ? "active" : ""}`}
          to="/create"
        >
          <PlusIcon className="nav-icon" aria-hidden="true" />
          Opprett arrangement
        </Link>
      </nav>

      <div className="sidebar-footer">
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
              <ArrowRightOnRectangleIcon className="nav-icon" aria-hidden="true" />
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
