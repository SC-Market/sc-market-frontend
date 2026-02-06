import React from "react"
import { FlatSection } from "../paper/Section"
import { Grid, Typography, CircularProgress, Button, Box } from "@mui/material"
import { PreferenceToggle } from "./PreferenceToggle"
import type { EmailPreference } from "../../features/email/domain/types"
import type { PushPreference } from "../../features/push-notifications/domain/types"

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
  onBatchPreferenceChange?: (
    preferences: Array<{
      preference: EmailPreference | PushPreference
      enabled: boolean
    }>,
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
  onBatchPreferenceChange,
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
    const batchUpdates: Array<{
      preference: EmailPreference | PushPreference
      enabled: boolean
    }> = []

    notificationTypes.forEach((typeItem) => {
      const existingPreference = preferences.find((pref) => {
        if (type === "email") {
          return (pref as EmailPreference).action_type_id === typeItem.id
        } else {
          const actionString = typeItem.action
          if (actionString) {
            return (pref as PushPreference).action === actionString
          }
          return false
        }
      })

      if (existingPreference) {
        batchUpdates.push({ preference: existingPreference, enabled: false })
      } else {
        // Create new preference object with enabled: false
        if (type === "email") {
          batchUpdates.push({
            preference: {
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
            enabled: false,
          })
        } else {
          const actionString = typeItem.action
          if (actionString) {
            batchUpdates.push({
              preference: {
                action: actionString,
                enabled: false,
                contractor_id: contractorId ?? null,
              } as PushPreference,
              enabled: false,
            })
          }
        }
      }
    })

    // Use batch update if available, otherwise fall back to individual updates
    if (onBatchPreferenceChange && batchUpdates.length > 0) {
      onBatchPreferenceChange(batchUpdates)
    } else {
      batchUpdates.forEach(({ preference, enabled }) => {
        onPreferenceChange(preference, enabled)
      })
    }
  }

  const handleTurnAllOn = () => {
    const batchUpdates: Array<{
      preference: EmailPreference | PushPreference
      enabled: boolean
    }> = []

    notificationTypes.forEach((typeItem) => {
      const existingPreference = preferences.find((pref) => {
        if (type === "email") {
          return (pref as EmailPreference).action_type_id === typeItem.id
        } else {
          const actionString = typeItem.action
          if (actionString) {
            return (pref as PushPreference).action === actionString
          }
          return false
        }
      })

      if (existingPreference) {
        batchUpdates.push({ preference: existingPreference, enabled: true })
      } else {
        // Create new preference object with enabled: true
        if (type === "email") {
          batchUpdates.push({
            preference: {
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
            enabled: true,
          })
        } else {
          const actionString = typeItem.action
          if (actionString) {
            batchUpdates.push({
              preference: {
                action: actionString,
                enabled: true,
                contractor_id: contractorId ?? null,
              } as PushPreference,
              enabled: true,
            })
          }
        }
      }
    })

    // Use batch update if available, otherwise fall back to individual updates
    if (onBatchPreferenceChange && batchUpdates.length > 0) {
      onBatchPreferenceChange(batchUpdates)
    } else {
      batchUpdates.forEach(({ preference, enabled }) => {
        onPreferenceChange(preference, enabled)
      })
    }
  }

  const hasAnyEnabled =
    preferences.some((pref) => pref.enabled) ||
    notificationTypes.some((typeItem) => {
      const existingPreference = preferences.find((pref) => {
        if (type === "email") {
          return (pref as EmailPreference).action_type_id === typeItem.id
        } else {
          const actionString = typeItem.action
          return (
            actionString && (pref as PushPreference).action === actionString
          )
        }
      })
      // If no preference exists, check default (push defaults to enabled)
      return existingPreference ? existingPreference.enabled : type === "push"
    })

  const hasAnyDisabled =
    preferences.some((pref) => !pref.enabled) ||
    notificationTypes.some((typeItem) => {
      const existingPreference = preferences.find((pref) => {
        if (type === "email") {
          return (pref as EmailPreference).action_type_id === typeItem.id
        } else {
          const actionString = typeItem.action
          return (
            actionString && (pref as PushPreference).action === actionString
          )
        }
      })
      // If no preference exists, check default (email defaults to disabled)
      return existingPreference ? !existingPreference.enabled : type === "email"
    })

  return (
    <FlatSection title={title}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
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
            // Must match both action and contractor_id to avoid cross-contamination
            const existingPreference = preferences.find((pref) => {
              if (type === "email") {
                const emailPref = pref as EmailPreference
                const matchesAction = emailPref.action_type_id === typeItem.id
                const matchesContractor =
                  contractorId === null || contractorId === undefined
                    ? emailPref.contractor_id === null ||
                      emailPref.contractor_id === undefined
                    : emailPref.contractor_id === contractorId
                return matchesAction && matchesContractor
              } else {
                // For push, match by action string and contractor_id
                const pushPref = pref as PushPreference & {
                  contractor_id?: string | null
                }
                const actionString = typeItem.action
                if (actionString) {
                  const matchesAction = pushPref.action === actionString
                  const matchesContractor =
                    contractorId === null || contractorId === undefined
                      ? pushPref.contractor_id === null ||
                        pushPref.contractor_id === undefined
                      : pushPref.contractor_id === contractorId
                  return matchesAction && matchesContractor
                }
                return false
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
                        const actionString = typeItem.action
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
