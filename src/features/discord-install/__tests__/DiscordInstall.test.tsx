import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import * as marketApi from "../../../store/api/v2/market"
import * as profileApi from "../../profile/api/profileApi"

vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)
vi.mock("@unhead/react", () => ({ useHead: vi.fn() }))
vi.mock("../../../components/layout/StandardPageLayout", () => ({
  StandardPageLayout: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))
vi.mock("../../help/components/FirstUseHint", () => ({
  FirstUseHint: ({
    title,
    children,
  }: {
    title: string
    children: React.ReactNode
  }) => (
    <aside data-testid="hint">
      {title}
      {children}
    </aside>
  ),
}))
vi.mock("../../../store/api/v2/market", () => ({
  useRecordDiscordInstallClickMutation: vi.fn(),
  useGetDiscordReachabilityQuery: vi.fn(),
}))
vi.mock("../../profile/api/profileApi", () => ({
  useGetUserProfileQuery: vi.fn(),
}))

import {
  DiscordInstallPage,
  redirect,
} from "../../../pages/discord/DiscordInstallPage"
import { DiscordUserInstallCta } from "../DiscordUserInstallCta"
import { discordInstallPath, installSource } from "../installLinks"
import { DISCORD_AUTHORIZE_URLS } from "../../../util/constants"

const record = vi.fn()
const reach = (r: Partial<marketApi.DiscordReachabilityResponse> | undefined) =>
  vi.mocked(marketApi.useGetDiscordReachabilityQuery).mockReturnValue({
    data: r && {
      discord_linked: true,
      dm_reachable: false,
      shares_server: false,
      user_installed: false,
      user_install_counts_as_dm: false,
      user_install_available: true,
      user_install_url: null,
      ...r,
    },
  } as never)

beforeEach(() => {
  vi.clearAllMocks()
  record.mockReturnValue({ unwrap: () => Promise.resolve(undefined) })
  vi.mocked(marketApi.useRecordDiscordInstallClickMutation).mockReturnValue([
    record,
  ] as never)
  vi.mocked(profileApi.useGetUserProfileQuery).mockReturnValue({
    data: { username: "lara" },
  } as never)
  vi.spyOn(redirect, "to").mockImplementation(() => undefined)
})

describe("install links", () => {
  it("all go through /discord/install; unknown sources count as other", () => {
    expect(discordInstallPath("user", "shop_hint")).toBe(
      "/discord/install?type=user&src=shop_hint",
    )
    expect(installSource("nope")).toBe("other")
    expect(DISCORD_AUTHORIZE_URLS.user).toContain(
      "integration_type=1&scope=applications.commands",
    )
    expect(DISCORD_AUTHORIZE_URLS.server).toContain(
      "integration_type=0&scope=bot",
    )
  })
})

describe("/discord/install", () => {
  const at = (q: string) =>
    render(
      <MemoryRouter initialEntries={[`/discord/install${q}`]}>
        <DiscordInstallPage />
      </MemoryRouter>,
    )

  it("counts the click with its surface, then opens Discord's user install", async () => {
    at("?type=user&src=shop_hint")
    expect(screen.getByTestId("discord-install-opening")).toBeInTheDocument()
    await waitFor(() =>
      expect(redirect.to).toHaveBeenCalledWith(DISCORD_AUTHORIZE_URLS.user),
    )
    expect(record).toHaveBeenCalledWith({
      discordInstallClickRequest: { type: "user", src: "shop_hint" },
    })
  })

  it("still redirects when counting fails; an unknown source is other", async () => {
    record.mockReturnValue({ unwrap: () => Promise.reject(new Error("429")) })
    at("?type=server&src=evil")
    await waitFor(() =>
      expect(redirect.to).toHaveBeenCalledWith(DISCORD_AUTHORIZE_URLS.server),
    )
    expect(record).toHaveBeenCalledWith({
      discordInstallClickRequest: { type: "server", src: "other" },
    })
  })

  it("without a valid type: offers both choices and counts nothing", () => {
    at("?src=footer")
    expect(screen.getByTestId("discord-install-choices")).toBeInTheDocument()
    expect(record).not.toHaveBeenCalled()
    expect(redirect.to).not.toHaveBeenCalled()
  })
})

describe("DiscordUserInstallCta", () => {
  const cta = (
    variant: "panel" | "unreachable" | "hint",
    src = "settings_notifications" as const,
  ) =>
    render(
      <MemoryRouter>
        <DiscordUserInstallCta src={src} variant={variant} />
      </MemoryRouter>,
    )

  it("links the user install through the counted route, with the reason", () => {
    reach({})
    cta("panel")
    expect(
      screen.getByTestId("discord-user-install").getAttribute("href"),
    ).toBe("/discord/install?type=user&src=settings_notifications")
    expect(
      screen.getByText(/even if you're not in a shared server/),
    ).toBeInTheDocument()
  })

  it("hidden while User Install is off, once installed, or signed out", () => {
    reach({ user_install_available: false })
    const a = cta("panel")
    expect(a.container).toBeEmptyDOMElement()
    a.unmount()
    reach({ user_installed: true })
    const b = cta("panel")
    expect(b.container).toBeEmptyDOMElement()
    b.unmount()
    vi.mocked(profileApi.useGetUserProfileQuery).mockReturnValue({
      data: undefined,
    } as never)
    reach({})
    expect(cta("panel").container).toBeEmptyDOMElement()
  })

  it("unreachable: only when not DM-reachable; asks to link Discord first", () => {
    reach({ dm_reachable: true })
    const a = cta("unreachable")
    expect(a.container).toBeEmptyDOMElement()
    a.unmount()
    reach({ discord_linked: false })
    cta("unreachable")
    expect(
      screen.getByTestId("discord-user-install-link-first"),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "Link Discord" }).getAttribute("href"),
    ).toBe("/settings?tab=discord")
  })

  it("hint: a first-use hint with the install link", () => {
    reach({})
    cta("hint")
    expect(screen.getByTestId("hint")).toBeInTheDocument()
    expect(
      screen.getByTestId("discord-user-install").getAttribute("href"),
    ).toContain("type=user")
  })
})
