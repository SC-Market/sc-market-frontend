/**
 * Every loading-skeleton family renders and is built on the shape it stands
 * in for (the shared constants, grid spans and frames the real page uses),
 * so the placeholder can't drift from the page. happy-dom has no layout, so
 * the layout-shift checks compare declared sizes: the CSS emitted for the
 * skeleton against the real component's constants.
 */
import React from "react"
import { render } from "@testing-library/react"
import { Provider } from "react-redux"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import { createHead, UnheadProvider } from "@unhead/react/client"
import { Grid, Skeleton } from "@mui/material"
import { ThemeProvider, type Theme } from "@mui/material/styles"
import { describe, expect, it } from "vitest"
import { mainTheme, lightTheme } from "../../hooks/styles/Theme"
import { DrawerOpenContext } from "../../hooks/layout/Drawer"
import { makeStore } from "../../store/store"
import { routeSkeletonMap } from "../routeSkeletons"
import {
  AdminPageSkeleton,
  DashboardSkeleton,
  DetailPageSkeleton,
  FormPageSkeleton,
  ListPageSkeleton,
  PageSkeleton,
} from "../../components/skeletons/RouteSkeleton"
import {
  ListingSkeleton,
  LISTING_CARD_MEDIA_HEIGHT,
} from "../../components/skeletons/ListingSkeleton"
import { ServiceListingSkeleton } from "../../components/skeletons/ServiceListingSkeleton"
import {
  DataGridSkeleton,
  dataGridSkeletonHeight,
  dataGridSkeletonProps,
} from "../../components/skeletons/DataGridSkeleton"
import { LISTING_CARD_HEIGHT } from "../../features/market/v2/marketSearchLayout"
import { SERVICE_CARD_HEIGHT } from "../../features/services/components/ServiceListingCard"
import { SERVICE_LISTING_GRID_BREAKPOINTS } from "../../features/services/components/ServiceListing"
import { CardGridSkeleton } from "../../components/game-data/GameDataSkeletons"
import * as CARD_GRIDS from "../../components/game-data/cardGrids"
import type { CardGridShape } from "../../components/game-data/cardGrids"

const networkEnv = {
  credentials: "omit" as const,
  headers: {},
  onUnauthorized: async () => false,
  checkSession: async () => "unsupported" as const,
  onLoggedOut: () => {},
}

function Providers(props: { children: React.ReactNode; theme?: Theme }) {
  const drawer = React.useState(false)
  const [store] = React.useState(() => makeStore({ networkEnv }))
  const [head] = React.useState(() => createHead())
  // A data router: the pages' Page component reads useRouteError().
  const [router] = React.useState(() =>
    createMemoryRouter([
      {
        path: "*",
        element: (
          <DrawerOpenContext.Provider value={drawer}>
            {props.children}
          </DrawerOpenContext.Provider>
        ),
      },
    ]),
  )
  return (
    <UnheadProvider head={head}>
      <Provider store={store}>
        <ThemeProvider theme={props.theme ?? mainTheme}>
          <RouterProvider router={router} />
        </ThemeProvider>
      </Provider>
    </UnheadProvider>
  )
}

/** The CSS Emotion emitted for an element's css-* classes. */
function cssOf(el: Element): string {
  const classes = [...el.classList].filter((c) => c.startsWith("css-"))
  const text = [...document.querySelectorAll("style")]
    .map((s) => s.textContent ?? "")
    .join("\n")
  return classes
    .flatMap((c) =>
      [...text.matchAll(new RegExp(`\\.${c}[^{]*\\{[^}]*\\}`, "g"))].map(
        (m) => m[0],
      ),
    )
    .join("\n")
    .replace(/\s+/g, "")
}

/** MUI Grid's class names for an item (its spans and spacing). */
function gridClasses(el: Element) {
  return [...el.classList].filter((c) => c.startsWith("MuiGrid-")).sort()
}

