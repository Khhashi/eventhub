import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import EventList from "../pages/EventList.jsx"

vi.mock("../api/events", () => ({
  fetchEvents: vi.fn(),
}))

vi.mock("../api/auth", () => ({
  getMe: vi.fn(),
}))

import { fetchEvents } from "../api/events"
import { getMe } from "../api/auth"

describe("EventList", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getMe.mockResolvedValue({ _id: "organizer-1", role: "organizer" })
  })

  it("renders events from API and shows edit link", async () => {
    fetchEvents.mockResolvedValueOnce([
      {
        _id: "1",
        title: "Test event",
        description: "Hei",
        location: "Oslo",
        date: "2026-02-14T00:00:00.000Z",
        createdBy: { _id: "organizer-1" },
      },
    ])

    render(
      <MemoryRouter>
        <EventList />
      </MemoryRouter>
    )

    expect(await screen.findByText("Test event")).toBeInTheDocument()
    expect(screen.getAllByText(/Oslo/i).length).toBeGreaterThan(0)
    expect(screen.getByRole("link", { name: /rediger/i })).toBeInTheDocument()
  })

  it("renders a location map preview for the event", async () => {
    fetchEvents.mockResolvedValueOnce([
      {
        _id: "2",
        title: "Møte i Bergen",
        description: "Hei",
        location: "Bergen",
        date: "2026-02-14T00:00:00.000Z",
        createdBy: { _id: "organizer-1" },
      },
    ])

    render(
      <MemoryRouter>
        <EventList />
      </MemoryRouter>
    )

    expect(await screen.findByText("Møte i Bergen")).toBeInTheDocument()
    expect(screen.getByTitle(/Kart for Bergen/i)).toBeInTheDocument()
  })
})
