/**
 * Property-Based Tests for StandardPageLayout Metadata
 *
 * Feature: page-architecture-refactor
 * Property 15: Document title is set from props
 * Validates: Requirements 10.2
 */

import React from "react"
import { render } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"
import { StandardPageLayout } from "../StandardPageLayout"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import fc from "fast-check"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { DrawerOpenContext } from "../../../hooks/layout/Drawer"
import { ThemeProvider, createTheme } from "@mui/material/styles"

// Create a real MUI theme with custom properties
const mockTheme = createTheme({
  layoutSpacing: {
    component: 2,
    layout: 3,
  },
} as any)

// Mock the Page component to track title and canonical URL props
let capturedTitle: string | null | undefined = undefined
let capturedCanonicalUrl: string | undefined = undefined

vi.mock("../../metadata/Page", async () => {
  return {
    Page: ({ 
      children, 
      title, 
      canonUrl 
    }: { 
      children: React.ReactNode; 
      title?: string | null;
      canonUrl?: string;
    }) => {
      capturedTitle = title
      capturedCanonicalUrl = canonUrl
      return <div>{children}</div>
    },
  }
})

// Mock ErrorPage component
vi.mock("../../../pages/errors/ErrorPage", async () => {
  return {
    ErrorPage: () => <div>Error Page</div>,
  }
})

// Mock Footer to avoid AlertHookContext dependency
vi.mock("../../footer/Footer", async () => {
  return {
    Footer: () => <div data-testid="footer">Footer</div>,
  }
})

// Create a minimal mock store
const mockStore = configureStore({
  reducer: {},
})

// Wrapper component to provide necessary context
function TestWrapper({ children }: { children: React.ReactNode }) {
  const drawerState = React.useState(false)

  return (
    <Provider store={mockStore}>
      <ThemeProvider theme={mockTheme}>
        <BrowserRouter>
          <DrawerOpenContext.Provider value={drawerState}>
            {children}
          </DrawerOpenContext.Provider>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  )
}

describe("StandardPageLayout - Metadata Property Tests", () => {
  beforeEach(() => {
    capturedTitle = undefined
  })

  afterEach(() => {
    capturedTitle = undefined
  })

  it("Property 15: Document title is set from props", () => {
    fc.assert(
      fc.property(
        // Generate arbitrary title strings, including null and undefined
        fc.option(
          fc.string({ minLength: 1, maxLength: 100 }),
          { nil: null }
        ),
        (title) => {
          // Reset captured title before each test
          capturedTitle = undefined

          // Render with generated title
          const { unmount } = render(
            <TestWrapper>
              <StandardPageLayout title={title}>
                <div>Test content</div>
              </StandardPageLayout>
            </TestWrapper>
          )

          // Verify that the Page component received the title prop
          expect(capturedTitle).toBe(title)

          // Clean up
          unmount()
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * Unit Tests for StandardPageLayout Metadata
 *
 * These tests verify specific metadata handling including canonical URLs
 * and loading state titles.
 */

describe("StandardPageLayout - Metadata Unit Tests", () => {
  beforeEach(() => {
    capturedTitle = undefined
    capturedCanonicalUrl = undefined
  })

  afterEach(() => {
    capturedTitle = undefined
    capturedCanonicalUrl = undefined
  })

  it("sets canonical URL in page metadata", () => {
    const testCanonicalUrl = "/market/listing/12345"

    render(
      <TestWrapper>
        <StandardPageLayout canonicalUrl={testCanonicalUrl}>
          <div>Test content</div>
        </StandardPageLayout>
      </TestWrapper>
    )

    // Verify Page component received the canonical URL
    expect(capturedCanonicalUrl).toBe(testCanonicalUrl)
  })

  it("displays default title during loading state", () => {
    render(
      <TestWrapper>
        <StandardPageLayout
          isLoading={true}
          skeleton={<div>Loading...</div>}
        >
          <div>Test content</div>
        </StandardPageLayout>
      </TestWrapper>
    )

    // When no title is provided during loading, capturedTitle should be undefined
    // The Page component will use the default title "SC Market"
    expect(capturedTitle).toBeUndefined()
  })

  it("displays provided title during loading state", () => {
    const loadingTitle = "Loading Page..."

    render(
      <TestWrapper>
        <StandardPageLayout
          title={loadingTitle}
          isLoading={true}
          skeleton={<div>Loading...</div>}
        >
          <div>Test content</div>
        </StandardPageLayout>
      </TestWrapper>
    )

    // Title should be passed to Page component even during loading
    expect(capturedTitle).toBe(loadingTitle)
  })
})
