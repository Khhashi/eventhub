import React, { useEffect, useState } from "react"
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  Tooltip,
} from "react-leaflet"

const locationCache = new Map()

export default function MapPreview({ location }) {
  const safeLocation = location || "Oslo"
  const locationKey = safeLocation.trim().toLowerCase()
  const query = encodeURIComponent(safeLocation)
  const mapUrl = `https://www.openstreetmap.org/search?query=${query}`
  const [coordinates, setCoordinates] = useState(null)
  const [mapStatus, setMapStatus] = useState("Laster kart...")

  useEffect(() => {
    const controller = new AbortController()
    const cachedCoordinates = locationCache.get(locationKey)

    if (cachedCoordinates) {
      setCoordinates(cachedCoordinates)
      setMapStatus("")
      return () => controller.abort()
    }

    if (locationCache.has(locationKey)) {
      setCoordinates(null)
      setMapStatus("Fant ikke en nøyaktig plassering")
      return () => controller.abort()
    }

    setCoordinates(null)
    setMapStatus("Laster kart...")

    const findLocation = async () => {
      try {
        const params = new URLSearchParams({
          q: safeLocation,
          format: "jsonv2",
          limit: "1",
          countrycodes: "no",
        })
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?${params}`,
          {
            signal: controller.signal,
            headers: { Accept: "application/json" },
          }
        )
        const results = response.ok ? await response.json() : []
        const result = results[0]

        if (!result) {
          locationCache.set(locationKey, null)
          setMapStatus("Fant ikke en nøyaktig plassering")
          return
        }

        const nextCoordinates = {
          latitude: Number(result.lat),
          longitude: Number(result.lon),
        }
        locationCache.set(locationKey, nextCoordinates)
        setCoordinates(nextCoordinates)
        setMapStatus("")
      } catch (error) {
        if (error.name !== "AbortError") {
          setMapStatus("Kartet kunne ikke lastes")
        }
      }
    }

    findLocation()
    return () => controller.abort()
  }, [locationKey, safeLocation])

  const fallbackCoordinates = { latitude: 59.9139, longitude: 10.7522 }
  const mapCoordinates = coordinates || fallbackCoordinates

  return (
    <div className="map-preview" title={`Kart for ${safeLocation}`}>
      <MapContainer
        key={`${mapCoordinates.latitude}-${mapCoordinates.longitude}`}
        className="map-preview__canvas"
        center={[mapCoordinates.latitude, mapCoordinates.longitude]}
        zoom={coordinates ? 14 : 10}
        scrollWheelZoom={false}
        title={`Kart for ${safeLocation}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <CircleMarker
          center={[mapCoordinates.latitude, mapCoordinates.longitude]}
          pathOptions={{ color: "#2563eb", fillColor: "#2563eb", fillOpacity: 0.8 }}
          radius={8}
        >
          <Tooltip direction="top" offset={[0, -8]}>
            {safeLocation}
          </Tooltip>
          <Popup>{safeLocation}</Popup>
        </CircleMarker>
      </MapContainer>
      {mapStatus && <span className="map-preview__status">{mapStatus}</span>}
      <a
        href={mapUrl}
        target="_blank"
        rel="noreferrer"
        className="map-preview__link"
      >
        Åpne kart
      </a>
    </div>
  )
}
