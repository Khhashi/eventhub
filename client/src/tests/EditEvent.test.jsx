import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import EditEvent from "../pages/EditEvent.jsx"

vi.mock("../api/events", () => ({
  fetchEventById: vi.fn(),
  updateEvent: vi.fn(),
}))

import { fetchEventById, updateEvent } from "../api/events"

const mockNavigate = vi.fn()

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom")
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe("EditEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("loads event and saves changes then navigates", async () => {
    fetchEventById.mockResolvedValueOnce({
      _id: "123",
      title: "Old title",
      description: "Old desc",
      location: "Oslo",
      date: "2026-02-14T00:00:00.000Z",
    })

    updateEvent.mockResolvedValueOnce({})

    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={["/events/123/edit"]}>
        <Routes>
          <Route path="/events/:id/edit" element={<EditEvent />} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByDisplayValue("Old title")).toBeInTheDocument()

    const titleInput = screen.getByPlaceholderText(/tittel/i)
    await user.clear(titleInput)
    await user.type(titleInput, "New title")

    await user.click(screen.getByRole("button", { name: /lagre endringer/i }))

    expect(updateEvent).toHaveBeenCalledTimes(1)
    expect(updateEvent).toHaveBeenCalledWith("123", {
      _id: "123",
      title: "New title",
      description: "Old desc",
      location: "Oslo",
      date: "2026-02-14",
    })

    expect(mockNavigate).toHaveBeenCalledWith("/events")
  })

  it("shows a not-found state with a link back to events", async () => {
    fetchEventById.mockRejectedValueOnce({ response: { status: 404 } })

    render(
      <MemoryRouter initialEntries={["/events/missing/edit"]}>
        <Routes>
          <Route path="/events/:id/edit" element={<EditEvent />} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByRole("heading", { name: /arrangementet finnes ikke/i }))
      .toBeInTheDocument()
    expect(screen.getByRole("link", { name: /tilbake til arrangementer/i }))
      .toHaveAttribute("href", "/events")
  })

  it("shows a retry action when loading fails", async () => {
    fetchEventById.mockRejectedValueOnce(new Error("Network error"))
    fetchEventById.mockResolvedValueOnce({
      _id: "123",
      title: "Recovered event",
      description: "Description",
      location: "Oslo",
      date: "2026-02-14T00:00:00.000Z",
    })

    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={["/events/123/edit"]}>
        <Routes>
          <Route path="/events/:id/edit" element={<EditEvent />} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByText("Kunne ikke laste arrangementet."))
      .toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: /prøv igjen/i }))

    expect(await screen.findByDisplayValue("Recovered event")).toBeInTheDocument()
    expect(fetchEventById).toHaveBeenCalledTimes(2)
  })
})