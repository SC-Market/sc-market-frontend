/**
 * MobileFAB Component
 * Floating Action Button optimized for mobile
 * Automatically positions above bottom navigation
 */

import { Fab, FabProps, useMediaQuery, useTheme } from "@mui/material"
import React from "react"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { haptic } from "../../util/haptics"

interface MobileFABProps extends FabProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left"
  offset?: number // Additional offset from edges
  aboveBottomNav?: boolean // Position above mobile bottom nav
}

export function MobileFAB({
  position = "bottom-right",
  offset = 16,
  aboveBottomNav = true,
  onClick,
  sx,
  ...fabProps
}: MobileFABProps) {
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    haptic.light()
    onClick?.(event)
  }

  // Calculate position
  const getPositionStyles = () => {
    const bottomNavHeight = isMobile && aboveBottomNav ? 80 : 0 // 64px nav + 16px spacing
    const safeAreaBottom = isMobile ? "env(safe-area-inset-bottom)" : 0

    const positions: Record<string, any> = {
      "bottom-right": {
        bottom: `calc(${offset}px + ${bottomNavHeight}px + ${safeAreaBottom})`,
        right: `calc(${offset}px + env(safe-area-inset-right))`,
        top: "auto",
        left: "auto",
      },
      "bottom-left": {
        bottom: `calc(${offset}px + ${bottomNavHeight}px + ${safeAreaBottom})`,
        left: `calc(${offset}px + env(safe-area-inset-left))`,
        top: "auto",
        right: "auto",
      },
      "top-right": {
        top: `calc(${offset}px + env(safe-area-inset-top))`,
        right: `calc(${offset}px + env(safe-area-inset-right))`,
        bottom: "auto",
        left: "auto",
      },
      "top-left": {
        top: `calc(${offset}px + env(safe-area-inset-top))`,
        left: `calc(${offset}px + env(safe-area-inset-left))`,
        bottom: "auto",
        right: "auto",
      },
    }

    return positions[position]
  }

  return (
    <Fab
      {...fabProps}
      onClick={handleClick}
      sx={{
        position: "fixed",
        zIndex: theme.zIndex.speedDial,
        ...getPositionStyles(),
        ...sx,
      }}
    />
  )
}
