import React, { useState } from "react"
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
import type { SidebarConfigItem } from "../../store/api/contractors"
import { useWhiteLabelSettings, TOGGLEABLE_TABS, isExternal, type CustomTab } from "../../features/contractor/hooks/useWhiteLabelSettings"

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
export function WhiteLabelSettings() {
  const {
    spectrumId, config,
    focusMode, setFocusMode, homepagePath, setHomepagePath, requireMembership, setRequireMembership,
    configSaving, handleSaveConfig,
    disabledTabs, toggleTab,
    customTabs, addCustomTab, removeCustomTab, updateCustomTabIcon,
    newLabel, setNewLabel, newPath, setNewPath, newIcon, setNewIcon,
    sidebarSaving, handleSaveSidebar,
    snack, setSnack,
  } = useWhiteLabelSettings()

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
