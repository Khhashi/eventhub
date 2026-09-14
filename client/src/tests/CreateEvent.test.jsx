import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import CreateEvent from "../pages/CreateEvent.jsx"

vi.mock("../api/events", () => ({
  createEvent: vi.fn(),
}))

import { createEvent } from "../api/events"

describe("CreateEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("submits form and shows success message", async () => {
    createEvent.mockResolvedValueOnce({})

    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <CreateEvent />
      </MemoryRouter>
    )

    await user.type(screen.getByPlaceholderText(/tittel/i), "Test event")
    await user.type(screen.getByPlaceholderText(/bør deltakerne/i), "Hei")
    await user.type(screen.getByLabelText(/dato/i), "2026-02-14")
    await user.type(screen.getByPlaceholderText(/gate eller sted/i), "Oslo")

    await user.selectOptions(
      screen.getByRole("combobox"),
      "Music"
    )

    await user.click(screen.getByRole("button", { name: /opprett arrangement/i }))

    expect(createEvent).toHaveBeenCalledTimes(1)
    expect(createEvent).toHaveBeenCalledWith({
      title: "Test event",
      description: "Hei",
      date: "2026-02-14",
      location: "Oslo",
      category: "Music",
    })

    expect(
      await screen.findByText(/Arrangementet er opprettet/i)
    ).toBeInTheDocument()
  })
})