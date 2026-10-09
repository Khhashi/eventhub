import { useLocation } from "react-router-dom"
import { loginWithGoogle } from "../api/auth"

export default function Login() {
  const location = useLocation()

  const handleGoogleLogin = () => {
    const from = location.state?.from
    if (from?.pathname?.startsWith("/") && !from.pathname.startsWith("//")) {
      const returnTo = `${from.pathname}${from.search || ""}${from.hash || ""}`
      sessionStorage.setItem("eventhub:returnTo", returnTo)
    }

    loginWithGoogle()
  }

  return (
    <div className="center-page auth-page">
      <div className="auth-card">
        <p className="eyebrow">Velkommen</p>
        <h2>Logg inn for å delta</h2>
        <p className="auth-subtitle">Logg inn for å se og melde deg på arrangementer.</p>

        <button
          className="button-primary auth-button"
          onClick={handleGoogleLogin}
        >
          Logg inn med Google
        </button>
      </div>
    </div>
  )
}