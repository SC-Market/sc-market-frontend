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
import { primaryFill, primaryFillHover } from "./roles"

/**
 * Keyboard focus ring for every ButtonBase (buttons, tabs, list rows, icon
 * buttons, chips, switches): MUI resets their outline to 0 and shows only a
 * faint background, so src/index.css's `*:focus` ring never reached them.
 * `inset` draws it inside the control, for ones inside clipping scrollers
 * (Tabs, menus, lists).
 */
function focusRing(theme: Theme, inset = false) {
  const width = theme.borderWidth?.focus ?? 2
  return {
    "&.Mui-focusVisible": {
      outline: `${width}px solid ${theme.palette.common.focus}`,
      outlineOffset: inset ? -width : 2,
    },
  }
}

/** Filled primary controls take the brand fill (./roles.ts). */
function primaryFilled(theme: Theme) {
  const fill = primaryFill(theme)
  return {
    backgroundColor: fill,
    color: theme.palette.primary.contrastText,
    "&:hover": {
      backgroundColor: primaryFillHover(theme),
      "@media (hover: none)": { backgroundColor: fill },
    },
  }
}

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
            // Filled primary: the brand fill, not the text role (./roles.ts)
            const filledPrimary =
              ownerState.variant === "contained" &&
              (ownerState.color ?? "primary") === "primary"
            return {
              ...(filledPrimary && primaryFilled(theme)),
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
    MuiButtonBase: {
      styleOverrides: {
        root: ({ theme }) => focusRing(theme),
      },
    },
    MuiTab: {
      styleOverrides: {
        root: ({ theme }) => focusRing(theme, true),
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: ({ theme }) => focusRing(theme, true),
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => focusRing(theme, true),
      },
    },
    MuiFab: {
      styleOverrides: {
        root: ({ theme, ownerState }) =>
          ownerState.color === "primary" ? primaryFilled(theme) : {},
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: ({ theme, ownerState }) =>
          ownerState.color === "primary"
            ? {
                backgroundColor: primaryFill(theme),
                color: theme.palette.primary.contrastText,
              }
            : {},
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
          // Filled primary chips: the brand fill (./roles.ts)
          const filledPrimary =
            ownerState.variant !== "outlined" && ownerState.color === "primary"
              ? {
                  backgroundColor: primaryFill(theme),
                  color: theme.palette.primary.contrastText,
                  "& .MuiChip-icon": { color: "inherit" },
                  "&.MuiChip-clickable:hover, &.Mui-focusVisible": {
                    backgroundColor: primaryFillHover(theme),
                  },
                }
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
            ...filledPrimary,
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
