import React from "react"
import {
  Alert,
  Box,
  Chip,
  IconButton,
  Link,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material"
import { ImageAvatar } from "../../../components/avatar/ImageAvatar"
import {
  DeleteOutlineRounded,
  EditRounded,
  PauseRounded,
  PlayArrowRounded,
} from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { Link as RouterLink } from "react-router-dom"
import {
  useGetWatchlistQuery,
  type WatchlistItem,
} from "../../../store/api/v2/market"
import { useWatchlistRowActions } from "../hooks/useWatchlistActions"
import { WatchPriceDialog } from "./WatchPriceDialog"
import { getErrorMessage } from "../../../util/errorHandling"
import { MARKET_PATHS, WIKI_PATHS } from "../../../routes/paths"
import { usePageReady } from "../../../components/metadata/PageReady"
import { useFormatters, useNow } from "../../../util/format"
import {
  WatchlistEmptyState,
  AddWatchlistItemForm,
} from "./WatchlistManagerParts"

function itemLabel(item: WatchlistItem): string {
  return item.item_name ?? item.query
}

/**
 * The user's watchlist on Settings -> Price Alerts: every watched item with
 * its target price, minimum quality, current lowest price, status and last
 * alert, with edit, pause/resume and remove, plus "Add item". The same list
 * Discord's /watchlist commands manage.
 */
export function WatchlistManager() {
  const fmt = useFormatters()
  const now = useNow()
  const { t } = useTranslation()
  const { data, isLoading, isError } = useGetWatchlistQuery()
  usePageReady(isLoading)
  const { remove, removeState, setPaused, updateState } =
    useWatchlistRowActions()
  const [editing, setEditing] = React.useState<WatchlistItem | null>(null)

  const items = data?.items ?? []
  const full = data ? items.length >= data.max_items : false

  return (
    <Stack spacing={2} data-testid="watchlist-manager">
      <Typography variant="body2" color="text.secondary">
        {t(
          "priceAlerts.manager.description",
          "Watch an item and get an alert when a public listing is at or below your target price. Use Watch price on an item or listing page, add one here, or use /watchlist add in Discord.",
        )}
      </Typography>

      <AddWatchlistItemForm disabled={full || isLoading} />
      {full && data && (
        <Alert severity="info">
          {t(
            "priceAlerts.manager.full",
            "Your watchlist is full ({{max}} items). Remove one to add another.",
            {
              max: data.max_items,
            },
          )}
        </Alert>
      )}

      {isError && (
        <Alert severity="error">
          {t("priceAlerts.manager.loadError", "Couldn't load your watchlist.")}
        </Alert>
      )}
      {removeState.error && (
        <Alert severity="error">
          {getErrorMessage(removeState.error) ??
            t("priceAlerts.manager.removeError", "Couldn't remove that item.")}
        </Alert>
      )}
      {updateState.error && (
        <Alert severity="error">
          {getErrorMessage(updateState.error) ??
            t(
              "priceAlerts.manager.pauseError",
              "Couldn't pause or resume that alert.",
            )}
        </Alert>
      )}

      {isLoading ? (
        <Stack spacing={1} data-testid="watchlist-loading">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} variant="rounded" height={48} />
          ))}
        </Stack>
      ) : data && items.length === 0 ? (
        <WatchlistEmptyState />
      ) : data ? (
        <Box>
          <Box
            component="ul"
            sx={{ listStyle: "none", m: 0, p: 0 }}
            aria-label={t("priceAlerts.manager.title", "Watchlist")}
          >
            {items.map((item) => (
              <Box
                component="li"
                key={item.id}
                data-testid="watchlist-item"
                data-id={item.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  py: 1.25,
                  borderBottom: 1,
                  borderColor: "divider",
                }}
              >
                <ImageAvatar
                  variant="rounded"
                  src={item.item_image_url ?? undefined}
                  alt=""
                  sx={{ width: 40, height: 40 }}
                >
                  {itemLabel(item).charAt(0).toUpperCase()}
                </ImageAvatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  {item.game_item_id ? (
                    <Link
                      component={RouterLink}
                      to={WIKI_PATHS.item(
                        item.game_item_id,
                        item.item_name ?? undefined,
                      )}
                      underline="hover"
                      color="text.primary"
                      variant="body2"
                      sx={{ fontWeight: 600, textTransform: "capitalize" }}
                    >
                      {itemLabel(item)}
                    </Link>
                  ) : (
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      “{item.query}”{" "}
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                      >
                        {t(
                          "priceAlerts.manager.textMatch",
                          "Matches listing titles",
                        )}
                      </Typography>
                    </Typography>
                  )}
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    flexWrap="wrap"
                    useFlexGap
                  >
                    <Typography variant="body2" color="primary.main">
                      {t(
                        "priceAlerts.manager.targetValue",
                        "Alert at ≤ {{price}}",
                        {
                          price: fmt.auec(item.max_price),
                        },
                      )}
                      {item.min_quality_tier != null &&
                        ` · ${t(
                          "priceAlerts.manager.qualityValue",
                          "Tier {{tier}}+",
                          { tier: item.min_quality_tier },
                        )}`}
                    </Typography>
                    <Chip
                      size="small"
                      variant="outlined"
                      color={item.paused ? "default" : "success"}
                      label={
                        item.paused
                          ? t("priceAlerts.manager.paused", "Paused")
                          : t("priceAlerts.manager.active", "Active")
                      }
                      data-testid="watchlist-status"
                    />
                  </Stack>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    component="div"
                  >
                    {t("priceAlerts.manager.lowest", "Current lowest")}:{" "}
                    {item.current_lowest == null ? (
                      t("priceAlerts.manager.none", "None listed")
                    ) : item.game_item_id ? (
                      <Link
                        component={RouterLink}
                        to={MARKET_PATHS.aggregate(
                          item.game_item_id,
                          item.item_name ?? undefined,
                        )}
                        underline="hover"
                        color={
                          item.current_lowest <= item.max_price
                            ? "success.main"
                            : "inherit"
                        }
                      >
                        {fmt.auec(item.current_lowest)}
                      </Link>
                    ) : (
                      fmt.auec(item.current_lowest)
                    )}
                    {" · "}
                    {t("priceAlerts.manager.lastAlerted", "Last alerted")}:{" "}
                    {item.last_notified_at
                      ? fmt.relative(new Date(item.last_notified_at), now)
                      : t("priceAlerts.manager.never", "Never")}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                  <Tooltip
                    title={
                      item.paused
                        ? t("priceAlerts.manager.resume", "Resume alerts")
                        : t("priceAlerts.manager.pause", "Pause alerts")
                    }
                  >
                    <IconButton
                      size="small"
                      disabled={updateState.isLoading}
                      onClick={() => setPaused(item.id, !item.paused)}
                      aria-label={
                        item.paused
                          ? t(
                              "priceAlerts.manager.resumeAria",
                              "Resume alerts for {{name}}",
                              {
                                name: itemLabel(item),
                              },
                            )
                          : t(
                              "priceAlerts.manager.pauseAria",
                              "Pause alerts for {{name}}",
                              {
                                name: itemLabel(item),
                              },
                            )
                      }
                    >
                      {item.paused ? (
                        <PlayArrowRounded fontSize="small" />
                      ) : (
                        <PauseRounded fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                  <Tooltip
                    title={t("priceAlerts.manager.edit", "Edit price alert")}
                  >
                    <IconButton
                      size="small"
                      onClick={() => setEditing(item)}
                      aria-label={t(
                        "priceAlerts.manager.editAria",
                        "Edit {{name}}",
                        {
                          name: itemLabel(item),
                        },
                      )}
                    >
                      <EditRounded fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip
                    title={t("priceAlerts.manager.remove", "Stop watching")}
                  >
                    <IconButton
                      size="small"
                      disabled={removeState.isLoading}
                      onClick={() => remove(item.id)}
                      aria-label={t(
                        "priceAlerts.manager.removeAria",
                        "Stop watching {{name}}",
                        {
                          name: itemLabel(item),
                        },
                      )}
                    >
                      <DeleteOutlineRounded fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
            ))}
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1 }}
          >
            {t("priceAlerts.manager.count", "{{count}} of {{max}} items", {
              count: items.length,
              max: data.max_items,
            })}
          </Typography>
        </Box>
      ) : null}

      {editing && (
        <WatchPriceDialog
          open
          onClose={() => setEditing(null)}
          gameItemId={editing.game_item_id ?? ""}
          itemName={itemLabel(editing)}
          currentPrice={editing.current_lowest}
          existing={editing}
          qualityRelevant={editing.game_item_id != null}
        />
      )}
    </Stack>
  )
}
