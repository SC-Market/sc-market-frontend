import React from "react"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import * as marketApi from "../../../store/api/v2/market"

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)
vi.mock("../../../hooks/alert/AlertHook", () => ({
  useAlertHook: () => vi.fn(),
}))
vi.mock("../../../store/api/v2/market", () => ({
  useGetLinkedDiscordServersQuery: vi.fn(),
  useUpdateLinkedDiscordServerMutation: vi.fn(),
  useUnlinkDiscordServerMutation: vi.fn(),
}))

import { LinkedDiscordServers } from "../LinkedDiscordServers"

const GUILD = "223456789012345678"
const update = vi.fn()
const unlink = vi.fn()

const server: marketApi.LinkedDiscordServer = {
  guild_id: GUILD,
  name: "Traders",
  icon_url: null,
  bot_in_server: true,
  channels: [
    { channel_id: "1", name: "orders", kind: "text" },
    { channel_id: "2", name: "order-posts", kind: "forum" },
    { channel_id: "3", name: "news", kind: "announcement" },
  ],
  thread_channel_id: "2",
  alert_channel_ids: ["1"],
}

function servers(
  list: marketApi.LinkedDiscordServer[] | undefined,
  isError = false,
) {
  vi.mocked(marketApi.useGetLinkedDiscordServersQuery).mockReturnValue({
    data: list && { servers: list },
    isError,
  } as never)
}

const view = (query = "") =>
  render(
    <MemoryRouter initialEntries={[`/shop/my-shop/settings${query}`]}>
      <LinkedDiscordServers owner={{ shop: "s1" }} src="shop_settings" />
    </MemoryRouter>,
  )

beforeEach(() => {
  vi.clearAllMocks()
  update.mockReturnValue({ unwrap: () => Promise.resolve(server) })
  unlink.mockReturnValue({ unwrap: () => Promise.resolve(undefined) })
  vi.mocked(marketApi.useUpdateLinkedDiscordServerMutation).mockReturnValue([
    update,
    { isLoading: false },
  ] as never)
  vi.mocked(marketApi.useUnlinkDiscordServerMutation).mockReturnValue([
    unlink,
    { isLoading: false },
  ] as never)
})

describe("LinkedDiscordServers", () => {
  it("adds the bot through the install flow with this shop", () => {
    servers([])
    view()
    expect(screen.getByTestId("linked-discord-add").getAttribute("href")).toBe(
      "/discord/install?type=server&src=shop_settings&shop=s1",
    )
    expect(marketApi.useGetLinkedDiscordServersQuery).toHaveBeenCalledWith({
      shop: "s1",
    })
    expect(screen.queryByTestId("linked-discord-just-linked")).toBeNull()
  })

  it("after the install: says the server is linked and saves the picked channels", async () => {
    servers([server])
    view("?discord=linked")
    expect(screen.getByTestId("linked-discord-just-linked")).toBeInTheDocument()
    expect(screen.getByText("Traders")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "Save channels" }))
    await waitFor(() =>
      expect(update).toHaveBeenCalledWith({
        guildId: GUILD,
        updateLinkedDiscordServerRequest: {
          shop: "s1",
          thread_channel_id: "2",
          alert_channel_ids: ["1"],
        },
      }),
    )
    fireEvent.click(screen.getByRole("button", { name: "Unlink server" }))
    await waitFor(() =>
      expect(unlink).toHaveBeenCalledWith({ guildId: GUILD, shop: "s1" }),
    )
  })

  it("when the bot left the server: no channels to pick, only unlink", () => {
    servers([{ ...server, bot_in_server: false, channels: [] }])
    view()
    expect(
      screen.getByText(/isn't in this server any more/),
    ).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Save channels" })).toBeNull()
  })

  it("hidden for someone who may not manage it", () => {
    servers(undefined, true)
    const { container } = view()
    expect(container).toBeEmptyDOMElement()
  })
})
