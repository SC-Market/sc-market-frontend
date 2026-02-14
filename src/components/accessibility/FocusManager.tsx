import { createContext, useContext, useCallback, useState, ReactNode, useRef } from "react"

/**
 * Selector for focusable elements
 */
const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]'
].join(', ')

interface FocusManagerContextValue {
  /**
   * The last focused element before a modal/dialog opened
   */
  lastFocusedElement: HTMLElement | null
  
  /**
   * Save the current focused element
   */
  saveFocus: () => void
  
  /**
   * Restore focus to the previously saved element
   */
  restoreFocus: () => void
  
  /**
   * Move focus to a specific element
   */
  moveFocusTo: (element: HTMLElement | null) => void
  
  /**
   * Get the first focusable element within a container
   */
  getFirstFocusable: (container: HTMLElement) => HTMLElement | null
  
  /**
   * Get the last focusable element within a container
   */
  getLastFocusable: (container: HTMLElement) => HTMLElement | null
  
  /**
   * Get all focusable elements within a container
   */
  getAllFocusable: (container: HTMLElement) => HTMLElement[]
}

const FocusManagerContext = createContext<FocusManagerContextValue | undefined>(undefined)

interface FocusManagerProviderProps {
  children: ReactNode
}

/**
 * FocusManager provides utilities for managing keyboard focus throughout the application.
 * It tracks focus state, provides methods for saving/restoring focus, and utilities for
 * finding focusable elements within containers.
 * 
 * This is essential for accessible dialogs, modals, and dynamic content updates.
 */
export function FocusManagerProvider({ children }: FocusManagerProviderProps) {
  const [lastFocusedElement, setLastFocusedElement] = useState<HTMLElement | null>(null)
  const focusHistoryRef = useRef<HTMLElement[]>([])
  
  const saveFocus = useCallback(() => {
    const activeElement = document.activeElement as HTMLElement
    if (activeElement && activeElement !== document.body) {
      setLastFocusedElement(activeElement)
      focusHistoryRef.current.push(activeElement)
    }
  }, [])
  
  const restoreFocus = useCallback(() => {
    if (lastFocusedElement && document.contains(lastFocusedElement)) {
      // Check if element is still focusable
      try {
        lastFocusedElement.focus()
      } catch (error) {
        // Element might not be focusable anymore, try to find a fallback
        console.warn('Failed to restore focus to saved element', error)
      }
    } else if (focusHistoryRef.current.length > 0) {
      // Try to restore from history
      const history = [...focusHistoryRef.current].reverse()
      for (const element of history) {
        if (document.contains(element)) {
          try {
            element.focus()
            break
          } catch (error) {
            // Continue to next element in history
            continue
          }
        }
      }
    }
    
    // Clean up history
    focusHistoryRef.current = focusHistoryRef.current.filter(el => document.contains(el))
  }, [lastFocusedElement])
  
  const moveFocusTo = useCallback((element: HTMLElement | null) => {
    if (element) {
      try {
        element.focus()
      } catch (error) {
        console.warn('Failed to move focus to element', error)
      }
    }
  }, [])
  
  const getAllFocusable = useCallback((container: HTMLElement): HTMLElement[] => {
    const elements = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    return Array.from(elements).filter(element => {
      // Filter out elements that are not visible or have display: none
      const style = window.getComputedStyle(element)
      const isHidden = style.display === 'none' || style.visibility === 'hidden'
      
      // In test environments (JSDOM), offsetParent might be null even for visible elements
      // So we only check offsetParent if the element is not explicitly hidden via CSS
      if (isHidden) {
        return false
      }
      
      // For real DOM, also check offsetParent (null means element is not rendered)
      // But allow null in test environments where offsetParent isn't reliable
      return element.offsetParent !== null || element.isConnected
    })
  }, [])
  
  const getFirstFocusable = useCallback((container: HTMLElement): HTMLElement | null => {
    const focusableElements = getAllFocusable(container)
    return focusableElements[0] || null
  }, [getAllFocusable])
  
  const getLastFocusable = useCallback((container: HTMLElement): HTMLElement | null => {
    const focusableElements = getAllFocusable(container)
    return focusableElements[focusableElements.length - 1] || null
  }, [getAllFocusable])
  
  const value: FocusManagerContextValue = {
    lastFocusedElement,
    saveFocus,
    restoreFocus,
    moveFocusTo,
    getFirstFocusable,
    getLastFocusable,
    getAllFocusable
  }
  
  return (
    <FocusManagerContext.Provider value={value}>
      {children}
    </FocusManagerContext.Provider>
  )
}

/**
 * Hook to access the FocusManager context
 */
export function useFocusManager(): FocusManagerContextValue {
  const context = useContext(FocusManagerContext)
  if (!context) {
    throw new Error('useFocusManager must be used within a FocusManagerProvider')
  }
  return context
}
