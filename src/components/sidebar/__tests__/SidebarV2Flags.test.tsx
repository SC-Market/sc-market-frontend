/**
 * Feature-flag gating for SidebarV2.
 *
 * SidebarV2 renders behind `nav_v2`, and it built its Wiki entries inline
 * instead of going through SidebarEntries/createItemFilter. So while the v1
 * sidebar gated that entry on `feature_flag: "wiki"`, this one showed it
 * unconditionally — the two sidebars disagreed about the same flag, and turning
 * `wiki` off hid the section for v1 users only.
 *
 * These tests assert on the rendered tree rather than the filter helper,
 * because the bug was that no filter was involved at all.
 */

import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { useState } from "react"
import { DrawerOpenContext } from "../../../hooks/layout/Drawer"

/** Driven per test to flip `wiki` without touching localStorage or the network. */
let mockFlags: Record<string, boolean> = {}

vi.mock("../../../hooks/market", () => ({
  useFeatureFlag: () => ({
    flags: mockFlags,
    marketVersion: "V1",
    isLoading: false,
    error: null,
    setMarketVersion: vi.fn(),
    isDeveloper: false,
    hasOverride: false,
    overriddenFlags: [],
    setFlag: vi.fn(),
  }),
}))

vi.mock("../../../features/profile/api/profileApi", () => ({
  useGetUserProfileQuery: () => ({ data: undefined, error: undefined }),
}))
vi.mock("../../../features/contractor/api/contractorApi", () => ({
  useGetContractorBySpectrumIDQuery: () => ({ data: undefined }),
}))
vi.mock("../../../store/api/v2/market", () => ({
  useGetMyShopsQuery: () => ({ data: undefined }),
}))
vi.mock("../../../features/chats", () => ({ useUnreadChatCount: () => 0 }))
vi.mock("../../../features/orders/hooks/usePendingOrderCount", () => ({
  usePendingOrderCount: () => 0,
}))
vi.mock("../../../features/orders/hooks/useShopPendingOrderCount", () => ({
  useShopPendingOrderCount: () => 0,
}))

const { SidebarV2 } = await import("../SidebarV2")

/** Supplies the drawer context SidebarV2 requires, open so content renders. */
function Harness() {
  const drawer = useState(true)
  return (
    <MemoryRouter initialEntries={["/"]}>
      <DrawerOpenContext.Provider value={drawer}>
        <SidebarV2 />
      </DrawerOpenContext.Provider>
    </MemoryRouter>
  )
}

function renderSidebar() {
  return render(<Harness />)
}

beforeEach(() => {
  mockFlags = {}
})

describe("SidebarV2 — wiki flag gating", () => {
  it("renders the Wiki section when the flag is on", () => {
    mockFlags = { wiki: true }

    renderSidebar()

    expect(screen.getByText("Wiki")).toBeInTheDocument()
  })

  it("hides the Wiki section when the flag is off", () => {
    mockFlags = { wiki: false }

    renderSidebar()

    expect(screen.queryByText("Wiki")).not.toBeInTheDocument()
  })

  it("hides the Wiki section when the flag is absent from the resolved set", () => {
    mockFlags = { nav_v2: true }

    renderSidebar()

    expect(screen.queryByText("Wiki")).not.toBeInTheDocument()
  })

  it("keeps unflagged sections visible when wiki is off", () => {
    // Guards against over-correcting: the flag must gate Wiki alone.
    mockFlags = { wiki: false }

    renderSidebar()

    expect(screen.queryByText("Wiki")).not.toBeInTheDocument()
    expect(screen.getByText("Game Data")).toBeInTheDocument()
  })
})
