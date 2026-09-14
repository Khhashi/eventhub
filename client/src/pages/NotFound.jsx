import { Link } from "react-router-dom"

export default function NotFound() {
  return (
    <div className="center-page auth-page">
      <div className="auth-card">
        <p className="eyebrow">404</p>
        <h2>Siden finnes ikke</h2>
        <p className="auth-subtitle">
          Denne adressen peker ikke til en side i Møteplass.
        </p>
        <Link to="/events" className="button-primary auth-button">
          Tilbake til arrangementer
        </Link>
      </div>
    </div>
  )
}
