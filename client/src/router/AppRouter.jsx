import React from "react"
import { Routes, Route, Navigate, Link } from "react-router-dom"
import EventList from "../pages/EventList.jsx"
import CreateEvent from "../pages/CreateEvent.jsx"
import EditEvent from "../pages/EditEvent.jsx"

export default function AppRouter() {
  return (
    <div style={{ padding: 16 }}>
      <nav style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <Link to="/events">Events</Link>
        <Link to="/create">Opprett arrangement</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/events" replace />} />
        <Route path="/events" element={<EventList />} />
        <Route path="/create" element={<CreateEvent />} />
        <Route path="/events/:id/edit" element={<EditEvent />} />
        <Route path="*" element={<p>Not found</p>} />
      </Routes>
    </div>
  )
}
