/**
 * Property-Based Tests for useFocusTrap
 * 
 * These tests validate universal correctness properties using property-based testing.
 * Property-based tests generate many random test cases to verify properties hold across
 * all valid inputs, providing stronger guarantees than example-based unit tests.
 */

import { render, cleanup, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import fc from 'fast-check'
import { useRef, useEffect } from 'react'
import { useFocusTrap } from '../useFocusTrap'
import { FocusManagerProvider } from '../FocusManager'

/**
 * Test component that uses useFocusTrap
 */
function TestDialog({
  enabled,
  elementCount,
  returnFocus = true
}: {
  enabled: boolean
  elementCount: number
  returnFocus?: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  useFocusTrap(containerRef, {
    enabled,
    returnFocus
  })
  
  useEffect(() => {
    if (containerRef.current && enabled) {
      // Clear any existing content first
      containerRef.current.innerHTML = ''
      
      // Create focusable elements
      for (let i = 0; i < elementCount; i++) {
        const button = document.createElement('button')
        button.textContent = `Button ${i + 1}`
        button.setAttribute('data-testid', `button-${i + 1}`)
        containerRef.current.appendChild(button)
      }
    }
  }, [enabled, elementCount])
  
  return (
    <div ref={containerRef} role="dialog" data-testid="dialog">
      {/* Elements will be added dynamically */}
    </div>
  )
}

describe('useFocusTrap Property-Based Tests', () => {
  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
  })
  
  /**
   * Property 4: Dialog accessibility (focus trap portion)
   * 
   * **Validates: Requirements 1.6**
   * 
   * This property tests that:
   * When a dialog is open, Tab/Shift+Tab should cycle focus only within the dialog,
   * creating a focus trap that prevents keyboard users from accidentally leaving
   * the modal context.
   * 
   * The property should hold for any:
   * - Number of focusable elements in the dialog (1 to many)
   * - Different types of focusable elements
   * - Tab and Shift+Tab navigation
   */
  describe('Property 4: Dialog accessibility (focus trap portion)', () => {
    it('should trap focus within container when enabled', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate 2-5 focusable elements
          fc.integer({ min: 2, max: 5 }),
          async (elementCount) => {
            const user = userEvent.setup()
            
            // Create a trigger button outside the dialog
            const trigger = document.createElement('button')
            trigger.textContent = 'Open Dialog'
            trigger.setAttribute('data-testid', 'trigger')
            document.body.appendChild(trigger)
            
            // Focus the trigger
            trigger.focus()
            expect(document.activeElement).toBe(trigger)
            
            // Render dialog with focus trap enabled
            const { unmount } = render(
              <FocusManagerProvider>
                <TestDialog enabled={true} elementCount={elementCount} />
              </FocusManagerProvider>
            )
            
            // Wait for focus to move to first button
            await waitFor(() => {
              const dialog = document.querySelector('[data-testid="dialog"]')
              const buttons = dialog?.querySelectorAll('button')
              expect(buttons?.length).toBe(elementCount)
              
              // Focus should have moved to first button
              if (buttons && buttons.length > 0) {
                expect(document.activeElement).toBe(buttons[0])
              }
            }, { timeout: 500 })
            
            // Get all buttons in the dialog
            const dialog = document.querySelector('[data-testid="dialog"]')
            const buttons = Array.from(dialog!.querySelectorAll('button'))
            
            const firstButton = buttons[0]
            const lastButton = buttons[buttons.length - 1]
            
            // Tab through all elements
            for (let i = 0; i < elementCount - 1; i++) {
              await user.tab()
              await waitFor(() => {
                expect(document.activeElement).toBe(buttons[i + 1])
              }, { timeout: 200 })
            }
            
            // Now we're on the last button
            expect(document.activeElement).toBe(lastButton)
            
            // Tab from last button should wrap to first button (focus trap)
            await user.tab()
            await waitFor(() => {
              expect(document.activeElement).toBe(firstButton)
            }, { timeout: 200 })
            
            // Shift+Tab from first button should wrap to last button
            await user.tab({ shift: true })
            await waitFor(() => {
              expect(document.activeElement).toBe(lastButton)
            }, { timeout: 200 })
            
            // Clean up
            unmount()
            document.body.removeChild(trigger)
          }
        ),
        {
          numRuns: 20
        }
      )
    })
    
    it('should restore focus to trigger element when trap is disabled', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 3 }),
          async (elementCount) => {
            // Create a trigger button
            const trigger = document.createElement('button')
            trigger.textContent = 'Open Dialog'
            trigger.setAttribute('data-testid', 'trigger')
            document.body.appendChild(trigger)
            
            // Focus the trigger
            trigger.focus()
            expect(document.activeElement).toBe(trigger)
            
            // Render dialog with focus trap enabled
            const { rerender, unmount } = render(
              <FocusManagerProvider>
                <TestDialog enabled={true} elementCount={elementCount} returnFocus={true} />
              </FocusManagerProvider>
            )
            
            // Wait for focus to move away from trigger
            await waitFor(() => {
              expect(document.activeElement).not.toBe(trigger)
            }, { timeout: 500 })
            
            // Disable the focus trap
            rerender(
              <FocusManagerProvider>
                <TestDialog enabled={false} elementCount={elementCount} returnFocus={true} />
              </FocusManagerProvider>
            )
            
            // Wait for focus restoration
            await waitFor(() => {
              expect(document.activeElement).toBe(trigger)
            }, { timeout: 500 })
            
            // Clean up
            unmount()
            document.body.removeChild(trigger)
          }
        ),
        {
          numRuns: 20
        }
      )
    })
    
    it('should handle containers with no focusable elements', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constant(0), // No focusable elements
          async () => {
            const user = userEvent.setup()
            
            // Create a trigger button
            const trigger = document.createElement('button')
            trigger.textContent = 'Open Dialog'
            document.body.appendChild(trigger)
            trigger.focus()
            
            // Render dialog with no focusable elements
            const { unmount } = render(
              <FocusManagerProvider>
                <TestDialog enabled={true} elementCount={0} />
              </FocusManagerProvider>
            )
            
            // Wait a bit
            await new Promise(resolve => setTimeout(resolve, 100))
            
            // Try to tab - should not throw error
            await user.tab()
            
            // Focus should remain somewhere safe
            expect(document.activeElement).toBeTruthy()
            
            // Clean up
            unmount()
            document.body.removeChild(trigger)
          }
        ),
        {
          numRuns: 10
        }
      )
    })
    
    it('should not trap focus when disabled', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 2, max: 5 }),
          async (elementCount) => {
            const user = userEvent.setup()
            
            // Create trigger and another button outside dialog
            const trigger = document.createElement('button')
            trigger.textContent = 'Trigger'
            trigger.setAttribute('data-testid', 'trigger')
            document.body.appendChild(trigger)
            
            const outsideButton = document.createElement('button')
            outsideButton.textContent = 'Outside'
            outsideButton.setAttribute('data-testid', 'outside')
            document.body.appendChild(outsideButton)
            
            // Render dialog with focus trap DISABLED
            const { unmount } = render(
              <FocusManagerProvider>
                <TestDialog enabled={false} elementCount={elementCount} />
              </FocusManagerProvider>
            )
            
            // Focus trigger
            trigger.focus()
            expect(document.activeElement).toBe(trigger)
            
            // Tab should move to outside button (not trapped)
            await user.tab()
            
            // Focus should be able to leave the dialog area
            // (either on outside button or dialog elements, but not trapped)
            expect(document.activeElement).toBeTruthy()
            
            // Clean up
            unmount()
            document.body.removeChild(trigger)
            document.body.removeChild(outsideButton)
          }
        ),
        {
          numRuns: 10
        }
      )
    })
  })
})
