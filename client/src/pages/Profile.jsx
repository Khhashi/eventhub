import { useEffect, useState } from "react"
import { request } from "../api/http"
import { Link } from "react-router-dom"
import { XMarkIcon } from "@heroicons/react/24/outline"

const supportedPictureTypes = ["image/jpeg", "image/png", "image/webp"]

export default function Profile() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isLoggedOut, setIsLoggedOut] = useState(false)
  const [pictureMessage, setPictureMessage] = useState(null)
  const [pictureLoading, setPictureLoading] = useState(false)
  const [pictureError, setPictureError] = useState(false)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      const res = await request("/auth/profile")
      setData(res)
      setError("")
      setIsLoggedOut(false)
    } catch (err) {
      // Check if error is 401 (unauthorized)
      if (err.response?.status === 401) {
        setIsLoggedOut(true)
        setError("")
      } else {
        setError("Kunne ikke hente profil. Prøv igjen senere.")
        setIsLoggedOut(false)
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="center-page"><div className="skeleton skeleton-card" /></div>
  }

  if (isLoggedOut) {
    return (
      <div className="center-page auth-page">
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
    )
  }

  if (error) {
    return (
      <div className="center-page auth-page">
        <div className="auth-card">
          <p className="eyebrow">Profil</p>
          <h2>En feil oppstod</h2>
          <p className="auth-subtitle">{error}</p>
          <button onClick={() => load()} className="button-primary auth-button">
            Prøv igjen
          </button>
          <Link to="/events" className="button-secondary">
            Tilbake til arrangementer
          </Link>
        </div>
      </div>
    )
  }

  const { user, createdEvents, registeredEvents } = data

  const handlePictureUpload = (event) => {
    const input = event.currentTarget
    const file = input.files?.[0]
    input.value = ""
    if (!file) return

    if (!supportedPictureTypes.includes(file.type)) {
      setPictureMessage({
        type: "error",
        text: "Velg et JPEG-, PNG- eller WebP-bilde.",
      })
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setPictureMessage({ type: "error", text: "Velg et bilde på maks 2 MB." })
      return
    }

    const reader = new FileReader()
    reader.onload = async () => {
      setPictureLoading(true)
      setPictureMessage("")
      setPictureError(false)
      try {
        const result = await request("/auth/profile/picture", {
          method: "PUT",
          body: JSON.stringify({ picture: reader.result }),
        })
        setData((current) => ({
          ...current,
          user: { ...current.user, picture: result.picture },
        }))
        setPictureMessage({ type: "success", text: "Profilbildet er oppdatert." })
      } catch {
        setPictureMessage({ type: "error", text: "Kunne ikke laste opp profilbildet." })
      } finally {
        setPictureLoading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handlePictureRemove = async () => {
    setPictureLoading(true)
    setPictureMessage("")
    try {
      await request("/auth/profile/picture", { method: "DELETE" })
      setData((current) => ({
        ...current,
        user: { ...current.user, picture: "" },
      }))
      setPictureMessage({ type: "success", text: "Profilbildet er fjernet." })
    } catch {
      setPictureMessage({ type: "error", text: "Kunne ikke fjerne profilbildet." })
    } finally {
      setPictureLoading(false)
    }
  }

  return (
    <div className="center-page">
      <div className="profile-shell">
        <div className="profile-header">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">
            {user.picture && !pictureError ? (
              <img
                src={user.picture}
                alt="Profilbilde"
                onError={() => setPictureError(true)}
              />
            ) : (
              user.name?.charAt(0)?.toUpperCase() || "U"
            )}
            </div>
            {user.picture && (
              <button
                type="button"
                className="profile-picture-remove"
                onClick={handlePictureRemove}
                disabled={pictureLoading}
                aria-label="Fjern profilbilde"
                title="Fjern profilbilde"
              >
                <XMarkIcon aria-hidden="true" />
              </button>
            )}
          </div>
          <div>
            <p className="eyebrow">Profil</p>
            <h1>{user.name}</h1>
            <label className="profile-upload button-secondary">
              {pictureLoading ? "Laster opp..." : "Bytt profilbilde"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePictureUpload}
                disabled={pictureLoading}
              />
            </label>
            {pictureMessage && (
              <p
                className={`profile-picture-message profile-picture-message--${pictureMessage.type}`}
                role={pictureMessage.type === "error" ? "alert" : "status"}
              >
                {pictureMessage.text}
              </p>
            )}
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