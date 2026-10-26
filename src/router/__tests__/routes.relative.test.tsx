/**
 * Relative link / navigate() resolution across the REAL route tree shape.
 *
 * The route table from src/App.tsx is cloned with every element, Component,
 * lazy and errorElement replaced by a probe that renders relative <Link>s,
 * so paths, index routes, pathless layouts and the `/*` splat are exactly the
 * app's. For every leaf route we snapshot the hrefs the probe's links resolve
 * to, with both `relative="route"` (default) and `relative="path"`.
 *
 * This is the Phase 1 risk surface: relative links in the nested
 * /org/:contractor_id/*, /shop/:shopSlug/* and /messages/:chat_id children,
 * the index-route <Navigate to="about"/"listings">, and the `/*` splat whose
 * relative resolution v7_relativeSplatPath changes (expect a diff ONLY for
 * the splat entries when that flag/RR7 lands).
 */
import React from "react"
import { act, render } from "@testing-library/react"
import {
  createMemoryRouter,
  Link,
  Outlet,
  RouterProvider,
  useLocation,
  useNavigate,
  useParams,
  useResolvedPath,
  type NavigateFunction,
  type RouteObject,
} from "react-router-dom"
import { describe, expect, it } from "vitest"
import { routes } from "../../router/routeObjects"
import { enumerateRoutes, fillPattern, routeLabel } from "./regression/harness"
import { FIXTURE } from "./regression/fixtures"

const TARGETS = [
  ".",
  "./",
  "..",
  "../..",
  "child",
  "./child",
  "../sibling",
  "?tab=x",
  "#frag",
  "",
]

let leafNavigate: NavigateFunction | null = null

function Probe({ label }: { label: string }) {
  const location = useLocation()
  const params = useParams()
  const navigate = useNavigate()
  const resolvedDot = useResolvedPath(".")
  // The innermost probe renders last; it is the matched leaf.
  leafNavigate = navigate
  return (
    <section data-probe={label}>
      <output data-kind="location">
        {location.pathname + location.search + location.hash}
      </output>
      <output data-kind="params">{JSON.stringify(params)}</output>
      <output data-kind="resolved-dot">{resolvedDot.pathname}</output>
      {TARGETS.map((to) => (
        <React.Fragment key={to}>
          <Link data-to={to} data-relative="route" to={to}>
            {to}
          </Link>
          <Link data-to={to} data-relative="path" to={to} relative="path">
            {to}
          </Link>
        </React.Fragment>
      ))}
      <Outlet />
    </section>
  )
}

function probeRoutes(list: RouteObject[]): RouteObject[] {
  return list.map((route): RouteObject => {
    const label = routeLabel(route)
    const children = route.children ? probeRoutes(route.children) : undefined
    if (route.index) {
      return { index: true, element: <Probe label={label} /> }
    }
    return {
      path: route.path,
      caseSensitive: route.caseSensitive,
      element: <Probe label={label} />,
      children,
    }
  })
}

const probed = probeRoutes(routes)

function readLeafProbe(container: HTMLElement) {
  const sections = container.querySelectorAll("section[data-probe]")
  const leaf = sections[sections.length - 1]
  if (!leaf) throw new Error("no probe rendered")
  const own = (selector: string) =>
    [...leaf.querySelectorAll(selector)].filter(
      (el) => el.closest("section[data-probe]") === leaf,
    )
  const text = (kind: string) =>
    own(`output[data-kind="${kind}"]`)[0]?.textContent ?? ""
  const links: Record<string, string> = {}
  for (const a of own("a[data-to]")) {
    links[
      `${a.getAttribute("data-relative")}:${JSON.stringify(a.getAttribute("data-to"))}`
    ] = a.getAttribute("href") ?? ""
  }
  return {
    probeChain: [...sections].map((s) => s.getAttribute("data-probe")),
    location: text("location"),
    params: JSON.parse(text("params") || "{}"),
    resolvedDot: text("resolved-dot"),
    links,
  }
}

function mountProbe(url: string) {
  const router = createMemoryRouter(probed, { initialEntries: [url] })
  const result = render(<RouterProvider router={router} />)
  return { router, ...result }
}

const leafPatterns = [...new Set(enumerateRoutes(routes).map((l) => l.pattern))]

describe("relative link resolution (every leaf)", () => {
  it.each(leafPatterns)("%s", (pattern) => {
    const url = fillPattern(pattern)
    const { container, unmount } = mountProbe(url)
    const probe = readLeafProbe(container)
    unmount()
    expect({ url, ...probe }).toMatchSnapshot()
  })
})

const NAVIGATE_CASES: Array<
  [url: string, to: string, relative?: "route" | "path"]
> = [
  [`/org/${FIXTURE.orgId}/manage/about`, ".."],
  [`/org/${FIXTURE.orgId}/manage/about`, "../roles"],
  [`/org/${FIXTURE.orgId}/manage/about`, "../roles", "path"],
  [`/org/${FIXTURE.orgId}/manage/about`, "roles"],
  [`/org/${FIXTURE.orgId}/orders`, ".."],
  [`/org/${FIXTURE.orgId}/orders`, "../money"],
  [`/org/${FIXTURE.orgId}/dashboard`, "../fleet"],
  [`/shop/${FIXTURE.shopSlug}/listings/create`, ".."],
  [`/shop/${FIXTURE.shopSlug}/listings/create`, "..", "path"],
  [`/shop/${FIXTURE.shopSlug}/listings`, "create"],
  [`/shop/${FIXTURE.shopSlug}/listings`, "../stock"],
  [`/messages/${FIXTURE.chatId}`, ".."],
  [`/messages/${FIXTURE.chatId}`, "../chat-2"],
  ["/messages", "chat-2"],
  ["/does/not/exist", "."],
  ["/does/not/exist", ".."],
  ["/does/not/exist", "sibling"],
  ["/does/not/exist", "..", "path"],
  ["/shops/test-shop/about", "../reviews"],
  ["/market/create/unique", "../multiple"],
]

describe("navigate() resolution", () => {
  it.each(NAVIGATE_CASES)(
    "from %s navigate(%j, relative=%s)",
    async (url, to, relative) => {
      const { router, unmount } = mountProbe(url)
      await act(async () => {
        await leafNavigate!(to, relative ? { relative } : undefined)
      })
      const after = router.state.location
      unmount()
      expect({
        from: url,
        to,
        relative: relative ?? "route",
        result: after.pathname + after.search + after.hash,
      }).toMatchSnapshot()
    },
  )
})
