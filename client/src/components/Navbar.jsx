import { Link } from "react-router-dom"

export default function Navbar() {
  return (
    <nav>
      <Link to="/">Arrangementer</Link>
      <Link to="/create">Opprett arrangement</Link>
      <Link to="/profile">Profil</Link>
      <Link to="/login">Logg inn</Link>
    </nav>
  )
}
