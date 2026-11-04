import React from "react"
import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const h = vi.hoisted(() => ({ data: null as unknown }))

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)
vi.mock("../../../store/api/v2/market", () => ({
  useGetLastWipeQuery: () => ({ data: h.data, isLoading: false }),
}))

import { LastWipeStats } from "../LastWipeStats"

beforeEach(() => {
  h.data = null
})

describe("LastWipeStats", () => {
  it("no wipe yet", () => {
    render(<LastWipeStats />)
    expect(screen.getByText("No wipe has run yet.")).toBeTruthy()
  })

  it("the last wipe: paused, relisted so far, sellers messaged", () => {
    h.data = {
      wipe_id: "w1",
      ran_at: "2026-11-03T12:00:00Z",
      paused: 1234,
      relisted: 56,
      messages_queued: 80,
      messages_sent: 79,
    }
    render(<LastWipeStats />)
    const text = screen.getByTestId("last-wipe").textContent
    expect(text).toContain("Ran on")
    expect(text).toContain("Listings paused1,234")
    expect(text).toContain("Relisted so far56")
    expect(text).toContain("Sellers messaged79 of 80")
  })
})
