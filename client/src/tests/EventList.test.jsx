import React from "react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
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

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("shows a clear message when there are no events", async () => {
    fetchEvents.mockResolvedValueOnce([])
    render(<MemoryRouter><EventList /></MemoryRouter>)

    expect(await screen.findByRole("heading", { name: "Ingen arrangementer ennå" })).toBeInTheDocument()
  })

  it("announces event loading errors to screen readers", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    fetchEvents.mockRejectedValueOnce(new Error("Nettverksfeil"))
    render(<MemoryRouter><EventList /></MemoryRouter>)

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Arrangementene kunne ikke oppdateres akkurat nå. Viser tidligere data."
    )
  })

  it("shows no results for a search and restores events after reset", async () => {
    fetchEvents.mockResolvedValueOnce([
      { _id: "3", title: "Konsert", description: "", location: "", date: "2026-02-14" },
    ])
    const user = userEvent.setup()
    render(<MemoryRouter><EventList /></MemoryRouter>)

    await screen.findByText("Konsert")
    await user.type(screen.getByRole("searchbox", { name: "Søk etter arrangement" }), "teater")
    expect(screen.getByRole("heading", { name: "Ingen treff" })).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Nullstill" }))
    expect(screen.getByText("Konsert")).toBeInTheDocument()
  })

  it("navigates between pages and resets the page when searching", async () => {
    fetchEvents.mockResolvedValueOnce(Array.from({ length: 6 }, (_, index) => ({
      _id: String(index), title: `Arrangement ${index}`, description: "", location: "", date: "2026-02-14",
    })))
    const user = userEvent.setup()
    render(<MemoryRouter><EventList /></MemoryRouter>)

    await screen.findByText("Arrangement 0")
    expect(screen.getByRole("button", { name: "Forrige" })).toBeDisabled()
    await user.click(screen.getByRole("button", { name: "Neste" }))
    expect(screen.getByText("Arrangement 5")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Neste" })).toBeDisabled()
    await user.type(screen.getByRole("searchbox", { name: "Søk etter arrangement" }), "Arrangement 0")
    expect(screen.getByText("Arrangement 0")).toBeInTheDocument()
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
