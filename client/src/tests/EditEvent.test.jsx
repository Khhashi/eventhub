import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import EditEvent from "../pages/EditEvent.jsx"

vi.mock("../api/events", () => ({
  fetchEvents: vi.fn(),
  updateEvent: vi.fn(),
}))

import { fetchEvents, updateEvent } from "../api/events"

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
    fetchEvents.mockResolvedValueOnce([
      {
        _id: "123",
        title: "Old title",
        description: "Old desc",
        location: "Oslo",
        date: "2026-02-14T00:00:00.000Z",
      },
    ])

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
})