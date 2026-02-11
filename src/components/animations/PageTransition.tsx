/**
 * PageTransition Component
 * Provides smooth fade/slide transitions between routes
 * Performance-conscious using CSS transforms
 * CSS-only approach for React 19 compatibility
 */

import React, { ReactNode, useEffect, useState } from "react"
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
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MaterialLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { GridProps } from '@mui/material/Grid';
import CookieRounded from '@mui/icons-material/CookieRounded';
import ZoomIn from '@mui/icons-material/ZoomIn';
import ZoomOut from '@mui/icons-material/ZoomOut';
import FitScreen from '@mui/icons-material/FitScreen';
import Close from '@mui/icons-material/Close';

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
