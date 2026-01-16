import React from "react"
import { FormControlLabel, Switch, Typography, Box } from "@mui/material"

export interface PreferenceToggleProps {
  actionTypeId: number
  actionName: string
  enabled: boolean
  onChange: (enabled: boolean) => void
  frequency?: "immediate" | "daily" | "weekly"
  digestTime?: string | null
  type: "email" | "push"
}

/**
 * Reusable preference toggle component for email and push notifications
 */
export function PreferenceToggle({
  actionName,
  enabled,
  onChange,
  frequency,
  digestTime,
  type,
}: PreferenceToggleProps) {
  return (
    <FormControlLabel
      control={
        <Switch
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)}
          color="primary"
        />
      }
      label={
        <Box>
          <Typography variant="body2">{actionName}</Typography>
          {type === "email" && frequency && (
            <Typography variant="caption" color="text.secondary">
              Frequency: {frequency}
              {digestTime && ` at ${digestTime}`}
            </Typography>
          )}
        </Box>
      }
      labelPlacement="start"
      sx={{ width: "100%", justifyContent: "space-between" }}
    />
  )
}
