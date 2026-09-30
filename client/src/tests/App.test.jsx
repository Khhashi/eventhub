import React from "react"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"
import App from "../App.jsx"
import { fetchEvents } from "../api/events"
import { getMe } from "../api/auth"

vi.mock("../api/events", () => ({
  fetchEvents: vi.fn(),
}))

vi.mock("../api/auth", () => ({
  getMe: vi.fn(),
}))

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  )
}

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchEvents.mockResolvedValue([])
    getMe.mockRejectedValue(new Error("Ikke innlogget"))
  })

  it("viser arrangementssiden på /events", async () => {
    renderAt("/events")

    expect(
      await screen.findByRole("heading", { level: 1, name: "Arrangementer" })
    ).toBeInTheDocument()
  })

  it("sender brukere som ikke er innlogget fra /create til innlogging", async () => {
    renderAt("/create")

    expect(
      await screen.findByRole("heading", { name: /logg inn/i })
    ).toBeInTheDocument()
  })

  it("viser 404-siden for ukjente adresser", async () => {
    renderAt("/finnes-ikke")

    expect(
      await screen.findByRole("heading", { name: /siden finnes ikke/i })
    ).toBeInTheDocument()
  })
})
