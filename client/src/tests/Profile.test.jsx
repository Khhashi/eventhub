import React from "react"
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest"
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
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

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
    expect(input).toHaveValue("")
    expect(request).toHaveBeenCalledTimes(1)
  })

  it("shows an error when the browser cannot read the selected image", async () => {
    const reader = {
      onload: null,
      onerror: null,
      readAsDataURL: vi.fn(),
    }
    vi.spyOn(window, "FileReader").mockImplementation(function FileReaderMock() {
      return reader
    })

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    )

    const input = await screen.findByLabelText(/bytt profilbilde/i)
    fireEvent.change(input, {
      target: {
        files: [new File(["image"], "avatar.jpg", { type: "image/jpeg" })],
      },
    })
    reader.onerror()

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Kunne ikke lese bildefilen. Prøv en annen fil."
    )
    expect(request).toHaveBeenCalledTimes(1)
  })
})
