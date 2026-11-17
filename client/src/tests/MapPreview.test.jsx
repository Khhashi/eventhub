import React from "react"
import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen } from "@testing-library/react"
import MapPreview from "../components/MapPreview.jsx"

vi.mock("../components/LeafletMap.jsx", () => ({
  default: ({ coordinates }) => (
    <div
      data-testid="leaflet-map"
      data-latitude={coordinates.latitude}
      data-longitude={coordinates.longitude}
    />
  ),
}))

describe("MapPreview", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("centers the map on the geocoded location instead of a default city", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ lat: "60.3913", lon: "5.3221" }],
      })
    )

    render(<MapPreview location="Map test location" />)

    const map = await screen.findByTestId("leaflet-map")
    expect(map).toHaveAttribute("data-latitude", "60.3913")
    expect(map).toHaveAttribute("data-longitude", "5.3221")
    expect(screen.getByRole("link", { name: "Større kart" })).toHaveAttribute(
      "href",
      expect.stringContaining("mlat=60.3913&mlon=5.3221")
    )
    expect(screen.getByRole("link", { name: "Veibeskrivelse" })).toHaveAttribute(
      "href",
      expect.stringContaining("destination=60.3913%2C5.3221")
    )
  })
})
