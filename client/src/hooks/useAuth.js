import { useCallback, useEffect, useState } from "react"

const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:3000/api"
    : "/api"

export default function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        credentials: "include",
      })

      if (!res.ok) throw new Error("Not authenticated")

      const data = await res.json()
      setUser(data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const logout = useCallback(() => {
    fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    })
    setUser(null)
  }, [])

  return {
    user,
    loading,
    refresh,
    logout,
    isAuthenticated: Boolean(user),
  }
}