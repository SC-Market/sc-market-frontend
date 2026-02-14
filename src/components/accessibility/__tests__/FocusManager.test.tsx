import { render, screen, waitFor } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react'
import { FocusManagerProvider, useFocusManager } from '../FocusManager'

describe('FocusManager', () => {
  describe('Provider', () => {
    it('should render children', () => {
      render(
        <FocusManagerProvider>
          <div>Test Content</div>
        </FocusManagerProvider>
      )
      
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })
    
    it('should throw error when useFocusManager is used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      expect(() => {
        renderHook(() => useFocusManager())
      }).toThrow('useFocusManager must be used within a FocusManagerProvider')
      
      consoleSpy.mockRestore()
    })
  })
  
  describe('Focus Management', () => {
    it('should save and restore focus', () => {
      const { result } = renderHook(() => useFocusManager(), {
        wrapper: FocusManagerProvider
      })
      
      // Create a focusable element
      const button = document.createElement('button')
      button.textContent = 'Test Button'
      document.body.appendChild(button)
      button.focus()
      
      // Save focus
      act(() => {
        result.current.saveFocus()
      })
      
      expect(result.current.lastFocusedElement).toBe(button)
      
      // Change focus
      const input = document.createElement('input')
      document.body.appendChild(input)
      input.focus()
      
      // Restore focus
      act(() => {
        result.current.restoreFocus()
      })
      
      expect(document.activeElement).toBe(button)
      
      // Cleanup
      document.body.removeChild(button)
      document.body.removeChild(input)
    })
    
    it('should move focus to specified element', () => {
      const { result } = renderHook(() => useFocusManager(), {
        wrapper: FocusManagerProvider
      })
      
      const button = document.createElement('button')
      button.textContent = 'Target Button'
      document.body.appendChild(button)
      
      act(() => {
        result.current.moveFocusTo(button)
      })
      
      expect(document.activeElement).toBe(button)
      
      // Cleanup
      document.body.removeChild(button)
    })
  })
  
  describe('Focusable Element Queries', () => {
    it('should find first focusable element in container', () => {
      const { result } = renderHook(() => useFocusManager(), {
        wrapper: FocusManagerProvider
      })
      
      const container = document.createElement('div')
      const button1 = document.createElement('button')
      const button2 = document.createElement('button')
      button1.textContent = 'First'
      button2.textContent = 'Second'
      
      container.appendChild(button1)
      container.appendChild(button2)
      document.body.appendChild(container)
      
      const firstFocusable = result.current.getFirstFocusable(container)
      expect(firstFocusable).toBe(button1)
      
      // Cleanup
      document.body.removeChild(container)
    })
    
    it('should find last focusable element in container', () => {
      const { result } = renderHook(() => useFocusManager(), {
        wrapper: FocusManagerProvider
      })
      
      const container = document.createElement('div')
      const button1 = document.createElement('button')
      const button2 = document.createElement('button')
      button1.textContent = 'First'
      button2.textContent = 'Second'
      
      container.appendChild(button1)
      container.appendChild(button2)
      document.body.appendChild(container)
      
      const lastFocusable = result.current.getLastFocusable(container)
      expect(lastFocusable).toBe(button2)
      
      // Cleanup
      document.body.removeChild(container)
    })
    
    it('should get all focusable elements in container', () => {
      const { result } = renderHook(() => useFocusManager(), {
        wrapper: FocusManagerProvider
      })
      
      const container = document.createElement('div')
      const button = document.createElement('button')
      const link = document.createElement('a')
      link.href = '#'
      const input = document.createElement('input')
      
      container.appendChild(button)
      container.appendChild(link)
      container.appendChild(input)
      document.body.appendChild(container)
      
      const allFocusable = result.current.getAllFocusable(container)
      expect(allFocusable).toHaveLength(3)
      expect(allFocusable).toContain(button)
      expect(allFocusable).toContain(link)
      expect(allFocusable).toContain(input)
      
      // Cleanup
      document.body.removeChild(container)
    })
    
    it('should filter out hidden elements', () => {
      const { result } = renderHook(() => useFocusManager(), {
        wrapper: FocusManagerProvider
      })
      
      const container = document.createElement('div')
      const visibleButton = document.createElement('button')
      const hiddenButton = document.createElement('button')
      hiddenButton.style.display = 'none'
      
      container.appendChild(visibleButton)
      container.appendChild(hiddenButton)
      document.body.appendChild(container)
      
      const allFocusable = result.current.getAllFocusable(container)
      expect(allFocusable).toHaveLength(1)
      expect(allFocusable).toContain(visibleButton)
      expect(allFocusable).not.toContain(hiddenButton)
      
      // Cleanup
      document.body.removeChild(container)
    })
  })
})
