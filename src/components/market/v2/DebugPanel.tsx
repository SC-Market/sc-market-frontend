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
  const { marketVersion, setMarketVersion, isDeveloper, isLoading } = useFeatureFlag()
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
  if (!isDeveloper) {
    return null
  }

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: theme.zIndex.modal - 1,
      }}
    >
      {/* Toggle button */}
      {!isOpen && (
        <IconButton
          onClick={handleTogglePanel}
          sx={{
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

      {/* Debug panel */}
      <Collapse in={isOpen}>
        <Paper
          elevation={8}
          sx={{
            width: 320,
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
    </Box>
  )
}
