import React, { lazy } from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest"
import { LazySection } from "../LazySection"

// Mock components for testing
const TestContent = () => <div>Test Content Loaded</div>
const TestSkeleton = () => <div>Loading Skeleton</div>
const TestErrorFallback = ({ error }: { error: Error }) => (
  <div>Error: {error.message}</div>
)

// Component that throws an error
const ErrorComponent = () => {
  throw new Error("Test error")
}

describe("LazySection", () => {
  // Suppress console.error for error boundary tests
  const originalError = console.error
  beforeAll(() => {
    console.error = vi.fn()
  })
  afterAll(() => {
    console.error = originalError
  })

  it("renders skeleton while lazy component is loading", async () => {
    const LazyTestContent = lazy(
      () =>
        new Promise<{ default: React.ComponentType }>((resolve) => {
          setTimeout(() => resolve({ default: TestContent }), 100)
        }),
    )

    render(
      <LazySection
        component={LazyTestContent}
        skeleton={TestSkeleton}
      />,
    )

    // Skeleton should be visible initially
    expect(screen.getByText("Loading Skeleton")).toBeInTheDocument()

    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText("Test Content Loaded")).toBeInTheDocument()
    })

    // Skeleton should be gone
    expect(screen.queryByText("Loading Skeleton")).not.toBeInTheDocument()
  })

  it("renders lazy component after loading", async () => {
    const LazyTestContent = lazy(() =>
      Promise.resolve({ default: TestContent }),
    )

    render(
      <LazySection
        component={LazyTestContent}
        skeleton={TestSkeleton}
      />,
    )

    await waitFor(() => {
      expect(screen.getByText("Test Content Loaded")).toBeInTheDocument()
    })
  })

  it("passes componentProps to lazy component", async () => {
    const PropsComponent = ({ message }: { message: string }) => (
      <div>{message}</div>
    )
    const LazyPropsComponent = lazy(() =>
      Promise.resolve({ default: PropsComponent }),
    )

    render(
      <LazySection
        component={LazyPropsComponent}
        componentProps={{ message: "Custom Message" }}
        skeleton={TestSkeleton}
      />,
    )

    await waitFor(() => {
      expect(screen.getByText("Custom Message")).toBeInTheDocument()
    })
  })

  it("catches errors and displays error fallback", async () => {
    const LazyErrorComponent = lazy(() =>
      Promise.resolve({ default: ErrorComponent }),
    )

    render(
      <LazySection
        component={LazyErrorComponent}
        skeleton={TestSkeleton}
        errorFallback={TestErrorFallback}
      />,
    )

    await waitFor(() => {
      expect(screen.getByText("Error: Test error")).toBeInTheDocument()
    })
  })

  it("displays default error message when no errorFallback provided", async () => {
    const LazyErrorComponent = lazy(() =>
      Promise.resolve({ default: ErrorComponent }),
    )

    render(
      <LazySection
        component={LazyErrorComponent}
        skeleton={TestSkeleton}
      />,
    )

    await waitFor(() => {
      expect(
        screen.getByText("An error occurred while loading this section."),
      ).toBeInTheDocument()
    })
  })

  it("logs errors to console", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error")
    const LazyErrorComponent = lazy(() =>
      Promise.resolve({ default: ErrorComponent }),
    )

    render(
      <LazySection
        component={LazyErrorComponent}
        skeleton={TestSkeleton}
      />,
    )

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    consoleErrorSpy.mockRestore()
  })

  it("applies grid props to container", async () => {
    const LazyTestContent = lazy(() =>
      Promise.resolve({ default: TestContent }),
    )

    const { container } = render(
      <LazySection
        component={LazyTestContent}
        skeleton={TestSkeleton}
        gridProps={{ xs: 12, md: 6, className: "custom-grid" }}
      />,
    )

    await waitFor(() => {
      expect(screen.getByText("Test Content Loaded")).toBeInTheDocument()
    })

    // Check that grid props are applied
    const gridItem = container.querySelector(".custom-grid")
    expect(gridItem).toBeInTheDocument()
  })
})
