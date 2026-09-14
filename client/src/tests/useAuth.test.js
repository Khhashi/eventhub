import { renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import useAuth from "../hooks/useAuth.js"

describe("useAuth", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it("uses the local backend API URL with the auth cookie", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        _id: "123",
        name: "Test User",
        email: "test@example.com",
        role: "user",
      }),
    })

    vi.stubGlobal("fetch", fetchMock)
    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true)
    })

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/api/auth/me",
      expect.objectContaining({
        credentials: "include",
      })
    )
  })
})
