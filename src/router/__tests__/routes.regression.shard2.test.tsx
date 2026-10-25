/**
 * Route regression suite, shard 2 of 4. See regression/harness.tsx.
 */
import { vi } from "vitest"
import { defineRouteSuite } from "./regression/defineRouteSuite"

vi.unmock("../../features/profile/api/profileApi")
vi.mock("react-router-dom", async (importOriginal) =>
  (await import("./regression/instrument")).instrumentRouterModule(
    await importOriginal<typeof import("react-router-dom")>(),
  ),
)
vi.mock("socket.io-client", async () =>
  (await import("./regression/instrument")).fakeSocketModule(),
)
vi.mock("@mui/x-charts/LineChart", async () =>
  (await import("./regression/instrument")).fakeChartModule(),
)
vi.mock("@mui/x-charts/BarChart", async () =>
  (await import("./regression/instrument")).fakeChartModule(),
)

defineRouteSuite(1)
