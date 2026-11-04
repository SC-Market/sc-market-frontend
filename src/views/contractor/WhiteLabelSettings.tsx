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
  Delete,
  OpenInNew,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material"
import { Section } from "../../components/paper/Section"
import {
  WHITE_LABEL_TAB_ICONS as ICON_MAP,
  DEFAULT_TAB_ICON as DEFAULT_ICON,
} from "../../features/contractor/components/whiteLabelIcons"
import {
  useWhiteLabelSettings,
  TOGGLEABLE_TABS,
  isExternal,
} from "../../features/contractor/hooks/useWhiteLabelSettings"
import { useTranslation } from "react-i18next"
import { HelpTip } from "../../features/help/components/HelpTip"

/** Catalog keys for the standard sidebar tab labels, by tab key. */
const TAB_LABEL_KEYS: Record<string, string> = {
  market: "sidebar.player_market",
  services: "sidebar.services_short",
  contracts: "sidebar.contracts_short",
  recruiting: "sidebar.recruiting",
  contractors: "sidebar.organizations.title",
}

function IconPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (icon: string) => void
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const { t } = useTranslation()

  return (
    <>
      <Tooltip title={t("orgAdminUi.whiteLabel.chooseIcon")}>
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
    spectrumId,
    config,
    focusMode,
    setFocusMode,
    homepagePath,
    setHomepagePath,
    requireMembership,
    setRequireMembership,
    configSaving,
    handleSaveConfig,
    disabledTabs,
    toggleTab,
    customTabs,
    addCustomTab,
    removeCustomTab,
    updateCustomTabIcon,
    newLabel,
    setNewLabel,
    newPath,
    setNewPath,
    newIcon,
    setNewIcon,
    newPathError,
    sidebarSaving,
    handleSaveSidebar,
    snack,
    setSnack,
  } = useWhiteLabelSettings()
  const { t } = useTranslation()

  return (
    <Grid container spacing={2}>
      <Section title={t("orgAdminUi.whiteLabel.siteSettings")} xs={12}>
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {t("orgAdminUi.whiteLabel.siteAccessHint")}
          </Typography>
          <Select
            inputProps={{ "aria-label": t("orgAdminUi.whiteLabel.siteAccess") }}
            size="small"
            value={focusMode}
            onChange={(e) =>
              setFocusMode(e.target.value as "public" | "internal")
            }
            fullWidth
          >
            <MenuItem value="public">
              {t("orgAdminUi.whiteLabel.accessPublic")}
            </MenuItem>
            <MenuItem value="internal">
              {t("orgAdminUi.whiteLabel.accessInternal")}
            </MenuItem>
          </Select>
        </Grid>
        {/* Only an Internal (login required) site can also require membership. */}
        {focusMode === "internal" && (
          <Grid item xs={12}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <FormControlLabel
                sx={{ mr: 0.5 }}
                control={
                  <Checkbox
                    checked={requireMembership}
                    onChange={(e) => setRequireMembership(e.target.checked)}
                  />
                }
                label={t("orgAdminUi.whiteLabel.requireMembership")}
              />
              <HelpTip
                label={t("orgAdminUi.whiteLabel.requireMembership")}
                title={t("help.tips.requireMembership")}
              />
            </Box>
          </Grid>
        )}
        <Grid item xs={12}>
          <TextField
            label={t("orgAdminUi.whiteLabel.homepagePath")}
            placeholder="/market"
            size="small"
            fullWidth
            value={homepagePath}
            onChange={(e) => setHomepagePath(e.target.value)}
            helperText={t("orgAdminUi.whiteLabel.homepagePathHelper")}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={handleSaveConfig}
            disabled={configSaving}
          >
            {configSaving
              ? t("orgAdminUi.whiteLabel.saving")
              : t("orgAdminUi.whiteLabel.saveSettings")}
          </Button>
        </Grid>
      </Section>

      <Section title={t("orgAdminUi.whiteLabel.sidebarTabs")} xs={12}>
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {t("orgAdminUi.whiteLabel.sidebarTabsHint")}
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
                  primary={
                    TAB_LABEL_KEYS[tab.key]
                      ? t(TAB_LABEL_KEYS[tab.key])
                      : tab.label
                  }
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
            {t("orgAdminUi.whiteLabel.customTabs")}
          </Typography>
          {customTabs.length > 0 && (
            <List dense disablePadding>
              {customTabs.map((ct, i) => (
                <ListItem
                  key={i}
                  secondaryAction={
                    <IconButton
                      aria-label={t("orgAdminUi.whiteLabel.removeTab", {
                        name: ct.label || i + 1,
                      })}
                      edge="end"
                      onClick={() => removeCustomTab(i)}
                    >
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
                            label={t("orgAdminUi.whiteLabel.opensInNewTab")}
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
              label={t("orgAdminUi.whiteLabel.tabLabel")}
              size="small"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              sx={{ flex: 1 }}
            />
            <TextField
              label={t("orgAdminUi.whiteLabel.pathOrUrl")}
              size="small"
              placeholder={t("orgAdminUi.whiteLabel.pathOrUrlPlaceholder")}
              value={newPath}
              onChange={(e) => setNewPath(e.target.value)}
              error={!!newPathError}
              helperText={
                newPathError ??
                (newPath && isExternal(newPath)
                  ? t("orgAdminUi.whiteLabel.willOpenInNewTab")
                  : undefined)
              }
              sx={{ flex: 2 }}
            />
            <Button
              variant="outlined"
              onClick={addCustomTab}
              disabled={!newLabel.trim() || !newPath.trim() || !!newPathError}
              startIcon={<Add />}
              sx={{ whiteSpace: "nowrap", mt: "4px" }}
            >
              {t("orgAdminUi.whiteLabel.add")}
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} sx={{ mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleSaveSidebar}
            disabled={sidebarSaving}
          >
            {sidebarSaving
              ? t("orgAdminUi.whiteLabel.saving")
              : t("orgAdminUi.whiteLabel.saveSidebar")}
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
