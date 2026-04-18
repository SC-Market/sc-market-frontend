import React, { useCallback, useEffect, useState } from "react"
import {
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material"
import {
  Add,
  Delete,
  OpenInNew,
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

// Tabs that can be toggled off — public/browsable features only
const TOGGLEABLE_TABS = [
  { key: "market", label: "Player Market" },
  { key: "services", label: "Services" },
  { key: "contracts", label: "Contracts" },
  { key: "recruiting", label: "Recruiting" },
  { key: "contractors", label: "Organizations" },
] as const

// Always-on tabs — not shown in the UI at all
const ALWAYS_ON_KEYS = [
  "sc_market_home",
  "orders_assigned",
  "messaging",
  "manage_listings",
  "manage_stock",
  "manage_services",
  "availability",
]

function isExternal(path: string) {
  return path.startsWith("http://") || path.startsWith("https://")
}

interface CustomTab {
  label: string
  path: string
}

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

  // ── Config state ──
  const [focusMode, setFocusMode] = useState<"public" | "internal">("public")
  const [homepagePath, setHomepagePath] = useState("")
  const [requireMembership, setRequireMembership] = useState(false)
  const [drawerStyle, setDrawerStyle] = useState<"elevation" | "outlined">(
    "elevation",
  )

  useEffect(() => {
    if (config) {
      setFocusMode(config.focus_mode ?? "public")
      setHomepagePath(config.homepage_path ?? "")
      setRequireMembership(config.require_membership ?? false)
      setDrawerStyle(config.drawer_style ?? "elevation")
    }
  }, [config])

  // ── Sidebar state ──
  const [disabledTabs, setDisabledTabs] = useState<Set<string>>(new Set())
  const [customTabs, setCustomTabs] = useState<CustomTab[]>([])
  const [newLabel, setNewLabel] = useState("")
  const [newPath, setNewPath] = useState("")

  useEffect(() => {
    const disabled = new Set<string>()
    const custom: CustomTab[] = []
    for (const item of sidebarItems) {
      if (item.standard_tab_key && !item.enabled) {
        disabled.add(item.standard_tab_key)
      }
      if (!item.standard_tab_key && item.custom_path) {
        custom.push({
          label: item.custom_label ?? "",
          path: item.custom_path,
        })
      }
    }
    setDisabledTabs(disabled)
    setCustomTabs(custom)
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
        drawer_style: drawerStyle,
      }).unwrap()
      setSnack("Settings saved")
    } catch {
      setSnack("Failed to save settings")
    }
  }, [
    spectrumId,
    focusMode,
    homepagePath,
    requireMembership,
    drawerStyle,
    updateConfig,
  ])

  const handleSaveSidebar = useCallback(async () => {
    if (!spectrumId) return
    try {
      const items: SidebarConfigItem[] = []
      let order = 0

      // Always-on tabs (silent)
      for (const key of ALWAYS_ON_KEYS) {
        items.push({
          standard_tab_key: key,
          custom_label: null,
          custom_path: null,
          custom_icon: null,
          is_external: false,
          enabled: true,
          sort_order: order++,
        })
      }

      // Toggleable tabs
      for (const t of TOGGLEABLE_TABS) {
        items.push({
          standard_tab_key: t.key,
          custom_label: null,
          custom_path: null,
          custom_icon: null,
          is_external: false,
          enabled: !disabledTabs.has(t.key),
          sort_order: order++,
        })
      }

      // Custom tabs
      for (const ct of customTabs) {
        items.push({
          standard_tab_key: null,
          custom_label: ct.label,
          custom_path: ct.path,
          custom_icon: null,
          is_external: isExternal(ct.path),
          enabled: true,
          sort_order: order++,
        })
      }

      await updateSidebar({ spectrum_id: spectrumId, items }).unwrap()
      setSnack("Sidebar saved")
    } catch {
      setSnack("Failed to save sidebar")
    }
  }, [spectrumId, disabledTabs, customTabs, updateSidebar])

  const toggleTab = (key: string) => {
    setDisabledTabs((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const addCustomTab = () => {
    const label = newLabel.trim()
    const path = newPath.trim()
    if (!label || !path) return
    setCustomTabs((prev) => [...prev, { label, path }])
    setNewLabel("")
    setNewPath("")
  }

  const removeCustomTab = (index: number) => {
    setCustomTabs((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <Grid container spacing={2}>
      <Section title="Site Settings" xs={12}>
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
            <MenuItem value="public">Public — anyone can browse</MenuItem>
            <MenuItem value="internal">Internal — login required</MenuItem>
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
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Drawer style for the navigation sidebar and panels.
          </Typography>
          <Select
            size="small"
            value={drawerStyle}
            onChange={(e) =>
              setDrawerStyle(e.target.value as "elevation" | "outlined")
            }
            fullWidth
          >
            <MenuItem value="elevation">Elevation — shadow depth</MenuItem>
            <MenuItem value="outlined">Outlined — border</MenuItem>
          </Select>
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
            Toggle which public-facing tabs appear in the sidebar.
          </Typography>
          <List dense disablePadding>
            {TOGGLEABLE_TABS.map((tab) => (
              <ListItem
                key={tab.key}
                secondaryAction={
                  <IconButton edge="end" onClick={() => toggleTab(tab.key)}>
                    {disabledTabs.has(tab.key) ? (
                      <VisibilityOff />
                    ) : (
                      <Visibility color="primary" />
                    )}
                  </IconButton>
                }
              >
                <ListItemText
                  primary={tab.label}
                  sx={{ opacity: disabledTabs.has(tab.key) ? 0.5 : 1 }}
                />
              </ListItem>
            ))}
          </List>
        </Grid>

        <Grid item xs={12}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ mt: 1, mb: 1 }}
          >
            Custom Tabs
          </Typography>
          {customTabs.length > 0 && (
            <List dense disablePadding>
              {customTabs.map((ct, i) => (
                <ListItem
                  key={i}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => removeCustomTab(i)}>
                      <Delete />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        {ct.label}
                        {isExternal(ct.path) && (
                          <Chip
                            icon={<OpenInNew sx={{ fontSize: 14 }} />}
                            label="Opens in new tab"
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                    secondary={ct.path}
                  />
                </ListItem>
              ))}
            </List>
          )}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              mt: 1,
              alignItems: "flex-start",
            }}
          >
            <TextField
              label="Label"
              size="small"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Path or URL"
              size="small"
              placeholder="/custom-page or https://..."
              value={newPath}
              onChange={(e) => setNewPath(e.target.value)}
              helperText={
                newPath && isExternal(newPath)
                  ? "Will open in a new tab"
                  : undefined
              }
              sx={{ flex: 2 }}
            />
            <Button
              variant="outlined"
              onClick={addCustomTab}
              disabled={!newLabel.trim() || !newPath.trim()}
              startIcon={<Add />}
              sx={{ whiteSpace: "nowrap", mt: "4px" }}
            >
              Add
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} sx={{ mt: 2 }}>
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
