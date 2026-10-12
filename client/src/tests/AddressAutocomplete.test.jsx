import React, { useState } from "react"
import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import AddressAutocomplete from "../components/AddressAutocomplete.jsx"

const suggestion = {
  place_id: 1,
  address: { road: "Karl Johans gate", postcode: "0161", city: "Oslo" },
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
      vi.fn().mockResolvedValue({ ok: true, json: async () => [suggestion] })
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
})
