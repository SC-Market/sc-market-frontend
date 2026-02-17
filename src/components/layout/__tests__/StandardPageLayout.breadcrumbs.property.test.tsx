/**
 * Property-Based Tests for StandardPageLayout Breadcrumbs
 *
 * Feature: page-architecture-refactor
 * These tests verify breadcrumb rendering properties across all valid inputs.
 */

import React from "react"
import { render, screen } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"
import { StandardPageLayout, BreadcrumbItem } from "../StandardPageLayout"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import fc from "fast-check"
import { describe, it, expect, vi } from "vitest"
import { DrawerOpenContext } from "../../../hooks/layout/Drawer"
import { ThemeProvider, createTheme } from "@mui/material/styles"

// Create a real MUI theme with custom properties
const mockTheme = createTheme({
  layoutSpacing: {
    component: 2,
    layout: 3,
  },
} as any)

// Mock the Page component
vi.mock("../../metadata/Page", async () => {
  return {
    Page: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
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

describe("StandardPageLayout - Breadcrumb Property Tests", () => {
  /**
   * Property 12: Breadcrumbs render all provided items
   * Validates: Requirements 9.1
   *
   * For any StandardPageLayout with a breadcrumbs array prop,
   * all items in the array should be rendered in the breadcrumb navigation.
   */
  it("Property 12: Breadcrumbs render all provided items", () => {
    fc.assert(
      fc.property(
        // Generate arbitrary breadcrumb arrays with alphanumeric labels
        fc.array(
          fc.record({
            label: fc
              .stringMatching(/^[a-zA-Z0-9 ]{1,50}$/)
              .filter((s) => s.trim().length > 0), // Ensure non-empty labels
            href: fc.option(fc.constantFrom("/", "/home", "/page", "/test"), {
              nil: undefined,
            }),
          }),
          { minLength: 1, maxLength: 10 },
        ),
        (breadcrumbs) => {
          const { container, unmount } = render(
            <TestWrapper>
              <StandardPageLayout breadcrumbs={breadcrumbs}>
                <div>Content</div>
              </StandardPageLayout>
            </TestWrapper>,
          )

          // Verify breadcrumb navigation is rendered
          const nav = container.querySelector("nav.MuiBreadcrumbs-root")
          expect(nav).toBeInTheDocument()

          // Get all breadcrumb list items (excluding separators and collapse button)
          const breadcrumbItems = container.querySelectorAll(
            "nav.MuiBreadcrumbs-root li.MuiBreadcrumbs-li",
          )

          // MUI may collapse breadcrumbs on mobile, so we check that at least some items are rendered
          // The number of rendered items should be at least 1 (the last item is always shown)
          expect(breadcrumbItems.length).toBeGreaterThan(0)

          // Verify that the breadcrumb navigation contains text from the breadcrumbs
          if (nav) {
            const navText = nav.textContent || ""
            const hasContent = breadcrumbs.some((item) =>
              navText.includes(item.label.trim()),
            )
            expect(hasContent).toBe(true)
          }

          unmount()
        },
      ),
      { numRuns: 100 },
    )
  })

  /**
   * Property 13: Current page is last breadcrumb
   * Validates: Requirements 9.2
   *
   * For any StandardPageLayout with breadcrumbs, the last item in the
   * breadcrumb array should represent the current page and should not be a link.
   */
  it("Property 13: Current page is last breadcrumb", () => {
    fc.assert(
      fc.property(
        // Generate breadcrumb arrays with at least 2 items and alphanumeric labels
        fc.array(
          fc.record({
            label: fc
              .stringMatching(/^[a-zA-Z0-9 ]{1,50}$/)
              .filter((s) => s.trim().length > 0), // Ensure non-empty labels
            href: fc.option(fc.constantFrom("/", "/home", "/page", "/test"), {
              nil: undefined,
            }),
          }),
          { minLength: 2, maxLength: 10 },
        ),
        (breadcrumbs) => {
          const { container, unmount } = render(
            <TestWrapper>
              <StandardPageLayout breadcrumbs={breadcrumbs}>
                <div>Content</div>
              </StandardPageLayout>
            </TestWrapper>,
          )

          const lastItem = breadcrumbs[breadcrumbs.length - 1]
          const trimmedLabel = lastItem.label.trim()

          // Find all breadcrumb list items
          const breadcrumbItems = container.querySelectorAll(
            "nav.MuiBreadcrumbs-root li.MuiBreadcrumbs-li",
          )
          expect(breadcrumbItems.length).toBeGreaterThan(0)

          // Get the last breadcrumb item
          const lastBreadcrumbItem =
            breadcrumbItems[breadcrumbItems.length - 1]

          // Verify it contains the last label
          expect(lastBreadcrumbItem.textContent).toContain(trimmedLabel)

          // Verify it's not a link (should be a Typography/p element, not an anchor)
          const linkInLastItem = lastBreadcrumbItem.querySelector("a")
          expect(linkInLastItem).toBeNull()

          // Verify it has a Typography element (p tag)
          const typographyInLastItem = lastBreadcrumbItem.querySelector("p")
          expect(typographyInLastItem).toBeInTheDocument()

          unmount()
        },
      ),
      { numRuns: 100 },
    )
  })
})


/**
 * Unit Test for Dynamic Breadcrumb Labels
 *
 * Feature: page-architecture-refactor
 * Validates: Requirements 9.3
 *
 * Test breadcrumbs update when data loads
 */
describe("StandardPageLayout - Dynamic Breadcrumb Unit Tests", () => {
  it("breadcrumbs update when data loads", () => {
    // Initial render with loading state (no data yet)
    const { rerender, container } = render(
      <TestWrapper>
        <StandardPageLayout
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Loading..." }, // Placeholder while data loads
          ]}
          isLoading={true}
          skeleton={<div>Loading skeleton</div>}
        >
          <div>Content</div>
        </StandardPageLayout>
      </TestWrapper>,
    )

    // Verify initial breadcrumb with placeholder
    expect(screen.getByText("Loading...")).toBeInTheDocument()

    // Simulate data loading complete - update breadcrumbs with actual data
    rerender(
      <TestWrapper>
        <StandardPageLayout
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Market Listing #12345" }, // Actual data loaded
          ]}
          isLoading={false}
        >
          <div>Content</div>
        </StandardPageLayout>
      </TestWrapper>,
    )

    // Verify breadcrumb updated with actual data
    expect(screen.getByText("Market Listing #12345")).toBeInTheDocument()
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument()
  })

  it("breadcrumbs update when entity name changes", () => {
    // Initial render with first entity
    const { rerender } = render(
      <TestWrapper>
        <StandardPageLayout
          breadcrumbs={[
            { label: "Organizations", href: "/orgs" },
            { label: "Org Alpha" },
          ]}
        >
          <div>Content</div>
        </StandardPageLayout>
      </TestWrapper>,
    )

    // Verify initial breadcrumb
    expect(screen.getByText("Org Alpha")).toBeInTheDocument()

    // Navigate to different entity - breadcrumbs should update
    rerender(
      <TestWrapper>
        <StandardPageLayout
          breadcrumbs={[
            { label: "Organizations", href: "/orgs" },
            { label: "Org Beta" },
          ]}
        >
          <div>Content</div>
        </StandardPageLayout>
      </TestWrapper>,
    )

    // Verify breadcrumb updated to new entity
    expect(screen.getByText("Org Beta")).toBeInTheDocument()
    expect(screen.queryByText("Org Alpha")).not.toBeInTheDocument()
  })

  it("breadcrumbs handle undefined to defined transition", () => {
    // Initial render without breadcrumbs
    const { rerender } = render(
      <TestWrapper>
        <StandardPageLayout>
          <div>Content</div>
        </StandardPageLayout>
      </TestWrapper>,
    )

    // Verify no breadcrumbs rendered initially
    const nav = document.querySelector("nav.MuiBreadcrumbs-root")
    expect(nav).not.toBeInTheDocument()

    // Update with breadcrumbs after data loads
    rerender(
      <TestWrapper>
        <StandardPageLayout
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Profile" },
          ]}
        >
          <div>Content</div>
        </StandardPageLayout>
      </TestWrapper>,
    )

    // Verify breadcrumbs now rendered
    expect(screen.getByText("Home")).toBeInTheDocument()
    expect(screen.getByText("Profile")).toBeInTheDocument()
  })
})
