/**
 * Accessibility Testing Utilities
 * 
 * This module provides helper functions for testing accessibility compliance
 * in React components using jest-axe and Testing Library.
 */

import { axe, toHaveNoViolations, type JestAxeConfigureOptions } from "jest-axe"
import { render, type RenderOptions, type RenderResult } from "@testing-library/react"
import type { ReactElement } from "react"

// Extend Jest matchers
expect.extend(toHaveNoViolations)

/**
 * Default axe configuration for accessibility testing
 * Configures rules to match WCAG 2.1 Level AA compliance
 */
export const defaultAxeConfig: JestAxeConfigureOptions = {
  rules: {
    // Enable WCAG 2.1 Level AA rules
    "color-contrast": { enabled: true },
    region: { enabled: true },
    "label-title-only": { enabled: true },
    "landmark-one-main": { enabled: true },
    "page-has-heading-one": { enabled: true },
  },
}

/**
 * Renders a component and runs axe accessibility tests
 * 
 * @param ui - React component to test
 * @param options - Render options from Testing Library
 * @param axeOptions - Optional axe configuration
 * @returns Render result and accessibility results
 * 
 * @example
 * ```tsx
 * const { container, results } = await renderWithA11y(<MyComponent />)
 * expect(results).toHaveNoViolations()
 * ```
 */
export async function renderWithA11y(
  ui: ReactElement,
  options?: RenderOptions,
  axeOptions?: JestAxeConfigureOptions
) {
  const renderResult = render(ui, options)
  const results = await axe(renderResult.container, axeOptions || defaultAxeConfig)
  
  return {
    ...renderResult,
    results,
  }
}

/**
 * Runs axe accessibility tests on a rendered component
 * 
 * @param container - DOM container to test
 * @param axeOptions - Optional axe configuration
 * @returns Accessibility test results
 * 
 * @example
 * ```tsx
 * const { container } = render(<MyComponent />)
 * const results = await checkA11y(container)
 * expect(results).toHaveNoViolations()
 * ```
 */
export async function checkA11y(
  container: HTMLElement,
  axeOptions?: JestAxeConfigureOptions
) {
  return await axe(container, axeOptions || defaultAxeConfig)
}

/**
 * Gets all focusable elements within a container
 * Useful for testing keyboard navigation
 * 
 * @param container - DOM container to search
 * @returns Array of focusable elements
 * 
 * @example
 * ```tsx
 * const { container } = render(<MyForm />)
 * const focusableElements = getFocusableElements(container)
 * expect(focusableElements).toHaveLength(5)
 * ```
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ')
  
  return Array.from(container.querySelectorAll<HTMLElement>(selector))
}

/**
 * Checks if an element has a visible focus indicator
 * 
 * @param element - Element to check
 * @returns True if element has visible focus styles
 * 
 * @example
 * ```tsx
 * const button = screen.getByRole('button')
 * button.focus()
 * expect(hasVisibleFocus(button)).toBe(true)
 * ```
 */
export function hasVisibleFocus(element: HTMLElement): boolean {
  const styles = window.getComputedStyle(element)
  const outlineWidth = styles.getPropertyValue('outline-width')
  const outlineStyle = styles.getPropertyValue('outline-style')
  
  // Check if outline is visible (not 'none' and has width)
  return outlineStyle !== 'none' && parseFloat(outlineWidth) > 0
}

/**
 * Gets the accessible name of an element
 * Uses the same algorithm as assistive technologies
 * 
 * @param element - Element to get name from
 * @returns Accessible name or null
 * 
 * @example
 * ```tsx
 * const button = screen.getByRole('button')
 * expect(getAccessibleName(button)).toBe('Submit Form')
 * ```
 */
export function getAccessibleName(element: HTMLElement): string | null {
  // Check aria-label
  const ariaLabel = element.getAttribute('aria-label')
  if (ariaLabel) return ariaLabel
  
  // Check aria-labelledby
  const labelledBy = element.getAttribute('aria-labelledby')
  if (labelledBy) {
    const labelElement = document.getElementById(labelledBy)
    if (labelElement) return labelElement.textContent
  }
  
  // Check associated label
  if (element instanceof HTMLInputElement || 
      element instanceof HTMLTextAreaElement || 
      element instanceof HTMLSelectElement) {
    const label = document.querySelector(`label[for="${element.id}"]`)
    if (label) return label.textContent
  }
  
  // Fall back to text content
  return element.textContent
}

/**
 * Checks if an element is keyboard accessible
 * Verifies element can receive focus and has proper role
 * 
 * @param element - Element to check
 * @returns True if element is keyboard accessible
 * 
 * @example
 * ```tsx
 * const button = screen.getByRole('button')
 * expect(isKeyboardAccessible(button)).toBe(true)
 * ```
 */
export function isKeyboardAccessible(element: HTMLElement): boolean {
  const tabIndex = element.getAttribute('tabindex')
  const isDisabled = element.hasAttribute('disabled')
  
  // Element should not be disabled
  if (isDisabled) return false
  
  // Element should be focusable (tabindex >= 0 or naturally focusable)
  if (tabIndex === '-1') return false
  
  // Check if element is naturally focusable or has tabindex
  const naturallyFocusable = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)
  const hasFocusableTabIndex = tabIndex !== null && parseInt(tabIndex) >= 0
  
  return naturallyFocusable || hasFocusableTabIndex
}

/**
 * Simulates keyboard navigation through focusable elements
 * 
 * @param container - Container to navigate within
 * @param direction - Navigation direction ('forward' or 'backward')
 * @returns Array of focused elements in order
 * 
 * @example
 * ```tsx
 * const { container } = render(<MyForm />)
 * const focusOrder = simulateTabNavigation(container, 'forward')
 * expect(focusOrder[0]).toHaveAttribute('name', 'firstName')
 * ```
 */
export function simulateTabNavigation(
  container: HTMLElement,
  direction: 'forward' | 'backward' = 'forward'
): HTMLElement[] {
  const focusableElements = getFocusableElements(container)
  const elements = direction === 'forward' ? focusableElements : [...focusableElements].reverse()
  
  const focusOrder: HTMLElement[] = []
  
  elements.forEach(element => {
    element.focus()
    if (document.activeElement === element) {
      focusOrder.push(element)
    }
  })
  
  return focusOrder
}

/**
 * Checks if live region announcements are properly configured
 * 
 * @param element - Element to check
 * @returns True if element has proper live region attributes
 * 
 * @example
 * ```tsx
 * const alert = screen.getByRole('alert')
 * expect(hasLiveRegion(alert)).toBe(true)
 * ```
 */
export function hasLiveRegion(element: HTMLElement): boolean {
  const ariaLive = element.getAttribute('aria-live')
  const role = element.getAttribute('role')
  
  // Check for aria-live attribute
  if (ariaLive === 'polite' || ariaLive === 'assertive') return true
  
  // Check for implicit live region roles
  if (role === 'alert' || role === 'status' || role === 'log') return true
  
  return false
}

/**
 * Type guard for axe violations
 */
export function hasViolations(results: { violations: unknown[] }): boolean {
  return results.violations.length > 0
}
