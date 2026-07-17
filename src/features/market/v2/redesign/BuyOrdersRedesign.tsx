import React, { useMemo, useState } from "react"
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Container,
  Divider,
  Grow,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import Grid from "@mui/material/Grid2"
import AddRounded from "@mui/icons-material/AddRounded"
import { Helmet } from "react-helmet"
import { useTranslation } from "react-i18next"
import { formatPrice } from "../../../../util/formatPrice"
import {
  useSearchBuyOrdersQuery,
  useSearchGameItemsQuery,
  useCreateStandingBuyOrderMutation,
} from "../../../../store/api/v2/market"
import type {
  StandingBuyOrder,
  GameItemSearchResult,
  BuyOrderVisibility,
} from "../../../../store/api/v2/market"
import { useAlertHook } from "../../../../hooks/alert/AlertHook"

/**
 * BuyOrdersRedesign — Phase 0 of the Market redesign (behind the
 * `market_v2_redesign` feature flag). Browse open buy orders (the demand side)
 * plus a "Create buy order" form (item, max price, min quality, quantity,
 * visibility public / roster / targeted).
 *
 * Reads are wired to the real `useSearchBuyOrdersQuery`. Create is wired to the
 * real `useCreateStandingBuyOrderMutation` where the payload maps cleanly.
 */

export function BuyOrdersRedesign() {
  const { t } = useTranslation()
  const [showForm, setShowForm] = useState(false)

  const { data, isLoading, error } = useSearchBuyOrdersQuery({
    pageSize: 60,
    sortBy: "created_at",
    sortOrder: "desc",
  })

  const orders = useMemo(
    () => (data?.buy_orders ?? []).filter((o) => o.status === "active"),
    [data],
  )

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Helmet>
        <title>{t("BuyOrdersRedesign.title", "Buy Orders")}</title>
      </Helmet>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" sx={{ color: "text.secondary", mb: 0.5 }}>
            {t("BuyOrdersRedesign.heading", "Buy Orders")}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.primary" }}>
            {t(
              "BuyOrdersRedesign.subheading",
              "What buyers want. Post your own, or fulfil an open want from your stock.",
            )}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddRounded />}
          onClick={() => setShowForm((s) => !s)}
        >
          {t("BuyOrdersRedesign.createBuyOrder", "Create buy order")}
        </Button>
      </Stack>

      <Collapse in={showForm} unmountOnExit>
        <Box sx={{ mb: 3 }}>
          <CreateBuyOrderForm onDone={() => setShowForm(false)} />
        </Box>
      </Collapse>

      {isLoading && (
        <Typography sx={{ color: "text.primary", py: 6, textAlign: "center" }}>
          {t("BuyOrdersRedesign.loading", "Loading buy orders…")}
        </Typography>
      )}
      {error && (
        <Typography sx={{ color: "error.main", py: 6, textAlign: "center" }}>
          {t("BuyOrdersRedesign.error", "Failed to load buy orders.")}
        </Typography>
      )}

      <Grid container spacing={2.5}>
        {orders.map((o, i) => (
          <Grid key={o.buy_order_id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Grow in timeout={300} style={{ transitionDelay: `${Math.min(i, 8) * 40}ms` }}>
              <Box sx={{ height: "100%" }}>
                <BuyOrderCard order={o} />
              </Box>
            </Grow>
          </Grid>
        ))}
      </Grid>

      {!isLoading && !error && orders.length === 0 && (
        <Typography sx={{ color: "text.primary", py: 6, textAlign: "center" }}>
          {t("BuyOrdersRedesign.empty", "No open buy orders right now.")}
        </Typography>
      )}
    </Container>
  )
}

function BuyOrderCard({ order }: { order: StandingBuyOrder }) {
  const { t } = useTranslation()
  const remaining = Math.max(0, (order.quantity ?? 0) - (order.quantity_fulfilled ?? 0))

  const visibilityLabel =
    order.visibility === "roster_only"
      ? t("BuyOrdersRedesign.rosterOnly", "Roster")
      : order.visibility === "private"
        ? t("BuyOrdersRedesign.targeted", "Targeted")
        : t("BuyOrdersRedesign.public", "Public")

  return (
    <Card sx={{ height: "100%", "&:hover": { borderColor: "secondary.main" } }}>
      <CardContent>
        <Stack direction="row" spacing={1} sx={{ mb: 1 }} flexWrap="wrap" useFlexGap>
          {order.game_item_type && (
            <Chip label={order.game_item_type} size="small" variant="outlined" sx={{ color: "text.primary" }} />
          )}
          <Chip label={visibilityLabel} size="small" color="info" variant="outlined" />
          {order.negotiable && (
            <Chip
              label={t("BuyOrdersRedesign.negotiable", "Negotiable")}
              size="small"
              color="secondary"
              variant="outlined"
            />
          )}
        </Stack>
        <Typography variant="subtitle1" noWrap title={order.game_item_name}>
          {order.game_item_name}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.primary" }}>
          {t("BuyOrdersRedesign.by", "by {{name}}", { name: order.buyer_name })}
        </Typography>

        <Divider sx={{ my: 1.5 }} />

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" sx={{ color: "text.primary" }}>
            {t("BuyOrdersRedesign.maxPrice", "Pays up to")}
          </Typography>
          <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 700 }}>
            {formatPrice(order.price_per_unit)}
          </Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" sx={{ color: "text.primary" }}>
            {t("BuyOrdersRedesign.wants", "Wants")}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {remaining.toLocaleString()} / {order.quantity?.toLocaleString()}
          </Typography>
        </Stack>
        {(order.quality_tier_min != null || order.quality_tier_max != null) && (
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: "text.primary" }}>
              {t("BuyOrdersRedesign.minQuality", "Quality")}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {t("BuyOrdersRedesign.tierRange", "T{{min}}–T{{max}}", {
                min: order.quality_tier_min ?? 1,
                max: order.quality_tier_max ?? 5,
              })}
            </Typography>
          </Stack>
        )}

        {/* Phase 0: visual only — fulfilment flows through the existing buy-order
            fulfil path elsewhere; kept as a disabled hint here. */}
        <Button variant="outlined" color="secondary" fullWidth sx={{ mt: 1.5 }} disabled>
          {t("BuyOrdersRedesign.fulfil", "Fulfil from stock")}
        </Button>
      </CardContent>
    </Card>
  )
}

