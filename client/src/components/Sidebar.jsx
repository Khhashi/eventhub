import { Link, useLocation } from "react-router-dom"
import {
  ArrowLeftOnRectangleIcon,
  CalendarDaysIcon,
  PlusIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline"

export default function Sidebar({ user, onLogout }) {
  const location = useLocation()

  const isActive = (path) => location.pathname === path
  const scrollToTop = () => {
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }

  return (
    <aside className="sidebar">
      <Link to="/events" className="sidebar-brand">
        <span className="brand-mark">E</span>
        <span>Møteplass</span>
      </Link>

      <nav className="sidebar-nav" aria-label="Hovedmeny">
        <Link
          className={isActive("/events") ? "active" : ""}
          to="/events"
          onClick={scrollToTop}
        >
          <CalendarDaysIcon className="sidebar-nav__icon" aria-hidden="true" />
          Arrangementer
        </Link>
        <Link className={isActive("/profile") ? "active" : ""} to="/profile">
          <UserCircleIcon className="sidebar-nav__icon" aria-hidden="true" />
          Profil
        </Link>
        <Link
          className={`sidebar-create ${isActive("/create") ? "active" : ""}`}
          to="/create"
        >
          <PlusIcon className="sidebar-nav__icon" aria-hidden="true" />
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
              <ArrowLeftOnRectangleIcon className="button-icon" aria-hidden="true" />
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
