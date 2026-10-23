import { useMediaQuery, useTheme } from "@mui/material"
import type { Breakpoint } from "@mui/material/styles"

/**
 * The single place the app reads viewport breakpoints. Every breakpoint
 * check goes through these hooks instead of calling MUI's `useMediaQuery`
 * directly, so the server/hydration default lives here and nowhere else.
 *
 * Server and hydration renders: MUI's `useMediaQuery` is built on
 * `useSyncExternalStore`. Its server snapshot is `defaultMatches` (`false`),
 * so on a server render and during the first `hydrateRoot` render every
 * query reports "no match": `down(...)` is false and `up(...)` is false.
 * In practice that's the desktop layout (all call sites branch on
 * `down(...)`), and it's the default today. React then re-renders with the
 * real `matchMedia` result after hydration.
 *
 * SPA (`createRoot`, what ships today): React reads the client snapshot from
 * the first render, so these hooks return the real value immediately,
 * exactly like calling `useMediaQuery` directly.
 *
 * Future server hint: to make phones hydrate straight into the mobile layout,
 * the server can guess the viewport (Client Hints such as
 * `Sec-CH-Viewport-Width`, or a UA sniff) and pass it to MUI through the
 * theme's `components.MuiUseMediaQuery.defaultProps.ssrMatchMedia`, using
 * MUI's documented `ssrMatchMedia` + `css-mediaquery` pattern
 * (https://mui.com/material-ui/react-use-media-query/#server-side-rendering).
 * The server and the hydrating client must provide the same hint, or the
 * first client render won't match the server HTML. Because every breakpoint
 * read goes through `useBreakpointQuery` below, that hint only has to be
 * wired up once (here, or in the theme these hooks read).
 *
 * State that's seeded from a breakpoint (`useState(!isMobile)`) must use
 * `useHydratedInitialState` (src/hooks/ssr) so it re-seeds from the real
 * value after hydration instead of keeping the server default.
 */
function useBreakpointQuery(query: string): boolean {
  return useMediaQuery(query)
}

/** `theme.breakpoints.down(key)`: viewport narrower than `key`. */
export function useBreakpointDown(key: Breakpoint): boolean {
  const theme = useTheme()
  return useBreakpointQuery(theme.breakpoints.down(key))
}

/** `theme.breakpoints.up(key)`: viewport at least as wide as `key`. */
export function useBreakpointUp(key: Breakpoint): boolean {
  const theme = useTheme()
  return useBreakpointQuery(theme.breakpoints.up(key))
}

/** `theme.breakpoints.between(start, end)`: `start` <= width < `end`. */
export function useBreakpointBetween(start: Breakpoint, end: Breakpoint): boolean {
  const theme = useTheme()
  return useBreakpointQuery(theme.breakpoints.between(start, end))
}

/** The app's standard mobile layout: viewport narrower than `md` (900px). */
export function useIsMobile(): boolean {
  return useBreakpointDown("md")
}
