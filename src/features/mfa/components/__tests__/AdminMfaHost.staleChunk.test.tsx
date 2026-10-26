/**
 * AdminMfaHost is mounted around every page for site admins. When its lazy
 * chunk is gone after a deploy, the rest of the app must keep rendering (it
 * used to crash the whole app to the root error boundary, on every page).
 */
import React from "react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"

vi.mock("../../../../hooks/login/useSession", () => ({
  useSession: () => ({ status: "authenticated", profile: { role: "admin" } }),
}))
vi.mock("../../../../util/siteRole", () => ({ isSiteAdmin: () => true }))
vi.mock("../../adminLock", () => ({ isMfaLockedAdmin: () => false }))
vi.mock("../MfaChallengeDialogHost", () => {
  throw new TypeError(
    "Failed to fetch dynamically imported module: https://sc-market.space/assets/MfaChallengeDialogHost-D2xWasGs.js",
  )
})
vi.mock("../../../../util/retryDynamicImport", () => ({
  // No backoff in tests; failure handling is covered by the real module's tests.
  retryDynamicImport: <T,>(importFn: () => Promise<T>) => importFn(),
}))
vi.mock("../../../../util/monitoring/bugsnagLoader", () => ({
  notifyBugsnag: vi.fn(),
}))

import { AdminMfaHost } from "../AdminMfaHost"

describe("AdminMfaHost with a missing chunk", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined)
  })

  it("renders nothing and leaves its siblings alone", async () => {
    render(
      <div>
        <p>page content</p>
        <AdminMfaHost />
      </div>,
    )
    await waitFor(() =>
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("[ErrorBoundary AdminMfaHost]"),
        expect.anything(),
        expect.anything(),
      ),
    )
    expect(screen.getByText("page content")).toBeInTheDocument()
  })
})
