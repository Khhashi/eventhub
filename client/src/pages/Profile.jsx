import { useEffect, useState } from "react"
import { request } from "../api/http"
import { Link } from "react-router-dom"

export default function Profile() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      const res = await request("/auth/profile")
      setData(res)
    } catch {
      setError("Kunne ikke hente profil.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="center-page"><div className="skeleton skeleton-card" /></div>
  }

  if (error) {
    return (
      <div className="public-page">
        <video className="public-page__background" autoPlay muted loop playsInline aria-hidden="true">
          <source src="/football-background.mp4" type="video/mp4" />
        </video>
        <div className="public-page__veil" />
        <div className="center-page auth-page public-page__content">
        <div className="auth-card">
          <p className="eyebrow">Profil</p>
          <h2>Logg inn for å se profilen din</h2>
          <p className="auth-subtitle">
            Her finner du dine arrangementer og påmeldinger.
          </p>
          <Link to="/login" className="button-primary auth-button">
            Gå til innlogging
          </Link>
        </div>
        </div>
      </div>
    )
  }

  const { user, createdEvents, registeredEvents } = data

  return (
    <div className="center-page">
      <div className="profile-shell">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="eyebrow">Profil</p>
            <h1>{user.name}</h1>
          </div>
        </div>

        <div className="summary-grid profile-summary">
          <div className="summary-card">
            <span className="summary-label">Opprettet</span>
            <strong>{createdEvents.length}</strong>
            <span>arrangementer</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Påmeldt</span>
            <strong>{registeredEvents.length}</strong>
            <span>arrangementer</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Rolle</span>
            <strong className="summary-role">{user.role}</strong>
            <span>på Møteplass</span>
          </div>
        </div>

        <div className="profile-grid">
          <div className="profile-card">
            <h3>Brukerinfo</h3>
            <div className="profile-info-list">
              <div><span>Navn</span><strong>{user.name}</strong></div>
              <div><span>Email</span><strong>{user.email}</strong></div>
              <div><span>Rolle</span><strong>{user.role}</strong></div>
            </div>
          </div>

          <div className="profile-card">
            <h3>Arrangementer jeg har laget</h3>
            {createdEvents.length === 0 && <p className="empty-state">Ingen</p>}
            {createdEvents.map((ev) => (
              <div key={ev._id} className="mini-card">
                <Link to={`/events/${ev._id}`}>{ev.title}</Link>
              </div>
            ))}
          </div>

          <div className="profile-card full-width">
            <h3>Arrangementer jeg er registrert på</h3>
            {registeredEvents.length === 0 && <p className="empty-state">Ingen</p>}
            {registeredEvents.map((ev) => (
              <div key={ev._id} className="mini-card">
                <Link to={`/events/${ev._id}`}>{ev.title}</Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}