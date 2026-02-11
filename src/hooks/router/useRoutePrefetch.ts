import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { prefetchRoutesForPath } from "../../router/routePrefetch"

import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

/**
 * Hook to automatically prefetch routes based on current location
 * Uses the ROUTE_PREFETCH_MAP to determine which routes to prefetch
 */
export function useRoutePrefetch(): void {
  const location = useLocation()

  useEffect(() => {
    // Prefetch routes for the current path
    prefetchRoutesForPath(location.pathname)
  }, [location.pathname])
}
