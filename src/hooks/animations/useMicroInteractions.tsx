/**
 * useMicroInteractions Hook
 * Provides button press feedback and hover effects
 * Returns sx props for Material-UI components
 */

import { useState, useCallback } from "react"
import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';

interface UseMicroInteractionsOptions {
  scale?: number
  duration?: number
  disableHover?: boolean
}

export function useMicroInteractions(
  options: UseMicroInteractionsOptions = {},
) {
  const { scale = 0.95, duration = 150, disableHover = false } = options
  const [isPressed, setIsPressed] = useState(false)

  const handleMouseDown = useCallback(() => {
    setIsPressed(true)
  }, [])

  const handleMouseUp = useCallback(() => {
    setTimeout(() => setIsPressed(false), duration)
  }, [duration])

  const handleMouseLeave = useCallback(() => {
    setIsPressed(false)
  }, [])

  const sx: SxProps<Theme> = {
    transition: `transform ${duration}ms ease-out`,
    transform: isPressed ? `scale(${scale})` : "scale(1)",
    "&:hover": disableHover
      ? {}
      : {
          transform: isPressed ? `scale(${scale})` : "scale(1.02)",
        },
    cursor: "pointer",
  }

  return {
    sx,
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseLeave,
    isPressed,
  }
}
