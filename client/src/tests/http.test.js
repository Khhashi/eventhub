import { afterEach, describe, expect, it, vi } from "vitest"
import { request } from "../api/http"

const mockFetch = (status, body) => {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(body),
  })
}

describe("request", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("includes the status code and server message when a request fails", async () => {
    mockFetch(401, JSON.stringify({ message: "Du må logge inn først." }))

    await expect(request("/auth/profile")).rejects.toEqual({
      message: "Du må logge inn først.",
      status: 401,
      response: { status: 401 },
    })
  })

  it("falls back to a default message when a failed response has no body", async () => {
    mockFetch(500, "")

    await expect(request("/events")).rejects.toMatchObject({
      message: "Forespørselen kunne ikke gjennomføres.",
      status: 500,
    })
  })
})
