export default function Login() {
  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google"
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