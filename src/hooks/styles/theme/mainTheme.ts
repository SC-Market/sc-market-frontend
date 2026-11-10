import { refTheme, mainOutline, NEUTRAL_DARK } from "./constants"
import { ON_ACCENT_DARK } from "./contrast"
import { themeBase } from "./baseTheme"
import { createAppTheme } from "./createAppTheme"
import type { ExtendedTheme } from "./utils"
import type { ExtendedThemeOptions } from "./constants"

export const mainThemeOptions: ExtendedThemeOptions = {
  palette: {
    mode: "dark",
    // Green is the one accent: main actions, links, fields, selection
    // controls and the focus ring. Dark text on it (7.47:1).
    primary: refTheme.palette.augmentColor({
      color: { main: "#10b881", contrastText: ON_ACCENT_DARK },
    }),
    // `secondary` is the buy side and premium, not a second accent: bid
    // prices, "Top bid", the depth chart's bid curve, buy orders, supporter
    // and premium badges. 5.69:1 on the page, 5.27:1 on paper; dark text on
    // it 5.27:1. scm-style/no-secondary-accent keeps it off controls.
    secondary: refTheme.palette.augmentColor({
      color: { main: "#7a7efe", contrastText: "#111828" },
    }),
    // Neutral controls: secondary-role buttons, outlined chips.
    neutral: refTheme.palette.augmentColor({
      color: { main: NEUTRAL_DARK, contrastText: "#111828" },
    }),
    // MUI's dark-mode shades, pinned with dark text: MUI would put white on
    // the red (3.68:1). Dark text is 5.20:1 and 9.85:1. These layers also
    // reach light themes, which set their own (lightThemeOptions).
    error: refTheme.palette.augmentColor({
      color: { main: "#f44336", contrastText: ON_ACCENT_DARK },
    }),
    warning: refTheme.palette.augmentColor({
      color: { main: "#ffa726", contrastText: ON_ACCENT_DARK },
    }),
    text: {
      primary: "#b7b7b7",
      secondary: "#e8e8e8",
      subtle: "rgba(255, 255, 255, 0.5)",
    },
    DataGrid: {
      bg: "transparent",
      pinnedBg: "transparent",
      headerBg: "transparent",
    },
    background: {
      default: "#0b0f1a",
      paper: "#111828",
      sidebar: "#111828",
      navbar: "#111828",
      light: "#FFF",
      overlay: "rgba(0, 0, 0, 0.5)",
      overlayDark: "rgba(0, 0, 0, 0.7)",
      imageOverlay: "rgba(0, 0, 0, 0.8)",
      imageOverlayHover: "rgba(0, 0, 0, 0.9)",
      subtleDivider: "rgba(255, 255, 255, 0.11)",
      subtleHover: "#1a1a1a",
    },
    outline: {
      main: mainOutline,
      // Control borders (neutral outlined buttons and chips): 3.09:1 on paper
      strong: "#58677e",
    },
    divider: mainOutline,
    action: {
      hover: "rgba(36, 41, 58, 0.43)",
    },
    common: {
      subheader: "#929ca1",
      // The focus ring is the accent: 7.47:1 on the page, 6.92:1 on paper
      focus: "#10b881",
      badge: {
        gold: "#FFD700",
        silver: "#C0C0C0",
        bronze: "#CD7F32",
        purple: "#9C27B0",
      },
    },
  },
  navKind: "outlined",
  components: {
    MuiDataGrid: {
      styleOverrides: {
        root: {
          "--DataGrid-containerBackground":
            "var(--mui-palette-background-paper)",
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        outlined: {
          border: `1px solid ${mainOutline}`,
        },
        root: ({ theme }) => {
          const extTheme = theme as ExtendedTheme
          return {
            borderRadius: theme.spacing(extTheme.borderRadius.topLevel),
          }
        },
      },
    },
    MuiCard: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: ({ theme }) => {
          const extTheme = theme as ExtendedTheme
          return {
            border: `1px solid ${mainOutline}`,
            borderRadius: theme.spacing(extTheme.borderRadius.topLevel),
          }
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        light: {
          backgroundColor: mainOutline,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: mainOutline,
        },
      },
    },
    MuiIconButton: {
      defaultProps: {
        color: "inherit",
      },
    },
    MuiInputAdornment: {
      defaultProps: {
        color: "inherit",
      },
    },
    MuiSelect: {
      defaultProps: {
        MenuProps: {
          disablePortal: true,
        },
      },
      styleOverrides: {
        icon: {
          color: "inherit",
        },
      },
    },
    MuiAutocomplete: {
      defaultProps: {
        disablePortal: true,
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          backgroundColor: "var(--mui-palette-background-default, #0b0f1a)",
        },
        "*:focus": {
          outlineColor: "var(--mui-palette-common-focus, #10b881)",
        },
      },
    },
  },
}

export const mainTheme = createAppTheme(themeBase, mainThemeOptions)
