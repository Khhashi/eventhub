import { Suspense, lazy, useEffect, useState } from "react"
import {
  ArrowUpRightIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline"

const LeafletMap = lazy(() => import("./LeafletMap.jsx"))

const geocodeCache = new Map()
let geocodeQueue = Promise.resolve()
let lastGeocodeAt = 0

function findCoordinates(location) {
  const query = location.trim()
  const cached = geocodeCache.get(query)
  if (cached) return cached

  const request = geocodeQueue.then(async () => {
    const delay = Math.max(0, 1100 - (Date.now() - lastGeocodeAt))
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay))
    }

    lastGeocodeAt = Date.now()
    const params = new URLSearchParams({
      q: query,
      format: "jsonv2",
      limit: "1",
      countrycodes: "no",
    })
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      { headers: { Accept: "application/json" } }
    )

    if (!response.ok) {
      throw new Error(`Address lookup failed with status ${response.status}`)
    }

    const [result] = await response.json()
    if (!result) return null

    const latitude = Number(result.lat)
    const longitude = Number(result.lon)
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null

    return { latitude, longitude }
  })

  const cachedRequest = request.catch((error) => {
    if (geocodeCache.get(query) === cachedRequest) {
      geocodeCache.delete(query)
    }
    throw error
  })

  geocodeCache.set(query, cachedRequest)
  geocodeQueue = cachedRequest.then(
    () => undefined,
    () => undefined
  )

  return cachedRequest
}

export default function MapPreview({ location }) {
  const safeLocation = location?.trim() || ""
  const [lookup, setLookup] = useState(null)

  useEffect(() => {
    let active = true

    if (!safeLocation) return undefined

    findCoordinates(safeLocation)
      .then((result) => {
        if (!active) return
        setLookup({
          location: safeLocation,
          coordinates: result,
          status: result ? "" : "Fant ikke stedet",
        })
      })
      .catch(() => {
        if (active) {
          setLookup({
            location: safeLocation,
            coordinates: null,
            status: "Kartet kunne ikke lastes",
          })
        }
      })

    return () => {
      active = false
    }
  }, [safeLocation])

  const lookupMatches = lookup?.location === safeLocation
  const coordinates = lookupMatches ? lookup.coordinates : null
  const mapStatus = !safeLocation
    ? "Ingen adresse er oppgitt"
    : lookupMatches
      ? lookup.status
      : "Laster kart..."

  const mapUrl = coordinates
    ? `https://www.openstreetmap.org/?mlat=${coordinates.latitude}&mlon=${coordinates.longitude}#map=16/${coordinates.latitude}/${coordinates.longitude}`
    : safeLocation
      ? `https://www.openstreetmap.org/search?query=${encodeURIComponent(safeLocation)}`
      : null
  const directionsUrl = safeLocation
    ? `https://www.google.com/maps/dir/?api=1&destination=${
        coordinates
          ? encodeURIComponent(`${coordinates.latitude},${coordinates.longitude}`)
          : encodeURIComponent(safeLocation)
      }`
    : null

  return (
    <div className={`map-preview${coordinates ? "" : " map-preview--empty"}`}>
      <div className="map-preview__canvas">
        {coordinates && (
          <Suspense
            fallback={
              <div className="map-preview__placeholder" role="status">
                <span>Laster kart...</span>
              </div>
            }
          >
            <LeafletMap coordinates={coordinates} location={safeLocation} />
          </Suspense>
        )}
        {!coordinates && (
          <div className="map-preview__placeholder" role="status">
            <span className="map-preview__pin" aria-hidden="true">
              <MapPinIcon />
            </span>
            <span>{mapStatus}</span>
          </div>
        )}
      </div>
      <div className="map-preview__location-info">
        <span className="map-preview__location" title={safeLocation || undefined}>
          <MapPinIcon aria-hidden="true" />
          {safeLocation || "Sted mangler"}
        </span>
      </div>
      <div className="map-preview__footer">
        <div className="map-preview__actions">
          {directionsUrl && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="map-preview__link map-preview__link--directions"
            >
              Veibeskrivelse
            </a>
          )}
          {mapUrl && (
          <a
            href={mapUrl}
            target="_blank"
            rel="noreferrer"
            className="map-preview__link"
          >
            Større kart
            <ArrowUpRightIcon aria-hidden="true" />
          </a>
          )}
        </div>
      </div>
    </div>
  )
}
