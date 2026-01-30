import type { Components, Theme } from "@mui/material"
import type { ExtendedTheme } from "./utils"

const fontStack = `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"`

export function getBaseComponentOverrides(): Components<Omit<Theme, "components">> {
  return {
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          color: "inherit",
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: "inherit",
        },
      },
    },
    MuiTypography: {
      defaultProps: {
        fontFamily: fontStack,
      },
    },
    MuiButton: {
      styleOverrides: {
        outlined: ({ theme }) => {
          const extTheme = theme as ExtendedTheme
          return {
            fontFamily: fontStack,
            borderRadius: theme.spacing(extTheme.borderRadius.button),
          }
        },
        text: ({ theme }) => {
          const extTheme = theme as ExtendedTheme
          return {
            fontFamily: fontStack,
            borderRadius: theme.spacing(extTheme.borderRadius.button),
          }
        },
        contained: ({ theme }) => {
          const extTheme = theme as ExtendedTheme
          return {
            borderRadius: theme.spacing(extTheme.borderRadius.button),
          }
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarGutter: "stable",
          "*::-webkit-scrollbar": {
            display: "none",
            scrollbarWidth: "none" /* Firefox */,
          },
          "*::-webkit-scrollbar-track": {
            WebkitBoxShadow: "inset 0 0 6px rgba(0,0,0,0.00)",
          },
          "*::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(100,100,100,.2)",
          },
          "*::-webkit-scrollbar-corner": { backgroundColor: "transparent" },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {},
      },
    },
    MuiDivider: {
      styleOverrides: {
        light: {
          borderColor: "outline.main",
          color: "outline.main",
        },
      },
    },
    MuiIconButton: {
      defaultProps: {
        color: "inherit",
      },
    },
    MuiInputAdornment: {
      styleOverrides: {
        root: {
          color: "inherit",
        },
      },
    },
  }
}
