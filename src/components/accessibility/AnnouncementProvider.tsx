import { createContext, useContext, useCallback, useState, ReactNode, useRef, useEffect } from "react"
import { LiveRegion } from "./LiveRegion"

interface Announcement {
  id: string
  message: string
  priority: 'polite' | 'assertive'
  timestamp: number
}

interface AnnouncementContextValue {
  /**
   * Announce a message to screen readers
   * @param message - The message to announce
   * @param priority - The politeness level ('polite' for non-urgent, 'assertive' for urgent)
   */
  announce: (message: string, priority?: 'polite' | 'assertive') => void
  
  /**
   * Clear all current announcements
   */
  clearAnnouncement: () => void
}

const AnnouncementContext = createContext<AnnouncementContextValue | undefined>(undefined)

interface AnnouncementProviderProps {
  children: ReactNode
  /**
   * Delay in milliseconds before clearing announcements (default: 1000ms)
   */
  clearDelay?: number
}

/**
 * AnnouncementProvider manages live region announcements for screen readers.
 * It provides a queue-based system for announcing dynamic content changes with
 * appropriate politeness levels.
 * 
 * - 'polite' announcements wait for the screen reader to finish current speech
 * - 'assertive' announcements interrupt current speech for urgent messages
 */
export function AnnouncementProvider({ 
  children, 
  clearDelay = 1000 
}: AnnouncementProviderProps) {
  const [politeMessage, setPoliteMessage] = useState('')
  const [assertiveMessage, setAssertiveMessage] = useState('')
  
  // Queue for managing multiple announcements
  const politeQueueRef = useRef<Announcement[]>([])
  const assertiveQueueRef = useRef<Announcement[]>([])
  const processingRef = useRef<{ polite: boolean; assertive: boolean }>({
    polite: false,
    assertive: false
  })
  
  // Timers for clearing announcements
  const politeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const assertiveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  
  /**
   * Process the next announcement in the queue
   */
  const processQueue = useCallback((priority: 'polite' | 'assertive') => {
    const queue = priority === 'polite' ? politeQueueRef.current : assertiveQueueRef.current
    const setMessage = priority === 'polite' ? setPoliteMessage : setAssertiveMessage
    const timerRef = priority === 'polite' ? politeTimerRef : assertiveTimerRef
    
    if (queue.length === 0) {
      processingRef.current[priority] = false
      return
    }
    
    processingRef.current[priority] = true
    const announcement = queue.shift()
    
    if (announcement) {
      setMessage(announcement.message)
      
      // Clear the timer if it exists
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      
      // Set a timer to clear the message and process next in queue
      timerRef.current = setTimeout(() => {
        setMessage('')
        timerRef.current = null
        
        // Process next announcement after a small delay
        setTimeout(() => {
          processQueue(priority)
        }, 100)
      }, clearDelay)
    }
  }, [clearDelay])
  
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!message.trim()) {
      return
    }
    
    const announcement: Announcement = {
      id: `${Date.now()}-${Math.random()}`,
      message: message.trim(),
      priority,
      timestamp: Date.now()
    }
    
    if (priority === 'assertive') {
      assertiveQueueRef.current.push(announcement)
      if (!processingRef.current.assertive) {
        processQueue('assertive')
      }
    } else {
      politeQueueRef.current.push(announcement)
      if (!processingRef.current.polite) {
        processQueue('polite')
      }
    }
  }, [processQueue])
  
  const clearAnnouncement = useCallback(() => {
    // Clear messages
    setPoliteMessage('')
    setAssertiveMessage('')
    
    // Clear queues
    politeQueueRef.current = []
    assertiveQueueRef.current = []
    
    // Clear timers
    if (politeTimerRef.current) {
      clearTimeout(politeTimerRef.current)
      politeTimerRef.current = null
    }
    if (assertiveTimerRef.current) {
      clearTimeout(assertiveTimerRef.current)
      assertiveTimerRef.current = null
    }
    
    // Reset processing flags
    processingRef.current = { polite: false, assertive: false }
  }, [])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (politeTimerRef.current) {
        clearTimeout(politeTimerRef.current)
      }
      if (assertiveTimerRef.current) {
        clearTimeout(assertiveTimerRef.current)
      }
    }
  }, [])
  
  const value: AnnouncementContextValue = {
    announce,
    clearAnnouncement
  }
  
  return (
    <AnnouncementContext.Provider value={value}>
      {children}
      <LiveRegion message={politeMessage} aria-live="polite" />
      <LiveRegion message={assertiveMessage} aria-live="assertive" />
    </AnnouncementContext.Provider>
  )
}

/**
 * Hook to access the AnnouncementProvider context
 */
export function useAnnouncement(): AnnouncementContextValue {
  const context = useContext(AnnouncementContext)
  if (!context) {
    throw new Error('useAnnouncement must be used within an AnnouncementProvider')
  }
  return context
}
