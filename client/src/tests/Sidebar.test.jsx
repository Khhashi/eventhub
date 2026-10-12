import React from "react"
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import Sidebar from "../components/Sidebar.jsx"

const renderSidebar = (user) =>
  render(
    <MemoryRouter>
      <Sidebar user={user} onLogout={() => {}} />
    </MemoryRouter>
  )

describe("Sidebar", () => {
  it.each([
    ["organizer", "Arrangør"],
    ["admin", "Administrator"],
    ["user", "Bruker"],
  ])("shows the label for the %s role", (role, label) => {
    renderSidebar({ _id: "1", name: "Kari", role })

    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it("falls back to the user label when the role is missing", () => {
    renderSidebar({ _id: "1", name: "Kari" })

    expect(screen.getByText("Bruker")).toBeInTheDocument()
  })
})
