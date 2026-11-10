import "../../../../util/i18n"
/**
 * Shop Settings › form: edits survive a refetch of the same shop, saving
 * sends only what changed. (Who may open it: ShopContextFromRoute, see
 * src/components/router/__tests__/ShopContextFromRoute.access.test.tsx.)
 */
import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { act, render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { ThemeProvider } from "@mui/material/styles"
import { mainTheme } from "../../../../hooks/styles/Theme"
import type { ShopResponse } from "../../../../store/api/v2/market"

const { updateShop, issueAlert, state, query, mutation } = vi.hoisted(() => ({
  updateShop: vi.fn(),
  issueAlert: vi.fn(),
  state: { shop: {} as ShopResponse },
  query: () => ({ data: undefined, isLoading: false }),
  mutation: () => [vi.fn(), { isLoading: false }],
}))

vi.mock("../../../../components/router/ShopContextFromRoute", () => ({
  useShopRouteContext: () => ({ shop: state.shop }),
}))
vi.mock("../../../../store/api/v2/market", () => ({
  useUpdateShopMutation: () => [
    (arg: unknown) => ({ unwrap: () => Promise.resolve(updateShop(arg)) }),
    { isLoading: false },
  ],
  useGetShopWebhooksQuery: query,
  useCreateShopWebhookMutation: mutation,
  useDeleteShopWebhookMutation: mutation,
  useGetShopOrderSettingsQuery: query,
  useUpsertShopOrderSettingMutation: mutation,
  useDeleteShopOrderSettingMutation: mutation,
  useTransferShopMutation: mutation,
  useGetShopSlugAvailabilityQuery: () => ({
    data: undefined,
    isFetching: false,
  }),
}))
vi.mock("../../../../store/api/v2/market-overrides", () => ({
  useUploadImageMutation: mutation,
}))
vi.mock("../../../profile/api/profileApi", () => ({
  useGetUserProfileQuery: () => ({ data: { contractors: [] } }),
}))
// Transfer Ownership looks up the owning org's owner role.
vi.mock("../../../contractor/api/contractorApi", () => ({
  useGetContractorBySpectrumIDQuery: () => ({ data: undefined }),
}))
vi.mock("../../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => issueAlert,
}))
vi.mock("../ShopBlocklist", () => ({ ShopBlocklistSection: () => null }))
vi.mock("../../../discord-install/LinkedDiscordServers", () => ({
  LinkedDiscordServers: () => null,
}))
vi.mock("../ShopStorefrontSection", () => ({
  ShopStorefrontSection: () => null,
}))
vi.mock("../../../../components/layout/StandardPageLayout", () => ({
  StandardPageLayout: (props: { children: React.ReactNode }) => (
    <div>{props.children}</div>
  ),
}))

import { ShopSettings } from "../ShopSettings"

function shop(overrides: Partial<ShopResponse>): ShopResponse {
  return {
    shop_id: "shop-1",
    slug: "scmarket",
    name: "SC Market",
    description: "",
    banner: null,
    logo: null,
    owner_user_id: null,
    is_org_owned: true,
    owner_contractor_spectrum_id: "SCMARKET",
    supported_languages: ["en"],
    tags: [],
    accepts_custom_orders: true,
    market_order_template: "",
    default_pickup_method: null,
    status: "active",
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
    banner_url: null,
    logo_url: null,
    official_server_id: null,
    discord_thread_channel_id: null,
    badge_ids: [],
    permissions: {
      can_manage: true,
      manage_market: true,
      manage_stock: true,
      manage_orders: true,
    },
    ...overrides,
  } as ShopResponse
}

const page = () => (
  <ThemeProvider theme={mainTheme}>
    <MemoryRouter>
      <ShopSettings />
    </MemoryRouter>
  </ThemeProvider>
)

function renderSettings() {
  const { rerender } = render(page())
  return {
    rerender: () => rerender(page()),
    name: () => screen.getByLabelText(/Shop Name/),
    save: () =>
      fireEvent.click(screen.getByRole("button", { name: /Save Changes/ })),
  }
}

describe("Shop Settings › form", () => {
  beforeEach(() => {
    updateShop.mockReset()
    issueAlert.mockReset()
  })

  it("keeps an unsaved edit when the same shop is refetched", () => {
    state.shop = shop({})
    const { name, rerender } = renderSettings()
    fireEvent.change(name(), { target: { value: "SC Market Co" } })

    // A refetch hands back a new object for the same shop.
    state.shop = shop({
      updated_at: "2026-01-02",
      description: "Changed elsewhere",
    })
    rerender()
    expect(name()).toHaveValue("SC Market Co")
  })

  it("starts a fresh draft for a different shop", () => {
    state.shop = shop({})
    const { name, rerender } = renderSettings()
    fireEvent.change(name(), { target: { value: "SC Market Co" } })

    state.shop = shop({ shop_id: "shop-2", slug: "other", name: "Other Shop" })
    rerender()
    expect(name()).toHaveValue("Other Shop")
  })

  it("saves only the changed fields", async () => {
    state.shop = shop({})
    const { name, save } = renderSettings()
    fireEvent.change(name(), { target: { value: "SC Market Co" } })
    save()
    await vi.waitFor(() => expect(updateShop).toHaveBeenCalledTimes(1))
    await act(() => Promise.resolve())
    expect(updateShop.mock.calls[0][0]).toEqual({
      shopId: "shop-1",
      updateShopRequest: { name: "SC Market Co" },
    })
  })

  it("sends a field again only if it changes after a save", async () => {
    state.shop = shop({})
    const { name, save } = renderSettings()
    fireEvent.change(name(), { target: { value: "SC Market Co" } })
    save()
    await vi.waitFor(() => expect(updateShop).toHaveBeenCalledTimes(1))
    await vi.waitFor(() =>
      expect(issueAlert).toHaveBeenCalledWith(
        expect.objectContaining({ severity: "success" }),
      ),
    )
    await act(() => Promise.resolve())
    save()
    await vi.waitFor(() => expect(updateShop).toHaveBeenCalledTimes(2))
    expect(updateShop.mock.calls[1][0].updateShopRequest).toEqual({})
  })
})
