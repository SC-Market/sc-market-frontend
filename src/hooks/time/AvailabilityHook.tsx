import React from "react"

import { SxProps } from '@mui/material/SxProps';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

interface AvailabilityHookData {
  clicked: boolean
  selections: boolean[]
  setClicked: (value: boolean) => void
  startSelect: (day: number, slot: number) => void
  endSelect: (day: number, slot: number) => void
  startedSelect: { day: number; slot: number; value: boolean } | null
  endedSelect: { day: number; slot: number } | null
}

export const AvailabilityHookContext =
  React.createContext<AvailabilityHookData | null>(null)

export const useAvailability = () => {
  const val = React.useContext(AvailabilityHookContext)
  if (val == null) {
    throw new Error(
      "Cannot use useAvailabilityHook outside of AvailabilityHookContext",
    )
  }
  return val
}
