import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, render } from "@testing-library/react"
import LeafletMap from "../components/LeafletMap.jsx"

const leaflet = vi.hoisted(() => ({
  map: vi.fn(),
  tileLayer: vi.fn(),
  divIcon: vi.fn(),
  marker: vi.fn(),
}))

vi.mock("leaflet", () => ({ default: leaflet }))

describe("LeafletMap", () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it("uses OpenStreetMap.de tiles and credits OpenStreetMap contributors", () => {
    const mapInstance = {
      remove: vi.fn(),
      zoomControl: { setPosition: vi.fn() },
    }
    leaflet.map.mockReturnValue(mapInstance)
    leaflet.tileLayer.mockReturnValue({ addTo: vi.fn() })
    leaflet.divIcon.mockReturnValue({})
    leaflet.marker.mockReturnValue({
      addTo: vi.fn().mockReturnThis(),
      bindPopup: vi.fn(),
    })

    render(
      <LeafletMap
        coordinates={{ latitude: 60.3913, longitude: 5.3221 }}
        location="Bergen"
      />
    )

    expect(leaflet.tileLayer).toHaveBeenCalledWith(
      "https://tile.openstreetmap.de/{z}/{x}/{y}.png",
      expect.objectContaining({
        attribution: expect.stringContaining("OpenStreetMap"),
      })
    )
    expect(leaflet.tileLayer.mock.calls[0][1].attribution).toContain(
      "contributors"
    )
  })
})
