/**
 * AnimatedListItem Component
 *
 * NEW: Custom component for staggered fade-in animations
 *
 * Provides Grid-compatible staggered animations for list items.
 * Unlike Material-UI's Fade component, this applies styles directly to Grid items
 * without adding wrapper elements that break Grid layouts.
 *
 * Material-UI provides: Fade, Grow, Slide (but they add wrapper elements)
 * This component: Applies CSS transitions directly via sx prop (Grid-compatible)
 *
 * IMPORTANT: Grid containers require direct Grid item children.
 * This component preserves that structure by cloning elements with animation styles.
 */

import React, {
  ReactNode,
  isValidElement,
  cloneElement,
  useEffect,
  useState,
} from "react"
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
  const [isVisible, setIsVisible] = useState(inProp)

  useEffect(() => {
    if (inProp) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => setIsVisible(false), timeout)
      return () => clearTimeout(timer)
    }
  }, [inProp, timeout])

  if (!isVisible && !inProp) {
    return null
  }

  // Animation styles to apply
  const animationStyles = {
    opacity: inProp ? 1 : 0,
    transform: inProp ? "translateY(0)" : "translateY(10px)",
    transition: `opacity ${timeout}ms ease-out, transform ${timeout}ms ease-out`,
    transitionDelay: `${transitionDelay}ms`,
  }

  // If child is a Grid item, apply animation styles directly to it
  // This preserves Grid layout structure (Grid container → Grid items)
  if (
    isValidElement(children) &&
    children.type === Grid &&
    (children.props as GridProps).item
  ) {
    const gridProps = children.props as GridProps
    return cloneElement(children as React.ReactElement<GridProps>, {
      sx: {
        ...(gridProps.sx || {}),
        ...animationStyles,
      },
    })
  }

  // If child is a React element (component that returns Grid item), clone with styles
  // This handles cases like <ItemListing /> which returns a Grid item
  if (isValidElement(children)) {
    const childProps = children.props as Record<string, unknown>
    return cloneElement(
      children as React.ReactElement<Record<string, unknown>>,
      {
        sx: {
          ...(childProps.sx || {}),
          ...animationStyles,
          width: "100%",
        },
      },
    )
  }

  // Fallback: wrap in a div (shouldn't happen in normal usage with Grid)
  return (
    <div
      style={{
        ...animationStyles,
        width: "100%",
      }}
    >
      {children}
    </div>
  )
}
