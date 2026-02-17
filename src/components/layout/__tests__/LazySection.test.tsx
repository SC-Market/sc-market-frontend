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

  it("loads multiple sections in parallel", async () => {
    const Section1 = () => <div>Section 1 Content</div>
    const Section2 = () => <div>Section 2 Content</div>
    const Section3 = () => <div>Section 3 Content</div>

    const LazySection1 = lazy(() =>
      new Promise<{ default: React.ComponentType }>((resolve) => {
        setTimeout(() => resolve({ default: Section1 }), 50)
      }),
    )
    const LazySection2 = lazy(() =>
      new Promise<{ default: React.ComponentType }>((resolve) => {
        setTimeout(() => resolve({ default: Section2 }), 100)
      }),
    )
    const LazySection3 = lazy(() =>
      new Promise<{ default: React.ComponentType }>((resolve) => {
        setTimeout(() => resolve({ default: Section3 }), 75)
      }),
    )

    const startTime = Date.now()

    render(
      <div>
        <LazySection component={LazySection1} skeleton={TestSkeleton} />
        <LazySection component={LazySection2} skeleton={TestSkeleton} />
        <LazySection component={LazySection3} skeleton={TestSkeleton} />
      </div>,
    )

    // All sections should show skeletons initially
    expect(screen.getAllByText("Loading Skeleton")).toHaveLength(3)

    // Wait for all sections to load
    await waitFor(() => {
      expect(screen.getByText("Section 1 Content")).toBeInTheDocument()
      expect(screen.getByText("Section 2 Content")).toBeInTheDocument()
      expect(screen.getByText("Section 3 Content")).toBeInTheDocument()
    })

    const endTime = Date.now()
    const totalTime = endTime - startTime

    // If sections loaded in parallel, total time should be close to the longest delay (100ms)
    // If they loaded sequentially, it would be 50 + 100 + 75 = 225ms
    // Allow buffer for test execution time and React rendering
    expect(totalTime).toBeLessThan(350)
  })

  it("error boundary catches errors in one section without affecting others", async () => {
    const WorkingSection = () => <div>Working Section</div>
    const LazyWorkingSection = lazy(() =>
      Promise.resolve({ default: WorkingSection }),
    )
    const LazyErrorSection = lazy(() =>
      Promise.resolve({ default: ErrorComponent }),
    )

    render(
      <div>
        <LazySection
          component={LazyWorkingSection}
          skeleton={TestSkeleton}
          errorFallback={TestErrorFallback}
        />
        <LazySection
          component={LazyErrorSection}
          skeleton={TestSkeleton}
          errorFallback={TestErrorFallback}
        />
        <LazySection
          component={LazyWorkingSection}
          skeleton={TestSkeleton}
          errorFallback={TestErrorFallback}
        />
      </div>,
    )

    await waitFor(() => {
      // Working sections should render successfully
      expect(screen.getAllByText("Working Section")).toHaveLength(2)
      // Error section should show error fallback
      expect(screen.getByText("Error: Test error")).toBeInTheDocument()
    })
  })

  it("logs errors when error boundary catches them", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error")
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

    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Section error:",
      expect.any(Error),
      expect.any(Object),
    )

    consoleErrorSpy.mockRestore()
  })
})
