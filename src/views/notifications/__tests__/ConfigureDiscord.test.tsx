/**
 * Settings › Discord Integration (yours) and the org's Discord tab: the
 * Integrated Channel comes from the owner's order-thread channel
 * (GET .../settings/discord → guild_id, channel_id and names), and the page
 * says how to set one up with the bot.
 */
import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { ThemeProvider } from "@mui/material/styles"
import { mainTheme } from "../../../hooks/styles/Theme"
import type { DiscordSettings } from "../../../features/contractor/domain/types"

const state: {
  user: DiscordSettings | undefined
  org: DiscordSettings | undefined
  orgArg: unknown
  orgSkip: boolean | undefined
} = { user: undefined, org: undefined, orgArg: undefined, orgSkip: undefined }
const useUserOfficial = vi.fn()
const useOrgOfficial = vi.fn()

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))
vi.mock("../../../features/profile/api/profileApi", () => ({
  useProfileGetDiscordSettingsQuery: (_: unknown, opts: { skip?: boolean }) => ({
    data: opts?.skip ? undefined : state.user,
  }),
  useProfileUseOfficialDiscordSettingsMutation: () => [useUserOfficial],
}))
vi.mock("../../../features/contractor/api/contractorApi", () => ({
  useGetDiscordSettingsQuery: (arg: unknown, opts: { skip?: boolean }) => {
    state.orgArg = arg
    state.orgSkip = opts?.skip
    return { data: opts?.skip ? undefined : state.org }
  },
  useUseOfficialDiscordSettingsMutation: () => [useOrgOfficial],
}))

import { ConfigureDiscord } from "../ConfigureDiscord"

const CHANNEL: DiscordSettings = {
  guild_id: "1003056231591727264",
  channel_id: "1072580369251041330",
  guild_name: "SC Market",
  guild_avatar: "https://cdn.discordapp.com/icons/1/a.webp",
  channel_name: "orders",
}

function renderAt(path: string, org: boolean) {
  return render(
    <ThemeProvider theme={mainTheme}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/settings" element={<ConfigureDiscord />} />
          <Route path="/org/:contractor_id/manage" element={<ConfigureDiscord org={org} />} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe("ConfigureDiscord", () => {
  beforeEach(() => {
    state.user = undefined
    state.org = undefined
    useUserOfficial.mockReset()
    useOrgOfficial.mockReset()
    vi.spyOn(window, "open").mockImplementation(() => null)
  })

  it("links your thread channel with its server and channel names", () => {
    state.user = CHANNEL
    renderAt("/settings", false)

    const link = screen.getByRole("link", { name: /SC Market: #orders/ })
    expect(link).toHaveAttribute(
      "href",
      "https://discord.com/channels/1003056231591727264/1072580369251041330",
    )
    expect(screen.queryByText("ConfigureDiscord.notConfigured")).not.toBeInTheDocument()
    expect(screen.getByText("ConfigureDiscord.setUpWithBot")).toBeInTheDocument()
  })

  it("falls back to the IDs when the bot can't see the server", () => {
    state.user = { ...CHANNEL, guild_name: null, channel_name: null, guild_avatar: null }
    renderAt("/settings", false)
    expect(
      screen.getByRole("link", { name: "1003056231591727264: #1072580369251041330" }),
    ).toBeInTheDocument()
  })

  it("says not configured, without a dead link, and how to set it up", () => {
    state.user = { guild_id: null, channel_id: null, guild_name: null, guild_avatar: null, channel_name: null }
    renderAt("/settings", false)
    expect(screen.getByText("ConfigureDiscord.notConfigured")).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /#/ })).not.toBeInTheDocument()
    expect(screen.getByText("ConfigureDiscord.setUpWithBot")).toBeInTheDocument()
  })

  it("shows the org's channel on the org page and uses the org's official-server action", () => {
    state.org = { ...CHANNEL, channel_name: "org-orders" }
    renderAt("/org/SCMARKET/manage", true)

    expect(state.orgArg).toBe("SCMARKET")
    expect(state.orgSkip).toBe(false)
    expect(screen.getByRole("link", { name: /SC Market: #org-orders/ })).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "ConfigureDiscord.useOfficialServer" }))
    expect(useOrgOfficial).toHaveBeenCalledWith("SCMARKET")
    expect(useUserOfficial).not.toHaveBeenCalled()
  })

  it("uses your own official-server action in your settings", () => {
    renderAt("/settings", false)
    expect(state.orgSkip).toBe(true)
    fireEvent.click(screen.getByRole("button", { name: "ConfigureDiscord.useOfficialServer" }))
    expect(useUserOfficial).toHaveBeenCalledTimes(1)
    expect(useOrgOfficial).not.toHaveBeenCalled()
  })
})
