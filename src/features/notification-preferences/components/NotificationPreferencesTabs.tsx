import React from "react"
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Link as MuiLink,
  MenuItem,
  Select,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { FlatSection } from "../../../components/paper/Section"
import {
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
  useUpdateNotificationOrgMuteMutation,
  type NotificationChannelId,
  type NotificationEventKey,
  type NotificationPreferenceCell,
  type NotificationPreferenceUpdate,
} from "../../../store/api/v2/market"
import { ContractAlertSettings } from "./ContractAlertSettings"
import { NOTIFICATION_TABS, type NotificationRow } from "../domain/layout"

const CHANNELS: NotificationChannelId[] = [
  "in_app",
  "push",
  "email",
  "discord_dm",
]

type CellMap = Map<
  NotificationEventKey,
  Map<NotificationChannelId, NotificationPreferenceCell>
>

/** Pill state for a row: all of its events on, all off, or a mix. */
function rowState(cells: NotificationPreferenceCell[]): "on" | "off" | "mixed" {
  const on = cells.filter((c) => c.enabled).length
  return on === cells.length ? "on" : on === 0 ? "off" : "mixed"
}

/**
 * Settings -> Notifications: tabs by area, cards by subsection, one row per
 * event group with a pill per channel. "Customise" opens the row's events.
 * Org scopes show only the categories kept per organization.
 */
