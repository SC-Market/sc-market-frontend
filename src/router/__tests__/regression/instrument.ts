/**
 * Test-only instrumentation shared by the route regression suites.
 *
 * Each suite registers these with vi.mock at the top of the file (vi.mock is
 * hoisted per test file, so it cannot live here):
 *
 *   vi.mock("react-router-dom", async (importOriginal) =>
 *     (await import("./regression/instrument")).instrumentRouterModule(await importOriginal()))
 *   vi.mock("socket.io-client", async () =>
 *     (await import("./regression/instrument")).fakeSocketModule())
 *
 * - `instrumentRouterModule` wraps `useRouteError` so every errorElement that
 *   renders reports its error here. Routing behavior is untouched.
 *   (After the RR7 codemod moves imports to "react-router", register it for
 *   that module too.)
 * - `fakeSocketModule` replaces socket.io so the chat socket never opens a
 *   real connection.
 * - `fakeChartModule` replaces @mui/x-charts. Charts need real layout
 *   (happy-dom has none) and under parallel load they intermittently threw
 *   "The data length of the x axis (0 items) is lower than the length of
 *   series" on the dashboard, which made /dashboard-family snapshots flaky.
 *   Charts are not routing; the browser crawl still renders the real ones.
 */

const routeErrors: string[] = []

/** Return and clear the errors errorElements have rendered since last call. */
export function takeRouteErrors(): string[] {
  return routeErrors.splice(0, routeErrors.length)
}

function describeError(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`
  if (error && typeof error === "object" && "status" in error) {
    const e = error as { status: unknown; statusText?: unknown }
    return `RouteErrorResponse ${String(e.status)} ${String(e.statusText ?? "")}`.trim()
  }
  return String(error)
}

export function instrumentRouterModule<
  M extends { useRouteError: () => unknown },
>(actual: M): M {
  return {
    ...actual,
    useRouteError: () => {
      const error = actual.useRouteError()
      // Page.tsx calls useRouteError() on every render; only a real error
      // means an errorElement (or Page's error redirect) is handling one.
      if (error !== null && error !== undefined)
        routeErrors.push(describeError(error))
      return error
    },
  }
}

export function fakeSocketModule() {
  const socket = {
    connected: false,
    on: () => socket,
    off: () => socket,
    once: () => socket,
    emit: () => socket,
    connect: () => socket,
    disconnect: () => socket,
    removeAllListeners: () => socket,
    io: { on: () => undefined, off: () => undefined },
  }
  return { io: () => socket, default: () => socket }
}

export function fakeChartModule() {
  const Chart = () => null
  return { LineChart: Chart, BarChart: Chart }
}
