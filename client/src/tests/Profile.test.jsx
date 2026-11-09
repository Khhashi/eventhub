import React from "react"
import { describe, it, expect, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import Profile from "../pages/Profile.jsx"

vi.mock("../api/http", () => ({
  request: vi.fn().mockResolvedValue({
    user: { name: "Testbruker", picture: "" },
    createdEvents: [],
    registeredEvents: [],
  }),
}))

import { request } from "../api/http"

describe("Profile", () => {
  it("explains unsupported profile image formats without uploading them", async () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    )

    const input = await screen.findByLabelText(/bytt profilbilde/i)
    fireEvent.change(input, {
      target: { files: [new File(["gif"], "avatar.gif", { type: "image/gif" })] },
    })

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Velg et JPEG-, PNG- eller WebP-bilde."
    )
    expect(request).toHaveBeenCalledTimes(1)
  })
})
