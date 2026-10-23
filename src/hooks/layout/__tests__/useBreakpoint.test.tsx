import React from "react"
import { act, render, screen } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { hydrateRoot } from "react-dom/client"
import { ThemeProvider, createTheme } from "@mui/material"
import { afterEach, describe, expect, it, vi } from "vitest"
import { breakpointsValues } from "../../styles/theme/constants"
import {
  useBreakpointBetween,
  useBreakpointDown,
  useBreakpointUp,
  useIsMobile,
} from "../useBreakpoint"
import { useHydratedInitialState } from "../../ssr/useHydratedInitialState"
import { DESKTOP_WIDTH, PHONE_WIDTH, mockViewport } from "./mockViewport"

const theme = createTheme({ breakpoints: { values: breakpointsValues } })

function withTheme(node: React.ReactNode) {
  return <ThemeProvider theme={theme}>{node}</ThemeProvider>
}

function Probe() {
  const flags = {
    mobile: useIsMobile(),
    downSm: useBreakpointDown("sm"),
    downLg: useBreakpointDown("lg"),
    upLg: useBreakpointUp("lg"),
    upXxl: useBreakpointUp("xxl"),
    smToMd: useBreakpointBetween("sm", "md"),
  }
  return <span data-testid="probe">{JSON.stringify(flags)}</span>
}

function probe() {
  return JSON.parse(screen.getByTestId("probe").textContent!)
}

/** Seeds open state from the viewport, like the sidebar drawers. */
function SeededDrawer(props: { onRender?: (open: boolean) => void }) {
  const isMobile = useIsMobile()
  const [open, setOpen] = useHydratedInitialState(!isMobile)
  props.onRender?.(open)
  return (
    <button data-testid="drawer" onClick={() => setOpen((o) => !o)}>
      {open ? "open" : "closed"}
    </button>
  )
}

async function hydrate(node: React.ReactElement, serverHtml: string) {
  const container = document.createElement("div")
  container.innerHTML = serverHtml
  document.body.appendChild(container)
  const errors: unknown[] = []
  let root: ReturnType<typeof hydrateRoot> | undefined
  await act(async () => {
    root = hydrateRoot(container, node, {
      onRecoverableError: (error) => errors.push(error),
    })
  })
  return {
    container,
    errors,
    cleanup: () => {
      act(() => root!.unmount())
      container.remove()
    },
  }
}

describe("breakpoint hooks", () => {
  afterEach(() => vi.restoreAllMocks())

  it("report the real viewport on the first client-only render (SPA)", () => {
    mockViewport(PHONE_WIDTH)
    render(withTheme(<Probe />))
    expect(probe()).toEqual({
      mobile: true,
      downSm: true,
      downLg: true,
      upLg: false,
      upXxl: false,
      smToMd: false,
    })
  })

  it("match the theme's breakpoint values", () => {
    mockViewport(700)
    render(withTheme(<Probe />))
    expect(probe()).toMatchObject({ mobile: true, downSm: false, smToMd: true })
  })

  it("report the desktop default (no query matches) on the server", () => {
    mockViewport(PHONE_WIDTH)
    const html = renderToString(withTheme(<Probe />))
    expect(html).toContain(
      JSON.stringify({
        mobile: false,
        downSm: false,
        downLg: false,
        upLg: false,
        upXxl: false,
        smToMd: false,
      }).replace(/"/g, "&quot;"),
    )
  })

  it("hydrate the server default without a mismatch, then report the viewport", async () => {
    const html = renderToString(withTheme(<Probe />))
    mockViewport(PHONE_WIDTH)
    const { container, errors, cleanup } = await hydrate(withTheme(<Probe />), html)
    expect(errors).toEqual([])
    expect(JSON.parse(container.textContent!)).toMatchObject({
      mobile: true,
      downLg: true,
    })
    cleanup()
  })
})

describe("useHydratedInitialState", () => {
  afterEach(() => vi.restoreAllMocks())

  it("seeds from the real viewport on a client-only render and never re-seeds", () => {
    mockViewport(PHONE_WIDTH)
    const renders: boolean[] = []
    render(withTheme(<SeededDrawer onRender={(o) => renders.push(o)} />))
    expect(screen.getByTestId("drawer")).toHaveTextContent("closed")
    // No render ever saw the desktop seed.
    expect(renders.every((o) => o === false)).toBe(true)

    act(() => screen.getByTestId("drawer").click())
    expect(screen.getByTestId("drawer")).toHaveTextContent("open")
  })

  it("ignores later viewport changes, like plain useState", () => {
    mockViewport(DESKTOP_WIDTH)
    const renders: boolean[] = []
    const onRender = (o: boolean) => renders.push(o)
    const { rerender } = render(withTheme(<SeededDrawer onRender={onRender} />))
    expect(screen.getByTestId("drawer")).toHaveTextContent("open")

    vi.restoreAllMocks()
    mockViewport(PHONE_WIDTH)
    rerender(withTheme(<SeededDrawer onRender={onRender} />))
    expect(screen.getByTestId("drawer")).toHaveTextContent("open")
    expect(renders.every((o) => o === true)).toBe(true)
  })

  it("re-seeds from the real viewport once after hydration, without a mismatch", async () => {
    const html = renderToString(withTheme(<SeededDrawer />))
    expect(html).toContain("open")

    mockViewport(PHONE_WIDTH)
    const { container, errors, cleanup } = await hydrate(
      withTheme(<SeededDrawer />),
      html,
    )
    expect(errors).toEqual([])
    expect(container.textContent).toBe("closed")

    act(() => container.querySelector("button")!.click())
    expect(container.textContent).toBe("open")
    cleanup()
  })

  it("keeps the desktop seed after hydration on desktop", async () => {
    const html = renderToString(withTheme(<SeededDrawer />))
    mockViewport(DESKTOP_WIDTH)
    const { container, errors, cleanup } = await hydrate(
      withTheme(<SeededDrawer />),
      html,
    )
    expect(errors).toEqual([])
    expect(container.textContent).toBe("open")
    cleanup()
  })
})
