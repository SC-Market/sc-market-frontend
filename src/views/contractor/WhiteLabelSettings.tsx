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
  ListItemIcon,
  ListItemText,
  MenuItem,
  Popover,
  Select,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material"
import {
  Add,
  AssignmentRounded,
  AttachMoneyRounded,
  BusinessRounded,
  CalendarMonthRounded,
  CreateRounded,
  DashboardCustomizeRounded,
  DashboardRounded,
  Delete,
  DesignServicesRounded,
  FolderOpenRounded,
  ForumRounded,
  GavelRounded,
  HomeRounded,
  InfoRounded,
  InventoryRounded,
  LinkRounded,
  ListAltRounded,
  LocalShipping,
  ManageAccountsRounded,
  OpenInNew,
  PaidRounded,
  PersonAddRounded,
  RequestQuoteRounded,
  SecurityRounded,
  SettingsRounded,
  ShieldRounded,
  StarRounded,
  StoreRounded,
  ToggleOnRounded,
  Visibility,
  VisibilityOff,
  WarehouseRounded,
  PublicRounded,
  BookRounded,
  HelpRounded,
  MapRounded,
  NotificationsRounded,
  PhotoCameraRounded,
  RocketLaunchRounded,
  ScienceRounded,
  WorkRounded,
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

// ── Icon registry ──────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ReactElement> = {
  home: <HomeRounded />,
  store: <StoreRounded />,
  dashboard: <DashboardRounded />,
  customize: <DashboardCustomizeRounded />,
  forum: <ForumRounded />,
  gavel: <GavelRounded />,
  assignment: <AssignmentRounded />,
  paid: <PaidRounded />,
  create: <CreateRounded />,
  business: <BusinessRounded />,
  settings: <SettingsRounded />,
  money: <AttachMoneyRounded />,
  folder: <FolderOpenRounded />,
  shipping: <LocalShipping />,
  calendar: <CalendarMonthRounded />,
  design: <DesignServicesRounded />,
  inventory: <InventoryRounded />,
  list: <ListAltRounded />,
  accounts: <ManageAccountsRounded />,
  recruit: <PersonAddRounded />,
  quote: <RequestQuoteRounded />,
  shield: <ShieldRounded />,
  warehouse: <WarehouseRounded />,
  security: <SecurityRounded />,
  star: <StarRounded />,
  toggle: <ToggleOnRounded />,
  link: <LinkRounded />,
  info: <InfoRounded />,
  public: <PublicRounded />,
  book: <BookRounded />,
  help: <HelpRounded />,
  map: <MapRounded />,
  notifications: <NotificationsRounded />,
  camera: <PhotoCameraRounded />,
  rocket: <RocketLaunchRounded />,
  science: <ScienceRounded />,
  work: <WorkRounded />,
}

const DEFAULT_ICON = "link"

function IconPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (icon: string) => void
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  return (
    <>
      <Tooltip title="Choose icon">
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
          {ICON_MAP[value] || ICON_MAP[DEFAULT_ICON]}
        </IconButton>
      </Tooltip>
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: 0.5,
            p: 1,
            maxWidth: 280,
          }}
        >
          {Object.entries(ICON_MAP).map(([key, icon]) => (
            <IconButton
              key={key}
              size="small"
              onClick={() => {
                onChange(key)
                setAnchorEl(null)
              }}
              color={key === value ? "primary" : "default"}
              sx={{
                border: key === value ? 1 : 0,
                borderColor: "primary.main",
              }}
            >
              {icon}
            </IconButton>
          ))}
        </Box>
      </Popover>
    </>
  )
}

// ── Tab definitions ────────────────────────────────────────────────────
const TOGGLEABLE_TABS = [
  { key: "market", label: "Player Market" },
  { key: "services", label: "Services" },
  { key: "contracts", label: "Contracts" },
  { key: "recruiting", label: "Recruiting" },
  { key: "contractors", label: "Organizations" },
] as const

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
  icon: string
}

// ── Component ──────────────────────────────────────────────────────────
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

  useEffect(() => {
    if (config) {
      setFocusMode(config.focus_mode ?? "public")
      setHomepagePath(config.homepage_path ?? "")
      setRequireMembership(config.require_membership ?? false)
    }
  }, [config])

  // ── Sidebar state ──
  const [disabledTabs, setDisabledTabs] = useState<Set<string>>(new Set())
  const [customTabs, setCustomTabs] = useState<CustomTab[]>([])
  const [newLabel, setNewLabel] = useState("")
  const [newPath, setNewPath] = useState("")
  const [newIcon, setNewIcon] = useState(DEFAULT_ICON)

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
          icon: item.custom_icon || DEFAULT_ICON,
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
    updateConfig,
  ])

  const handleSaveSidebar = useCallback(async () => {
    if (!spectrumId) return
    try {
      const items: SidebarConfigItem[] = []
      let order = 0

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

      for (const ct of customTabs) {
        items.push({
          standard_tab_key: null,
          custom_label: ct.label,
          custom_path: ct.path,
          custom_icon: ct.icon,
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
    setCustomTabs((prev) => [...prev, { label, path, icon: newIcon }])
    setNewLabel("")
    setNewPath("")
    setNewIcon(DEFAULT_ICON)
  }

  const removeCustomTab = (index: number) => {
    setCustomTabs((prev) => prev.filter((_, i) => i !== index))
  }

  const updateCustomTabIcon = (index: number, icon: string) => {
    setCustomTabs((prev) =>
      prev.map((t, i) => (i === index ? { ...t, icon } : t)),
    )
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
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <IconPicker
                      value={ct.icon}
                      onChange={(icon) => updateCustomTabIcon(i, icon)}
                    />
                  </ListItemIcon>
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
            <IconPicker value={newIcon} onChange={setNewIcon} />
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
