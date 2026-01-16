import React, { useState } from "react"
import { FlatSection } from "../paper/Section"
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Grid,
} from "@mui/material"
import { PreferenceSection } from "./PreferenceSection"
import { EmailPreference } from "../../store/email"
import { PushPreference } from "../../store/push-notifications"

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
  type,
  isLoading = false,
}: OrganizationPreferenceSelectorProps) {
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
    <>
      <FlatSection title="Organization Notifications">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="org-select-label">Select Organization</InputLabel>
              <Select
                labelId="org-select-label"
                value={selectedOrgId}
                label="Select Organization"
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

      {selectedOrg && (
        <PreferenceSection
          title={`Notifications for ${selectedOrg.name}`}
          preferences={selectedOrgPreferences}
          notificationTypes={notificationTypes}
          onPreferenceChange={(pref, enabled) =>
            onPreferenceChange(pref, enabled, selectedOrgId)
          }
          type={type}
          contractorId={selectedOrgId}
          isLoading={isLoading}
        />
      )}
    </>
  )
}
