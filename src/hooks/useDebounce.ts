import { useState, useEffect, useRef } from "react"
import throttle from "lodash/throttle"

import Alert from '@mui/material/Alert';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from '@mui/material/Snackbar';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { responsiveFontSizes } from '@mui/material/styles';
import CarRentalRounded from '@mui/icons-material/CarRentalRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';

/**
 * Custom hook that throttles a value update
 * @param value - The value to throttle
 * @param delay - The throttle delay in milliseconds
 * @returns The throttled value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const throttledUpdate = useRef(
    throttle((newValue: T) => {
      setThrottledValue(newValue)
    }, delay),
  )

  useEffect(() => {
    throttledUpdate.current(value)
  }, [value])

  useEffect(() => {
    return () => {
      throttledUpdate.current.cancel()
    }
  }, [])

  return throttledValue
}
