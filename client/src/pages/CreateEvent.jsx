import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { createEvent } from "../api/events"
import AddressAutocomplete from "../components/AddressAutocomplete"

export default function CreateEvent() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    category: "",
    customCategory: "",
  })

  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const { customCategory, ...eventData } = form
      eventData.category = form.category === "Annet" ? customCategory : form.category
      await createEvent(eventData)

      setSuccess("Arrangementet er opprettet.")

      setForm({
        title: "",
        description: "",
        date: "",
        location: "",
        category: "",
        customCategory: "",
      })

      setTimeout(() => {
        navigate("/events")
      }, 1000)

    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError("Noe gikk galt. Prøv igjen.")
      }
    }

    setLoading(false)
  }

  return (
    <div className="container">
      <div className="form-card">
        <p className="eyebrow">Nytt arrangement</p>
        <h2>Opprett arrangement</h2>

        {success && (
          <div className="message-success">
            {success}
          </div>
        )}

        {error && (
          <div className="message-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="title">Tittel</label>
          <input
            id="title"
            name="title"
            placeholder="Tittel, f.eks. Sommerfest"
            value={form.title}
            onChange={handleChange}
            required
          />

          <label htmlFor="description">Beskrivelse</label>
          <textarea
            id="description"
            name="description"
            placeholder="Hva bør deltakerne vite?"
            value={form.description}
            onChange={handleChange}
            required
          />

          <label htmlFor="date">Dato</label>
          <input
            id="date"
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            aria-label="Dato"
            required
          />

          <label htmlFor="location">Sted</label>
          <AddressAutocomplete
            id="location"
            value={form.location}
            onChange={handleChange}
          />

          <label htmlFor="category">Kategori</label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="">Velg kategori</option>
            <option value="Music">Musikk</option>
            <option value="Tech">Teknologi</option>
            <option value="Sports">Sport</option>
            <option value="Annet">Annet</option>
          </select>

          {form.category === "Annet" && (
            <>
              <label htmlFor="custom-category">Skriv kategori</label>
              <textarea
                id="custom-category"
                name="customCategory"
                value={form.customCategory}
                onChange={handleChange}
                placeholder="F.eks. frivillighet eller kultur"
                rows="2"
                required
              />
            </>
          )}

          <button
            type="submit"
            className="button-primary"
            disabled={loading}
          >
            {loading ? "Oppretter..." : "Opprett arrangement"}
          </button>
          <Link to="/events" className="button-secondary">Avbryt</Link>
        </form>
      </div>
    </div>
  )
}