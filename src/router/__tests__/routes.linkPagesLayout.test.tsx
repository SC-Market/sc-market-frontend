/**
 * The pages people reach from a link in an email or a DM (unsubscribe,
 * email verification, "Still selling?") sit in the normal app layout:
 * under AppLayout and in StandardPageLayout with the sidebar on (noSidebar
 * also closed the sidebar for the pages visited after them), with their
 * content on a card (PageCard) whose heading is the page's h1.
 * /discord/install: routes.discordInstallLayout.test.tsx.
 */
import React from "react"
import { render, screen, within } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { RouteConfigEntry } from "@react-router/dev/routes"
import routeConfig from "../../routes"

const layoutProps = vi.hoisted(() => [] as Record<string, unknown>[])
vi.mock("react-i18next", async (importOriginal) =>
  (await import("../../test/mocks/reactI18next")).mockReactI18next(
    importOriginal,
  ),
)
vi.mock("../../components/layout/StandardPageLayout", () => ({
  StandardPageLayout: (props: { children: React.ReactNode }) => {
    layoutProps.push(props as Record<string, unknown>)
    return <div>{props.children}</div>
  },
}))
vi.mock("../../store/api/v2/market", () => ({
  useGetStillSellingActionQuery: () => ({
    data: { valid: false, reason: "expired" },
    isLoading: false,
    isError: false,
  }),
  useConfirmStillSellingActionMutation: () => [vi.fn(), {}],
  useSendStillSellingFeedbackMutation: () => [vi.fn(), {}],
}))
vi.mock("../../features/email/hooks/usePageUnsubscribe", () => ({
  usePageUnsubscribe: () => ({
    data: { status: "success", message: "Turned off." },
    isLoading: false,
    unsubscribeAll: vi.fn(),
    isUnsubscribingAll: false,
  }),
}))
vi.mock("../../features/email/hooks/usePageEmailVerification", () => ({
  usePageEmailVerification: () => ({
    data: { status: "invalid", message: "Bad link." },
    isLoading: false,
    error: undefined,
  }),
}))

import { StillSellingPage } from "../../pages/listings/StillSellingPage"
import { UnsubscribePage } from "../../pages/email/UnsubscribePage"
import { EmailVerificationPage } from "../../pages/email/EmailVerificationPage"

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
})

const PAGES = [
  ["/still-selling/:token", "/still-selling/tok", StillSellingPage],
  ["/email/unsubscribe/:token", "/email/unsubscribe/tok", UnsubscribePage],
  ["/email/verify/:token", "/email/verify/tok", EmailVerificationPage],
] as const

describe("link pages layout", () => {
  it.each(PAGES)("%s is under the app layout", (path) => {
    expect(chainTo(routeConfig, path)?.[0]).toBe("routes/layouts/AppLayout")
  })

  it.each(PAGES)(
    "%s keeps the sidebar and shows its content on a card with an h1",
    (path, url, Page) => {
      render(
        <MemoryRouter initialEntries={[url]}>
          <Routes>
            <Route path={path} element={<Page />} />
          </Routes>
        </MemoryRouter>,
      )
      expect(layoutProps.length).toBeGreaterThan(0)
      for (const p of layoutProps) {
        expect(p.noSidebar).toBeFalsy()
        expect(p.noTopSpacer).toBeFalsy()
        expect(p.maxWidth).toBe("sm")
      }
      const card = screen.getByRole("region")
      expect(card.tagName).toBe("SECTION")
      expect(within(card).getByRole("heading", { level: 1 })).toBe(
        screen.getByRole("heading", { level: 1 }),
      )
    },
  )
})
