/**
 * AnimatedButton Component
 * Button with micro-interaction feedback
 * Wraps Material-UI Button with press animations
 */

import React, { ReactNode } from "react"
import { Button, ButtonProps } from "@mui/material"
import { useMicroInteractions } from "../../hooks/animations/useMicroInteractions"

interface AnimatedButtonProps extends ButtonProps {
  children: ReactNode
  disableHover?: boolean
}

export function AnimatedButton({
  children,
  disableHover = false,
  sx,
  ...props
}: AnimatedButtonProps) {
  const { sx: interactionSx, ...interactionHandlers } = useMicroInteractions({
    disableHover,
  })

  return (
    <Button
      {...props}
      {...interactionHandlers}
      sx={{
        ...interactionSx,
        ...sx,
      }}
    >
      {children}
    </Button>
  )
}