export function NotificationPreferencesTabs() {
  const { t } = useTranslation()
  const [tab, setTab] = React.useState(NOTIFICATION_TABS[0].id)
  const [scope, setScope] = React.useState<string | null>(null)
  const [open, setOpen] = React.useState<Record<string, boolean>>({})
  const { data, isLoading, isError, isFetching } =
    useGetNotificationPreferencesQuery(scope ? { contractorId: scope } : {})
  const [update, { isLoading: isSaving, isError: saveFailed }] =
    useUpdateNotificationPreferencesMutation()
  const [updateMute, { isLoading: isMuting, isError: muteFailed }] =
    useUpdateNotificationOrgMuteMutation()
  const busy = isSaving || isFetching || isMuting

  const MUTE_HOURS = { "8h": 8, "1w": 24 * 7 } as const
  const setMute = (choice: "off" | "8h" | "1w" | "on") => {
    if (!scope) return
    updateMute({
      updateNotificationOrgMuteRequest: {
        contractor_id: scope,
        muted: choice !== "off",
        until:
          choice === "8h" || choice === "1w"
            ? new Date(Date.now() + MUTE_HOURS[choice] * 3600_000).toISOString()
            : null,
      },
    })
  }
  const scopeName = data?.scopes.find((s) => s.contractor_id === scope)?.name

  const cells: CellMap = React.useMemo(() => {
    const map: CellMap = new Map()
    for (const cat of data?.categories ?? []) {
      for (const ev of cat.events) {
        map.set(ev.event, new Map(ev.cells.map((c) => [c.channel, c])))
      }
    }
    return map
  }, [data])

  const channelLabel = (c: NotificationChannelId) =>
    t(
      `settings.notifications.channels.${c}`,
      {
        in_app: "In-app",
        push: "Push",
        email: "Email",
        discord_dm: "Discord DM",
      }[c],
    )

  const lockHint = (cell: NotificationPreferenceCell) =>
    cell.reason === "discord_not_linked"
      ? t("settings.notifications.linkDiscord", "Link Discord to get DMs")
      : cell.reason === "personal_only"
        ? t(
            "settings.notifications.personalOnly",
            "Set once under Personal for all your notifications",
          )
        : cell.reason === "always_on"
          ? t("settings.notifications.locked", "Always on")
          : cell.reason === "coming_soon"
            ? t(
                "settings.notifications.comingSoon",
                "Not available for this notification yet",
              )
            : ""

  const save = (updates: NotificationPreferenceUpdate[]) =>
    update({
      updateNotificationPreferencesRequest: { contractor_id: scope, updates },
    })

  const pill = (
    key: string,
    channel: NotificationChannelId,
    rowCells: NotificationPreferenceCell[],
    events: NotificationEventKey[],
    label: string,
  ) => {
    const state = rowState(rowCells)
    const locked = rowCells.every((c) => c.locked)
    const hint = locked
      ? lockHint(rowCells[0])
      : state === "mixed"
        ? t("settings.notifications.mixed", "Some events on")
        : ""
    return (
      <Tooltip key={key} title={hint}>
        <span>
          <Chip
            size="small"
            label={channelLabel(channel)}
            color={state === "off" ? "default" : "primary"}
            variant={state === "on" ? "filled" : "outlined"}
            disabled={locked || busy}
            onClick={() =>
              save(
                events
                  .filter((e) => !cells.get(e)?.get(channel)?.locked)
                  .map((event) => ({
                    event,
                    channel,
                    enabled: state !== "on",
                  })),
              )
            }
            role="switch"
            aria-checked={
              state === "on" ? "true" : state === "mixed" ? "mixed" : "false"
            }
            aria-label={`${label}: ${channelLabel(channel)}`}
            data-testid={`notif-pill-${key}`}
            sx={{
              ...(state === "mixed" && { borderStyle: "dashed" }),
              ...((rowCells[0]?.reason === "discord_not_linked" ||
                rowCells[0]?.reason === "coming_soon") && {
                borderStyle: "dashed",
                opacity: 0.5,
              }),
            }}
          />
        </span>
      </Tooltip>
    )
  }

  const renderRow = (row: NotificationRow) => {
    const events = row.events.filter((e) => cells.has(e))
    if (!events.length) return null
    const label = t(row.labelKey, row.label)
    return (
      <Box
        key={row.id}
        data-testid={`notif-row-${row.id}`}
        sx={{ py: 1, borderTop: 1, borderColor: "divider" }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {label}
            </Typography>
            {row.hint && (
              <Typography variant="caption" color="text.secondary">
                {t(row.hintKey!, row.hint)}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            {CHANNELS.map((channel) => {
              const rowCells = events
                .map((e) => cells.get(e)?.get(channel))
                .filter((c): c is NotificationPreferenceCell => !!c)
              if (!rowCells.length) return null
              return pill(
                `${row.id}-${channel}`,
                channel,
                rowCells,
                events,
                label,
              )
            })}
          </Box>
        </Box>
        {events.length > 1 && (
          <Button
            size="small"
            sx={{ mt: 0.5, px: 0 }}
            aria-expanded={!!open[row.id]}
            onClick={() => setOpen((o) => ({ ...o, [row.id]: !o[row.id] }))}
          >
            {t("settings.notifications.customise", "Customise")}{" "}
            {open[row.id] ? "▾" : "▸"}
          </Button>
        )}
        {open[row.id] &&
          events.map((event) => {
            const evLabel = t(
              `settings.notifications.events.${event.replace(/\./g, "_")}`,
              event,
            )
            return (
              <Box
                key={event}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  pl: 2,
                  py: 0.5,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {evLabel}
                </Typography>
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  {CHANNELS.map((channel) => {
                    const cell = cells.get(event)?.get(channel)
                    return cell
                      ? pill(
                          `${row.id}-${event}-${channel}`,
                          channel,
                          [cell],
                          [event],
                          evLabel,
                        )
                      : null
                  })}
                </Box>
              </Box>
            )
          })}
      </Box>
    )
  }

  const current =
    NOTIFICATION_TABS.find((x) => x.id === tab) ?? NOTIFICATION_TABS[0]

  return (
    <Box sx={{ width: "100%" }}>
      {(isError || saveFailed || muteFailed) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t(
            "settings.notifications.error",
            "Couldn't load or save your notification settings.",
          )}
        </Alert>
      )}
      <Tabs
        value={tab}
        onChange={(_e, v) => setTab(v)}
        variant="scrollable"
        textColor="secondary"
        indicatorColor="secondary"
        aria-label={t("settings.notifications.tabsLabel", "Notification areas")}
        sx={{ mb: 2 }}
      >
        {NOTIFICATION_TABS.map((x) => (
          <Tab
            key={x.id}
            value={x.id}
            label={t(x.labelKey, x.label)}
            data-testid={`notif-tab-${x.id}`}
          />
        ))}
      </Tabs>

      {data && data.scopes.length > 1 && current.id !== "account" && (
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
            <InputLabel id="notif-scope">
              {t("settings.notifications.scope", "Settings for")}
            </InputLabel>
            <Select
              labelId="notif-scope"
              label={t("settings.notifications.scope", "Settings for")}
              value={scope ?? ""}
              onChange={(e) =>
                setScope(e.target.value ? String(e.target.value) : null)
              }
              data-testid="notif-scope"
            >
              {data.scopes.map((s) => (
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
          <Typography variant="caption" color="text.secondary">
            {t(
              "settings.notifications.scopeHint",
              "Org work has its own settings for each org.",
            )}
          </Typography>
        </Box>
      )}

      {scope && data?.mute && current.id !== "account" && (
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
              value={
                data.mute.muted ? (data.mute.until ? "timed" : "on") : "off"
              }
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
              {data.mute.until && (
                <MenuItem value="timed" disabled>
                  {t("settings.notifications.mute.until", {
                    defaultValue: "Muted until {{time}}",
                    time: new Date(data.mute.until).toLocaleString(),
                  })}
                </MenuItem>
              )}
            </Select>
          </FormControl>
          <Typography variant="caption" color="text.secondary">
            {data.mute.muted
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
      )}

      {isLoading || !data
        ? !isError && <CircularProgress />
        : current.sections.map((section) => {
            const rows = section.rows.map(renderRow).filter(Boolean)
            if (!rows.length && !section.extra) return null
            return (
              <Box
                key={section.id}
                sx={{ mb: 2 }}
                data-testid={`notif-section-${section.id}`}
              >
                <FlatSection title={t(section.labelKey, section.label)}>
                  <Box sx={{ width: "100%" }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {t(section.hintKey, section.hint)}
                    </Typography>
                    {rows}
                    {section.extra === "price-alerts" && (
                      <MuiLink
                        component={Link}
                        to="/settings?tab=price-alerts"
                        variant="body2"
                      >
                        {t(
                          "settings.notifications.manageWatchlist",
                          "Manage your watchlist",
                        )}
                      </MuiLink>
                    )}
                  </Box>
                </FlatSection>
                {section.extra === "contract-alerts" && !scope && (
                  <Box sx={{ mt: 2 }}>
                    <ContractAlertSettings />
                  </Box>
                )}
              </Box>
            )
          })}
    </Box>
  )
}
