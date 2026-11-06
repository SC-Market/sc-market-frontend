import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

/** The sidebar's shared sx: nav rows, section headers and the pin button. */
export function useSidebarStyles() {
  const theme = useTheme<ExtendedTheme>()
  const sidebarContrast = theme.palette.getContrastText(
    theme.palette.background.sidebar || theme.palette.background.paper,
  )

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
    "&.Mui-selected": {
      "& .MuiListItemIcon-root": { color: "primary.main" },
      "& .MuiListItemText-primary": { color: "primary.main" },
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
