import React from "react"
import { useTranslation } from "react-i18next"

import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

export function SkipNavigation() {
  const { t } = useTranslation()

  const handleSkipToMain = () => {
    const mainContent =
      document.querySelector("main") || document.querySelector("#main-content")
    if (mainContent) {
      mainContent.focus()
      mainContent.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleSkipToNav = () => {
    const navigation =
      document.querySelector("nav") || document.querySelector("#navbar")
    if (navigation) {
      navigation.focus()
      navigation.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <Box
      sx={{
        position: "absolute",
        top: "-40px",
        left: "6px",
        zIndex: 9999,
        "&:focus-within": {
          top: "6px",
        },
      }}
    >
      <Button
        onClick={handleSkipToMain}
        variant="contained"
        size="small"
        sx={{
          mr: 1,
          backgroundColor: "primary.main",
          color: "primary.contrastText",
          "&:focus": {
            outline: "2px solid",
            outlineColor: "primary.main",
            outlineOffset: "2px",
          },
        }}
        aria-label={t(
          "accessibility.skipToMainContent",
          "Skip to main content",
        )}
      >
        {t("accessibility.skipToMainContent", "Skip to main content")}
      </Button>
      <Button
        onClick={handleSkipToNav}
        variant="contained"
        size="small"
        sx={{
          backgroundColor: "secondary.main",
          color: "secondary.contrastText",
          "&:focus": {
            outline: "2px solid",
            outlineColor: "secondary.main",
            outlineOffset: "2px",
          },
        }}
        aria-label={t("accessibility.skipToNavigation", "Skip to navigation")}
      >
        {t("accessibility.skipToNavigation", "Skip to navigation")}
      </Button>
    </Box>
  )
}
