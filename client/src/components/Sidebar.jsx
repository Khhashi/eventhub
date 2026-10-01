import { Link, useLocation } from "react-router-dom"
import {
  CalendarDaysIcon,
  PlusIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline"

export default function Sidebar({ user, onLogout }) {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <aside className="sidebar">
      <Link to="/events" className="sidebar-brand" aria-label="Møteplass">
        <span className="brand-mark">M</span>
        <span className="nav-label">Møteplass</span>
      </Link>

      <div className="sidebar-section-label">Arbeidsområde</div>
      <nav className="sidebar-nav" aria-label="Hovedmeny">
        <Link
          className={isActive("/events") ? "active" : ""}
          to="/events"
          title="Arrangementer"
        >
          <CalendarDaysIcon className="nav-icon" aria-hidden="true" />
          <span className="nav-label">Arrangementer</span>
        </Link>
        <Link
          className={isActive("/profile") ? "active" : ""}
          to="/profile"
          title="Profil"
        >
          <UserCircleIcon className="nav-icon" aria-hidden="true" />
          <span className="nav-label">Profil</span>
        </Link>
        <Link
          className={`sidebar-create ${isActive("/create") ? "active" : ""}`}
          to="/create"
          title="Opprett arrangement"
        >
          <PlusIcon className="nav-icon" aria-hidden="true" />
          <span className="nav-label">Opprett arrangement</span>
        </Link>
      </nav>

      <div className="sidebar-footer">
        {user ? (
          <>
            <div className="sidebar-user" title={user.name}>
              <div className="sidebar-avatar">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="nav-label">
                <strong>{user.name}</strong>
                <span>Arrangør</span>
              </div>
            </div>
            <button className="sidebar-logout" onClick={onLogout} title="Logg ut">
              <ArrowRightOnRectangleIcon className="nav-icon" aria-hidden="true" />
              <span className="nav-label">Logg ut</span>
            </button>
          </>
        ) : (
          <Link to="/login" className="button-primary sidebar-login" title="Logg inn">
            <ArrowLeftOnRectangleIcon className="nav-icon" aria-hidden="true" />
            <span className="nav-label">Logg inn</span>
          </Link>
        )}
      </div>
    </aside>
  )
}
