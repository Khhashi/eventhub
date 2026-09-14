import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi } from "vitest"
import AppRouter from "../router/AppRouter.jsx"
import * as eventsApi from "../api/events"
import React from "react"

vi.mock("../api/events", () => ({
  fetchEvents: vi.fn(),
}))

describe("App smoke test", () => {
  it("renders Events page route", async () => {
    eventsApi.fetchEvents.mockResolvedValue([
      {
        _id: "1",
        title: "Test Event",
        description: "Test desc",
        date: "2025-01-01",
        location: "Oslo",
      },
    ])

    render(
      <MemoryRouter initialEntries={["/events"]}>
        <AppRouter />
      </MemoryRouter>
    )

    expect(
      await screen.findByRole("heading", { name: /arrangementer/i })
    ).toBeInTheDocument()
  })
})