import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  fetchEvents,
  registerForEvent,
  unregisterFromEvent,
  deleteEvent,
} from "../api/events"
import { getMe } from "../api/auth"
import MapPreview from "../components/MapPreview.jsx"
import {
  ArrowPathIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import { createSocket } from "../api/socket"

export default function EventList() {
  const [events, setEvents] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [message, setMessage] = useState(null)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [page, setPage] = useState(1)
  const pageSize = 5

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (!user) return undefined

    const socket = createSocket()
    const refreshEvents = () => load()

    socket.on("eventCreated", refreshEvents)
    socket.on("eventUpdated", refreshEvents)
    socket.on("eventDeleted", refreshEvents)
    socket.on("eventRegistrationUpdated", refreshEvents)

    return () => {
      socket.off("eventCreated", refreshEvents)
      socket.off("eventUpdated", refreshEvents)
      socket.off("eventDeleted", refreshEvents)
      socket.off("eventRegistrationUpdated", refreshEvents)
      socket.disconnect()
    }
  }, [user])

  const load = async () => {
    setLoading(true)

    try {
      const data = await fetchEvents()
      setEvents(data || [])
      setLoadError("")
    } catch (err) {
      console.error("Kunne ikke hente arrangementer", err)
      setEvents([])
      setLoadError("Arrangementene kunne ikke hentes akkurat nå. Prøv igjen.")
    }

    try {
      const me = await getMe()
      setUser(me)
    } catch {
      setUser(null)
    }

    setLoading(false)
  }

  const handleRegisterToggle = async (ev) => {
    try {
      const isRegistered = ev.attendees?.some(
        (a) => a._id === user?._id || a === user?._id
      )

      if (isRegistered) {
        await unregisterFromEvent(ev._id)
        setMessage({ type: "success", text: "Avregistrert" })
      } else {
        await registerForEvent(ev._id)
        setMessage({ type: "success", text: "Registrert" })
      }

      load()
    } catch {
      setMessage({ type: "error", text: "Noe gikk galt" })
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Er du sikker på at du vil slette dette arrangementet?")) {
      return
    }

    try {
      await deleteEvent(id)
      setMessage({ type: "success", text: "Arrangementet er slettet" })
      load()
    } catch {
      setMessage({ type: "error", text: "Kunne ikke slette" })
    }
  }

  const categories = [...new Set(events.map((event) => event.category).filter(Boolean))]
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const visibleEvents = events.filter((event) => {
    const eventDate = new Date(event.date)
    const matchesSearch = `${event.title} ${event.description} ${event.location}`
      .toLowerCase()
      .includes(search.toLowerCase())
    const matchesCategory = category === "all" || event.category === category
    const matchesDate =
      dateFilter === "all" ||
      (dateFilter === "upcoming" && eventDate >= today) ||
      (dateFilter === "past" && eventDate < today)

    return matchesSearch && matchesCategory && matchesDate
  })

  const resetFilters = () => {
    setSearch("")
    setCategory("all")
    setDateFilter("all")
    setPage(1)
  }

  useEffect(() => {
    setPage(1)
  }, [search, category, dateFilter])

  const pageCount = Math.max(1, Math.ceil(visibleEvents.length / pageSize))
  const paginatedEvents = visibleEvents.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

  if (loading) {
    return (
      <div className="center-page">
        <div className="loading-header">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-line" />
        </div>
        <div className="loading-grid">
          <div className="skeleton skeleton-card" />
          <div className="skeleton skeleton-card" />
        </div>
      </div>
    )
  }

  return (
    <div className="events-page">
      <video
        className="events-page__background"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      >
        <source src="/event-background.webm" type="video/webm" />
      </video>
      <div className="events-page__veil" />

      <div className="center-page events-page__content">
      <div className="events-hero">
        <div>
          <p className="eyebrow">Oversikt</p>
          <h1>Arrangementer</h1>
          <p className="hero-description">
            Her finner du kommende og tidligere arrangementer.
          </p>
        </div>
        <Link to="/create" className="button-primary hero-action">
          <PlusIcon className="button-icon" aria-hidden="true" />
          Nytt arrangement
        </Link>
      </div>

      <div className="filter-bar" aria-label="Filtrer arrangementer">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Søk etter arrangement..."
          aria-label="Søk etter arrangement"
        />
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label="Filtrer på kategori"
        >
          <option value="all">Alle kategorier</option>
          {categories.map((eventCategory) => (
            <option key={eventCategory} value={eventCategory}>
              {eventCategory}
            </option>
          ))}
        </select>
        <select
          value={dateFilter}
          onChange={(event) => setDateFilter(event.target.value)}
          aria-label="Filtrer på dato"
        >
          <option value="all">Alle datoer</option>
          <option value="upcoming">Kommende</option>
          <option value="past">Tidligere</option>
        </select>
        <button
          type="button"
          className="button-secondary filter-action"
          onClick={resetFilters}
        >
          <XMarkIcon className="button-icon" aria-hidden="true" />
          Nullstill
        </button>
        <button
          type="button"
          className="button-secondary filter-action"
          onClick={load}
        >
          <ArrowPathIcon className="button-icon" aria-hidden="true" />
          Oppdater
        </button>
      </div>

      <p className="results-summary" aria-live="polite">
        Viser {visibleEvents.length} av {events.length} arrangementer
      </p>

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

      {loadError && <div className="message-error">{loadError}</div>}

      {!loadError && events.length === 0 && (
        <div className="empty-panel">
          <h2>Ingen arrangementer ennå</h2>
          <p>Kom tilbake snart, eller opprett det første arrangementet.</p>
        </div>
      )}

      {!loadError && events.length > 0 && visibleEvents.length === 0 && (
        <div className="empty-panel">
          <h2>Ingen treff</h2>
          <p>Prøv et annet søk eller endre filtrene.</p>
        </div>
      )}

      {paginatedEvents.map((ev) => {
        const isRegistered = ev.attendees?.some(
          (a) => a._id === user?._id || a === user?._id
        )
        const ownerId = ev.createdBy?._id || ev.createdBy
        const canManage = Boolean(
          user && (user.role === "admin" || ownerId === user._id)
        )

        return (
          <div key={ev._id} className="event-card">
            <div className="event-card__content">
              <div>
                <div className="event-meta-row">
                  <span className="event-category">
                    {ev.category || "Generelt"}
                  </span>
                  <span className="badge">
                    {ev.attendees?.length || 0} påmeldte
                  </span>
                </div>

                <h3>{ev.title}</h3>
                <p className="event-description">{ev.description}</p>
                <div className="event-details-grid">
                  <div className="event-info-item">
                    <span className="event-info-label">Adresse</span>
                    <strong>{ev.location}</strong>
                  </div>
                  <div className="event-info-item">
                    <span className="event-info-label">Dato</span>
                    <strong>
                      {new Date(ev.date).toLocaleDateString("no-NO", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="event-card__map">
                <p className="map-preview__heading">Finn frem</p>
                <MapPreview location={ev.location} />
              </div>
            </div>

            <div className="event-actions">
              <Link
                to={`/events/${ev._id}`}
                className="button-secondary"
              >
                Se detaljer
              </Link>

              {canManage && (
                <Link
                  to={`/events/${ev._id}/edit`}
                  className="button-secondary"
                >
                  Rediger
                </Link>
              )}

              {user && (
                <button
                  className="button-primary"
                  onClick={() => handleRegisterToggle(ev)}
                >
                  {isRegistered ? "Avregistrer" : "Registrer"}
                </button>
              )}

              {canManage && (
                <button
                  className="button-danger"
                  onClick={() => handleDelete(ev._id)}
                >
                  Slett
                </button>
              )}
            </div>
          </div>
        )
      })}

      {pageCount > 1 && (
        <div className="pagination" aria-label="Sideinndeling">
          <button
            className="button-secondary"
            disabled={page === 1}
            onClick={() => setPage((current) => current - 1)}
          >
            Forrige
          </button>
          <span>Side {page} av {pageCount}</span>
          <button
            className="button-secondary"
            disabled={page === pageCount}
            onClick={() => setPage((current) => current + 1)}
          >
            Neste
          </button>
        </div>
      )}
      </div>
    </div>
  )
}