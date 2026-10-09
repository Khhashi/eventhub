import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"
import App from "../App.jsx"
import { fetchEvents } from "../api/events"
import { getMe, loginWithGoogle } from "../api/auth"

vi.mock("../api/events", () => ({
  fetchEvents: vi.fn(),
}))

vi.mock("../api/auth", () => ({
  getMe: vi.fn(),
  loginWithGoogle: vi.fn(),
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
    sessionStorage.clear()
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

  it("waits for auth before deciding whether to render a protected route", async () => {
    let resolveAuth
    getMe.mockReset()
    getMe.mockReturnValueOnce(new Promise((resolve) => {
      resolveAuth = resolve
    }))

    renderAt("/create")

    expect(screen.getByRole("status")).toHaveTextContent(/kontrollerer innlogging/i)
    expect(screen.queryByRole("heading", { name: /logg inn/i })).not.toBeInTheDocument()

    resolveAuth({ _id: "user-1", role: "organizer" })

    expect(
      await screen.findByRole("heading", { name: /opprett arrangement/i })
    ).toBeInTheDocument()
  })

  it("preserves the protected path through Google login", async () => {
    const user = userEvent.setup()
    renderAt("/create")

    await user.click(await screen.findByRole("button", { name: /logg inn med google/i }))

    expect(sessionStorage.getItem("eventhub:returnTo")).toBe("/create")
    expect(loginWithGoogle).toHaveBeenCalledOnce()
  })

  it("returns to the saved protected path after authentication", async () => {
    sessionStorage.setItem("eventhub:returnTo", "/create")
    getMe.mockResolvedValue({ _id: "user-1", role: "organizer" })

    renderAt("/events")

    expect(
      await screen.findByRole("heading", { name: /opprett arrangement/i })
    ).toBeInTheDocument()
    expect(sessionStorage.getItem("eventhub:returnTo")).toBeNull()
  })

  it("viser 404-siden for ukjente adresser", async () => {
    renderAt("/finnes-ikke")

    expect(
      await screen.findByRole("heading", { name: /siden finnes ikke/i })
    ).toBeInTheDocument()
  })
})
