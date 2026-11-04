import { useTranslation } from "react-i18next"
import React, { useState } from "react"
import { FlatSection } from "../paper/Section"
import { FormControl, InputLabel, Select, MenuItem, Grid } from "@mui/material"
import { PreferenceSection } from "./PreferenceSection"
import type { EmailPreference } from "../../features/email/domain/types"
import type { PushPreference } from "../../features/push-notifications/domain/types"

export interface OrganizationPreferenceSelectorProps {
  organizations: Array<{ contractor_id: string; name: string }>
  preferences: Array<{
    contractor_id: string
    preferences: (EmailPreference | PushPreference)[]
  }>
  notificationTypes: Array<{
    id: number
    name: string
    description?: string | null
    action?: string
  }>
  onPreferenceChange: (
    preference: EmailPreference | PushPreference,
    enabled: boolean,
    contractorId: string,
  ) => void
  onBatchPreferenceChange?: (
    updates: Array<{
      preference: EmailPreference | PushPreference
      enabled: boolean
    }>,
    contractorId: string,
  ) => void
  type: "email" | "push"
  isLoading?: boolean
}

/**
 * Organization preference selector - allows selecting an org and configuring its preferences
 */
export function OrganizationPreferenceSelector({
  organizations,
  preferences,
  notificationTypes,
  onPreferenceChange,
  onBatchPreferenceChange,
  type,
  isLoading = false,
}: OrganizationPreferenceSelectorProps) {
  const { t } = useTranslation()
  const [selectedOrgId, setSelectedOrgId] = useState<string>(
    organizations[0]?.contractor_id || "",
  )

  const selectedOrg = organizations.find(
    (o) => o.contractor_id === selectedOrgId,
  )
  const selectedOrgPreferences =
    preferences.find((p) => p.contractor_id === selectedOrgId)?.preferences ||
    []

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <FlatSection title={t("settingsUi.orgNotifications")}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="org-select-label">
                  {t("settingsUi.selectOrg")}
                </InputLabel>
                <Select
                  labelId="org-select-label"
                  value={selectedOrgId}
                  label={t("settingsUi.selectOrg")}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                >
                  {organizations.map((org) => (
                    <MenuItem key={org.contractor_id} value={org.contractor_id}>
                      {org.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </FlatSection>
      </Grid>

      {selectedOrg && (
        <Grid item xs={12}>
          <PreferenceSection
            title={t("settingsUi.notificationsFor", { name: selectedOrg.name })}
            preferences={selectedOrgPreferences}
            notificationTypes={notificationTypes}
            onPreferenceChange={(pref, enabled) =>
              onPreferenceChange(pref, enabled, selectedOrgId)
            }
            onBatchPreferenceChange={
              onBatchPreferenceChange
                ? (updates) => onBatchPreferenceChange(updates, selectedOrgId)
                : undefined
            }
            type={type}
            contractorId={selectedOrgId}
            isLoading={isLoading}
          />
        </Grid>
      )}
    </Grid>
  )
}
