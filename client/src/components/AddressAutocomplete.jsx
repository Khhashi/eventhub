import React, { useEffect, useRef, useState } from "react"

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
const PHOTON_URL = "https://photon.komoot.io/api/"

const formatAddress = (suggestion) => {
  const address = suggestion.address || suggestion.properties || {}
  const street = [address.road || address.street, address.house_number || address.housenumber]
    .filter(Boolean)
    .join(" ")
  const city = address.city || address.town || address.village || address.municipality
  const postal = [address.postcode, city].filter(Boolean).join(" ")
  const conciseAddress = [street, postal].filter(Boolean).join(", ")

  return conciseAddress || suggestion.display_name
}

const fetchPhotonSuggestions = async (query, signal) => {
  const params = new URLSearchParams({
    q: query,
    limit: "5",
    bbox: "4,58,32,71",
  })
  const response = await fetch(`${PHOTON_URL}?${params}`, { signal })

  if (!response.ok) return []

  const data = await response.json()
  return data.features
    .filter((feature) => feature.properties?.countrycode === "NO")
    .map((feature) => ({
      ...feature,
      address: feature.properties,
      display_name: [
        feature.properties.name,
        feature.properties.city,
        feature.properties.postcode,
      ]
        .filter(Boolean)
        .join(", "),
      place_id: `${feature.properties.osm_type}-${feature.properties.osm_id}`,
    }))
}

export default function AddressAutocomplete({ value, onChange, id = "location" }) {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [lookupError, setLookupError] = useState("")
  const [focused, setFocused] = useState(false)
  const requestId = useRef(0)

  useEffect(() => {
    const query = value.trim()

    if (query.length < 3) {
      setSuggestions([])
      setLoading(false)
      setLookupError("")
      return undefined
    }

    const controller = new AbortController()
    const currentRequestId = ++requestId.current
    setSuggestions([])
    setLookupError("")
    const timeout = window.setTimeout(async () => {
      setLoading(true)

      try {
        const params = new URLSearchParams({
          q: query,
          format: "jsonv2",
          addressdetails: "1",
          limit: "5",
          countrycodes: "no",
          "accept-language": "no",
        })
        const response = await fetch(`${NOMINATIM_URL}?${params}`, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        })

        let nextSuggestions = []
        if (response.ok) {
          nextSuggestions = await response.json()
        } else {
          nextSuggestions = await fetchPhotonSuggestions(query, controller.signal)
        }

        if (currentRequestId === requestId.current) {
          if (nextSuggestions.length === 0) {
            setLookupError("Fant ingen norske adresseforslag.")
          }
          setSuggestions(nextSuggestions)
        }
      } catch (error) {
        if (error.name !== "AbortError" && currentRequestId === requestId.current) {
          try {
            const fallbackSuggestions = await fetchPhotonSuggestions(
              query,
              controller.signal
            )

            if (currentRequestId === requestId.current) {
              if (fallbackSuggestions.length === 0) {
                setLookupError("Fant ingen norske adresseforslag.")
              }
              setSuggestions(fallbackSuggestions)
            }
          } catch (fallbackError) {
            if (
              fallbackError.name !== "AbortError" &&
              currentRequestId === requestId.current
            ) {
              setSuggestions([])
              setLookupError("Kunne ikke hente adresseforslag akkurat nå.")
            }
          }
        }
      } finally {
        if (currentRequestId === requestId.current) {
          setLoading(false)
        }
      }
    }, 450)

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [value])

  const handleSelect = (suggestion) => {
    onChange({
      target: {
        name: "location",
        value: formatAddress(suggestion),
      },
    })
    setSuggestions([])
    setFocused(false)
  }

  return (
    <div className="address-autocomplete">
      <input
        id={id}
        name="location"
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => window.setTimeout(() => setFocused(false), 150)}
        placeholder="Skriv gate eller sted, f.eks. Karl Johans gate"
        autoComplete="street-address"
        aria-autocomplete="list"
        aria-controls={`${id}-suggestions`}
        required
      />

      {focused && (loading || suggestions.length > 0 || lookupError) && (
        <div id={`${id}-suggestions`} className="address-suggestions" role="listbox">
          {loading && <div className="address-suggestion-status">Søker etter adresser...</div>}
          {!loading && lookupError && (
            <div className="address-suggestion-status">{lookupError} Skriv adressen manuelt.</div>
          )}
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              type="button"
              className="address-suggestion"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleSelect(suggestion)}
            >
              <span>{formatAddress(suggestion)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
