import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom"
import { useEffect, useState } from "react"
import EventList from "./pages/EventList"
import CreateEvent from "./pages/CreateEvent"
import EditEvent from "./pages/EditEvent"
import EventDetails from "./pages/EventDetails"
import Login from "./pages/Login"
import Profile from "./pages/Profile"
import NotFound from "./pages/NotFound"
import { getMe } from "./api/auth"
import Sidebar from "./components/Sidebar"
import {
  ArrowLeftIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline"

function ProtectedRoute({ user, loading, children }) {
  if (loading) {
    return <div className="center-page">Sjekker innlogging...</div>
  }

  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  const checkAuth = async () => {
    try {
      const me = await getMe()
      setUser(me)
    } catch {
      setUser(null)
    } finally {
      setAuthLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    fetch("/api/auth/logout", { method: "POST", credentials: "include" })
    setUser(null)
    navigate("/events")
  }

  const isEventsPage = location.pathname === "/events"

  return (
    <div className="app-layout">
      <Sidebar user={user} onLogout={handleLogout} />

      <main className="app-main">
        <div className="page-toolbar">
          {!isEventsPage && (
            <button
              className="button-secondary"
              onClick={() => navigate(-1)}
            >
              <ArrowLeftIcon className="button-icon" aria-hidden="true" />
              Tilbake
            </button>
          )}

          <button
            className="button-secondary"
            onClick={() => navigate(0)}
          >
            <ArrowPathIcon className="button-icon" aria-hidden="true" />
            Oppdater
          </button>
        </div>

        <Routes>
          <Route path="/" element={<Navigate to="/events" replace />} />
          <Route path="/events" element={<EventList />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route
            path="/events/:id/edit"
            element={
              <ProtectedRoute user={user} loading={authLoading}>
                <EditEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute user={user} loading={authLoading}>
                <CreateEvent />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  )
}