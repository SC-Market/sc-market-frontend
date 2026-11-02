/**
 * /discord/install (choices, results such as ?result=failed, and the brief
 * "Opening Discord…" before the redirect) sits in the normal app layout:
 * under AppLayout (navbar, sidebar, top bar spacer) and in
 * StandardPageLayout with the sidebar and top spacer on, like other pages.
 */
import React from "react"
import { render } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { RouteConfigEntry } from "@react-router/dev/routes"
import routeConfig from "../../routes"

const layoutProps = vi.hoisted(() => [] as Record<string, unknown>[])
vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)
vi.mock("@unhead/react", () => ({ useHead: vi.fn() }))
vi.mock("../../components/layout/StandardPageLayout", () => ({
  StandardPageLayout: (props: { children: React.ReactNode }) => {
    layoutProps.push(props as Record<string, unknown>)
    return <div>{props.children}</div>
  },
}))
vi.mock("../../store/api/v2/market", () => ({
  useRecordDiscordInstallClickMutation: () => [
    () => ({ unwrap: () => Promise.resolve() }),
  ],
  useGetDiscordReachabilityQuery: () => ({ data: undefined }),
}))
vi.mock("../../features/profile/api/profileApi", () => ({
  useGetUserProfileQuery: () => ({ data: undefined }),
}))

import {
  DiscordInstallPage,
  redirect,
} from "../../pages/discord/DiscordInstallPage"

/** The ids of the route entries from the root down to `path`. */
function chainTo(
  entries: RouteConfigEntry[],
  path: string,
  parents: string[] = [],
): string[] | null {
  for (const e of entries) {
    const here = [...parents, e.id ?? e.file]
    if (e.path === path) return here
    const found = e.children && chainTo(e.children, path, here)
    if (found) return found
  }
  return null
}

beforeEach(() => {
  layoutProps.length = 0
  vi.spyOn(redirect, "to").mockImplementation(() => undefined)
})

describe("/discord/install layout", () => {
  it("is a child of the app layout", () => {
    expect(chainTo(routeConfig, "/discord/install")).toEqual([
      "routes/layouts/AppLayout",
      "routes/pages/DiscordInstallPage",
    ])
  })

  it.each([
    "?src=discord_app",
    "?result=failed",
    "?result=user_installed&type=user",
    "?type=server&src=footer",
  ])(
    "%s renders in StandardPageLayout with the sidebar and top spacer",
    (q) => {
      render(
        <MemoryRouter initialEntries={[`/discord/install${q}`]}>
          <DiscordInstallPage />
        </MemoryRouter>,
      )
      expect(layoutProps.length).toBeGreaterThan(0)
      for (const p of layoutProps) {
        expect(p.noSidebar).toBeFalsy()
        expect(p.noTopSpacer).toBeFalsy()
      }
    },
  )
})
