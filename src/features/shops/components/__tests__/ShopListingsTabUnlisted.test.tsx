/**
 * Shop page listings: the admin-only "Show unlisted (admin)" toggle. Hidden
 * for everyone else, off by default; on, the search asks for unlisted
 * listings (includeUnlisted), which the backend honours for site admins only.
 */
import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

const h = vi.hoisted(() => {
  const state: {
    role: string | undefined
    searchArgs: Array<Record<string, unknown>>
  } = {
    role: "user",
    searchArgs: [],
  }
  return state
})

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: unknown) =>
      typeof defaultValue === "string" ? defaultValue : key,
  }),
}))

vi.mock("../../../profile/api/profileApi", () => ({
  useGetUserProfileQuery: () => ({
    data: h.role ? { role: h.role } : undefined,
  }),
}))

vi.mock("../../../../store/api/v2/market", () => ({
  useGetShopQuery: vi.fn(),
  useGetShopReviewsQuery: vi.fn(),
  useSearchListingsQuery: (arg: Record<string, unknown>) => {
    h.searchArgs.push(arg)
    return {
      data: { listings: [], total: 0 },
      isLoading: false,
      isFetching: false,
      currentData: undefined,
    }
  },
}))

vi.mock("../../../market/v2/ListingSearchV2", () => ({
  ListingCardV2: () => null,
}))
vi.mock("../../../services/components/ServiceListings", () => ({
  ServiceListings: () => null,
}))
vi.mock("../../../../views/services/ServiceSearchArea", () => ({
  ServiceSearchArea: () => null,
}))
vi.mock("../../../../views/orders/CreateOrderForm", () => ({
  CreateOrderForm: () => null,
}))
vi.mock("../../../../components/markdown/Markdown", () => ({
  MarkdownRender: () => null,
}))
vi.mock("../../../../components/metadata/PageReady", () => ({
  usePageReady: () => undefined,
}))

const { ShopListingsTab } = await import("../ShopProfile")

function renderTab() {
  return render(
    <MemoryRouter>
      <ShopListingsTab slug="some-shop" />
    </MemoryRouter>,
  )
}

const lastArgs = () => h.searchArgs[h.searchArgs.length - 1]

beforeEach(() => {
  h.searchArgs = []
})

describe("ShopListingsTab: show unlisted (admin)", () => {
  it("is hidden for non-admins, who never ask for unlisted listings", () => {
    for (const role of ["user", undefined]) {
      h.role = role
      const { unmount } = renderTab()
      expect(screen.queryByLabelText("Show unlisted (admin)")).toBeNull()
      expect(h.searchArgs.every((a) => a.includeUnlisted === undefined)).toBe(
        true,
      )
      unmount()
    }
  })

  it("is off by default for admins, and asks for unlisted listings when on", () => {
    h.role = "admin"
    renderTab()
    const toggle = screen.getByLabelText("Show unlisted (admin)")
    expect(toggle).not.toBeChecked()
    expect(lastArgs().includeUnlisted).toBeUndefined()

    fireEvent.click(toggle)
    expect(toggle).toBeChecked()
    expect(lastArgs()).toMatchObject({
      shopSlug: "some-shop",
      includeUnlisted: true,
      page: 1,
    })

    fireEvent.click(toggle)
    expect(lastArgs().includeUnlisted).toBeUndefined()
  })
})