describe("skeleton motion", () => {
  it("holds still when reduced motion is asked for (theme-wide)", () => {
    const { container } = render(
      <ThemeProvider theme={mainTheme}>
        <Skeleton variant="rounded" animation="pulse" />
        <Skeleton variant="rounded" animation="wave" />
      </ThemeProvider>,
    )
    const allCss = [...document.querySelectorAll("style")]
      .map((s) => s.textContent ?? "")
      .join("")
      .replace(/\s+/g, "")
    const skeletons = container.querySelectorAll(".MuiSkeleton-root")
    expect(skeletons).toHaveLength(2)
    for (const el of skeletons) {
      const cls = [...el.classList].find((c) => c.startsWith("css-"))!
      // The animation runs normally (pulse, or the wave's ::after)...
      expect(cssOf(el)).toMatch(/animation:/)
      // ...and stops inside the reduced-motion query, ::after included.
      expect(allCss).toMatch(
        new RegExp(
          `@media\\(prefers-reduced-motion:reduce\\)\\{\\.${cls}\\{[^}]*animation:none[^}]*\\}\\.${cls}::after\\{[^}]*animation:none`,
        ),
      )
    }
  })
})

describe("route skeletons", () => {
  it.each(Object.entries(routeSkeletonMap))(
    "%s renders a deterministic placeholder",
    (_path, Component) => {
      const first = render(
        <Providers>
          <Component />
        </Providers>,
      )
      const html = first.container.innerHTML
      // Something in place of the page (some skeletons draw their
      // placeholders in a lazily mounted section, so not always a Skeleton).
      expect(first.container.childElementCount).toBeGreaterThan(0)
      first.unmount()
      // Same markup every render (no Math.random widths): the prerendered
      // HTML and the client agree, and repeated boundaries don't flicker.
      const second = render(
        <Providers>
          <Component />
        </Providers>,
      )
      expect(second.container.innerHTML).toBe(html)
    },
  )

  it.each([
    ["PageSkeleton", PageSkeleton],
    ["DashboardSkeleton", DashboardSkeleton],
    ["ListPageSkeleton", ListPageSkeleton],
    ["DetailPageSkeleton", DetailPageSkeleton],
    ["FormPageSkeleton", FormPageSkeleton],
    ["AdminPageSkeleton", AdminPageSkeleton],
  ])(
    "%s sits in StandardPageLayout's frame: main > grid, title row first",
    (_name, Component) => {
      const { container } = render(
        <Providers>
          <Component />
        </Providers>,
      )
      const grid = container.querySelector(
        "main .MuiContainer-root > .MuiGrid-container",
      )
      expect(grid).not.toBeNull()
      // The page's sections are the grid's items (spaced like the page's),
      // and the first is the header row with a title placeholder.
      const items = [...grid!.children]
      expect(items.length).toBeGreaterThan(1)
      for (const item of items) expect(item).toHaveClass("MuiGrid-item")
      expect(items[0].querySelector("h1, h2, h3, h4, h5, h6")).not.toBeNull()
    },
  )

  it("admin pages have no second sidebar: the frame is the page's", () => {
    const { container } = render(
      <Providers>
        <AdminPageSkeleton />
      </Providers>,
    )
    expect(container.querySelectorAll("main")).toHaveLength(1)
    expect(
      container.querySelector('[data-skeleton="data-grid"]'),
    ).not.toBeNull()
  })
})

describe("listing card skeleton", () => {
  it.each([
    ["dark", mainTheme],
    ["light", lightTheme],
  ])("is the card's size in %s mode", (mode, theme) => {
    const { container } = render(
      <Providers theme={theme}>
        <ListingSkeleton />
      </Providers>,
    )
    const card = container.querySelector(
      '[data-skeleton="listing-card"] > .MuiCard-root',
    )!
    expect(cssOf(card)).toContain(`height:${LISTING_CARD_HEIGHT}px`)
    const media = card.querySelector(".MuiSkeleton-root")!
    expect(media.getAttribute("style") ?? cssOf(media)).toMatch(
      mode === "dark"
        ? /height:\s*100%/
        : new RegExp(`height:\\s*${LISTING_CARD_MEDIA_HEIGHT}px`),
    )
  })
})

