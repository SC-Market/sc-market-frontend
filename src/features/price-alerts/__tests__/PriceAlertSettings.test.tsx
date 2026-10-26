import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"

const update = vi.fn()
const prefs = { site: true, push: true, email: false, discord: false }

vi.mock("../../../store/api/v2/market", () => ({
  useGetPriceAlertPreferencesQuery: () => ({
    data: prefs,
    isLoading: false,
    isError: false,
  }),
  useUpdatePriceAlertPreferencesMutation: () => [
    update,
    { isLoading: false, isError: false },
  ],
}))
vi.mock("../../../components/paper/Section", () => ({
  FlatSection: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

import { PriceAlertSettings } from "../components/PriceAlertSettings"

describe("PriceAlertSettings", () => {
  beforeEach(() => update.mockClear())

  it("shows one toggle per channel with the saved state", () => {
    render(<PriceAlertSettings />)
    const toggles = screen.getAllByRole("checkbox") as HTMLInputElement[]
    expect(toggles.map((t) => t.checked)).toEqual([true, true, false, false])
    expect(screen.getByText("Email")).toBeTruthy()
    expect(screen.getByText("Discord DM")).toBeTruthy()
  })

  it("saves only the channel that was toggled", () => {
    render(<PriceAlertSettings />)
    fireEvent.click(screen.getAllByRole("checkbox")[2])
    expect(update).toHaveBeenCalledWith({
      updatePriceAlertPreferencesRequest: { email: true },
    })
  })
})
