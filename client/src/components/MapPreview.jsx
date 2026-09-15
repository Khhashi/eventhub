import React, { useEffect, useState } from "react"

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
  const delta = coordinates ? 0.008 : 0.04
  const bbox = [
    mapCoordinates.longitude - delta,
    mapCoordinates.latitude - delta,
    mapCoordinates.longitude + delta,
    mapCoordinates.latitude + delta,
  ].join(",")
  const embedUrl =
    `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}` +
    `&layer=mapnik&marker=${mapCoordinates.latitude},${mapCoordinates.longitude}`

  return (
    <div className="map-preview">
      <iframe
        title={`Kart for ${safeLocation}`}
        src={embedUrl}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
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
