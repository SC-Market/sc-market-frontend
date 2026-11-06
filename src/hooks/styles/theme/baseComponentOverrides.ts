import type { Components, Theme } from "@mui/material"
import type { ExtendedTheme } from "./utils"
import {
  accentFill,
  disabledButton,
  isAccentFill,
  outlinedInput,
  selectedToggle,
  withContrast,
} from "./contrast"

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
    MuiAvatar: {
      // Almost every avatar sits next to the name of the user, org or shop
      // it pictures, so the image is decorative: alt="" (MUI leaves the
      // attribute off unless alt is set, which fails accessibility audits).
      // An avatar that stands for its owner (a page header, an avatar-only
      // link) passes a named alt such as accessibility.userAvatar.
      defaultProps: {
        alt: "",
      },
    },
    MuiButton: {
      styleOverrides: {
        // Contrast rules (computed from the active palette, so every theme
        // gets them): readable disabled labels, and dark text on
        // secondary/neutral/warning/error fills. See ./contrast.ts.
        root: ({ theme, ownerState }) =>
          withContrast(() => {
            const disabled = disabledButton(theme, "all")
            const accent =
              ownerState.variant === "contained" &&
              isAccentFill(ownerState.color)
                ? accentFill(theme, ownerState.color)
                : null
            // Neutral (secondary-role) actions: an outline,
            // bright neutral text on a crisp 3:1 border (outline.strong),
            // the surface steps on hover.
            const neutral =
              ownerState.color === "neutral" &&
              ownerState.variant !== "contained"
            return {
              ...(accent && {
                color: accent.text,
                "&:hover": { backgroundColor: accent.hover },
              }),
              ...(neutral && {
                color: theme.palette.neutral.main,
                ...(ownerState.variant === "outlined" && {
                  borderColor: theme.palette.outline.strong,
                }),
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                  ...(ownerState.variant === "outlined" && {
                    borderColor: theme.palette.text.primary,
                  }),
                },
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
            borderRadius: theme.spacing(extTheme.borderRadius.button),
          }
        },
        text: ({ theme }) => {
          const extTheme = theme as ExtendedTheme
          return {
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
    MuiSkeleton: {
      styleOverrides: {
        // Loading placeholders pulse (or shimmer); with reduced motion asked
        // for they hold still: the same shape, a steady fill.
        root: {
          "@media (prefers-reduced-motion: reduce)": {
            animation: "none",
            "&::after": { animation: "none", display: "none" },
          },
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
        // Border at 3:1 resting; hover and focus never weaker. Error and
        // disabled keep MUI's colours (guarded by :not). See ./contrast.ts.
        root: ({ theme, ownerState }) =>
          withContrast(() => {
            const o = outlinedInput(theme, ownerState.color ?? "primary")
            const outline = ".MuiOutlinedInput-notchedOutline"
            const idle = ":not(.Mui-error):not(.Mui-disabled)"
            return {
              [`& ${outline}`]: { borderColor: o.resting },
              [`&:hover${idle}:not(.Mui-focused) ${outline}`]: {
                borderColor: o.hover,
              },
              "@media (hover: none)": {
                [`&:hover${idle}:not(.Mui-focused) ${outline}`]: {
                  borderColor: o.resting,
                },
              },
              [`&.Mui-focused${idle} ${outline}`]: { borderColor: o.focus },
            }
          }),
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
          // Neutral outlined chips: bright text on the 3:1 control border
          const neutral =
            ownerState.variant === "outlined" &&
            (ownerState.color ?? "default") === "default"
              ? {
                  color: theme.palette.neutral.main,
                  borderColor: theme.palette.outline.strong,
                }
              : {}
          return {
            fontFamily: theme.typography.fontFamilyHeading,
            borderRadius: theme.spacing(extTheme.borderRadius.chip),
            ...neutral,
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
