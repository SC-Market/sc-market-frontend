/**
 * Unit and Property-Based Tests for DetailPageLayout Component
 *
 * Feature: page-architecture-refactor
 * Property 3: DetailPageLayout includes navigation elements
 * Validates: Requirements 2.5
 */

import React from "react"
import { render, screen } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"
import { DetailPageLayout } from "../DetailPageLayout"
import { FormPageLayout } from "../FormPageLayout"
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

describe("DetailPageLayout - Property Tests", () => {
  it("Property 3: DetailPageLayout includes navigation elements", () => {
    fc.assert(
      fc.property(
        // Generate arbitrary configurations with backButton enabled
        fc.record({
          backButton: fc.constant(true),
          backTo: fc.option(fc.constantFrom("/", "/market", "/profile"), { nil: undefined }),
          entityTitle: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
          entitySubtitle: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
        }),
        (config) => {
          // Render with generated configuration
          const { container, unmount } = render(
            <TestWrapper>
              <DetailPageLayout
                backButton={config.backButton}
                backTo={config.backTo}
                entityTitle={config.entityTitle}
                entitySubtitle={config.entitySubtitle}
              >
                <div data-testid="test-content">Test content</div>
              </DetailPageLayout>
            </TestWrapper>,
          )

          // Verify component renders without errors
          expect(container).toBeInTheDocument()

          // Verify back button is rendered when backButton is true
          const backButton = screen.getByLabelText("Go back")
          expect(backButton).toBeInTheDocument()

          // Verify content is rendered
          expect(screen.getByTestId("test-content")).toBeInTheDocument()

          // Clean up after each property test run
          unmount()
        },
      ),
      { numRuns: 100 },
    )
  })
})

/**
 * Unit Tests for Specialized Layouts
 *
 * Tests verify specific functionality of DetailPageLayout and FormPageLayout
 * Validates: Requirements 2.5, 2.6
 */
describe("DetailPageLayout - Unit Tests", () => {
  it("renders back button when configured", () => {
    render(
      <TestWrapper>
        <DetailPageLayout
          backButton={true}
          entityTitle="Test Entity"
        >
          <div>Test content</div>
        </DetailPageLayout>
      </TestWrapper>,
    )

    const backButton = screen.getByLabelText("Go back")
    expect(backButton).toBeInTheDocument()
  })

  it("does not render back button when not configured", () => {
    render(
      <TestWrapper>
        <DetailPageLayout
          backButton={false}
          entityTitle="Test Entity"
        >
          <div>Test content</div>
        </DetailPageLayout>
      </TestWrapper>,
    )

    const backButton = screen.queryByLabelText("Go back")
    expect(backButton).not.toBeInTheDocument()
  })

  it("renders entity title and subtitle", () => {
    render(
      <TestWrapper>
        <DetailPageLayout
          entityTitle="Test Entity"
          entitySubtitle="Test Subtitle"
        >
          <div>Test content</div>
        </DetailPageLayout>
      </TestWrapper>,
    )

    expect(screen.getByText("Test Entity")).toBeInTheDocument()
    expect(screen.getByText("Test Subtitle")).toBeInTheDocument()
  })

  it("renders entity actions", () => {
    render(
      <TestWrapper>
        <DetailPageLayout
          entityTitle="Test Entity"
          entityActions={<button>Entity Action</button>}
        >
          <div>Test content</div>
        </DetailPageLayout>
      </TestWrapper>,
    )

    expect(screen.getByText("Entity Action")).toBeInTheDocument()
  })
})

describe("FormPageLayout - Unit Tests", () => {
  it("renders form actions", () => {
    render(
      <TestWrapper>
        <FormPageLayout
          formTitle="Test Form"
          submitButton={<button>Submit</button>}
          cancelButton={<button>Cancel</button>}
        >
          <div>Form content</div>
        </FormPageLayout>
      </TestWrapper>,
    )

    expect(screen.getByText("Submit")).toBeInTheDocument()
    expect(screen.getByText("Cancel")).toBeInTheDocument()
  })

  it("renders form title", () => {
    render(
      <TestWrapper>
        <FormPageLayout formTitle="Create New Item">
          <div>Form content</div>
        </FormPageLayout>
      </TestWrapper>,
    )

    expect(screen.getByText("Create New Item")).toBeInTheDocument()
  })

  it("renders back button when configured", () => {
    render(
      <TestWrapper>
        <FormPageLayout
          formTitle="Test Form"
          backButton={true}
        >
          <div>Form content</div>
        </FormPageLayout>
      </TestWrapper>,
    )

    const backButton = screen.getByLabelText("Go back")
    expect(backButton).toBeInTheDocument()
  })

  it("renders only submit button when cancel is not provided", () => {
    render(
      <TestWrapper>
        <FormPageLayout
          formTitle="Test Form"
          submitButton={<button>Submit</button>}
        >
          <div>Form content</div>
        </FormPageLayout>
      </TestWrapper>,
    )

    expect(screen.getByText("Submit")).toBeInTheDocument()
    expect(screen.queryByText("Cancel")).not.toBeInTheDocument()
  })
})
