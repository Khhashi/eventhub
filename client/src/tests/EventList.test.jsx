import React from "react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, cleanup } from "@testing-library/react"
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
  afterEach(() => {
    cleanup()
  })

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
    expect(screen.getByText("Viser 1 av 1 arrangementer")).toBeInTheDocument()
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

  it("allows sorting events by date and resetting the filters", async () => {
    fetchEvents.mockResolvedValueOnce([
      {
        _id: "a",
        title: "Sommerfest",
        description: "Fest",
        location: "Oslo",
        date: "2026-07-15T00:00:00.000Z",
        category: "Fest",
        createdBy: { _id: "organizer-1" },
      },
      {
        _id: "b",
        title: "Tech meetup",
        description: "Møte",
        location: "Bergen",
        date: "2026-02-10T00:00:00.000Z",
        category: "Tech",
        createdBy: { _id: "organizer-1" },
      },
    ])

    render(
      <MemoryRouter>
        <EventList />
      </MemoryRouter>
    )

    const sortSelect = await screen.findByLabelText(/sorter arrangementer/i)
    fireEvent.change(sortSelect, { target: { value: "soonest" } })

    const cards = screen.getAllByRole("heading", { level: 3 })
    expect(cards[0]).toHaveTextContent("Tech meetup")

    fireEvent.click(screen.getByRole("button", { name: /tilbakestill filtre/i }))
    expect(screen.getByLabelText(/søk etter arrangement/i)).toHaveValue("")
  })
})
