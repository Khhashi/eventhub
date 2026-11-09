import React from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import MapPreview from "../components/MapPreview.jsx"

afterEach(() => vi.unstubAllGlobals())

describe("map status", () => {
  it("does not display a map or search without an address", () => {
    const fetch = vi.fn()
    vi.stubGlobal("fetch", fetch)
    render(<MapPreview location="" />)
    expect(screen.getByRole("status")).toHaveTextContent("Ingen adresse er oppgitt")
    expect(screen.queryByRole("region", { name: /Kart med markør/ })).not.toBeInTheDocument()
    expect(screen.queryByRole("link")).not.toBeInTheDocument()
    expect(fetch).not.toHaveBeenCalled()
  })

  it("shows a clear error rather than a map when lookup fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }))
    render(<MapPreview location="Bergen" />)
    expect(await screen.findByText("Kartet kunne ikke lastes")).toBeInTheDocument()
    expect(screen.queryByRole("region", { name: /Kart med markør/ })).not.toBeInTheDocument()
  })
})
