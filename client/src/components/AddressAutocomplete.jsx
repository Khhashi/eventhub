import React, { useEffect, useRef, useState } from "react"

const ADDRESS_URL = "https://ws.geonorge.no/adresser/v1/sok"

const formatAddress = (suggestion) => {
  const postal = [suggestion.postnummer, suggestion.poststed].filter(Boolean).join(" ")
  return [suggestion.adressetekst, postal].filter(Boolean).join(", ")
}

export default function AddressAutocomplete({ value, onChange, id = "location" }) {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [focused, setFocused] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const blurTimeout = useRef(null)
  const selectedAddress = useRef(null)

  useEffect(() => () => window.clearTimeout(blurTimeout.current), [])

  useEffect(() => {
    const query = value.trim()

    if (query.length < 3 || query === selectedAddress.current) {
      setSuggestions([])
      return undefined
    }

    const controller = new AbortController()
    const timeout = window.setTimeout(async () => {
      setLoading(true)

      try {
        const params = new URLSearchParams({
          sok: `${query}*`,
          treffPerSide: "5",
        })
        const response = await fetch(`${ADDRESS_URL}?${params}`, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        })
        if (!response.ok) throw new Error(`Adresseoppslag feilet: ${response.status}`)
        const data = await response.json()
        if (!Array.isArray(data.adresser)) throw new Error("Ugyldig svar fra adresseoppslag")
        if (!controller.signal.aborted) {
          setSuggestions(data.adresser.filter((address) => address.adresseid && address.adressetekst))
        }
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([])
          setError("Adresseforslag er utilgjengelige. Du kan skrive inn adressen selv.")
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 450)

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [value])

  const handleSelect = (suggestion) => {
    const address = formatAddress(suggestion)
    selectedAddress.current = address
    onChange({
      target: {
        name: "location",
        value: address,
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
        onChange={(event) => {
          selectedAddress.current = null
          setDismissed(false)
          setSuggestions([])
          setLoading(false)
          setError("")
          onChange(event)
        }}
        onFocus={() => {
          setFocused(true)
          setDismissed(false)
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") setDismissed(true)
        }}
        onBlur={() => {
          blurTimeout.current = window.setTimeout(() => setFocused(false), 150)
        }}
        placeholder="Skriv gate eller sted, f.eks. Karl Johans gate"
        autoComplete="street-address"
        aria-autocomplete="list"
        aria-controls={`${id}-suggestions`}
        required
      />

      {error && <div className="address-suggestion-status" role="status">{error}</div>}
      {focused && !dismissed && (loading || suggestions.length > 0) && (
        <div id={`${id}-suggestions`} className="address-suggestions" role="listbox">
          {loading && <div className="address-suggestion-status">Søker etter adresser...</div>}
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.adresseid}
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
