import React, { useState, useEffect } from "react"
import {
  Box,
  Paper,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  IconButton,
  Collapse,
  Divider,
  Chip,
  useMediaQuery,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import SettingsIcon from "@mui/icons-material/Settings"
import CloseIcon from "@mui/icons-material/Close"
import { useFeatureFlag, MarketVersion } from "../../../hooks/market/useFeatureFlag"

/**
 * DebugPanel component for switching between V1 and V2 market experiences
 * 
 * This component provides a debug interface for developers to:
 * - View the current market version (V1 or V2)
 * - Switch between V1 and V2 experiences
 * - Persist panel open/closed state in local storage
 * 
 * The panel is only visible in Vite dev mode or for site admins (see useFeatureFlag).
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */
export function DebugPanel() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const { marketVersion, setMarketVersion, isDeveloper, hasOverride, isLoading } = useFeatureFlag()
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

  // Handle market version change
  const handleVersionChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVersion = event.target.value as MarketVersion
    
    if (newVersion === marketVersion) {
      return // No change needed
    }

    try {
      setIsSwitching(true)
      await setMarketVersion(newVersion)
      // Page will reload automatically after setMarketVersion completes
    } catch (error) {
      console.error("Failed to switch market version:", error)
      setIsSwitching(false)
    }
  }

  // Don't render if user is not a developer
  if (!isDeveloper && !hasOverride) {
    return null
  }

  // Stack above the preferences FAB: same horizontal inset as PreferencesButton,
  // bottom = FAB inset + default Fab height (56px) + gap.
  const fabInset = isMobile ? theme.spacing(10) : theme.spacing(2)
  const debugBottom = `calc(${fabInset} + 56px + ${theme.spacing(1)})`

  return (
    <Box
      sx={{
        position: "absolute",
        right: theme.spacing(2),
        bottom: debugBottom,
        zIndex: theme.zIndex.drawer + 3,
        display: "flex",
        flexDirection: "column-reverse",
        alignItems: "flex-end",
        gap: theme.spacing(1),
        pointerEvents: "none",
      }}
    >
      {/* Debug panel (first in DOM: sits above the toggle when using column-reverse) */}
      <Collapse
        in={isOpen}
        sx={{
          pointerEvents: isOpen ? "auto" : "none",
        }}
      >
        <Paper
          elevation={8}
          sx={{
            width: 320,
            p: 2,
            backgroundColor: theme.palette.background.paper,
            border: `2px solid ${theme.palette.primary.main}`,
            pointerEvents: "auto",
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
              <SettingsIcon color="primary" />
              <Typography variant="h6" component="h2">
                Debug Panel
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={handleTogglePanel}
              aria-label="Close debug panel"
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Current version display */}
          <Box mb={2}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Current Market Version
            </Typography>
            <Chip
              label={marketVersion}
              color={marketVersion === "V2" ? "primary" : "default"}
              sx={{ fontWeight: "bold" }}
            />
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Version selector */}
          <FormControl component="fieldset" fullWidth disabled={isLoading || isSwitching}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Switch Version
            </Typography>
            <RadioGroup
              value={marketVersion}
              onChange={handleVersionChange}
              aria-label="Market version selector"
            >
              <FormControlLabel
                value="V1"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      V1 (Production)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Current stable market system
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="V2"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      V2 (Beta)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      New market with variants & quality tiers
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>

          {/* Switching indicator */}
          {isSwitching && (
            <Box mt={2}>
              <Typography variant="caption" color="primary">
                Switching version... Page will reload.
              </Typography>
            </Box>
          )}

          {/* Developer notice */}
          <Box mt={2} pt={2} borderTop={`1px solid ${theme.palette.divider}`}>
            <Typography variant="caption" color="text.secondary">
              This panel is only visible to developers. Changes will reload the page.
            </Typography>
          </Box>
        </Paper>
      </Collapse>

      {/* Toggle button — anchored just above the preferences FAB; only this captures clicks when closed */}
      {!isOpen && (
        <IconButton
          onClick={handleTogglePanel}
          sx={{
            pointerEvents: "auto",
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            "&:hover": {
              backgroundColor: theme.palette.primary.dark,
            },
            boxShadow: theme.shadows[4],
          }}
          aria-label="Open debug panel"
        >
          <SettingsIcon />
        </IconButton>
      )}
    </Box>
  )
}
