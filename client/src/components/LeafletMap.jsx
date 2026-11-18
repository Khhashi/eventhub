import { useEffect, useRef } from "react"
import L from "leaflet"

export default function LeafletMap({ coordinates, location }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return undefined

    const center = [coordinates.latitude, coordinates.longitude]
    const map = L.map(containerRef.current, {
      center,
      zoom: 14,
      scrollWheelZoom: false,
    })

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
      }
    ).addTo(map)

    const markerIcon = L.divIcon({
      className: "map-marker-wrap",
      html: '<span class="map-marker"><span class="map-marker__dot"></span></span>',
      iconSize: [36, 44],
      iconAnchor: [18, 42],
    })
    const marker = L.marker(center, { icon: markerIcon }).addTo(map)
    const popupContent = document.createElement("span")
    popupContent.textContent = location
    marker.bindPopup(popupContent)
    map.zoomControl.setPosition("topright")

    return () => map.remove()
  }, [coordinates.latitude, coordinates.longitude, location])

  return (
    <div
      ref={containerRef}
      className="map-preview__map"
      role="region"
      aria-label={`Kart med markør for ${location}`}
    />
  )
}
