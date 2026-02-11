import { useState, useEffect } from "react"
import { ExtendedTheme } from "../styles/Theme"

import { SxProps } from '@mui/material/SxProps';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

/**
 * Hook to get the current bottom navigation bar height
 * Returns 64px on mobile when visible, 0 when keyboard is open or on desktop
 */
export function useBottomNavHeight(): number {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.only("xs"))
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)

  // Track keyboard visibility to determine if bottom nav is hidden
  useEffect(() => {
    if (!isMobile) {
      setIsKeyboardOpen(false)
      return
    }

    const handleResize = () => {
      // On mobile, if viewport height is significantly reduced, keyboard is likely open
      const viewportHeight = window.visualViewport?.height || window.innerHeight
      const screenHeight = window.screen.height
      // If viewport is less than 75% of screen height, assume keyboard is open
      setIsKeyboardOpen(viewportHeight < screenHeight * 0.75)
    }

    // Use visualViewport API if available (better for mobile)
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize)
      return () => {
        window.visualViewport?.removeEventListener("resize", handleResize)
      }
    } else {
      window.addEventListener("resize", handleResize)
      return () => {
        window.removeEventListener("resize", handleResize)
      }
    }
  }, [isMobile])

  // Bottom nav is 64px on mobile when visible (keyboard closed), 0 otherwise
  return isMobile && !isKeyboardOpen ? 64 : 0
}
