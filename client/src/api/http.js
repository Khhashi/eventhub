const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:3000/api"
    : "/api"

export const request = async (path, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers,
  })

  const text = await res.text()

  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    throw new Error(text || "Ugyldig svar fra serveren.")
  }

  if (!res.ok) {
    // Ta med statuskoden så sidene kan skille mellom f.eks. 401 (ikke innlogget) og 404.
    throw {
      message: "Forespørselen kunne ikke gjennomføres.",
      ...data,
      status: res.status,
      response: { status: res.status },
    }
  }

  return data
}