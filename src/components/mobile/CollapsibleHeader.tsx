/**
 * CollapsibleHeader Component
 * A sticky header that collapses on scroll
 * Provides more screen space while maintaining navigation
 */

import {
  AppBar,
  Box,
  Toolbar,
  useMediaQuery,
  useScrollTrigger,
  useTheme,
} from "@mui/material"
import React, { ReactNode, useEffect, useState } from "react"
import { ExtendedTheme } from "../../hooks/styles/Theme"

interface CollapsibleHeaderProps {
  children: ReactNode
  elevation?: number
  collapsedHeight?: number
  expandedHeight?: number
  threshold?: number // Scroll distance before collapsing
  variant?: "slide" | "fade" | "shrink"
}

export function CollapsibleHeader({
  children,
  elevation = 4,
  collapsedHeight = 56,
  expandedHeight = 64,
  threshold = 100,
  variant = "slide",
}: CollapsibleHeaderProps) {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [scrollY, setScrollY] = useState(0)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: threshold,
  })

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setScrollY(currentScrollY)
      setIsCollapsed(currentScrollY > threshold)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [threshold])

  if (!isMobile) {
    // On desktop, use regular sticky header
    return (
      <AppBar
        position="sticky"
        elevation={elevation}
        sx={{
          zIndex: theme.zIndex.appBar,
        }}
      >
        <Toolbar>{children}</Toolbar>
      </AppBar>
    )
  }

  // Calculate height based on scroll position
  const heightDiff = expandedHeight - collapsedHeight
  const scrollProgress = Math.min(1, scrollY / threshold)
  const currentHeight =
    variant === "shrink"
      ? expandedHeight - heightDiff * scrollProgress
      : isCollapsed
        ? collapsedHeight
        : expandedHeight

  return (
    <AppBar
      position="sticky"
      elevation={isCollapsed ? elevation : 0}
      sx={{
        zIndex: theme.zIndex.appBar,
        height: currentHeight,
        transition: variant === "shrink" ? "height 0.3s ease-out" : "all 0.3s ease-out",
        transform:
          variant === "slide"
            ? isCollapsed
              ? "translateY(-100%)"
              : "translateY(0)"
            : "none",
        opacity: variant === "fade" ? (isCollapsed ? 0 : 1) : 1,
        visibility: variant === "fade" && isCollapsed ? "hidden" : "visible",
      }}
    >
      <Toolbar
        sx={{
          minHeight: `${currentHeight}px !important`,
          height: currentHeight,
          transition: "all 0.3s ease-out",
        }}
      >
        {children}
      </Toolbar>
    </AppBar>
  )
}
