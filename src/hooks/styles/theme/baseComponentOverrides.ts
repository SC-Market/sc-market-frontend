import type { Components, Theme } from "@mui/material"
import type { ExtendedTheme } from "./utils"
import {
  accentFill,
  disabledButton,
  isAccentFill,
  selectedToggle,
  withContrast,
} from "./contrast"

const fontStack = `var(--sc-custom-font, "Electrolize"), "Electrolize Fallback", "Electrolize Fallback Roboto", "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"`

export function getBaseComponentOverrides(): Components<
  Omit<Theme, "components">
> {
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
        // Contrast rules (computed from the active palette, so every theme
        // gets them): readable disabled labels, and dark text on
        // secondary/warning/error fills. See ./contrast.ts.
        root: ({ theme, ownerState }) =>
          withContrast(() => {
            const disabled = disabledButton(theme, "all")
            const accent =
              ownerState.variant === "contained" &&
              isAccentFill(ownerState.color)
                ? accentFill(theme, ownerState.color)
                : null
            return {
              ...(accent && {
                color: accent.text,
                "&:hover": { backgroundColor: accent.hover },
              }),
              "&.Mui-disabled": {
                color: disabled.text,
                ...(ownerState.variant === "contained" && {
                  backgroundColor: disabled.fill,
                }),
                ...(ownerState.variant === "outlined" && {
                  borderColor: disabled.border,
                }),
              },
            }
          }),
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
    MuiChip: {
      styleOverrides: {
        root: ({ theme, ownerState }) => {
          const extTheme = theme as ExtendedTheme
          const accent =
            ownerState.variant === "filled" && isAccentFill(ownerState.color)
              ? withContrast(() => {
                  const a = accentFill(theme, ownerState.color as never)
                  return {
                    color: a.text,
                    "& .MuiChip-icon, & .MuiChip-avatar": { color: a.text },
                    "& .MuiChip-deleteIcon": {
                      color: a.deleteIcon,
                      "&:hover": { color: a.text },
                    },
                    "&.MuiChip-clickable:hover, &.Mui-focusVisible": {
                      backgroundColor: a.hover,
                    },
                  }
                })
              : {}
          return {
            borderRadius: theme.spacing(extTheme.borderRadius.chip),
            ...accent,
          }
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        // Selected state: stronger tint, an inset ring (independent of the
        // group's collapsed borders) and an AA label. See ./contrast.ts.
        root: ({ theme, ownerState }) =>
          withContrast(() => {
            const s = selectedToggle(theme, ownerState.color ?? "standard")
            return {
              color: s.idle,
              "&.Mui-selected": {
                color: s.text,
                backgroundColor: s.fill,
                boxShadow: `inset 0 0 0 1px ${s.ring}`,
                "&:hover": {
                  backgroundColor: s.hover,
                  "@media (hover: none)": { backgroundColor: s.fill },
                },
              },
            }
          }),
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
