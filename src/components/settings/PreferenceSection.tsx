import React from "react"
import { FlatSection } from "../paper/Section"
import { Grid, Typography, CircularProgress, Button, Box } from "@mui/material"
import { PreferenceToggle } from "./PreferenceToggle"
import { EmailPreference } from "../../store/email"
import { PushPreference } from "../../store/push-notifications"

export interface PreferenceSectionProps {
  title: string
  preferences: (EmailPreference | PushPreference)[]
  notificationTypes: Array<{
    id: number
    name: string
    description?: string | null
    action?: string // For push preferences
  }>
  onPreferenceChange: (
    preference: EmailPreference | PushPreference,
    enabled: boolean,
  ) => void
  type: "email" | "push"
  contractorId?: string | null
  isLoading?: boolean
}

/**
 * Reusable preference section component for displaying notification preferences
 * Used for both individual and organization preferences
 */
export function PreferenceSection({
  title,
  preferences,
  notificationTypes,
  onPreferenceChange,
  type,
  contractorId,
  isLoading = false,
}: PreferenceSectionProps) {
  if (isLoading) {
    return (
      <FlatSection title={title}>
        <Grid item xs={12}>
          <CircularProgress />
        </Grid>
      </FlatSection>
    )
  }

  const handleTurnAllOff = () => {
    notificationTypes.forEach((typeItem) => {
      const existingPreference = preferences.find((pref) => {
        if (type === "email") {
          return (pref as EmailPreference).action_type_id === typeItem.id
        } else {
          const actionString = (typeItem as any).action
          if (actionString) {
            return (pref as PushPreference).action === actionString
          }
          return false
        }
      })

      if (existingPreference) {
        onPreferenceChange(existingPreference, false)
      } else {
        // Create new preference object with enabled: false
        if (type === "email") {
          onPreferenceChange(
            {
              preference_id: "",
              action_type_id: typeItem.id,
              action_name: typeItem.name,
              enabled: false,
              frequency: "immediate",
              digest_time: null,
              created_at: "",
              updated_at: "",
              contractor_id: contractorId ?? null,
            } as EmailPreference,
            false,
          )
        } else {
          const actionString = (typeItem as any).action
          if (actionString) {
            onPreferenceChange(
              {
                action: actionString,
                enabled: false,
              } as PushPreference,
              false,
            )
          }
        }
      }
    })
  }

  const handleTurnAllOn = () => {
    notificationTypes.forEach((typeItem) => {
      const existingPreference = preferences.find((pref) => {
        if (type === "email") {
          return (pref as EmailPreference).action_type_id === typeItem.id
        } else {
          const actionString = (typeItem as any).action
          if (actionString) {
            return (pref as PushPreference).action === actionString
          }
          return false
        }
      })

      if (existingPreference) {
        onPreferenceChange(existingPreference, true)
      } else {
        // Create new preference object with enabled: true
        if (type === "email") {
          onPreferenceChange(
            {
              preference_id: "",
              action_type_id: typeItem.id,
              action_name: typeItem.name,
              enabled: true,
              frequency: "immediate",
              digest_time: null,
              created_at: "",
              updated_at: "",
              contractor_id: contractorId ?? null,
            } as EmailPreference,
            true,
          )
        } else {
          const actionString = (typeItem as any).action
          if (actionString) {
            onPreferenceChange(
              {
                action: actionString,
                enabled: true,
              } as PushPreference,
              true,
            )
          }
        }
      }
    })
  }

  const hasAnyEnabled = preferences.some((pref) => pref.enabled) || 
    notificationTypes.some((typeItem) => {
      const existingPreference = preferences.find((pref) => {
        if (type === "email") {
          return (pref as EmailPreference).action_type_id === typeItem.id
        } else {
          const actionString = (typeItem as any).action
          return actionString && (pref as PushPreference).action === actionString
        }
      })
      // If no preference exists, check default (push defaults to enabled)
      return existingPreference ? existingPreference.enabled : (type === "push")
    })

  const hasAnyDisabled = preferences.some((pref) => !pref.enabled) ||
    notificationTypes.some((typeItem) => {
      const existingPreference = preferences.find((pref) => {
        if (type === "email") {
          return (pref as EmailPreference).action_type_id === typeItem.id
        } else {
          const actionString = (typeItem as any).action
          return actionString && (pref as PushPreference).action === actionString
        }
      })
      // If no preference exists, check default (email defaults to disabled)
      return existingPreference ? !existingPreference.enabled : (type === "email")
    })

  return (
    <FlatSection title={title}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Choose which types of notifications you want to receive
              {contractorId ? " for this organization" : " individually"}.
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              {hasAnyEnabled && (
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={handleTurnAllOff}
                >
                  Turn All Off
                </Button>
              )}
              {hasAnyDisabled && (
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  onClick={handleTurnAllOn}
                >
                  Turn All On
                </Button>
              )}
            </Box>
          </Box>
        </Grid>

        <Grid container spacing={2} sx={{ mt: 1 }}>
          {notificationTypes.map((typeItem) => {
            // Find existing preference for this action type
            const existingPreference = preferences.find((pref) => {
              if (type === "email") {
                return (pref as EmailPreference).action_type_id === typeItem.id
              } else {
                // For push, match by action string
                // Use the action property if available, otherwise try to derive it
                const actionString = (typeItem as any).action
                if (actionString) {
                  return (pref as PushPreference).action === actionString
                }
                // Fallback: try to match by converting name (less reliable)
                const derivedAction = typeItem.name
                  .toLowerCase()
                  .replace(/\s+/g, "_")
                  .replace(/([a-z])([A-Z])/g, "$1_$2")
                return (pref as PushPreference).action === derivedAction
              }
            })

            const enabled = existingPreference?.enabled ?? type === "push" // Push defaults to enabled, email to disabled

            return (
              <Grid item xs={12} sm={6} key={typeItem.id}>
                <PreferenceToggle
                  actionTypeId={typeItem.id}
                  actionName={typeItem.name}
                  enabled={enabled}
                  onChange={(newEnabled) => {
                    if (existingPreference) {
                      onPreferenceChange(existingPreference, newEnabled)
                    } else {
                      // Create new preference object
                      if (type === "email") {
                        onPreferenceChange(
                          {
                            preference_id: "",
                            action_type_id: typeItem.id,
                            action_name: typeItem.name,
                            enabled: false,
                            frequency: "immediate",
                            digest_time: null,
                            created_at: "",
                            updated_at: "",
                            contractor_id: contractorId ?? null,
                          } as EmailPreference,
                          newEnabled,
                        )
                      } else {
                        // For push, use the action string from typeItem
                        const actionString = (typeItem as any).action
                        if (!actionString) {
                          console.warn(
                            "Missing action string for push preference",
                            typeItem,
                          )
                          return
                        }
                        onPreferenceChange(
                          {
                            action: actionString,
                            enabled: false,
                          } as PushPreference,
                          newEnabled,
                        )
                      }
                    }
                  }}
                  frequency={
                    type === "email"
                      ? (existingPreference as EmailPreference)?.frequency
                      : undefined
                  }
                  digestTime={
                    type === "email"
                      ? (existingPreference as EmailPreference)?.digest_time
                      : undefined
                  }
                  type={type}
                />
              </Grid>
            )
          })}
        </Grid>
      </Grid>
    </FlatSection>
  )
}
