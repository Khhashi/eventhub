import React, { lazy, Suspense, useEffect, useState } from "react"

const LeafletMap = lazy(() => import("./LeafletMap.jsx"))
const coordinateCache = new Map()
const pendingLookups = new Map()

async function lookupCoordinates(location) {
  const cached = coordinateCache.get(location)
  if (cached && cached.expiresAt > Date.now()) return cached.coordinates
  coordinateCache.delete(location)
  if (pendingLookups.has(location)) return pendingLookups.get(location)

  const request = (async () => {
    const params = new URLSearchParams({
      q: location,
      format: "jsonv2",
      limit: "1",
      countrycodes: "no",
    })
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: { Accept: "application/json" },
    })
    if (!response.ok) throw new Error(`Kartoppslag feilet: ${response.status}`)
    const [result] = await response.json()
    if (!result) return null
    const latitude = Number(result.lat)
    const longitude = Number(result.lon)
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
    const coordinates = { latitude, longitude }
    if (coordinateCache.size >= 100) coordinateCache.delete(coordinateCache.keys().next().value)
    coordinateCache.set(location, { coordinates, expiresAt: Date.now() + 30 * 60 * 1000 })
    return coordinates
  })()
  pendingLookups.set(location, request)
  try {
    return await request
  } finally {
    pendingLookups.delete(location)
  }
}

export default function MapPreview({ location }) {
  const safeLocation = location?.trim() || ""
  const query = encodeURIComponent(safeLocation)
  const [coordinates, setCoordinates] = useState(null)
  const [mapStatus, setMapStatus] = useState(null)

  useEffect(() => {
    if (!safeLocation) return undefined
    let active = true

    const findLocation = async () => {
      try {
        const result = await lookupCoordinates(safeLocation)
        if (!active) return
        if (!result) {
          setMapStatus({ location: safeLocation, message: "Fant ikke en nøyaktig plassering" })
          return
        }
        setCoordinates({ ...result, location: safeLocation })
        setMapStatus(null)
      } catch {
        if (active) {
          setMapStatus({ location: safeLocation, message: "Kartet kunne ikke lastes" })
        }
      }
    }

    findLocation()
    return () => { active = false }
  }, [safeLocation])

  const resolvedCoordinates = coordinates?.location === safeLocation ? coordinates : null
  const mapUrl = resolvedCoordinates
    ? `https://www.openstreetmap.org/?mlat=${resolvedCoordinates.latitude}&mlon=${resolvedCoordinates.longitude}#map=16/${resolvedCoordinates.latitude}/${resolvedCoordinates.longitude}`
    : `https://www.openstreetmap.org/search?query=${query}`
  const directionsUrl =
    `https://www.google.com/maps/dir/?api=1&destination=${query}`
  return (
    <div className="map-preview">
      {resolvedCoordinates && (
        <Suspense fallback={<span className="map-preview__status" role="status">Laster kart...</span>}>
          <LeafletMap coordinates={resolvedCoordinates} location={safeLocation} />
        </Suspense>
      )}
      {!resolvedCoordinates && (
        <span className="map-preview__status" role="status">
          {!safeLocation ? "Ingen adresse er oppgitt" :
            mapStatus?.location === safeLocation ? mapStatus.message : "Laster kart..."}
        </span>
      )}
      <div className="map-preview__links">
        {location?.trim() && (
          <a href={directionsUrl} target="_blank" rel="noreferrer" className="map-preview__link">
            Veibeskrivelse
          </a>
        )}
        {safeLocation && (
          <a href={mapUrl} target="_blank" rel="noreferrer" className="map-preview__link">
            Åpne kart
          </a>
        )}
      </div>
    </div>
  )
}
