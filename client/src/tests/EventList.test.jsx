import React from "react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import EventList from "../pages/EventList.jsx"

vi.mock("../api/events", () => ({
  fetchEvents: vi.fn(),
  registerForEvent: vi.fn(),
  deleteEvent: vi.fn(),
}))

vi.mock("../api/auth", () => ({
  getMe: vi.fn(),
}))

import { fetchEvents, registerForEvent, deleteEvent } from "../api/events"
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

  it("keeps previously loaded events and announces refresh errors", async () => {
    const event = {
      _id: "stale-1",
      title: "Beholdt arrangement",
      description: "",
      location: "Oslo",
      date: "2026-02-14",
    }
    fetchEvents.mockResolvedValueOnce([event])
    fetchEvents.mockRejectedValueOnce(new Error("Nettverksfeil"))
    vi.spyOn(console, "error").mockImplementation(() => {})
    const user = userEvent.setup()
    render(<MemoryRouter><EventList /></MemoryRouter>)

    expect(await screen.findByText("Beholdt arrangement")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Oppdater" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Arrangementene kunne ikke oppdateres akkurat nå. Viser tidligere data."
    )
    expect(screen.getByText("Beholdt arrangement")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Oppdater" })).toBeEnabled()
  })

  it("keeps the current list visible and disables refresh while updating", async () => {
    const event = {
      _id: "refresh-1",
      title: "Eksisterende arrangement",
      description: "",
      location: "Oslo",
      date: "2026-02-14",
    }
    fetchEvents.mockResolvedValueOnce([event])
    let resolveRefresh
    fetchEvents.mockReturnValueOnce(new Promise((resolve) => {
      resolveRefresh = resolve
    }))
    const user = userEvent.setup()
    render(<MemoryRouter><EventList /></MemoryRouter>)

    expect(await screen.findByText("Eksisterende arrangement")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Oppdater" }))

    const refreshButton = screen.getByRole("button", { name: "Oppdaterer..." })
    expect(refreshButton).toBeDisabled()
    expect(screen.getByText("Eksisterende arrangement")).toBeInTheDocument()

    resolveRefresh([event, {
      ...event,
      _id: "refresh-2",
      title: "Nytt arrangement",
    }])

    expect(await screen.findByText("Nytt arrangement")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Oppdater" })).toBeEnabled()
  })

  it("prevents duplicate registration requests while a registration is pending", async () => {
    const event = {
      _id: "registration-1",
      title: "Testarrangement",
      description: "",
      location: "Oslo",
      date: "2026-02-14",
      attendees: [],
    }
    fetchEvents.mockResolvedValueOnce([event])
    let resolveRegistration
    registerForEvent.mockReturnValueOnce(new Promise((resolve) => {
      resolveRegistration = resolve
    }))
    fetchEvents.mockResolvedValueOnce([{ ...event, attendees: ["organizer-1"] }])
    const user = userEvent.setup()
    render(<MemoryRouter><EventList /></MemoryRouter>)

    await screen.findByText("Testarrangement")
    const registerButton = screen.getByRole("button", { name: "Registrer" })
    await user.click(registerButton)

    expect(screen.getByRole("button", { name: "Behandler..." })).toBeDisabled()
    expect(registerForEvent).toHaveBeenCalledTimes(1)

    resolveRegistration()
    expect(await screen.findByRole("status")).toHaveTextContent("Registrert")
    expect(registerForEvent).toHaveBeenCalledTimes(1)
    expect(await screen.findByRole("button", { name: "Avregistrer" })).toBeEnabled()
  })

  it("prevents duplicate delete requests while a deletion is pending", async () => {
    getMe.mockResolvedValueOnce({ _id: "admin-1", role: "admin" })
    const event = {
      _id: "delete-1",
      title: "Arrangement som slettes",
      description: "",
      location: "Oslo",
      date: "2026-02-14",
      createdBy: "organizer-1",
    }
    fetchEvents.mockResolvedValueOnce([event])
    let resolveDeletion
    deleteEvent.mockReturnValueOnce(new Promise((resolve) => {
      resolveDeletion = resolve
    }))
    fetchEvents.mockResolvedValueOnce([])
    vi.spyOn(window, "confirm").mockReturnValue(true)
    const user = userEvent.setup()
    render(<MemoryRouter><EventList /></MemoryRouter>)

    await screen.findByText("Arrangement som slettes")
    await user.click(screen.getByRole("button", { name: "Slett" }))
    const deleteButton = screen.getByRole("button", { name: "Sletter..." })

    expect(deleteButton).toBeDisabled()
    expect(window.confirm).toHaveBeenCalledTimes(1)
    expect(deleteEvent).toHaveBeenCalledTimes(1)
    await user.click(deleteButton)
    expect(deleteEvent).toHaveBeenCalledTimes(1)

    resolveDeletion()
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Arrangementet er slettet"
    )
    expect(await screen.findByRole("heading", { name: "Ingen arrangementer ennå" }))
      .toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Oppdater" })).toBeEnabled()
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
