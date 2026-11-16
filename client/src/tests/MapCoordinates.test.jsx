import React from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import MapPreview from "../components/MapPreview.jsx"

vi.mock("../components/LeafletMap.jsx", () => ({
  default: ({ location, coordinates }) => (
    <div role="region" aria-label={`Kart med markør for ${location}`}>
      {coordinates.latitude}, {coordinates.longitude}
    </div>
  ),
}))

afterEach(() => vi.unstubAllGlobals())

describe("map link", () => {
  it("uses resolved coordinates and avoids old coordinates when location changes", async () => {
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ lat: "60.3913", lon: "5.3221" }],
      })
      .mockImplementationOnce(() => new Promise(() => {})))

    const { rerender } = render(<MapPreview location="Bergen" />)
    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Åpne kart" })).toHaveAttribute(
        "href",
        expect.stringContaining("mlat=60.3913&mlon=5.3221")
      )
    })
    expect(await screen.findByRole("region", { name: "Kart med markør for Bergen" }))
      .toHaveTextContent("60.3913, 5.3221")

    rerender(<MapPreview location="Tromsø" />)
    expect(screen.queryByRole("region", { name: "Kart med markør for Bergen" })).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Åpne kart" })).toHaveAttribute(
      "href",
      expect.stringContaining("search?query=Troms%C3%B8")
    )
  })
})
