import "@testing-library/jest-dom"
import { expect, afterEach, vi } from "vitest"
import { cleanup } from "@testing-library/react"
import * as matchers from "@testing-library/jest-dom/matchers"
import { toHaveNoViolations } from "jest-axe"
import React from "react"

expect.extend(matchers)
expect.extend(toHaveNoViolations)
afterEach(() => cleanup())

// Global fetch mock to prevent ECONNREFUSED errors from RTK Query middleware.
// Tests that need real network behavior should override this with MSW or vi.spyOn.
if (!globalThis.fetch || !(globalThis.fetch as any).__mocked) {
  const mockFetch = vi.fn(() =>
    Promise.resolve(new Response(JSON.stringify({}), { status: 200, headers: { "Content-Type": "application/json" } }))
  ) as any
  mockFetch.__mocked = true
  globalThis.fetch = mockFetch
}

// Global mock for profileApi to prevent serviceApi middleware errors in tests.
// Tests that specifically need to test profile-related behavior can vi.unmock this.
vi.mock("./features/profile/api/profileApi", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    useGetUserProfileQuery: () => ({
      data: undefined,
      isLoading: false,
      isError: false,
      error: undefined,
      refetch: vi.fn(),
    }),
  }
})
