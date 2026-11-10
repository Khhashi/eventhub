import React, { useState } from "react"
import { describe, it, expect, vi, afterEach } from "vitest"
import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import AddressAutocomplete from "../components/AddressAutocomplete.jsx"

const suggestion = {
  adresseid: "1",
  adressetekst: "Karl Johans gate 1",
  postnummer: "0154",
  poststed: "OSLO",
}

function Harness() {
  const [value, setValue] = useState("Karl Johans")

  return (
    <AddressAutocomplete
      value={value}
      onChange={(event) => setValue(event.target.value)}
    />
  )
}

describe("AddressAutocomplete", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("closes the suggestions on Escape without changing the field", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ adresser: [suggestion] }) })
    )
    const user = userEvent.setup()

    render(<Harness />)

    const input = screen.getByPlaceholderText(/gate eller sted/i)
    await user.click(input)
    expect(await screen.findByRole("listbox")).toBeInTheDocument()

    await user.keyboard("{Escape}")

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
    expect(input).toHaveValue("Karl Johans")

    await user.type(input, " ")

    expect(await screen.findByRole("listbox")).toBeInTheDocument()
  })

  it("requests and selects a formatted address from Kartverket", async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true, json: async () => ({ adresser: [suggestion] }),
    })
    vi.stubGlobal("fetch", fetch)
    const user = userEvent.setup()
    render(<Harness />)
    const input = screen.getByPlaceholderText(/gate eller sted/i)
    await user.click(input)
    await user.click(await screen.findByRole("button", { name: "Karl Johans gate 1, 0154 OSLO" }))

    expect(input).toHaveValue("Karl Johans gate 1, 0154 OSLO")
    const url = new URL(fetch.mock.calls[0][0])
    expect(url.origin + url.pathname).toBe("https://ws.geonorge.no/adresser/v1/sok")
    expect(url.searchParams.get("sok")).toBe("Karl Johans*")
    expect(url.searchParams.get("treffPerSide")).toBe("5")
    await new Promise((resolve) => setTimeout(resolve, 500))
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it("reports failed lookups while allowing manual input", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }))
    const user = userEvent.setup()
    render(<Harness />)
    const input = screen.getByPlaceholderText(/gate eller sted/i)
    await user.click(input)
    expect(await screen.findByRole("status")).toHaveTextContent("Du kan skrive inn adressen selv")
    await user.type(input, " 42")
    expect(input).toHaveValue("Karl Johans 42")
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })

  it("ignores an outdated response after the query changes", async () => {
    let resolveFirst
    const fetch = vi.fn()
      .mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve }))
      .mockResolvedValue({ ok: true, json: async () => ({ adresser: [] }) })
    vi.stubGlobal("fetch", fetch)
    const user = userEvent.setup()
    render(<Harness />)
    const input = screen.getByPlaceholderText(/gate eller sted/i)
    await user.click(input)
    await screen.findByText("Søker etter adresser...")
    await user.clear(input)
    await user.type(input, "Bergen")
    await act(async () => resolveFirst({ ok: true, json: async () => ({ adresser: [suggestion] }) }))
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2))
    expect(screen.queryByRole("button", { name: /Karl Johans gate/ })).not.toBeInTheDocument()
    expect(input).toHaveValue("Bergen")
  })
})
