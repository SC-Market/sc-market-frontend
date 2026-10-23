/**
 * The five viewport detail gates must put the entity's detail page in
 * server/hydration output (the desktop modal is a closed Portal on the
 * server), hydrate without a mismatch, and keep today's SPA behavior:
 * browser + modal on desktop, detail page below `lg`.
 *
 * The detail pages and browsers are stubbed: this tests the gate, not the
 * pages behind it.
 */
import React from "react"
import { act, render, screen } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { hydrateRoot } from "react-dom/client"
import { ThemeProvider, createTheme } from "@mui/material"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { breakpointsValues } from "../../hooks/styles/theme/constants"
import {
  DESKTOP_WIDTH,
  PHONE_WIDTH,
  mockViewport,
} from "../../hooks/layout/__tests__/mockViewport"
import { BlueprintDetailGate } from "../blueprints/BlueprintDetailGate"
import { MissionDetailGate } from "../missions/MissionDetailGate"
import { MiningOreDetailGate } from "../mining/MiningOreDetailGate"
import { MiningLocationDetailGate } from "../mining/MiningLocationDetailGate"
import { WikiShipDetailGate } from "../wiki/WikiShipDetailGate"

const rendered: string[] = []

function stub(name: string) {
  return function Stub() {
    rendered.push(name)
    return <div data-testid="gate-child">{name}</div>
  }
}

vi.mock("../blueprints/BlueprintDetail", () => ({ BlueprintDetail: stub("BlueprintDetail") }))
vi.mock("../blueprints/BlueprintBrowser", () => ({ BlueprintBrowser: stub("BlueprintBrowser") }))
vi.mock("../missions/MissionDetail", () => ({ MissionDetail: stub("MissionDetail") }))
vi.mock("../missions/MissionSearch", () => ({ MissionSearch: stub("MissionSearch") }))
vi.mock("../mining/MiningOreDetailPage", () => ({ MiningOreDetailPage: stub("MiningOreDetailPage") }))
vi.mock("../mining/MiningLocationDetailPage", () => ({
  MiningLocationDetailPage: stub("MiningLocationDetailPage"),
}))
vi.mock("../mining/MiningPage", () => ({ MiningPage: stub("MiningPage") }))
vi.mock("../wiki/WikiShipDetail", () => ({ WikiShipDetail: stub("WikiShipDetail") }))
vi.mock("../wiki/WikiShipBrowser", () => ({ WikiShipBrowser: stub("WikiShipBrowser") }))

const theme = createTheme({ breakpoints: { values: breakpointsValues } })

const GATES: Array<[string, React.ComponentType, string, string]> = [
  ["BlueprintDetailGate", BlueprintDetailGate, "BlueprintDetail", "BlueprintBrowser"],
  ["MissionDetailGate", MissionDetailGate, "MissionDetail", "MissionSearch"],
  ["MiningOreDetailGate", MiningOreDetailGate, "MiningOreDetailPage", "MiningPage"],
  ["MiningLocationDetailGate", MiningLocationDetailGate, "MiningLocationDetailPage", "MiningPage"],
  ["WikiShipDetailGate", WikiShipDetailGate, "WikiShipDetail", "WikiShipBrowser"],
]

describe.each(GATES)("%s", (_name, Gate, detailPage, desktopBrowser) => {
  const app = (
    <ThemeProvider theme={theme}>
      <Gate />
    </ThemeProvider>
  )

  beforeEach(() => {
    rendered.length = 0
  })
  afterEach(() => vi.restoreAllMocks())

  it("renders the detail page on the server", () => {
    expect(renderToString(app)).toContain(detailPage)
    expect(rendered).toEqual([detailPage])
  })

  it.each([
    ["desktop", DESKTOP_WIDTH, desktopBrowser],
    ["a phone", PHONE_WIDTH, detailPage],
  ])(
    "hydrates the server HTML without a mismatch, then shows the %s experience",
    async (_viewport, width, expected) => {
      const container = document.createElement("div")
      container.innerHTML = renderToString(app)
      document.body.appendChild(container)
      mockViewport(width)
      rendered.length = 0

      const errors: unknown[] = []
      let root: ReturnType<typeof hydrateRoot> | undefined
      await act(async () => {
        root = hydrateRoot(container, app, {
          onRecoverableError: (error) => errors.push(error),
        })
      })

      expect(errors).toEqual([])
      // The hydration render matches the server: the detail page.
      expect(rendered[0]).toBe(detailPage)
      expect(container.textContent).toBe(expected)
      act(() => root!.unmount())
      container.remove()
    },
  )

  it("SPA on desktop: renders only the browser + modal, never the detail page", () => {
    mockViewport(DESKTOP_WIDTH)
    render(app)
    expect(screen.getByTestId("gate-child")).toHaveTextContent(desktopBrowser)
    expect(rendered).not.toContain(detailPage)
  })

  it("SPA on a phone: renders the detail page", () => {
    mockViewport(PHONE_WIDTH)
    render(app)
    expect(screen.getByTestId("gate-child")).toHaveTextContent(detailPage)
    expect(rendered).not.toContain(desktopBrowser)
  })
})
