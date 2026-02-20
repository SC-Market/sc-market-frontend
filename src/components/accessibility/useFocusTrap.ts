import { useEffect, RefObject } from "react"
import { useFocusManager } from "./FocusManager"

export interface UseFocusTrapOptions {
  /**
   * Whether the focus trap is enabled
   */
  enabled: boolean

  /**
   * Optional ref to the element that should receive initial focus
   */
  initialFocus?: RefObject<HTMLElement | null>

  /**
   * Whether to restore focus to the previously focused element when the trap is disabled
   * @default true
   */
  returnFocus?: boolean
}

/**
 * useFocusTrap is a custom hook that traps keyboard focus within a container element.
 * This is essential for accessible modal dialogs and other overlay components.
 *
 * When enabled, the hook:
 * 1. Saves the currently focused element
 * 2. Moves focus to the first focusable element (or initialFocus if provided)
 * 3. Traps Tab/Shift+Tab navigation within the container
 * 4. Restores focus when disabled (if returnFocus is true)
 *
 * @param containerRef - Ref to the container element that should trap focus
 * @param options - Configuration options for the focus trap
 *
 * @example
 * ```tsx
 * function MyDialog({ open, onClose }) {
 *   const dialogRef = useRef<HTMLDivElement>(null)
 *   const firstButtonRef = useRef<HTMLButtonElement>(null)
 *
 *   useFocusTrap(dialogRef, {
 *     enabled: open,
 *     initialFocus: firstButtonRef,
 *     returnFocus: true
 *   })
 *
 *   return (
 *     <div ref={dialogRef} role="dialog">
 *       <button ref={firstButtonRef}>First Button</button>
 *       <button>Second Button</button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  options: UseFocusTrapOptions,
) {
  const { enabled, initialFocus, returnFocus = true } = options
  const {
    saveFocus,
    restoreFocus,
    moveFocusTo,
    getFirstFocusable,
    getLastFocusable,
  } = useFocusManager()

  useEffect(() => {
    if (!enabled || !containerRef.current) {
      return
    }

    const container = containerRef.current

    // Save focus before trapping (for restoration later)
    if (returnFocus) {
      saveFocus()
    }

    // Set initial focus
    const elementToFocus = initialFocus?.current || getFirstFocusable(container)
    if (elementToFocus) {
      // Use setTimeout to ensure the element is ready to receive focus
      setTimeout(() => {
        moveFocusTo(elementToFocus)
      }, 0)
    }

    // Handle Tab key to trap focus within container
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") {
        return
      }

      const firstFocusable = getFirstFocusable(container)
      const lastFocusable = getLastFocusable(container)

      // If there are no focusable elements, prevent tabbing
      if (!firstFocusable || !lastFocusable) {
        e.preventDefault()
        return
      }

      // Shift + Tab on first element -> go to last
      if (e.shiftKey && document.activeElement === firstFocusable) {
        e.preventDefault()
        moveFocusTo(lastFocusable)
      }
      // Tab on last element -> go to first
      else if (!e.shiftKey && document.activeElement === lastFocusable) {
        e.preventDefault()
        moveFocusTo(firstFocusable)
      }
    }

    // Add event listener to container
    container.addEventListener("keydown", handleKeyDown)

    // Cleanup function
    return () => {
      container.removeEventListener("keydown", handleKeyDown)

      // Restore focus when trap is disabled
      if (returnFocus) {
        restoreFocus()
      }
    }
  }, [
    enabled,
    containerRef,
    initialFocus,
    returnFocus,
    saveFocus,
    restoreFocus,
    moveFocusTo,
    getFirstFocusable,
    getLastFocusable,
  ])
}
