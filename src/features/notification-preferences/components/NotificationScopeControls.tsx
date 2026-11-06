import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import { useMuteOrgNotifications } from "../hooks/useNotificationPreferenceActions"
import { useFormatters } from "../../../util/format"
import type {
  NotificationOrgMute,
  NotificationPreferenceScope,
} from "../../../store/api/v2/market"

/** Picks whose notification settings are shown: Personal or one of the orgs. */
export function NotificationScopeSelect({
  scopes,
  scope,
  setScope,
}: {
  scopes: NotificationPreferenceScope[]
  scope: string | null
  setScope: (scope: string | null) => void
}) {
  const { t } = useTranslation()
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        mb: 2,
        flexWrap: "wrap",
      }}
    >
      <FormControl size="small" sx={{ minWidth: 220 }}>
        {/* shrink + displayEmpty: Personal is the "" value, which MUI
                otherwise treats as empty and renders as a blank field */}
        <InputLabel id="notif-scope" shrink>
          {t("settings.notifications.scope", "Settings for")}
        </InputLabel>
        <Select
          labelId="notif-scope"
          label={t("settings.notifications.scope", "Settings for")}
          displayEmpty
          notched
          value={scope ?? ""}
          onChange={(e) =>
            setScope(e.target.value ? String(e.target.value) : null)
          }
          data-testid="notif-scope"
        >
          {scopes.map((s) => (
            <MenuItem
              key={s.contractor_id ?? "personal"}
              value={s.contractor_id ?? ""}
            >
              {s.contractor_id
                ? s.name
                : t("settings.notifications.personal", "Personal")}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Typography variant="caption" color="text.primary">
        {t(
          "settings.notifications.scopeHint",
          "Org work has its own settings for each org.",
        )}
      </Typography>
    </Box>
  )
}

/** Mutes push, email and Discord DMs from the selected org. */
export function OrgMuteControl({
  mute,
  scopeName,
  busy,
  setMute,
}: {
  mute: NotificationOrgMute
  scopeName: string | undefined
  busy: boolean
  setMute: ReturnType<typeof useMuteOrgNotifications>["setMute"]
}) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        mb: 2,
        flexWrap: "wrap",
      }}
      data-testid="notif-org-mute"
    >
      <FormControl size="small" sx={{ minWidth: 220 }}>
        <InputLabel id="notif-mute">
          {t("settings.notifications.mute.label", "Mute this org")}
        </InputLabel>
        <Select
          labelId="notif-mute"
          label={t("settings.notifications.mute.label", "Mute this org")}
          value={mute.muted ? (mute.until ? "timed" : "on") : "off"}
          disabled={busy}
          onChange={(e) =>
            setMute(e.target.value as "off" | "8h" | "1w" | "on")
          }
          data-testid="notif-mute"
        >
          <MenuItem value="off">
            {t("settings.notifications.mute.off", "Not muted")}
          </MenuItem>
          <MenuItem value="8h">
            {t("settings.notifications.mute.8h", "For 8 hours")}
          </MenuItem>
          <MenuItem value="1w">
            {t("settings.notifications.mute.1w", "For 1 week")}
          </MenuItem>
          <MenuItem value="on">
            {t("settings.notifications.mute.on", "Until I turn it back on")}
          </MenuItem>
          {mute.until && (
            <MenuItem value="timed" disabled>
              {t("settings.notifications.mute.until", {
                defaultValue: "Muted until {{time}}",
                time: fmt.dateTime(mute.until),
              })}
            </MenuItem>
          )}
        </Select>
      </FormControl>
      <Typography variant="caption" color="text.primary">
        {mute.muted
          ? t("settings.notifications.mute.active", {
              defaultValue:
                "No push, email or Discord DMs from {{org}}. It still shows in your notifications.",
              org: scopeName,
            })
          : t(
              "settings.notifications.mute.hint",
              "Stops push, email and Discord DMs from this org. In-app notifications and announcements still arrive.",
            )}
      </Typography>
    </Box>
  )
}