function CreateBuyOrderForm({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()

  const [itemQuery, setItemQuery] = useState("")
  const [item, setItem] = useState<GameItemSearchResult | null>(null)
  const [maxPrice, setMaxPrice] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [minTier, setMinTier] = useState(1)
  const [visibility, setVisibility] = useState<BuyOrderVisibility>("public")
  const [negotiable, setNegotiable] = useState(false)

  const { data: itemResults } = useSearchGameItemsQuery({
    query: itemQuery || undefined,
    limit: 25,
  })
  const [createBuyOrder, { isLoading }] = useCreateStandingBuyOrderMutation()

  const canSubmit = !!item && Number(maxPrice) > 0 && Number(quantity) > 0

  const handleSubmit = async () => {
    if (!item) return
    try {
      await createBuyOrder({
        createTargetedBuyOrderRequest: {
          game_item_id: item.id,
          quantity: Number(quantity),
          price_per_unit: Number(maxPrice),
          quality_tier_min: minTier,
          negotiable,
          visibility,
        },
      }).unwrap()
      issueAlert({
        message: t("BuyOrdersRedesign.posted", "Buy order posted."),
        severity: "success",
      })
      onDone()
    } catch (e) {
      issueAlert(e as never)
    }
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="overline" sx={{ color: "text.primary" }}>
          {t("BuyOrdersRedesign.newBuyOrder", "New buy order")}
        </Typography>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select={false}
              fullWidth
              label={t("BuyOrdersRedesign.itemSearch", "Item")}
              value={itemQuery}
              onChange={(e) => setItemQuery(e.target.value)}
              helperText={
                item
                  ? t("BuyOrdersRedesign.selected", "Selected: {{name}}", { name: item.name })
                  : t("BuyOrdersRedesign.typeToSearch", "Type to search the catalog")
              }
            />
            {!item && (itemResults?.length ?? 0) > 0 && itemQuery.length > 0 && (
              <Box sx={{ mt: 1, maxHeight: 180, overflowY: "auto", border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
                {(itemResults ?? []).map((r) => (
                  <MenuItem
                    key={r.id}
                    onClick={() => {
                      setItem(r)
                      setItemQuery(r.name)
                    }}
                  >
                    {r.name} — {r.type}
                  </MenuItem>
                ))}
              </Box>
            )}
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <TextField
              fullWidth
              type="number"
              label={t("BuyOrdersRedesign.maxPriceLabel", "Max price / unit")}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <TextField
              fullWidth
              type="number"
              label={t("BuyOrdersRedesign.quantityLabel", "Quantity")}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 4 }}>
            <TextField
              select
              fullWidth
              label={t("BuyOrdersRedesign.minQualityLabel", "Min quality tier")}
              value={minTier}
              onChange={(e) => setMinTier(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <MenuItem key={n} value={n}>
                  {t("BuyOrdersRedesign.tierN", "Tier {{n}}", { n })}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, md: 4 }}>
            <TextField
              select
              fullWidth
              label={t("BuyOrdersRedesign.visibilityLabel", "Visibility")}
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as BuyOrderVisibility)}
            >
              <MenuItem value="public">{t("BuyOrdersRedesign.public", "Public")}</MenuItem>
              <MenuItem value="roster_only">{t("BuyOrdersRedesign.rosterOnly", "Roster only")}</MenuItem>
              <MenuItem value="private">{t("BuyOrdersRedesign.targeted", "Targeted")}</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              label={t("BuyOrdersRedesign.negotiableLabel", "Accept counter-offers?")}
              value={negotiable ? "yes" : "no"}
              onChange={(e) => setNegotiable(e.target.value === "yes")}
            >
              <MenuItem value="no">{t("BuyOrdersRedesign.no", "No")}</MenuItem>
              <MenuItem value="yes">{t("BuyOrdersRedesign.yes", "Yes")}</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        {visibility === "private" && (
          <Alert severity="info" variant="outlined" sx={{ mt: 2 }}>
            {t(
              "BuyOrdersRedesign.targetedNote",
              "Targeted orders need a specific supplier — pick one from the supplier roster (coming soon).",
            )}
          </Alert>
        )}

        <Divider sx={{ my: 2 }} />
        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <Button color="inherit" onClick={onDone}>
            {t("BuyOrdersRedesign.cancel", "Cancel")}
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!canSubmit || isLoading}
            onClick={handleSubmit}
          >
            {t("BuyOrdersRedesign.post", "Post buy order")}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}
