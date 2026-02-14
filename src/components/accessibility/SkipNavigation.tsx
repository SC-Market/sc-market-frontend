import React from "react"
import { Box, Button } from "@mui/material"
import { useTranslation } from "react-i18next"

export interface SkipLink {
  id: string
  label: string
  target: string
}

export interface SkipNavigationProps {
  /**
   * Custom skip links to display. If not provided, default links will be used.
   */
  links?: SkipLink[]
}

/**
 * SkipNavigation provides skip links that allow keyboard users to bypass
 * repetitive navigation and jump directly to important page sections.
 * 
 * Skip links are hidden off-screen by default and become visible when focused,
 * meeting WCAG 2.1 Level A requirement 2.4.1 (Bypass Blocks).
 */
export function SkipNavigation({ links }: SkipNavigationProps) {
  const { t } = useTranslation()

  // Default skip links if none provided
  const defaultLinks: SkipLink[] = [
    {
      id: "skip-main",
      label: t("accessibility.skipToMain", "Skip to main content"),
      target: "main",
    },
    {
      id: "skip-nav",
      label: t("accessibility.skipToNav", "Skip to navigation"),
      target: "nav",
    },
    {
      id: "skip-search",
      label: t("accessibility.skipToSearch", "Skip to search"),
      target: "#search",
    },
    {
      id: "skip-filters",
      label: t("accessibility.skipToFilters", "Skip to filters"),
      target: "#filters",
    },
  ]

  const skipLinks = links || defaultLinks

  /**
   * Handle skip link activation with smooth scrolling and focus management
   */
  const handleSkip = (target: string) => {
    const element = document.querySelector(target)
    if (element) {
      // Make element focusable if not already
      const htmlElement = element as HTMLElement
      if (!htmlElement.hasAttribute("tabindex")) {
        htmlElement.setAttribute("tabindex", "-1")
      }
      
      // Focus the element
      htmlElement.focus()
      
      // Smooth scroll to element
      htmlElement.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <Box
      component="nav"
      aria-label={t("accessibility.skipLinks", "Skip links")}
      sx={{
        position: "absolute",
        top: "-100px",
        left: 0,
        zIndex: 9999,
        "&:focus-within": {
          top: 0,
        },
      }}
    >
      {skipLinks.map((link) => (
        <Button
          key={link.id}
          onClick={() => handleSkip(link.target)}
          variant="contained"
          size="small"
          sx={{
            position: "absolute",
            left: "-9999px",
            mr: 1,
            backgroundColor: "primary.main",
            color: "primary.contrastText",
            "&:focus": {
              position: "static",
              left: 0,
              outline: "2px solid",
              outlineColor: "primary.main",
              outlineOffset: "2px",
            },
          }}
          aria-label={link.label}
        >
          {link.label}
        </Button>
      ))}
    </Box>
  )
}
