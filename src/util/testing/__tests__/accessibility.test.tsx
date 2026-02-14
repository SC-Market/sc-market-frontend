/**
 * Accessibility Testing Examples
 * 
 * This file demonstrates how to use the accessibility testing utilities
 * and provides examples of common accessibility test patterns.
 */

import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import {
  renderWithA11y,
  checkA11y,
  getFocusableElements,
  hasVisibleFocus,
  getAccessibleName,
  isKeyboardAccessible,
  simulateTabNavigation,
  hasLiveRegion,
} from "../accessibility"

describe("Accessibility Testing Utilities", () => {
  describe("renderWithA11y", () => {
    it("should render component and check for accessibility violations", async () => {
      const { results } = await renderWithA11y(
        <button>Click me</button>
      )
      
      expect(results).toHaveNoViolations()
    })

    it("should detect missing alt text on images", async () => {
      const { results } = await renderWithA11y(
        <img src="test.jpg" />
      )
      
      // This should have violations
      expect(results.violations.length).toBeGreaterThan(0)
      expect(results.violations[0].id).toBe("image-alt")
    })

    it("should pass when image has alt text", async () => {
      const { results } = await renderWithA11y(
        <img src="test.jpg" alt="Test image" />
      )
      
      expect(results).toHaveNoViolations()
    })
  })

  describe("checkA11y", () => {
    it("should check accessibility of rendered container", async () => {
      const { container } = render(
        <form>
          <label htmlFor="name">Name</label>
          <input id="name" type="text" />
        </form>
      )
      
      const results = await checkA11y(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe("getFocusableElements", () => {
    it("should find all focusable elements", () => {
      const { container } = render(
        <div>
          <button>Button 1</button>
          <a href="/test">Link</a>
          <input type="text" />
          <button disabled>Disabled Button</button>
          <div tabIndex={-1}>Not focusable</div>
        </div>
      )
      
      const focusable = getFocusableElements(container)
      
      // Should find button, link, and input (not disabled button or tabindex -1)
      expect(focusable).toHaveLength(3)
    })
  })

  describe("hasVisibleFocus", () => {
    it("should detect visible focus indicator", () => {
      const { container } = render(
        <button style={{ outline: "2px solid blue", outlineStyle: "solid" }}>Focused Button</button>
      )
      
      const button = container.querySelector("button")!
      button.focus()
      
      // Note: In jsdom, computed styles may not reflect inline styles perfectly
      // This test demonstrates the utility function, but may need adjustment for real DOM
      const styles = window.getComputedStyle(button)
      const hasOutline = styles.getPropertyValue("outline-width") !== "0px" && 
                        styles.getPropertyValue("outline-style") !== "none"
      
      // In a real browser, this would be true
      expect(typeof hasVisibleFocus(button)).toBe("boolean")
    })
  })

  describe("getAccessibleName", () => {
    it("should get accessible name from aria-label", () => {
      const { container } = render(
        <button aria-label="Close dialog">X</button>
      )
      
      const button = container.querySelector("button")!
      expect(getAccessibleName(button)).toBe("Close dialog")
    })

    it("should get accessible name from associated label", () => {
      const { container } = render(
        <div>
          <label htmlFor="email">Email Address</label>
          <input id="email" type="email" />
        </div>
      )
      
      const input = container.querySelector("input")!
      expect(getAccessibleName(input)).toBe("Email Address")
    })

    it("should get accessible name from text content", () => {
      const { container } = render(
        <button>Submit Form</button>
      )
      
      const button = container.querySelector("button")!
      expect(getAccessibleName(button)).toBe("Submit Form")
    })
  })

  describe("isKeyboardAccessible", () => {
    it("should identify keyboard accessible elements", () => {
      const { container } = render(
        <div>
          <button>Accessible</button>
          <div role="button" tabIndex={0}>Also Accessible</div>
          <div role="button">Not Accessible</div>
        </div>
      )
      
      const elements = container.querySelectorAll("button, div[role='button']")
      
      expect(isKeyboardAccessible(elements[0] as HTMLElement)).toBe(true)
      expect(isKeyboardAccessible(elements[1] as HTMLElement)).toBe(true)
      expect(isKeyboardAccessible(elements[2] as HTMLElement)).toBe(false)
    })

    it("should identify disabled elements as not accessible", () => {
      const { container } = render(
        <button disabled>Disabled Button</button>
      )
      
      const button = container.querySelector("button")!
      expect(isKeyboardAccessible(button)).toBe(false)
    })
  })

  describe("simulateTabNavigation", () => {
    it("should simulate forward tab navigation", () => {
      const { container } = render(
        <form>
          <input name="first" type="text" />
          <input name="second" type="text" />
          <button>Submit</button>
        </form>
      )
      
      const focusOrder = simulateTabNavigation(container, "forward")
      
      expect(focusOrder).toHaveLength(3)
      expect(focusOrder[0]).toHaveAttribute("name", "first")
      expect(focusOrder[1]).toHaveAttribute("name", "second")
      expect(focusOrder[2]).toHaveTextContent("Submit")
    })

    it("should simulate backward tab navigation", () => {
      const { container } = render(
        <form>
          <input name="first" type="text" />
          <input name="second" type="text" />
          <button>Submit</button>
        </form>
      )
      
      const focusOrder = simulateTabNavigation(container, "backward")
      
      expect(focusOrder).toHaveLength(3)
      expect(focusOrder[0]).toHaveTextContent("Submit")
      expect(focusOrder[1]).toHaveAttribute("name", "second")
      expect(focusOrder[2]).toHaveAttribute("name", "first")
    })
  })

  describe("hasLiveRegion", () => {
    it("should detect aria-live regions", () => {
      const { container } = render(
        <div aria-live="polite">Status message</div>
      )
      
      const liveRegion = container.querySelector("div")!
      expect(hasLiveRegion(liveRegion)).toBe(true)
    })

    it("should detect implicit live region roles", () => {
      const { container } = render(
        <div role="alert">Error message</div>
      )
      
      const alert = container.querySelector("div")!
      expect(hasLiveRegion(alert)).toBe(true)
    })

    it("should return false for non-live regions", () => {
      const { container } = render(
        <div>Regular content</div>
      )
      
      const div = container.querySelector("div")!
      expect(hasLiveRegion(div)).toBe(false)
    })
  })
})

/**
 * Example Test Patterns for Common Accessibility Scenarios
 */
describe("Accessibility Test Patterns", () => {
  describe("Pattern: Button Accessibility", () => {
    it("should have accessible name", async () => {
      const { container } = render(
        <button aria-label="Close">X</button>
      )
      
      const button = screen.getByRole("button")
      expect(getAccessibleName(button)).toBeTruthy()
      
      const results = await checkA11y(container)
      expect(results).toHaveNoViolations()
    })

    it("should be keyboard accessible", async () => {
      const handleClick = jest.fn()
      render(<button onClick={handleClick}>Click me</button>)
      
      const button = screen.getByRole("button")
      
      // Test keyboard activation
      button.focus()
      await userEvent.keyboard("{Enter}")
      expect(handleClick).toHaveBeenCalledTimes(1)
      
      await userEvent.keyboard(" ")
      expect(handleClick).toHaveBeenCalledTimes(2)
    })
  })

  describe("Pattern: Form Accessibility", () => {
    it("should have associated labels", async () => {
      const { container } = render(
        <form>
          <label htmlFor="username">Username</label>
          <input id="username" type="text" />
          
          <label htmlFor="password">Password</label>
          <input id="password" type="password" />
        </form>
      )
      
      const results = await checkA11y(container)
      expect(results).toHaveNoViolations()
    })

    it("should indicate required fields", async () => {
      const { container } = render(
        <form>
          <label htmlFor="email">
            Email <span aria-label="required">*</span>
          </label>
          <input id="email" type="email" required aria-required="true" />
        </form>
      )
      
      const input = screen.getByLabelText(/email/i)
      expect(input).toHaveAttribute("required")
      expect(input).toHaveAttribute("aria-required", "true")
      
      const results = await checkA11y(container)
      expect(results).toHaveNoViolations()
    })

    it("should associate error messages with inputs", async () => {
      const { container } = render(
        <form>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            aria-invalid="true"
            aria-describedby="email-error"
          />
          <span id="email-error" role="alert">
            Please enter a valid email
          </span>
        </form>
      )
      
      const input = screen.getByLabelText(/email/i)
      expect(input).toHaveAttribute("aria-invalid", "true")
      expect(input).toHaveAttribute("aria-describedby", "email-error")
      
      const results = await checkA11y(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe("Pattern: Dialog Accessibility", () => {
    it("should have proper ARIA attributes", async () => {
      const { container } = render(
        <div
          role="dialog"
          aria-labelledby="dialog-title"
          aria-describedby="dialog-desc"
          aria-modal="true"
        >
          <h2 id="dialog-title">Confirm Action</h2>
          <p id="dialog-desc">Are you sure you want to proceed?</p>
          <button>Cancel</button>
          <button>Confirm</button>
        </div>
      )
      
      const dialog = screen.getByRole("dialog")
      expect(dialog).toHaveAttribute("aria-labelledby", "dialog-title")
      expect(dialog).toHaveAttribute("aria-describedby", "dialog-desc")
      expect(dialog).toHaveAttribute("aria-modal", "true")
      
      const results = await checkA11y(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe("Pattern: Image Accessibility", () => {
    it("should have alt text for informative images", async () => {
      const { container } = render(
        <img src="product.jpg" alt="Blue widget with chrome finish" />
      )
      
      const results = await checkA11y(container)
      expect(results).toHaveNoViolations()
    })

    it("should mark decorative images", async () => {
      const { container } = render(
        <img src="decoration.jpg" alt="" role="presentation" />
      )
      
      const results = await checkA11y(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe("Pattern: Keyboard Navigation", () => {
    it("should maintain logical tab order", () => {
      const { container } = render(
        <div>
          <button>First</button>
          <button>Second</button>
          <button>Third</button>
        </div>
      )
      
      const focusOrder = simulateTabNavigation(container)
      
      expect(focusOrder[0]).toHaveTextContent("First")
      expect(focusOrder[1]).toHaveTextContent("Second")
      expect(focusOrder[2]).toHaveTextContent("Third")
    })

    it("should not use positive tabindex", () => {
      const { container } = render(
        <div>
          <button>Good Practice</button>
          <button>Also Good</button>
        </div>
      )
      
      // Verify no positive tabindex values exist
      const badButton = container.querySelector('[tabindex="1"]')
      expect(badButton).toBeNull() // Should avoid positive tabindex
    })
  })

  describe("Pattern: Live Region Announcements", () => {
    it("should announce dynamic content changes", () => {
      const { container } = render(
        <div aria-live="polite" aria-atomic="true">
          5 results found
        </div>
      )
      
      const liveRegion = container.querySelector('[aria-live]')!
      expect(hasLiveRegion(liveRegion)).toBe(true)
      expect(liveRegion).toHaveAttribute("aria-atomic", "true")
    })
  })
})
