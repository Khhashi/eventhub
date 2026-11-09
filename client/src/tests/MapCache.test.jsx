import React from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import MapPreview from "../components/MapPreview.jsx"

vi.mock("../components/LeafletMap.jsx", () => ({
  default: ({ location }) => <div role="region" aria-label={`Kart for ${location}`} />,
}))

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("map lookup cache", () => {
  it("shares an in-flight lookup and reuses the result after unmounting", async () => {
    let resolveFetch
    const fetch = vi.fn(() => new Promise(resolve => { resolveFetch = resolve }))
    vi.stubGlobal("fetch", fetch)
    const first = render(<MapPreview location="Delt adresse" />)
    render(<MapPreview location="Delt adresse" />)
    expect(fetch).toHaveBeenCalledTimes(1)
    first.unmount()
    resolveFetch({ ok: true, json: async () => [{ lat: "60", lon: "5" }] })
    expect(await screen.findByRole("region", { name: "Kart for Delt adresse" })).toBeInTheDocument()
    render(<MapPreview location="Delt adresse" />)
    await waitFor(() => expect(screen.getAllByRole("region", { name: "Kart for Delt adresse" })).toHaveLength(2))
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it("retries a failed lookup rather than caching the error", async () => {
    const fetch = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ lat: "60", lon: "5" }] })
    vi.stubGlobal("fetch", fetch)
    const first = render(<MapPreview location="Feil adresse" />)
    expect(await screen.findByText("Kartet kunne ikke lastes")).toBeInTheDocument()
    first.unmount()
    render(<MapPreview location="Feil adresse" />)
    expect(await screen.findByRole("region", { name: "Kart for Feil adresse" })).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it("refreshes a cached location after 30 minutes", async () => {
    let now = 1_000_000
    vi.spyOn(Date, "now").mockImplementation(() => now)
    const fetch = vi.fn().mockResolvedValue({
      ok: true, json: async () => [{ lat: "60", lon: "5" }],
    })
    vi.stubGlobal("fetch", fetch)
    const first = render(<MapPreview location="Utløpt adresse" />)
    await screen.findByRole("region", { name: "Kart for Utløpt adresse" })
    first.unmount()
    now += 30 * 60 * 1000
    render(<MapPreview location="Utløpt adresse" />)
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2))
    expect(await screen.findByRole("region", { name: "Kart for Utløpt adresse" })).toBeInTheDocument()
  })
})
