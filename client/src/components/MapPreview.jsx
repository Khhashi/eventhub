import React, { lazy, Suspense, useEffect, useState } from "react"

const LeafletMap = lazy(() => import("./LeafletMap.jsx"))

export default function MapPreview({ location }) {
  const safeLocation = location?.trim() || ""
  const query = encodeURIComponent(safeLocation)
  const [coordinates, setCoordinates] = useState(null)
  const [mapStatus, setMapStatus] = useState(null)

  useEffect(() => {
    if (!safeLocation) return undefined
    const controller = new AbortController()

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
        if (!response.ok) throw new Error(`Kartoppslag feilet: ${response.status}`)
        const results = await response.json()
        const result = results[0]

        if (!result) {
          setMapStatus({ location: safeLocation, message: "Fant ikke en nøyaktig plassering" })
          return
        }

        const latitude = Number(result.lat)
        const longitude = Number(result.lon)
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          setMapStatus({ location: safeLocation, message: "Fant ikke en nøyaktig plassering" })
          return
        }
        setCoordinates({ latitude, longitude, location: safeLocation })
        setMapStatus(null)
      } catch (error) {
        if (error.name !== "AbortError") {
          setMapStatus({ location: safeLocation, message: "Kartet kunne ikke lastes" })
        }
      }
    }

    findLocation()
    return () => controller.abort()
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
        <Suspense fallback={<span role="status">Laster kart...</span>}>
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
