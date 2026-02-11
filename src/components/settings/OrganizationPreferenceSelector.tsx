import React, { useState } from "react"
import { FlatSection } from "../paper/Section"
import { PreferenceSection } from "./PreferenceSection"
import type { EmailPreference } from "../../features/email/domain/types"
import type { PushPreference } from "../../features/push-notifications/domain/types"

import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Avatar from '@mui/material/Avatar';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Skeleton from '@mui/material/Skeleton';
import { SkeletonProps } from '@mui/material/SkeletonProps';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import CardActions from '@mui/material/CardActions';
import Chip from '@mui/material/Chip';
import CardActionArea from '@mui/material/CardActionArea';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import SecurityRounded from '@mui/icons-material/SecurityRounded';
import AssignmentTurnedInRounded from '@mui/icons-material/AssignmentTurnedInRounded';
import CableRounded from '@mui/icons-material/CableRounded';
import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded';
import CloudDownloadRounded from '@mui/icons-material/CloudDownloadRounded';
import DashboardCustomizeRounded from '@mui/icons-material/DashboardCustomizeRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import HomeRounded from '@mui/icons-material/HomeRounded';
import InventoryRounded from '@mui/icons-material/InventoryRounded';
import ListAltRounded from '@mui/icons-material/ListAltRounded';
import ManageAccountsRounded from '@mui/icons-material/ManageAccountsRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import RequestQuoteRounded from '@mui/icons-material/RequestQuoteRounded';
import ShieldRounded from '@mui/icons-material/ShieldRounded';
import StoreRounded from '@mui/icons-material/StoreRounded';
import WarehouseRounded from '@mui/icons-material/WarehouseRounded';

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
        <FlatSection title="Organization Notifications">
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="org-select-label">
                  Select Organization
                </InputLabel>
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
      </Grid>

      {selectedOrg && (
        <Grid item xs={12}>
          <PreferenceSection
            title={`Notifications for ${selectedOrg.name}`}
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
