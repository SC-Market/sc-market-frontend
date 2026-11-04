import React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const h = vi.hoisted(() => ({
  data: null as null | { wipe_id: string; ran_at: string; count: number },
  query: vi.fn(),
  relist: vi.fn(),
  alert: vi.fn(),
}))

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)
vi.mock("../../../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => h.alert,
}))
vi.mock("../../../../../store/api/v2/market", () => ({
  useGetWipeRelistQuery: (arg: unknown) => {
    h.query(arg)
    return { data: h.data }
  },
  useRelistWipeMutation: () => [
    (arg: unknown) => ({ unwrap: () => h.relist(arg) }),
    { isLoading: false },
  ],
}))

import { WipeRelistBanner } from "../WipeRelistBanner"

const WIPE = "aaaaaaaa-0000-4000-8000-000000000001"

beforeEach(() => {
  vi.clearAllMocks()
  h.data = { wipe_id: WIPE, ran_at: "2026-11-03T12:00:00Z", count: 3 }
})

describe("WipeRelistBanner", () => {
  it("says how many listings the wipe paused and when", () => {
    render(<WipeRelistBanner />)
    expect(
      screen.getByText(
        /3 listings were paused by the wipe on November 3, 2026/,
      ),
    ).toBeTruthy()
    expect(screen.getByRole("button", { name: "Relist all" })).toBeTruthy()
    expect(h.query).toHaveBeenCalledWith({ shopId: undefined })
  })

  it("one listing: singular", () => {
    h.data = { wipe_id: WIPE, ran_at: "2026-11-03T12:00:00Z", count: 1 }
    render(<WipeRelistBanner />)
    expect(screen.getByText(/1 listing was paused by the wipe/)).toBeTruthy()
  })

  it("nothing to relist: nothing shown", () => {
    h.data = null
    const { container } = render(<WipeRelistBanner />)
    expect(container.textContent).toBe("")
  })

  it("Relist all relists that wipe across every shop the user manages", async () => {
    h.relist.mockResolvedValue({ relisted: 3 })
    render(<WipeRelistBanner />)
    fireEvent.click(screen.getByRole("button", { name: "Relist all" }))
    await waitFor(() => expect(h.alert).toHaveBeenCalled())
    expect(h.relist).toHaveBeenCalledWith({
      wipeRelistRequest: { wipe_id: WIPE },
    })
    expect(h.alert).toHaveBeenCalledWith({
      message: "Relisted 3 listings",
      severity: "success",
    })
  })

  it("on a shop's Listings page: only that shop", async () => {
    h.relist.mockResolvedValue({ relisted: 0 })
    render(<WipeRelistBanner shopId="shop-1" />)
    expect(h.query).toHaveBeenCalledWith({ shopId: "shop-1" })
    fireEvent.click(screen.getByRole("button", { name: "Relist all" }))
    await waitFor(() => expect(h.alert).toHaveBeenCalled())
    expect(h.relist).toHaveBeenCalledWith({
      wipeRelistRequest: { wipe_id: WIPE, shop_id: "shop-1" },
    })
    expect(h.alert).toHaveBeenCalledWith({
      message: "Nothing left to relist.",
      severity: "info",
    })
  })

  it("a failure says so", async () => {
    h.relist.mockRejectedValue(new Error("500"))
    render(<WipeRelistBanner />)
    fireEvent.click(screen.getByRole("button", { name: "Relist all" }))
    await waitFor(() => expect(h.alert).toHaveBeenCalled())
    expect(h.alert.mock.calls[0][0].severity).toBe("error")
  })
})
