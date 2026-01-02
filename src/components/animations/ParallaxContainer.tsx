/**
 * ParallaxContainer Component
 * Performance-conscious parallax effect using CSS transforms and will-change
 * Uses Intersection Observer for efficient scroll detection
 */

import React, { ReactNode, useRef, useEffect, useState } from "react"
import { Box, useMediaQuery, useTheme } from "@mui/material"
import { ExtendedTheme } from "../../hooks/styles/Theme"

interface ParallaxContainerProps {
  children: ReactNode
  speed?: number // Parallax speed (0-1, where 0.5 is standard)
  disabled?: boolean
  sx?: any
}

export function ParallaxContainer({
  children,
  speed = 0.5,
  disabled = false,
  sx,
}: ParallaxContainerProps) {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const containerRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  // Disable parallax on mobile for performance
  const shouldParallax = !disabled && !isMobile

  useEffect(() => {
    if (!shouldParallax || !containerRef.current) return

    const container = containerRef.current

    // Intersection Observer to only animate when visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting)
        })
      },
      {
        threshold: 0,
        rootMargin: "50px",
      },
    )

    observer.observe(container)

    const handleScroll = () => {
      if (!isVisible) return

      const rect = container.getBoundingClientRect()
      const scrolled = window.scrollY
      const elementTop = rect.top + scrolled
      const windowHeight = window.innerHeight
      const elementHeight = rect.height

      // Calculate parallax offset
      const scrollProgress =
        (window.scrollY + windowHeight - elementTop) /
        (windowHeight + elementHeight)
      const newOffset = (scrollProgress - 0.5) * speed * 50 // Max 50px movement

      // Use requestAnimationFrame for smooth performance
      requestAnimationFrame(() => {
        setOffset(newOffset)
      })
    }

    // Throttled scroll listener
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    handleScroll() // Initial calculation

    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", onScroll)
    }
  }, [shouldParallax, isVisible, speed])

  return (
    <Box
      ref={containerRef}
      sx={{
        willChange: shouldParallax ? "transform" : "auto",
        transform: shouldParallax ? `translateY(${offset}px)` : "none",
        transition: shouldParallax ? "none" : "transform 0.3s ease-out",
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}
