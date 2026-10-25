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
// `__mocked` is a marker this file attaches to its own stub so a second setup
// pass does not wrap an already-mocked fetch.
type MockedFetch = typeof globalThis.fetch & { __mocked?: true }

const existingFetch: MockedFetch | undefined = globalThis.fetch
if (!existingFetch || !existingFetch.__mocked) {
  const mockFetch: MockedFetch = Object.assign(
    vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify({}), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    ),
    { __mocked: true as const },
  )
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
    // Session check unanswered: useSession() follows the profile query above
    // and useIsAuthenticated() is false, as before the check existed.
    useAuthSessionCheckQuery: () => ({ data: undefined }),
  }
})
