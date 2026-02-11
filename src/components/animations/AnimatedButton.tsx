/**
 * AnimatedButton Component
 * Button with micro-interaction feedback
 * Wraps Material-UI Button with press animations
 */

import React, { ReactNode } from "react"
import { useMicroInteractions } from "../../hooks/animations/useMicroInteractions"

import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import Paper from '@mui/material/Paper';
import Fade from '@mui/material/Fade';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ButtonProps } from '@mui/material/Button';
import CookieRounded from '@mui/icons-material/CookieRounded';

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
