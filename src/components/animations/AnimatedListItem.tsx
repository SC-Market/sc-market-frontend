/**
 * AnimatedListItem Component
 * Provides staggered fade-in animations for list items
 * Performance-conscious using CSS transforms
 * Uses Material-UI transitions (React 19 compatible)
 */

import React, { ReactNode } from "react"
import { Fade, Grow } from "@mui/material"
import { Box } from "@mui/material"

interface AnimatedListItemProps {
  children: ReactNode
  index: number
  in: boolean
  timeout?: number
  delay?: number
}

const defaultTimeout = 500
const defaultDelay = 50

export function AnimatedListItem({
  children,
  index,
  in: inProp,
  timeout = defaultTimeout,
  delay = defaultDelay,
}: AnimatedListItemProps) {
  const transitionDelay = index * delay

  return (
    <Grow
      in={inProp}
      timeout={timeout}
      style={{
        transitionDelay: `${transitionDelay}ms`,
      }}
      mountOnEnter
      unmountOnExit
    >
      <Box
        sx={{
          width: "100%",
        }}
      >
        {children}
      </Box>
    </Grow>
  )
}
