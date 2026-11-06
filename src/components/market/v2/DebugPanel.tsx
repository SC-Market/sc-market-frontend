import React, { useState, useEffect } from "react"
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Collapse,
  Divider,
  Stack,
  Switch,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import BugReportIcon from "@mui/icons-material/BugReportRounded"
import CloseIcon from "@mui/icons-material/CloseRounded"
import { useFeatureFlag } from "../../../hooks/market/useFeatureFlag"
import { useTranslation } from "react-i18next"

/** Flags fully rolled out + cleaned up — hidden from the toggle menu even if the
 * backend still returns their config rows. */
const RETIRED_FLAGS = new Set(["market_v2", "crafting", "nav_v2", "wiki"])

/**
 * DebugPanel: lets developers toggle feature flags for themselves.
 *
 * - Lists every live flag (retired ones are hidden) with its override state
 * - Toggling a flag persists it server-side and reloads the page
 * - Persists panel open/closed state in local storage
 *
 * The panel is only visible in Vite dev mode or for site admins (see useFeatureFlag).
 */
export function DebugPanel() {
  const { t } = useTranslation()
  const theme = useTheme()
  const { isDeveloper, hasOverride, flags, overriddenFlags, setFlag } =
    useFeatureFlag()
  const [isOpen, setIsOpen] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)

  // Load panel open/closed state from local storage on mount
  useEffect(() => {
    const storedState = localStorage.getItem("debug_panel_open")
    if (storedState === "true") {
      setIsOpen(true)
    }
  }, [])

  // Persist panel open/closed state to local storage
  const handleTogglePanel = () => {
    const newState = !isOpen
    setIsOpen(newState)
    localStorage.setItem("debug_panel_open", String(newState))
  }

  // Don't render if user is not a developer or override user
  if (!isDeveloper && !hasOverride) {
    return null
  }

  // Rendered inside FloatingActions (Root): the panel and its toggle are
  // in-flow children of that column, so they stack above the page-settings
  // FAB instead of carrying their own offsets.
  return (
    <>
      {/* Unmounted when closed so the column's gap doesn't count it */}
      <Collapse in={isOpen} unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            width: 320,
            maxWidth: "100%",
            p: 2,
            backgroundColor: theme.palette.background.paper,
            border: `2px solid ${theme.palette.primary.main}`,
          }}
        >
          {/* Header */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <BugReportIcon color="primary" />
              <Typography variant="h6" component="h2">
                {t("marketUi.debugPanel.title")}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={handleTogglePanel}
              aria-label={t("marketUi.debugPanel.close")}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Current version display */}
          <Box mb={2}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t("marketUi.debugPanel.featureFlags")}
            </Typography>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Flag toggles — retired flags (fully rolled out) are hidden */}
          <Stack spacing={1.5}>
            {Object.entries(flags)
              .filter(([flagName]) => !RETIRED_FLAGS.has(flagName))
              .map(([flagName, enabled]) => {
                const isOverridden = overriddenFlags.includes(flagName)
                const label = flagName
                  .replace(/_/g, " ")
                  .replace(/\bv2\b/i, "V2")
                return (
                  <Box
                    key={flagName}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        sx={{ textTransform: "capitalize" }}
                      >
                        {label}
                      </Typography>
                      {isOverridden && (
                        <Typography variant="caption" color="primary">
                          {t("marketUi.debugPanel.override")}
                        </Typography>
                      )}
                    </Box>
                    <Switch
                      inputProps={{ "aria-label": label }}
                      checked={enabled}
                      onChange={async () => {
                        setIsSwitching(true)
                        await setFlag(flagName, !enabled)
                        setIsSwitching(false)
                        window.location.reload()
                      }}
                      disabled={isSwitching}
                      size="small"
                      color="primary"
                    />
                  </Box>
                )
              })}
          </Stack>

          {/* Switching indicator */}
          {isSwitching && (
            <Box mt={2}>
              <Typography variant="caption" color="primary">
                {t("marketUi.debugPanel.updating")}
              </Typography>
            </Box>
          )}

          {/* Developer notice */}
          <Box mt={2} pt={2} borderTop={`1px solid ${theme.palette.divider}`}>
            <Typography variant="caption" color="text.secondary">
              {t("marketUi.debugPanel.notice")}
            </Typography>
          </Box>
        </Paper>
      </Collapse>

      {/* Toggle button: a bug icon, so it doesn't read as a second settings gear */}
      {!isOpen && (
        <IconButton
          onClick={handleTogglePanel}
          sx={{
            // Centred over the wider page-settings FAB below it
            alignSelf: "center",
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            "&:hover": {
              backgroundColor: theme.palette.primary.dark,
            },
            boxShadow: theme.shadows[4],
          }}
          aria-label={t("marketUi.debugPanel.open")}
        >
          <BugReportIcon />
        </IconButton>
      )}
    </>
  )
}
