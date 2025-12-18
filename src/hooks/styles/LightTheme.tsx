import React from "react"

export type ThemeChoice = "light" | "dark" | "system"

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
