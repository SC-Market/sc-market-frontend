import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material"
import {
  DragHandle,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material"
import { Section } from "../../components/paper/Section"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import {
  useGetWhitelabelConfigQuery,
  useUpdateWhitelabelConfigMutation,
  useGetWhitelabelSidebarQuery,
  useUpdateWhitelabelSidebarMutation,
  SidebarConfigItem,
} from "../../store/api/contractors"

const STANDARD_TABS: { key: string; label: string; protected: boolean }[] = [
  { key: "sc_market_home", label: "SC Market Home", protected: true },
  { key: "market", label: "Market", protected: false },
  { key: "services", label: "Services", protected: false },
  { key: "contracts", label: "Contracts", protected: false },
  { key: "orders_assigned", label: "Orders Assigned", protected: false },
  { key: "messaging", label: "Messaging", protected: false },
  { key: "manage_listings", label: "Manage Listings", protected: false },
  { key: "manage_stock", label: "Manage Stock", protected: false },
  { key: "manage_services", label: "Manage Services", protected: false },
  { key: "availability", label: "Availability", protected: false },
  { key: "recruiting", label: "Recruiting", protected: false },
]

export function WhiteLabelSettings() {
  const [contractor] = useCurrentOrg()
  const spectrumId = contractor?.spectrum_id

  const { data: configRes } = useGetWhitelabelConfigQuery(spectrumId!, {
    skip: !spectrumId,
  })
  const { data: sidebarRes } = useGetWhitelabelSidebarQuery(spectrumId!, {
    skip: !spectrumId,
  })
  const [updateConfig, { isLoading: configSaving }] =
    useUpdateWhitelabelConfigMutation()
  const [updateSidebar, { isLoading: sidebarSaving }] =
    useUpdateWhitelabelSidebarMutation()

  const config = (configRes as any)?.data
  const sidebarItems: SidebarConfigItem[] = (sidebarRes as any)?.data ?? []

  // ── Config form state ──
  const [focusMode, setFocusMode] = useState<"public" | "internal">("public")
  const [homepagePath, setHomepagePath] = useState("")
  const [requireMembership, setRequireMembership] = useState(false)

  useEffect(() => {
    if (config) {
      setFocusMode(config.focus_mode ?? "public")
      setHomepagePath(config.homepage_path ?? "")
      setRequireMembership(config.require_membership ?? false)
    }
  }, [config])

  // ── Sidebar form state ──
  const [tabs, setTabs] = useState<
    { key: string; label: string; enabled: boolean; protected: boolean }[]
  >([])

  useEffect(() => {
    // Merge saved sidebar config with the standard tabs list
    const saved = new Map(
      sidebarItems
        .filter((i) => i.standard_tab_key)
        .map((i) => [i.standard_tab_key!, i]),
    )
    setTabs(
      STANDARD_TABS.map((t) => {
        const s = saved.get(t.key)
        return {
          key: t.key,
          label: t.label,
          enabled: s ? s.enabled : true,
          protected: t.protected,
        }
      }),
    )
  }, [sidebarItems])

  const [snack, setSnack] = useState<string | null>(null)

  const handleSaveConfig = useCallback(async () => {
    if (!spectrumId) return
    try {
      await updateConfig({
        spectrum_id: spectrumId,
        focus_mode: focusMode,
        homepage_path: homepagePath || null,
        require_membership: requireMembership,
      }).unwrap()
      setSnack("Settings saved")
    } catch {
      setSnack("Failed to save settings")
    }
  }, [spectrumId, focusMode, homepagePath, requireMembership, updateConfig])

  const handleSaveSidebar = useCallback(async () => {
    if (!spectrumId) return
    try {
      await updateSidebar({
        spectrum_id: spectrumId,
        items: tabs.map((t, i) => ({
          standard_tab_key: t.key,
          custom_label: null,
          custom_path: null,
          custom_icon: null,
          is_external: false,
          enabled: t.enabled,
          sort_order: i,
        })),
      }).unwrap()
      setSnack("Sidebar saved")
    } catch {
      setSnack("Failed to save sidebar")
    }
  }, [spectrumId, tabs, updateSidebar])

  const toggleTab = (key: string) => {
    setTabs((prev) =>
      prev.map((t) =>
        t.key === key && !t.protected ? { ...t, enabled: !t.enabled } : t,
      ),
    )
  }

  return (
    <Grid container spacing={2}>
      <Section title="Focus Mode" xs={12}>
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Controls who can access your white-label site.
          </Typography>
          <Select
            size="small"
            value={focusMode}
            onChange={(e) =>
              setFocusMode(e.target.value as "public" | "internal")
            }
            fullWidth
          >
            <MenuItem value="public">
              Public — anyone can browse
            </MenuItem>
            <MenuItem value="internal">
              Internal — login required
            </MenuItem>
          </Select>
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={requireMembership}
                onChange={(e) => setRequireMembership(e.target.checked)}
              />
            }
            label="Require org membership to access"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Homepage path"
            placeholder="/market"
            size="small"
            fullWidth
            value={homepagePath}
            onChange={(e) => setHomepagePath(e.target.value)}
            helperText="Custom landing page path. Leave blank for default."
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={handleSaveConfig}
            disabled={configSaving}
          >
            {configSaving ? "Saving…" : "Save Settings"}
          </Button>
        </Grid>
      </Section>

      <Section title="Sidebar Tabs" xs={12}>
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Toggle which sidebar tabs are visible on your white-label site.
            Protected tabs cannot be disabled.
          </Typography>
          <List dense>
            {tabs.map((tab) => (
              <ListItem
                key={tab.key}
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={() => toggleTab(tab.key)}
                    disabled={tab.protected}
                  >
                    {tab.enabled ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                }
              >
                <ListItemText
                  primary={tab.label}
                  secondary={tab.protected ? "Protected — always visible" : undefined}
                  sx={{ opacity: tab.enabled ? 1 : 0.5 }}
                />
              </ListItem>
            ))}
          </List>
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={handleSaveSidebar}
            disabled={sidebarSaving}
          >
            {sidebarSaving ? "Saving…" : "Save Sidebar"}
          </Button>
        </Grid>
      </Section>

      <Snackbar
        open={!!snack}
        autoHideDuration={3000}
        onClose={() => setSnack(null)}
        message={snack}
      />
    </Grid>
  )
}
