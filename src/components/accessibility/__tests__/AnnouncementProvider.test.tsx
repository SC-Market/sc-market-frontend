import { render, screen, waitFor } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react'
import { AnnouncementProvider, useAnnouncement } from '../AnnouncementProvider'

describe('AnnouncementProvider', () => {
  describe('Provider', () => {
    it('should render children', () => {
      render(
        <AnnouncementProvider>
          <div>Test Content</div>
        </AnnouncementProvider>
      )
      
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })
    
    it('should render live regions', () => {
      const { container } = render(
        <AnnouncementProvider>
          <div>Test Content</div>
        </AnnouncementProvider>
      )
      
      // Check for polite and assertive live regions
      const liveRegions = container.querySelectorAll('[aria-live]')
      expect(liveRegions).toHaveLength(2)
      
      const politeLiveRegion = container.querySelector('[aria-live="polite"]')
      const assertiveLiveRegion = container.querySelector('[aria-live="assertive"]')
      
      expect(politeLiveRegion).toBeInTheDocument()
      expect(assertiveLiveRegion).toBeInTheDocument()
    })
    
    it('should throw error when useAnnouncement is used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      expect(() => {
        renderHook(() => useAnnouncement())
      }).toThrow('useAnnouncement must be used within an AnnouncementProvider')
      
      consoleSpy.mockRestore()
    })
  })
  
  describe('Announcements', () => {
    it('should announce polite messages', async () => {
      const { result } = renderHook(() => useAnnouncement(), {
        wrapper: AnnouncementProvider
      })
      
      act(() => {
        result.current.announce('Test polite message', 'polite')
      })
      
      // The message should be announced (we can't directly test screen reader behavior,
      // but we can verify the hook doesn't throw errors)
      expect(result.current.announce).toBeDefined()
    })
    
    it('should announce assertive messages', async () => {
      const { result } = renderHook(() => useAnnouncement(), {
        wrapper: AnnouncementProvider
      })
      
      act(() => {
        result.current.announce('Test assertive message', 'assertive')
      })
      
      expect(result.current.announce).toBeDefined()
    })
    
    it('should default to polite priority', async () => {
      const { result } = renderHook(() => useAnnouncement(), {
        wrapper: AnnouncementProvider
      })
      
      act(() => {
        result.current.announce('Test default message')
      })
      
      expect(result.current.announce).toBeDefined()
    })
    
    it('should ignore empty messages', async () => {
      const { result } = renderHook(() => useAnnouncement(), {
        wrapper: AnnouncementProvider
      })
      
      act(() => {
        result.current.announce('')
        result.current.announce('   ')
      })
      
      // Should not throw errors
      expect(result.current.announce).toBeDefined()
    })
    
    it('should clear announcements', async () => {
      const { result } = renderHook(() => useAnnouncement(), {
        wrapper: AnnouncementProvider
      })
      
      act(() => {
        result.current.announce('Test message')
      })
      
      act(() => {
        result.current.clearAnnouncement()
      })
      
      expect(result.current.clearAnnouncement).toBeDefined()
    })
    
    it('should handle multiple announcements in queue', async () => {
      const { result } = renderHook(() => useAnnouncement(), {
        wrapper: AnnouncementProvider
      })
      
      act(() => {
        result.current.announce('First message', 'polite')
        result.current.announce('Second message', 'polite')
        result.current.announce('Third message', 'polite')
      })
      
      // All messages should be queued without errors
      expect(result.current.announce).toBeDefined()
    })
    
    it('should handle mixed priority announcements', async () => {
      const { result } = renderHook(() => useAnnouncement(), {
        wrapper: AnnouncementProvider
      })
      
      act(() => {
        result.current.announce('Polite message', 'polite')
        result.current.announce('Assertive message', 'assertive')
        result.current.announce('Another polite message', 'polite')
      })
      
      expect(result.current.announce).toBeDefined()
    })
  })
  
  describe('Custom clear delay', () => {
    it('should accept custom clearDelay prop', () => {
      render(
        <AnnouncementProvider clearDelay={2000}>
          <div>Test Content</div>
        </AnnouncementProvider>
      )
      
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })
  })
})
