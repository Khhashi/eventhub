export default function Login() {
  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google"
  }

  return (
    <div className="public-page">
      <video className="public-page__background" autoPlay muted loop playsInline aria-hidden="true">
        <source src="/football-background.mp4" type="video/mp4" />
      </video>
      <div className="public-page__veil" />
      <div className="center-page auth-page public-page__content">
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
    </div>
  )
}