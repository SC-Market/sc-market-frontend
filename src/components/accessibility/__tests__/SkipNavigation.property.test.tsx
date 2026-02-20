/**
 * Property-Based Tests for SkipNavigation Component
 *
 * These tests validate universal correctness properties using property-based testing.
 * Property-based tests generate many random test cases to verify properties hold across
 * all valid inputs, providing stronger guarantees than example-based unit tests.
 */

import { vi } from "vitest"
import { render, cleanup } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import fc from "fast-check"
import { SkipNavigation, SkipLink } from "../SkipNavigation"

// Mock i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue: string) => defaultValue,
  }),
}))

/**
 * Arbitrary generator for a single skip link with guaranteed unique values
 */
const skipLinkArb = fc.integer({ min: 1, max: 100000 }).map((n) => ({
  id: `skip-${n}`,
  label: `Skip to section ${n}`,
  target: `#target-${n}`,
}))

/**
 * Arbitrary generator for an array of unique skip links (1-4 links)
 * Uses uniqueArray to ensure no duplicates
 */
const skipLinksArrayArb = fc.uniqueArray(skipLinkArb, {
  minLength: 1,
  maxLength: 4,
  selector: (link) => link.id, // Ensure uniqueness by ID
})

describe("SkipNavigation Property-Based Tests", () => {
  afterEach(() => {
    cleanup()
    // Clean up any dynamically created elements
    document.body.innerHTML = ""
  })

  /**
   * Property 5: Skip link presence
   *
   * **Validates: Requirements 1.7**
   *
   * This property tests that:
   * For any page load, the page should contain at least one skip link that allows
   * keyboard users to bypass repetitive navigation.
   *
   * The property should hold for any:
   * - Number of skip links (1 to many)
   * - Different skip link labels and targets
   * - Custom vs default skip links
   */
  describe("Property 5: Skip link presence", () => {
    it("should render at least one skip link", () => {
      fc.assert(
        fc.property(
          fc.option(skipLinksArrayArb, { nil: undefined }),
          (links) => {
            // Clean up before each property test iteration
            cleanup()
            document.body.innerHTML = ""

            const { container } = render(<SkipNavigation links={links} />)

            // Should have at least one button (skip link)
            const buttons = container.querySelectorAll("button")
            expect(buttons.length).toBeGreaterThan(0)

            // Clean up after
            cleanup()
            document.body.innerHTML = ""

            return true
          },
        ),
        {
          numRuns: 50,
        },
      )
    })

    it("should render correct number of skip links when provided", () => {
      fc.assert(
        fc.property(skipLinksArrayArb, (links) => {
          // Clean up before each property test iteration
          cleanup()
          document.body.innerHTML = ""

          const { container } = render(<SkipNavigation links={links} />)

          const buttons = container.querySelectorAll("button")
          expect(buttons.length).toBe(links.length)

          // Clean up after
          cleanup()
          document.body.innerHTML = ""

          return true
        }),
        {
          numRuns: 50,
        },
      )
    })

    it("should render skip links with correct labels", () => {
      fc.assert(
        fc.property(skipLinksArrayArb, (links) => {
          // Clean up before each property test iteration
          cleanup()
          document.body.innerHTML = ""

          const { getAllByRole } = render(<SkipNavigation links={links} />)

          // Get all buttons
          const buttons = getAllByRole("button")
          expect(buttons.length).toBe(links.length)

          // Each link should have the correct aria-label
          links.forEach((link, index) => {
            expect(buttons[index]).toHaveAttribute("aria-label", link.label)
          })

          // Clean up after
          cleanup()
          document.body.innerHTML = ""

          return true
        }),
        {
          numRuns: 50,
        },
      )
    })

    it("should focus and scroll to target when skip link is activated", async () => {
      await fc.assert(
        fc.asyncProperty(skipLinkArb, async (link) => {
          // Clean up before each property test iteration
          cleanup()
          document.body.innerHTML = ""

          const user = userEvent.setup()

          // Create target element with unique ID
          const targetId = link.target.replace("#", "")
          const targetElement = document.createElement("div")
          targetElement.id = targetId
          targetElement.textContent = "Target content"
          document.body.appendChild(targetElement)

          // Mock scrollIntoView
          targetElement.scrollIntoView = vi.fn()

          const { getByRole } = render(<SkipNavigation links={[link]} />)

          const skipButton = getByRole("button", { name: link.label })
          await user.click(skipButton)

          // Target should have received focus
          expect(document.activeElement).toBe(targetElement)

          // scrollIntoView should have been called
          expect(targetElement.scrollIntoView).toHaveBeenCalled()

          // Clean up
          cleanup()
          document.body.innerHTML = ""

          return true
        }),
        {
          numRuns: 30,
        },
      )
    })

    it("should make non-focusable targets focusable", async () => {
      await fc.assert(
        fc.asyncProperty(skipLinkArb, async (link) => {
          // Clean up before each property test iteration
          cleanup()
          document.body.innerHTML = ""

          const user = userEvent.setup()

          // Create target element without tabindex
          const targetId = link.target.replace("#", "")
          const targetElement = document.createElement("div")
          targetElement.id = targetId
          targetElement.textContent = "Target content"
          document.body.appendChild(targetElement)

          // Mock scrollIntoView
          targetElement.scrollIntoView = vi.fn()

          // Initially should not have tabindex
          expect(targetElement.hasAttribute("tabindex")).toBe(false)

          const { getByRole } = render(<SkipNavigation links={[link]} />)

          const skipButton = getByRole("button", { name: link.label })
          await user.click(skipButton)

          // After clicking skip link, target should have tabindex="-1"
          expect(targetElement.getAttribute("tabindex")).toBe("-1")

          // Clean up
          cleanup()
          document.body.innerHTML = ""

          return true
        }),
        {
          numRuns: 30,
        },
      )
    })

    it("should handle missing targets gracefully", async () => {
      await fc.assert(
        fc.asyncProperty(skipLinkArb, async (link) => {
          // Clean up before each property test iteration
          cleanup()
          document.body.innerHTML = ""

          const user = userEvent.setup()

          // Don't create target element - it's missing
          const { getByRole } = render(<SkipNavigation links={[link]} />)

          const skipButton = getByRole("button", { name: link.label })

          // Should not throw error when clicking
          await expect(user.click(skipButton)).resolves.not.toThrow()

          // Clean up
          cleanup()
          document.body.innerHTML = ""

          return true
        }),
        {
          numRuns: 20,
        },
      )
    })

    it("should have nav landmark with aria-label", () => {
      fc.assert(
        fc.property(
          fc.option(skipLinksArrayArb, { nil: undefined }),
          (links) => {
            // Clean up before each property test iteration
            cleanup()
            document.body.innerHTML = ""

            const { container } = render(<SkipNavigation links={links} />)

            const nav = container.querySelector("nav")
            expect(nav).toBeInTheDocument()
            expect(nav).toHaveAttribute("aria-label")

            // Clean up after
            cleanup()
            document.body.innerHTML = ""

            return true
          },
        ),
        {
          numRuns: 30,
        },
      )
    })
  })
})
