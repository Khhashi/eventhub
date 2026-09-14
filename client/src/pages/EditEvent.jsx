import React, { useEffect, useState } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { fetchEvents, updateEvent } from "../api/events"
import AddressAutocomplete from "../components/AddressAutocomplete"

export default function EditEvent() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    load()
  }, [id])

  const load = async () => {
    try {
      const events = await fetchEvents()
      const event = events.find((candidate) => candidate._id === id)

      if (event) {
        const standardCategories = ["Music", "Tech", "Sports", "Annet"]
        const hasCategory = Boolean(event.category)
        setForm({
          ...event,
          category: !hasCategory || standardCategories.includes(event.category)
            ? event.category || ""
            : "Annet",
          customCategory: hasCategory && !standardCategories.includes(event.category)
            ? event.category
            : "",
          date: event.date?.split("T")[0] || "",
        })
      }
    } catch {
      setError("Kunne ikke laste arrangementet.")
    }
  }

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)
    setError("")

    try {
      const { customCategory, ...eventData } = form
      if (form.category || customCategory) {
        eventData.category = form.category === "Annet" ? customCategory : form.category
      } else {
        delete eventData.category
      }
      await updateEvent(id, eventData)

      navigate("/events")

    } catch {
      setError("Du må være innlogget og eie arrangementet for å redigere det.")
    }

    setLoading(false)
  }

  if (!form) {
    return <div className="center-page">Laster...</div>
  }

  return (
    <div className="container">
      <div className="form-card">
        <p className="eyebrow">Rediger arrangement</p>
        <h2>Oppdater arrangement</h2>

        {error && (
          <div className="message-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="edit-title">Tittel</label>
          <input
            id="edit-title"
            name="title"
            placeholder="Tittel"
            value={form.title}
            onChange={handleChange}
            required
          />

          <label htmlFor="edit-description">Beskrivelse</label>
          <textarea
            id="edit-description"
            name="description"
            placeholder="Beskrivelse"
            value={form.description}
            onChange={handleChange}
            required
          />

          <label htmlFor="edit-date">Dato</label>
          <input
            id="edit-date"
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            aria-label="Dato"
            required
          />

          <label htmlFor="edit-location">Sted</label>
          <AddressAutocomplete
            id="edit-location"
            value={form.location}
            onChange={handleChange}
          />

          <label htmlFor="edit-category">Kategori</label>
          <select
            id="edit-category"
            name="category"
            value={form.category || ""}
            onChange={handleChange}
          >
            <option value="">Velg kategori</option>
            <option value="Music">Musikk</option>
            <option value="Tech">Teknologi</option>
            <option value="Sports">Sport</option>
            <option value="Annet">Annet</option>
          </select>

          {form.category === "Annet" && (
            <>
              <label htmlFor="edit-custom-category">Skriv kategori</label>
              <textarea
                id="edit-custom-category"
                name="customCategory"
                value={form.customCategory || ""}
                onChange={handleChange}
                placeholder="F.eks. frivillighet eller kultur"
                rows="2"
              />
            </>
          )}

          <button
            type="submit"
            className="button-primary"
            disabled={loading}
          >
            {loading ? "Lagrer..." : "Lagre endringer"}
          </button>
          <Link to={`/events/${id}`} className="button-secondary">Avbryt</Link>
        </form>
      </div>
    </div>
  )
}