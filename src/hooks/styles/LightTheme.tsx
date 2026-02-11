import React from "react"
import { CUSTOM_THEMES } from "./custom_themes"

import { SxProps } from '@mui/system';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export type ThemeChoice =
  | "light"
  | "dark"
  | "system"
  | "BWINCORP"
  | "MEDRUNNER"
  | "RSNM"
  | "INDUSTRIAL"
  | "NATURE"
  | "NATURE_DARK"
  | "CYBERPUNK"
  | "OCEAN"
  | "SUNSET"
  | "SPACE"

export const LightThemeContext = React.createContext<
  [ThemeChoice, React.Dispatch<React.SetStateAction<ThemeChoice>>] | null
>(null)

export const useLightTheme = () => {
  const val = React.useContext(LightThemeContext)
  if (val == null) {
    throw new Error("Cannot use useLightTheme outside of DrawerWidthContext")
  }
  return val
}
