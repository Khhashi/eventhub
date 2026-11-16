import React from "react"
import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import LeafletMap from "../components/LeafletMap.jsx"

const mocks = vi.hoisted(() => {
  const map = { remove: vi.fn(), zoomControl: { setPosition: vi.fn() } }
  const marker = { addTo: vi.fn(), bindPopup: vi.fn() }
  marker.addTo.mockReturnValue(marker)
  return { map, marker, createMap: vi.fn(() => map) }
})

vi.mock("leaflet", () => ({
  default: {
    map: mocks.createMap,
    tileLayer: () => ({ addTo: vi.fn() }),
    divIcon: vi.fn(),
    marker: () => mocks.marker,
  },
}))

describe("LeafletMap", () => {
  it("uses coordinates, inserts location as text, and removes the map on unmount", () => {
    const { unmount } = render(
      <LeafletMap coordinates={{ latitude: 60.39, longitude: 5.32 }} location="<b>Bergen</b>" />
    )
    expect(screen.getByRole("region")).toHaveAttribute("aria-label", "Kart med markør for <b>Bergen</b>")
    expect(mocks.createMap).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ center: [60.39, 5.32] }))
    expect(mocks.marker.bindPopup.mock.calls[0][0].textContent).toBe("<b>Bergen</b>")
    expect(mocks.marker.bindPopup.mock.calls[0][0].children).toHaveLength(0)
    unmount()
    expect(mocks.map.remove).toHaveBeenCalledOnce()
  })
})
