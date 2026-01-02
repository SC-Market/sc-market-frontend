/**
 * PageTransition Component
 * Provides smooth fade/slide transitions between routes
 * Performance-conscious using CSS transforms
 * CSS-only approach for React 19 compatibility
 */

import React, { ReactNode, useEffect, useState } from "react"
import { Box } from "@mui/material"

interface PageTransitionProps {
  children: ReactNode
  in: boolean
  timeout?: number
  variant?: "fade" | "slide" | "slideUp"
}

const defaultTimeout = 300

export function PageTransition({
  children,
  in: inProp,
  timeout = defaultTimeout,
  variant = "fade",
}: PageTransitionProps) {
  const [isMounted, setIsMounted] = useState(inProp)

  useEffect(() => {
    if (inProp) {
      setIsMounted(true)
    } else {
      const timer = setTimeout(() => setIsMounted(false), timeout)
      return () => clearTimeout(timer)
    }
  }, [inProp, timeout])

  if (!isMounted) return null

  const getStyles = () => {
    const baseTransition = `opacity ${timeout}ms ease-in-out, transform ${timeout}ms ease-in-out`
    
    switch (variant) {
      case "slide":
        return {
          transition: baseTransition,
          opacity: inProp ? 1 : 0,
          transform: inProp ? "translateX(0)" : "translateX(20px)",
        }
      case "slideUp":
        return {
          transition: baseTransition,
          opacity: inProp ? 1 : 0,
          transform: inProp ? "translateY(0)" : "translateY(20px)",
        }
      case "fade":
      default:
        return {
          transition: baseTransition,
          opacity: inProp ? 1 : 0,
        }
    }
  }

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        ...getStyles(),
      }}
    >
      {children}
    </Box>
  )
}
