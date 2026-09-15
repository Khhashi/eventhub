import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  fetchEventById,
  registerForEvent,
  unregisterFromEvent,
} from "../api/events"
import { getMe } from "../api/auth"
import MapPreview from "../components/MapPreview.jsx"
import { CalendarDaysIcon, ShareIcon } from "@heroicons/react/24/outline"

export default function EventDetails() {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [user, setUser] = useState(null)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState("")

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      const ev = await fetchEventById(id)
      setEvent(ev)
    } catch {
      setError("Dette arrangementet finnes ikke lenger.")
    }

    try {
      const me = await getMe()
      setUser(me)
    } catch {
      setUser(null)
    }
  }

  if (error) {
    return (
      <div className="center-page">
        <div className="empty-panel">
          <h2>{error}</h2>
          <Link to="/events" className="button-secondary">Tilbake til arrangementer</Link>
        </div>
      </div>
    )
  }

  if (!event) return <div className="center-page">Laster...</div>

const isRegistered = event.attendees?.some(
  (a) =>
    a._id === user?._id ||
    a.toString() === user?._id
)

  const handleRegister = async () => {
    try {
      if (isRegistered) {
        await unregisterFromEvent(event._id)
        setMessage({
          type: "success",
          text: "Du er nå avregistrert.",
        })
      } else {
        await registerForEvent(event._id)
        setMessage({
          type: "success",
          text: "Du er nå registrert",
        })
      }

      load()
    } catch {
      setMessage({
        type: "error",
        text: "Noe gikk galt.",
      })
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: event.title,
      text: `Arrangement: ${event.title}`,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        setMessage({ type: "success", text: "Arrangementet er delt." })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        setMessage({ type: "success", text: "Lenken er kopiert. Du kan dele den med andre." })
      }
    } catch (shareError) {
      if (shareError.name !== "AbortError") {
        setMessage({ type: "error", text: "Kunne ikke dele arrangementet." })
      }
    }
  }

  const handleCalendar = () => {
    const start = new Date(event.date)
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000)
    const formatDate = (date) => date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    const escapeText = (text) => String(text).replace(/[,;\\]/g, "\\$&").replace(/\n/g, "\\n")
    const calendar = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Moteplass//Arrangement//NO",
      "BEGIN:VEVENT",
      `UID:${event._id}@moteplass`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(start)}`,
      `DTEND:${formatDate(end)}`,
      `SUMMARY:${escapeText(event.title)}`,
      `DESCRIPTION:${escapeText(event.description)}`,
      `LOCATION:${escapeText(event.location)}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n")
    const url = URL.createObjectURL(new Blob([calendar], { type: "text/calendar" }))
    const link = document.createElement("a")
    link.href = url
    link.download = `${event.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics`
    link.click()
    URL.revokeObjectURL(url)
    setMessage({ type: "success", text: "Arrangementet er lagt til i kalenderen." })
  }

  return (
    <div className="container event-details-page">
      {message && (
        <div
          className={
            message.type === "success"
              ? "message-success"
              : "message-error"
          }
        >
          {message.text}
        </div>
      )}

      <div className="event-detail-grid">
        <div className="event-card">
          <div className="event-meta-row">
            <span className="event-category">{event.category || "Generelt"}</span>
            <span className="badge">{event.attendees?.length || 0} påmeldte</span>
          </div>
          <h2>{event.title}</h2>
          <p className="event-description">{event.description}</p>
          <div className="event-details-grid">
            <div className="event-info-item">
              <span className="event-info-label">Adresse</span>
              <strong>{event.location}</strong>
            </div>
            <div className="event-info-item">
              <span className="event-info-label">Dato</span>
              <strong>{new Date(event.date).toLocaleDateString("no-NO", {
                dateStyle: "full",
              })}</strong>
            </div>
          </div>

        <div className="organizer-box">
          {event.createdBy?.picture && (
            <img
              src={event.createdBy.picture}
              alt="Arrangør"
              className="avatar"
            />
          )}
          <div>
            <strong>Arrangør:</strong>{" "}
            {event.createdBy?.name}
          </div>
        </div>

          <div className="attendees-list">
            <h4>Påmeldte</h4>

            {event.attendees.length === 0 && (
              <p>Ingen påmeldte enda.</p>
            )}

            {event.attendees.map((attendee) => (
              <div key={attendee._id} className="attendee-item">
                {attendee.picture && (
                  <img src={attendee.picture} alt="" className="avatar-small" />
                )}
                {attendee.name}
              </div>
            ))}
          </div>

          {user ? (
            <button className="button-primary" onClick={handleRegister}>
              {isRegistered ? "Avregistrer" : "Registrer deg"}
            </button>
          ) : (
            <Link to="/login" className="button-primary">
              Logg inn for å delta
            </Link>
          )}
          <div className="event-secondary-actions">
            <button className="button-secondary" onClick={handleCalendar}>
              <CalendarDaysIcon className="button-icon" aria-hidden="true" />
              Legg i kalender
            </button>
            <button className="button-secondary" onClick={handleShare}>
              <ShareIcon className="button-icon" aria-hidden="true" />
              Del arrangement
            </button>
          </div>
        </div>

        <div className="detail-map-panel">
          <p className="eyebrow">Sted</p>
          <h3>{event.location}</h3>
          <MapPreview location={event.location} />
        </div>
      </div>
    </div>
  )
}