import React from "react"
import { render, screen, waitFor, within } from "@testing-library/react"
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
import {
  discordInstallPath,
  discordInstallStartUrl,
  installSource,
} from "../installLinks"
import { BACKEND_URL } from "../../../util/constants"

const record = vi.fn()
const reach = (r: Partial<marketApi.DiscordReachabilityResponse> | undefined) =>
  vi.mocked(marketApi.useGetDiscordReachabilityQuery).mockReturnValue({
    data: r && {
      discord_linked: true,
      dm_reachable: false,
      shares_server: false,
      user_installed: false,
      user_install_counts_as_dm: true,
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
  reach(undefined)
})

describe("install links", () => {
  it("all go through /discord/install; unknown sources count as other", () => {
    expect(discordInstallPath("user", "shop_hint")).toBe(
      "/discord/install?type=user&src=shop_hint",
    )
    expect(installSource("nope")).toBe("other")
  })

  it("a server install can name the shop or org it links the server to", () => {
    expect(discordInstallPath("server", "shop_settings", { shop: "s1" })).toBe(
      "/discord/install?type=server&src=shop_settings&shop=s1",
    )
    expect(
      discordInstallStartUrl("server", "org_discord", { org: "SCMARKET" }),
    ).toBe(
      `${BACKEND_URL}/auth/discord-install?type=server&src=org_discord&org=SCMARKET`,
    )
    // A user install never carries an owner.
    expect(discordInstallPath("user", "guide", { shop: "s1" })).toBe(
      "/discord/install?type=user&src=guide",
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

  it("counts the click with its surface, then starts the backend's install flow", async () => {
    at("?type=user&src=shop_hint")
    expect(screen.getByTestId("discord-install-opening")).toBeInTheDocument()
    await waitFor(() =>
      expect(redirect.to).toHaveBeenCalledWith(
        `${BACKEND_URL}/auth/discord-install?type=user&src=shop_hint`,
      ),
    )
    expect(record).toHaveBeenCalledWith({
      discordInstallClickRequest: { type: "user", src: "shop_hint" },
    })
  })

  it("still redirects when counting fails; an unknown source is other", async () => {
    record.mockReturnValue({ unwrap: () => Promise.reject(new Error("429")) })
    at("?type=server&src=evil")
    await waitFor(() =>
      expect(redirect.to).toHaveBeenCalledWith(
        `${BACKEND_URL}/auth/discord-install?type=server&src=other`,
      ),
    )
    expect(record).toHaveBeenCalledWith({
      discordInstallClickRequest: { type: "server", src: "other" },
    })
  })

  it("passes the shop a server install is for on to the backend", async () => {
    at("?type=server&src=shop_settings&shop=s1")
    await waitFor(() =>
      expect(redirect.to).toHaveBeenCalledWith(
        `${BACKEND_URL}/auth/discord-install?type=server&src=shop_settings&shop=s1`,
      ),
    )
  })

  it("shows how an install ended, without counting or redirecting", () => {
    at("?result=user_linked_elsewhere&type=user")
    expect(
      screen.getByText(
        "This Discord account is linked to another SC Market account",
      ),
    ).toBeInTheDocument()
    expect(record).not.toHaveBeenCalled()
    expect(redirect.to).not.toHaveBeenCalled()
  })

  it("a user install says we can now DM you, even before reachability loads", () => {
    reach(undefined)
    at("?result=user_installed&type=user")
    expect(
      screen.getByText(/even if you're not in a shared server/),
    ).toBeInTheDocument()
    expect(screen.queryByText(/stay in a server with the bot/)).toBeNull()
  })

  it("signed out: the choices say a user install lets us reach you", () => {
    reach(undefined)
    at("?src=discord_app")
    expect(
      screen.getByText(
        "So we can reach you about offers and orders even if you're not in a shared server.",
      ),
    ).toBeInTheDocument()
  })

  it("asks a signed-out installer to sign in", () => {
    at("?result=user_sign_in&type=user")
    expect(
      screen.getByTestId("discord-install-result-user_sign_in"),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "Sign in" }).getAttribute("href"),
    ).toBe("/login?redirect=%2Fsettings%3Ftab%3Dnotifications")
  })

  it("an unknown result shows the choices", () => {
    at("?result=evil")
    expect(screen.getByTestId("discord-install-choices")).toBeInTheDocument()
  })

  it("without a valid type: offers both choices and counts nothing", () => {
    at("?src=footer")
    expect(screen.getByTestId("discord-install-choices")).toBeInTheDocument()
    expect(record).not.toHaveBeenCalled()
    expect(redirect.to).not.toHaveBeenCalled()
  })

  it("the Discord app's install link (no type, signed out): both choices, keeping the surface", () => {
    vi.mocked(profileApi.useGetUserProfileQuery).mockReturnValue({
      data: undefined,
    } as never)
    at("?src=discord_app")
    expect(installSource("discord_app")).toBe("discord_app")
    const choices = within(screen.getByTestId("discord-install-choices"))
    expect(
      choices
        .getByRole("link", { name: "To a Discord server" })
        .getAttribute("href"),
    ).toBe("/discord/install?type=server&src=discord_app")
    expect(
      choices
        .getByRole("link", { name: "To your Discord account" })
        .getAttribute("href"),
    ).toBe("/discord/install?type=user&src=discord_app")
    expect(record).not.toHaveBeenCalled()
  })

  it("then counts discord_app and starts the flow signed out", async () => {
    vi.mocked(profileApi.useGetUserProfileQuery).mockReturnValue({
      data: undefined,
    } as never)
    at("?type=server&src=discord_app")
    await waitFor(() =>
      expect(redirect.to).toHaveBeenCalledWith(
        `${BACKEND_URL}/auth/discord-install?type=server&src=discord_app`,
      ),
    )
    expect(record).toHaveBeenCalledWith({
      discordInstallClickRequest: { type: "server", src: "discord_app" },
    })
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

  it.each(["panel", "unreachable", "hint"] as const)(
    "%s: says a user install lets us reach you without a shared server",
    (variant) => {
      reach({})
      cta(variant)
      expect(
        screen.getByText(/even if you're not in a shared server/),
      ).toBeInTheDocument()
    },
  )

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

  it("unreachable: only when not DM-reachable; installing also links Discord", () => {
    reach({ dm_reachable: true })
    const a = cta("unreachable")
    expect(a.container).toBeEmptyDOMElement()
    a.unmount()
    reach({ discord_linked: false })
    cta("unreachable")
    expect(
      screen.getByTestId("discord-user-install").getAttribute("href"),
    ).toBe("/discord/install?type=user&src=settings_notifications")
    expect(
      screen.getByTestId("discord-user-install-also-links"),
    ).toBeInTheDocument()
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