describe("service card skeleton", () => {
  it("is the card's grid cell and height", () => {
    const { container } = render(
      <Providers>
        <Grid container>
          <ServiceListingSkeleton />
        </Grid>
        <Grid container data-testid="real">
          <Grid item {...SERVICE_LISTING_GRID_BREAKPOINTS} />
        </Grid>
      </Providers>,
    )
    const [skeletonItem, realItem] = container.querySelectorAll(".MuiGrid-item")
    expect(gridClasses(skeletonItem)).toEqual(gridClasses(realItem))
    const card = skeletonItem.querySelector(".MuiCard-root")!
    expect(cssOf(card)).toContain(`height:${SERVICE_CARD_HEIGHT}px`)
  })
})

describe("game-data card grids", () => {
  const shapes = Object.entries(CARD_GRIDS).filter(
    (e): e is [string, CardGridShape] =>
      typeof e[1] === "object" && e[1] !== null && "item" in e[1],
  )

  it.each(shapes)("%s: skeleton grid = the page's grid", (_name, shape) => {
    const { container } = render(
      <Providers>
        <CardGridSkeleton shape={shape} count={2} />
        <Grid container spacing={shape.spacing} data-testid="real">
          <Grid item {...shape.item} />
        </Grid>
      </Providers>,
    )
    const [skeletonGrid, realGrid] =
      container.querySelectorAll(".MuiGrid-container")
    expect(gridClasses(skeletonGrid)).toEqual(gridClasses(realGrid))
    expect(gridClasses(skeletonGrid.children[0])).toEqual(
      gridClasses(realGrid.children[0]),
    )
    const card = skeletonGrid.querySelector(".MuiSkeleton-root")!
    expect(card.getAttribute("style") ?? "").toMatch(
      new RegExp(`height:\\s*${shape.cardHeight}px`),
    )
  })
})

describe("DataGrid skeleton", () => {
  it("takes the grid's shape from its props", () => {
    const shape = dataGridSkeletonProps({
      columns: [
        { field: "a" },
        { field: "b" },
        { field: "c" },
        { field: "hidden" },
      ],
      rows: [],
      autoHeight: true,
      initialState: {
        pagination: { paginationModel: { pageSize: 10, page: 0 } },
        columns: { columnVisibilityModel: { hidden: false } },
      },
    })
    expect(shape).toMatchObject({
      columns: 3,
      rows: 5,
      density: "standard",
      showFooter: true,
      autoHeight: true,
    })
    // 1px frame top and bottom + 56 header + 5 x 52 rows + 52 footer
    expect(dataGridSkeletonHeight(shape)).toBe(2 + 56 + 5 * 52 + 52)
    expect(
      dataGridSkeletonHeight({ ...shape, density: "compact", rows: 10 }),
    ).toBe(2 + 39 + 10 * 36 + 52)
  })

  it("is that tall, framed like the grid", () => {
    const { container } = render(
      <ThemeProvider theme={mainTheme}>
        <DataGridSkeleton rows={3} columns={2} />
      </ThemeProvider>,
    )
    const frame = container.querySelector('[data-skeleton="data-grid"]')!
    const css = cssOf(frame)
    expect(css).toContain(`height:${2 + 56 + 3 * 52 + 52}px`)
    expect(css).toMatch(/border:1pxsolid/)
  })

  it("fills its container when the grid isn't autoHeight", () => {
    const { container } = render(
      <ThemeProvider theme={mainTheme}>
        <DataGridSkeleton rows={3} autoHeight={false} />
      </ThemeProvider>,
    )
    expect(
      cssOf(container.querySelector('[data-skeleton="data-grid"]')!),
    ).toContain("height:100%")
  })
})
