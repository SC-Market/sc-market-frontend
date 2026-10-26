import React from "react"
import {
  Alert,
  Avatar,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Link,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material"
import {
  DeleteOutlineRounded,
  EditRounded,
  NotificationAddRounded,
} from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { Link as RouterLink } from "react-router-dom"
import {
  useAddWatchlistItemMutation,
  useGetWatchlistQuery,
  useRemoveWatchlistItemMutation,
  type WatchlistItem,
} from "../../../store/api/v2/market"
import {
  GameItemPicker,
  type GameItemChoice,
} from "../../dashboard/GameItemPicker"
import { WatchPriceDialog } from "./WatchPriceDialog"
import { formatAuec, parseTargetPrice } from "../domain/price"
import { getErrorMessage } from "../../../util/errorHandling"
import { getRelativeTime } from "../../../util/time"
import { MARKET_PATHS, WIKI_PATHS } from "../../../routes/paths"
import { usePageReady } from "../../../components/metadata/PageReady"

function itemLabel(item: WatchlistItem): string {
  return item.item_name ?? item.query
}

/**
 * The user's watchlist on Settings -> Price Alerts: every watched item with
 * its target price, current lowest price and last alert, plus "Add item".
 * The same list Discord's /watchlist commands manage.
 */
export function WatchlistManager() {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useGetWatchlistQuery()
  usePageReady(isLoading)
  const [remove, removeState] = useRemoveWatchlistItemMutation()
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

      {isLoading ? (
        <Stack spacing={1} data-testid="watchlist-loading">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} variant="rounded" height={48} />
          ))}
        </Stack>
      ) : data && items.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          {t("priceAlerts.manager.empty", "You aren't watching anything yet.")}
        </Typography>
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
                <Avatar
                  variant="rounded"
                  src={item.item_image_url ?? undefined}
                  alt=""
                  sx={{ width: 40, height: 40 }}
                >
                  {itemLabel(item).charAt(0).toUpperCase()}
                </Avatar>
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
                  <Typography variant="body2" color="primary.main">
                    {t(
                      "priceAlerts.manager.targetValue",
                      "Alert at ≤ {{price}}",
                      {
                        price: formatAuec(item.max_price),
                      },
                    )}
                  </Typography>
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
                        {formatAuec(item.current_lowest)}
                      </Link>
                    ) : (
                      formatAuec(item.current_lowest)
                    )}
                    {" · "}
                    {t("priceAlerts.manager.lastAlerted", "Last alerted")}:{" "}
                    {item.last_notified_at
                      ? getRelativeTime(new Date(item.last_notified_at))
                      : t("priceAlerts.manager.never", "Never")}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                  <Tooltip
                    title={t("priceAlerts.manager.edit", "Edit target price")}
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
                      onClick={() => remove({ watchlistId: item.id })}
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
        />
      )}
    </Stack>
  )
}

/** Pick a game item and a target price, then add it to the watchlist. */
function AddWatchlistItemForm({ disabled }: { disabled: boolean }) {
  const { t } = useTranslation()
  const [item, setItem] = React.useState<GameItemChoice | null>(null)
  const [price, setPrice] = React.useState("")
  const [add, { isLoading, error, reset }] = useAddWatchlistItemMutation()
  const parsed = parseTargetPrice(price)
  const invalid = price !== "" && parsed == null

  const submit = async () => {
    if (!item || parsed == null) return
    try {
      await add({
        addWatchlistItemRequest: { game_item_id: item.id, max_price: parsed },
      }).unwrap()
      setItem(null)
      setPrice("")
    } catch {
      // Shown below.
    }
  }

  return (
    <Box>
      <Stack spacing={1.5}>
        <GameItemPicker
          value={item}
          onChange={(v) => {
            setItem(v)
            reset()
          }}
        />
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <TextField
            size="small"
            sx={{ flex: 1, minWidth: 0 }}
            label={t("priceAlerts.watch.targetPrice", "Target price")}
            value={price}
            onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, ""))}
            onKeyDown={(e) => {
              if (e.key === "Enter") void submit()
            }}
            inputProps={{ inputMode: "numeric" }}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">aUEC</InputAdornment>
              ),
            }}
            error={invalid}
            helperText={
              invalid
                ? t(
                    "priceAlerts.watch.invalidPrice",
                    "Enter a whole number above 1 aUEC.",
                  )
                : undefined
            }
          />
          <Button
            variant="contained"
            startIcon={<NotificationAddRounded />}
            onClick={submit}
            disabled={disabled || isLoading || !item || parsed == null}
            sx={{ whiteSpace: "nowrap", height: 40, flexShrink: 0 }}
          >
            {t("priceAlerts.manager.add", "Add item")}
          </Button>
        </Stack>
      </Stack>
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {getErrorMessage(error) ??
            t("priceAlerts.watch.error", "Couldn't save your price alert.")}
        </Alert>
      )}
    </Box>
  )
}
