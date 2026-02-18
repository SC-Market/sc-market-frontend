/**
 * Tests for usePageMarketListing Hook
 *
 * These tests verify the page hook pattern including return shape,
 * error handling, and query composition.
 */

import { renderHook, waitFor } from "@testing-library/react"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import fc from "fast-check"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { usePageMarketListing } from "../usePageMarketListing"
import type {
  UsePageResult,
  MarketListingPageData,
} from "../usePageMarketListing"
import { marketApi } from "../../api/marketApi"
import type { BaseListingType } from "../../domain/types"
import React from "react"

// Mock the market API
vi.mock("../../api/marketApi", () => ({
  marketApi: {
    reducerPath: "marketApi",
    reducer: vi.fn(),
    middleware: vi.fn(() => (next: any) => (action: any) => next(action)),
    endpoints: {},
  },
  useGetMarketListingQuery: vi.fn(),
}))

// Import the mocked function
import { useGetMarketListingQuery } from "../../api/marketApi"

// Create a mock store with the market API
function createMockStore() {
  return configureStore({
    reducer: {
      [marketApi.reducerPath]: (state = {}) => state,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(marketApi.middleware),
  })
}

// Wrapper component to provide Redux store
function createWrapper() {
  const store = createMockStore()
  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
}

describe("usePageMarketListing", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * Unit Test: Hook composes multiple API queries
   * Requirements: 5.4
   */
  it("composes API query correctly", () => {
    const mockListing: BaseListingType = {
      listing_id: "test-123",
      details: {
        title: "Test Listing",
        description: "Test description",
      },
    } as unknown as BaseListingType

    // Mock the query hook
    vi.mocked(useGetMarketListingQuery).mockReturnValue({
      data: mockListing,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as any)

    const { result } = renderHook(() => usePageMarketListing("test-123"), {
      wrapper: createWrapper(),
    })

    // Verify the hook was called with the correct ID
    expect(useGetMarketListingQuery).toHaveBeenCalledWith("test-123")

    // Verify the returned data structure
    expect(result.current.data).toEqual({
      listing: mockListing,
    })
  })

  /**
   * Unit Test: Refetch function calls all queries
   * Requirements: 5.4
   */
  it("refetch function calls underlying query refetch", () => {
    const mockRefetch = vi.fn()

    vi.mocked(useGetMarketListingQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: mockRefetch,
    } as any)

    const { result } = renderHook(() => usePageMarketListing("test-123"), {
      wrapper: createWrapper(),
    })

    // Call refetch
    result.current.refetch()

    // Verify the underlying query refetch was called
    expect(mockRefetch).toHaveBeenCalledTimes(1)
  })

  /**
   * Unit Test: Hook handles loading state
   */
  it("returns loading state correctly", () => {
    vi.mocked(useGetMarketListingQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: true,
      error: undefined,
      refetch: vi.fn(),
    } as any)

    const { result } = renderHook(() => usePageMarketListing("test-123"), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.isFetching).toBe(true)
    expect(result.current.data).toBeUndefined()
  })

  /**
   * Unit Test: Hook handles error state
   */
  it("returns error state correctly", () => {
    const mockError = { status: 404, data: "Not found" }

    vi.mocked(useGetMarketListingQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      error: mockError,
      refetch: vi.fn(),
    } as any)

    const { result } = renderHook(() => usePageMarketListing("test-123"), {
      wrapper: createWrapper(),
    })

    expect(result.current.error).toEqual(mockError)
    expect(result.current.data).toBeUndefined()
  })

  /**
   * Unit Test: Hook returns undefined data when query has no data
   */
  it("returns undefined data when query returns no data", () => {
    vi.mocked(useGetMarketListingQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      error: undefined,
      refetch: vi.fn(),
    } as any)

    const { result } = renderHook(() => usePageMarketListing("test-123"), {
      wrapper: createWrapper(),
    })

    expect(result.current.data).toBeUndefined()
  })
})

/**
 * Property-Based Tests for usePageMarketListing
 *
 * Feature: page-architecture-refactor
 */
describe("usePageMarketListing - Property Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * Property 6: Page hooks return required properties
   * Validates: Requirements 5.2, 5.5
   */
  it("Property 6: Page hooks return required properties", () => {
    fc.assert(
      fc.property(
        // Generate arbitrary listing IDs
        fc.string({ minLength: 1, maxLength: 50 }),
        // Generate arbitrary query states
        fc.record({
          hasData: fc.boolean(),
          isLoading: fc.boolean(),
          isFetching: fc.boolean(),
          hasError: fc.boolean(),
        }),
        (listingId, queryState) => {
          // Create mock data based on state
          const mockListing: BaseListingType | undefined = queryState.hasData
            ? ({
                listing_id: listingId,
                details: {
                  title: `Listing ${listingId}`,
                  description: "Test description",
                },
              } as unknown as BaseListingType)
            : undefined

          const mockError = queryState.hasError
            ? { status: 500, data: "Error" }
            : undefined

          // Mock the query hook
          vi.mocked(useGetMarketListingQuery).mockReturnValue({
            data: mockListing,
            isLoading: queryState.isLoading,
            isFetching: queryState.isFetching,
            error: mockError,
            refetch: vi.fn(),
          } as any)

          const { result } = renderHook(() => usePageMarketListing(listingId), {
            wrapper: createWrapper(),
          })

          // Verify all required properties are present
          expect(result.current).toHaveProperty("data")
          expect(result.current).toHaveProperty("isLoading")
          expect(result.current).toHaveProperty("isFetching")
          expect(result.current).toHaveProperty("error")
          expect(result.current).toHaveProperty("refetch")

          // Verify property types
          expect(typeof result.current.isLoading).toBe("boolean")
          expect(typeof result.current.isFetching).toBe("boolean")
          expect(typeof result.current.refetch).toBe("function")

          // Verify data structure when data exists
          if (queryState.hasData && result.current.data) {
            expect(result.current.data).toHaveProperty("listing")
            expect(result.current.data.listing).toEqual(mockListing)
          }

          // Verify error is exposed when present
          if (queryState.hasError) {
            expect(result.current.error).toBeDefined()
          }
        },
      ),
      { numRuns: 100 },
    )
  })

  /**
   * Property 7: Page hooks expose error information
   * Validates: Requirements 5.3
   */
  it("Property 7: Page hooks expose error information", () => {
    fc.assert(
      fc.property(
        // Generate arbitrary listing IDs
        fc.string({ minLength: 1, maxLength: 50 }),
        // Generate arbitrary error responses
        fc.record({
          status: fc.integer({ min: 400, max: 599 }),
          data: fc.string(),
        }),
        (listingId, errorResponse) => {
          // Mock the query hook with error
          vi.mocked(useGetMarketListingQuery).mockReturnValue({
            data: undefined,
            isLoading: false,
            isFetching: false,
            error: errorResponse,
            refetch: vi.fn(),
          } as any)

          const { result } = renderHook(() => usePageMarketListing(listingId), {
            wrapper: createWrapper(),
          })

          // Verify error is exposed in the hook's error property
          expect(result.current.error).toBeDefined()
          expect(result.current.error).toEqual(errorResponse)

          // Verify data is undefined when there's an error
          expect(result.current.data).toBeUndefined()
        },
      ),
      { numRuns: 100 },
    )
  })
})
