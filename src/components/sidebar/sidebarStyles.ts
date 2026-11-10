import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import {
  AA_TEXT,
  flatten,
  nudgeToContrast,
  surfaces,
} from "../../hooks/styles/theme/contrast"

/**
 * The selected row's label on the sidebar: text.selected, moved to 4.5:1 on
 * the selected tint over the sidebar when the sidebar is a different shade
 * from Paper (the site's light theme has a dark sidebar).
 */
function sidebarSelectedLabel(theme: ExtendedTheme): string {
  const label = theme.palette.text.selected ?? theme.palette.primary.main
  try {
    const { page } = surfaces(theme)
    const sidebar = flatten(
      theme.palette.background.sidebar || theme.palette.background.paper,
      page,
    )
    const fill = flatten(theme.palette.action.selected, sidebar)
    return nudgeToContrast(label, [fill, sidebar], AA_TEXT)
  } catch {
    return label
  }
}

/** The sidebar's shared sx: nav rows, section headers and the pin button. */
export function useSidebarStyles() {
  const theme = useTheme<ExtendedTheme>()
  const sidebarContrast = theme.palette.getContrastText(
    theme.palette.background.sidebar || theme.palette.background.paper,
  )

  const selectedLabel = sidebarSelectedLabel(theme)

  const itemSx = {
    borderRadius: theme.spacing(theme.borderRadius?.topLevel ?? 0.375),
    mt: 0.5,
    transition: "0.3s",
    "& .MuiListItemIcon-root": {
      color: sidebarContrast,
      transition: "0.3s",
      fontSize: "0.9em",
    },
    // Navigation is in the heading font; 600 now that the weight is real
    "& .MuiListItemText-primary": {
      color: sidebarContrast,
      fontFamily: theme.typography.fontFamilyHeading,
      fontWeight: 600,
      transition: "0.3s",
    },
    // The selected tint, rail and hover are the theme's (selectedState,
    // hooks/styles/theme/baseComponentOverrides.ts); the label is checked
    // against the sidebar's own surface.
    "&.Mui-selected": {
      boxShadow: `inset ${theme.borderWidth?.emphasis ?? 2}px 0 0 ${selectedLabel}`,
      "& .MuiListItemIcon-root": { color: selectedLabel },
      "& .MuiListItemText-primary": { color: selectedLabel },
    },
    "&:hover": { backgroundColor: theme.palette.action.hover },
    // reveal star button on hover
    "&:hover .nav-star, &:focus-within .nav-star": { opacity: 1 },
  }

  const sectionHeaderSx = {
    px: 2,
    pt: 1.5,
    pb: 0.5,
    fontFamily: theme.typography.fontFamilyHeading,
    fontWeight: 600,
    opacity: 0.7,
    textTransform: "uppercase" as const,
    fontSize: "0.85em",
  }

  const pinSx = (isStarred: boolean) => ({
    ml: 0.5,
    opacity: isStarred ? 1 : 0,
    transition: "opacity 0.2s",
    color: isStarred ? "primary.main" : sidebarContrast,
    p: 0.25,
  })

  return { itemSx, sectionHeaderSx, pinSx }
}
