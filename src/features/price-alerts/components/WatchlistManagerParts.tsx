import React from "react"
import {
  Alert,
  Box,
  Button,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { NotificationAddRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { Link as RouterLink } from "react-router-dom"
import { useAddWatchlistItem } from "../hooks/useWatchlistActions"
import {
  GameItemPicker,
  type GameItemChoice,
} from "../../dashboard/GameItemPicker"
import { parseTargetPrice } from "../domain/price"
import { getErrorMessage } from "../../../util/errorHandling"
import { MARKET_PATHS, WIKI_PATHS } from "../../../routes/paths"
import AddRounded from "@mui/icons-material/AddRounded"

/** No watches yet: what price alerts do and where to start one. */
export function WatchlistEmptyState() {
  const { t } = useTranslation()
  return (
    <Box
      data-testid="watchlist-empty"
      sx={{
        py: 3,
        px: 2,
        textAlign: "center",
        border: 1,
        borderColor: "divider",
        borderStyle: "dashed",
        borderRadius: 2,
      }}
    >
      <NotificationAddRounded color="primary" sx={{ fontSize: 36, mb: 1 }} />
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        {t("priceAlerts.manager.empty", "You aren't watching anything yet.")}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 0.5, mb: 2, maxWidth: 420, mx: "auto" }}
      >
        {t(
          "priceAlerts.manager.emptyBody",
          "Find an item you want to buy and press Watch price. When someone lists it at or below your target price, you get an alert, so you don't have to keep checking the market.",
        )}
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        justifyContent="center"
        flexWrap="wrap"
        useFlexGap
      >
        <Button
          component={RouterLink}
          to={WIKI_PATHS.items}
          variant="outlined"
          size="small"
        >
          {t("priceAlerts.manager.browseItems", "Browse items")}
        </Button>
        <Button
          component={RouterLink}
          to={MARKET_PATHS.search}
          variant="outlined"
          size="small"
        >
          {t("priceAlerts.manager.browseMarket", "Browse the market")}
        </Button>
      </Stack>
    </Box>
  )
}

/** Pick a game item and a target price, then add it to the watchlist. */
export function AddWatchlistItemForm({ disabled }: { disabled: boolean }) {
  const { t } = useTranslation()
  const [item, setItem] = React.useState<GameItemChoice | null>(null)
  const [price, setPrice] = React.useState("")
  const { add, isLoading, error, reset } = useAddWatchlistItem()
  const parsed = parseTargetPrice(price)
  const invalid = price !== "" && parsed == null

  const submit = async () => {
    if (!item || parsed == null) return
    if (await add(item.id, parsed)) {
      setItem(null)
      setPrice("")
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
            startIcon={<AddRounded />}
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
