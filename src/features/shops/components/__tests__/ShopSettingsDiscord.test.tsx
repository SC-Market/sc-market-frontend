/**
 * Shop Settings › Discord: a shop's own order-thread channel (both IDs) or
 * none (use the owner's channel, set with /setup threads in Discord).
 */
import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, within } from "@testing-library/react"
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
  return {
    server: screen.getByLabelText("Discord Server ID"),
    channel: screen.getByLabelText("Thread Channel ID"),
    save: () => fireEvent.click(screen.getByRole("button", { name: /Save Changes/ })),
  }
}

describe("Shop Settings › Discord", () => {
  beforeEach(() => {
    updateShop.mockReset()
    issueAlert.mockReset()
  })

  it("explains that empty fields use the org's channel, set with /setup threads", () => {
    state.shop = shop({})
    renderSettings()
    const discord = screen.getByText(/own channel/).closest("div")!
    expect(within(discord).getByText(/your org's thread\s+channel/)).toBeInTheDocument()
    expect(discord.textContent).toContain("/setup threads")
  })

  it("says 'your' thread channel for a personal shop", () => {
    state.shop = shop({ is_org_owned: false, owner_user_id: "user-1" })
    renderSettings()
    expect(screen.getByText(/Leave both\s+empty to use your thread/)).toBeInTheDocument()
  })

  it("shows the shop's own channel and saves both IDs", async () => {
    state.shop = shop({ official_server_id: "1003056231591727264", discord_thread_channel_id: "1072580369251041330" })
    const { server, channel, save } = renderSettings()
    expect(server).toHaveValue("1003056231591727264")
    expect(channel).toHaveValue("1072580369251041330")

    fireEvent.change(channel, { target: { value: " 1072580369251041331 " } })
    save()
    await vi.waitFor(() => expect(updateShop).toHaveBeenCalledTimes(1))
    expect(updateShop.mock.calls[0][0].updateShopRequest).toMatchObject({
      official_server_id: "1003056231591727264",
      discord_thread_channel_id: "1072580369251041331",
    })
  })

  it("clears both to go back to the owner's channel", async () => {
    state.shop = shop({ official_server_id: "1003056231591727264", discord_thread_channel_id: "1072580369251041330" })
    const { server, channel, save } = renderSettings()
    fireEvent.change(server, { target: { value: "" } })
    fireEvent.change(channel, { target: { value: "" } })
    save()
    await vi.waitFor(() => expect(updateShop).toHaveBeenCalledTimes(1))
    expect(updateShop.mock.calls[0][0].updateShopRequest).toMatchObject({
      official_server_id: null,
      discord_thread_channel_id: null,
    })
  })

  it("won't save only one of the two IDs, and says why", () => {
    state.shop = shop({})
    const { server, save } = renderSettings()
    fireEvent.change(server, { target: { value: "1003056231591727264" } })

    expect(
      screen.getByText("Enter both the server ID and the channel ID, or leave both empty"),
    ).toBeInTheDocument()
    save()
    expect(updateShop).not.toHaveBeenCalled()
    expect(issueAlert).toHaveBeenCalledWith({
      message: "Enter both the server ID and the channel ID, or leave both empty",
      severity: "error",
    })
  })
})
