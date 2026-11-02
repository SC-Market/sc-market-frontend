import "../../../../util/i18n"
/**
 * Shop Settings › Stock Management › Stock subtraction timing: options that
 * say what happens to V2 orders, a "?" HelpTip explaining them, and the
 * saved value shown (a disabled or unknown row is the default, as on the
 * server).
 */
import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { ThemeProvider } from "@mui/material/styles"
import { mainTheme } from "../../../../hooks/styles/Theme"
import type { ShopResponse } from "../../../../store/api/v2/market"

const { updateShop, issueAlert, state, query, mutation } = vi.hoisted(() => ({
  updateShop: vi.fn(),
  issueAlert: vi.fn(),
  state: { shop: {} as ShopResponse, settings: [] as Array<Record<string, unknown>> },
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
  useGetShopOrderSettingsQuery: () => ({ data: state.settings, isLoading: false }),
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
vi.mock("../ShopStorefrontSection", () => ({ ShopStorefrontSection: () => null }))
vi.mock("../../../../components/layout/StandardPageLayout", () => ({
  StandardPageLayout: (props: { children: React.ReactNode }) => <div>{props.children}</div>,
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
    permissions: { can_manage: true, manage_market: true, manage_stock: true, manage_orders: true },
    ...overrides,
  } as ShopResponse
}

function renderSettings() {
  render(
    <ThemeProvider theme={mainTheme}>
      <MemoryRouter>
        <ShopSettings />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

const timingRow = (message_content: string, enabled = true) => ({
  id: "s1",
  entity_type: "shop",
  entity_id: "shop-1",
  setting_type: "stock_subtraction_timing",
  message_content,
  enabled,
  created_at: "2026-01-01",
  updated_at: "2026-01-01",
})

describe("Shop Settings › Stock subtraction timing", () => {
  beforeEach(() => {
    issueAlert.mockReset()
    state.shop = shop({})
    state.settings = []
  })

  it("describes each option by what happens to an order (no 'received/fulfilled' mix-up)", () => {
    renderSettings()
    expect(screen.getByLabelText("When you accept the order (default)")).toBeChecked()
    expect(screen.getByLabelText("As soon as the order arrives, before you accept it")).not.toBeChecked()
    expect(screen.getByLabelText("Never (unlimited supply)")).not.toBeChecked()
    expect(screen.queryByText(/received\/fulfilled/)).not.toBeInTheDocument()
  })

  it("has a ? HelpTip that explains all three values", () => {
    renderSettings()
    const tip = screen.getByRole("button", { name: "Help: Stock subtraction timing" })
    fireEvent.click(tip)
    const text = screen.getByRole("tooltip").textContent ?? ""
    expect(text).toContain("When you accept (default)")
    expect(text).toContain("holds its units while you decide")
    expect(text).toContain("listed quantities never go down")
  })

  it("shows the shop's saved timing", () => {
    state.settings = [timingRow("dont_subtract")]
    renderSettings()
    expect(screen.getByLabelText("Never (unlimited supply)")).toBeChecked()
  })

  it("a disabled or unknown saved row shows the default, which is what orders use", () => {
    state.settings = [timingRow("on_received", false)]
    renderSettings()
    expect(screen.getByLabelText("When you accept the order (default)")).toBeChecked()
  })
})
