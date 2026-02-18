import React, { lazy } from "react"
import { render, screen, waitFor, cleanup } from "@testing-library/react"
import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterAll,
  afterEach,
} from "vitest"
import fc from "fast-check"
import { LazySection } from "../LazySection"

/**
 * Property-Based Tests for LazySection Component
 * Feature: page-architecture-refactor
 */

describe.concurrent("LazySection - Property-Based Tests", () => {
  // Suppress console.error for error boundary tests
  const originalError = console.error
  beforeAll(() => {
    console.error = vi.fn()
  })
  afterAll(() => {
    console.error = originalError
  })
  afterEach(() => {
    cleanup()
  })

  /**
   * Property 4: Lazy sections display skeletons during loading
   * Validates: Requirements 3.2, 8.2
   *
   * For any LazySection with a lazy-loaded component and skeleton,
   * the skeleton should be displayed during the loading phase before
   * the actual component renders.
   */
  it.skip("Property 4: displays skeleton during loading for any valid skeleton component", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.stringMatching(/^[a-zA-Z0-9 ]{5,50}$/),
        fc.stringMatching(/^[a-zA-Z0-9 ]{5,50}$/),
        fc.integer({ min: 10, max: 100 }),
        async (skeletonText, contentText, delayMs) => {
          // Create unique test IDs for this iteration
          const testId = `test-${Date.now()}-${Math.random()}`
          const skeletonId = `skeleton-${testId}`
          const contentId = `content-${testId}`

          // Create skeleton and content components with arbitrary text
          const TestSkeleton = () => (
            <div data-testid={skeletonId}>{skeletonText}</div>
          )
          const TestContent = () => (
            <div data-testid={contentId}>{contentText}</div>
          )

          // Create lazy component with delay
          const LazyTestContent = lazy(
            () =>
              new Promise<{ default: React.ComponentType }>((resolve) => {
                setTimeout(() => resolve({ default: TestContent }), delayMs)
              }),
          )

          const { unmount } = render(
            <LazySection component={LazyTestContent} skeleton={TestSkeleton} />,
          )

          // Skeleton should be visible immediately
          expect(screen.getByTestId(skeletonId)).toBeInTheDocument()
          expect(screen.getByTestId(skeletonId)).toHaveTextContent(
            skeletonText.trim(),
          )

          // Content should not be visible yet
          expect(screen.queryByTestId(contentId)).not.toBeInTheDocument()

          // Wait for content to load
          await waitFor(
            () => {
              expect(screen.getByTestId(contentId)).toBeInTheDocument()
            },
            { timeout: delayMs + 1000 },
          )

          // After loading, content should be visible
          expect(screen.getByTestId(contentId)).toHaveTextContent(
            contentText.trim(),
          )

          // Skeleton should be gone
          expect(screen.queryByTestId(skeletonId)).not.toBeInTheDocument()

          unmount()
          cleanup()
        },
      ),
      { numRuns: 50, timeout: 30000 },
    )
  }, 30000)

  /**
   * Property 5: Error isolation between content sections
   * Validates: Requirements 3.4, 7.4
   *
   * For any page with multiple Content_Sections where one section throws an error,
   * the other sections should continue to render successfully without being
   * affected by the failing section.
   */
  it.skip("Property 5: isolates errors between multiple sections", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.stringMatching(/^[a-zA-Z0-9 ]{3,30}$/), {
          minLength: 2,
          maxLength: 5,
        }),
        fc.integer({ min: 0, max: 10 }), // Which section should error (index)
        async (sectionTexts, errorIndex) => {
          // Ensure errorIndex is within bounds
          const actualErrorIndex = errorIndex % sectionTexts.length
          const testId = `test-${Date.now()}-${Math.random()}`

          const TestSkeleton = () => <div>Loading...</div>
          const ErrorFallback = ({ error }: { error: Error }) => (
            <div data-testid={`error-fallback-${testId}`}>
              Error: {error.message}
            </div>
          )

          // Create components for each section
          const sections = sectionTexts.map((text, index) => {
            if (index === actualErrorIndex) {
              // This section will throw an error
              const ErrorComponent = () => {
                throw new Error(`Error in section ${index}`)
              }
              return {
                component: lazy(() =>
                  Promise.resolve({ default: ErrorComponent }),
                ),
                text,
                shouldError: true,
                index,
              }
            } else {
              // Normal section
              const NormalComponent = () => (
                <div data-testid={`section-${testId}-${index}`}>{text}</div>
              )
              return {
                component: lazy(() =>
                  Promise.resolve({ default: NormalComponent }),
                ),
                text,
                shouldError: false,
                index,
              }
            }
          })

          const { unmount } = render(
            <div>
              {sections.map((section, index) => (
                <LazySection
                  key={index}
                  component={section.component}
                  skeleton={TestSkeleton}
                  errorFallback={ErrorFallback}
                />
              ))}
            </div>,
          )

          // Wait for all sections to settle
          await waitFor(
            () => {
              // Error section should show error fallback
              expect(
                screen.getByTestId(`error-fallback-${testId}`),
              ).toBeInTheDocument()
            },
            { timeout: 2000 },
          )

          // All non-error sections should render successfully
          sections.forEach((section) => {
            if (!section.shouldError) {
              const sectionElement = screen.getByTestId(
                `section-${testId}-${section.index}`,
              )
              expect(sectionElement).toBeInTheDocument()
              expect(sectionElement).toHaveTextContent(section.text.trim())
            }
          })

          // Error section should show error fallback
          expect(
            screen.getByTestId(`error-fallback-${testId}`),
          ).toBeInTheDocument()

          unmount()
          cleanup()
        },
      ),
      { numRuns: 50, timeout: 30000 },
    )
  }, 30000)
})
