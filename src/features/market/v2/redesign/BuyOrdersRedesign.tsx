import React, { useMemo, useState, useCallback, useRef } from "react"
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Collapse,
  Container,
  Divider,
  Fade,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material"
import Grid2 from "@mui/material/Grid2"
import AddRounded from "@mui/icons-material/AddRounded"
import { useSearchParams } from "react-router-dom"
import { Helmet } from "react-helmet"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import { ExtendedTheme, cardFadeGradient } from "../../../../hooks/styles/Theme"
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
import { useDrawerOpen } from "../../../../hooks/layout/Drawer"
import { HideOnScroll, MarketNavArea } from "../../components/MarketNavArea"
import { MarketSearchAreaV2, MarketSidebarV2 } from "../ListingSearchV2"
import { ListingWrapper } from "../../components/listings/ListingWrapper"
import { ListingPagination } from "../../components/listings/ListingPagination"
import { ListingSkeleton } from "../../../../components/skeletons"
import { EmptyListings } from "../../../../components/empty-states/EmptyListings"
import { FALLBACK_IMAGE_URL } from "../../../../util/constants"
import { useViewMode, ViewModeToggle } from "../../../../hooks/market/useViewMode"
import { BuyOrdersTableV2 } from "../components/BuyOrdersTableV2"
import {
  UnifiedSearchBar,
  marketParamsToTokens,
  marketTokensToParams,
  type SearchToken,
} from "../../../../components/game-data/UnifiedSearchBar"

/**
 * BuyOrdersRedesign — Phase 0 of the Market redesign (behind the
 * `market_v2_redesign` feature flag). It is a page-in-page that mirrors
 * BuyOrdersViewV2's shell exactly (sidebar + market nav + unified search +
 * view-mode toggle + paginated card grid) so it is visually identical to the
 * rest of the market, and adds the genuinely-new redesign feature: an inline
 * "Create buy order" form wired to `useCreateStandingBuyOrderMutation`.
 *
 * Reads are wired to the real `useSearchBuyOrdersQuery` with URL-param search
 * state (text/page/pageSize), matching BuyOrdersViewV2's arg mapping. Active
 * buy orders only. The Phase-0 "Fulfil from stock" button stays visual-only.
 */
export function BuyOrdersRedesign() {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const [viewMode, setViewMode] = useViewMode()
  const showMobileSidebar = useMediaQuery(theme.breakpoints.down("lg"))
  const [drawerOpen] = useDrawerOpen()

  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(0)
  const [perPage, setPerPage] = useState(48)
  const [showForm, setShowForm] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const searchText =
    searchParams.get("text") || searchParams.get("query") || undefined
  const marketSearchTokens = useMemo(
    () => marketParamsToTokens(searchParams),
    [searchParams],
  )

  const handleMarketTokensChange = useCallback(
    (tokens: SearchToken[]) => {
      const params = marketTokensToParams(tokens)
      setSearchParams(params)
      setPage(0)
    },
    [setSearchParams],
  )

  const { data, isLoading, isFetching } = useSearchBuyOrdersQuery({
    page: page + 1,
    pageSize: perPage,
    text: searchText,
  })

  // Active buy orders only (preserved redesign behavior).
  const activeOrders = useMemo(
    () => (data?.buy_orders ?? []).filter((o) => o.status === "active"),
    [data],
  )

  // Grouped by game item for the list/table view (matches BuyOrdersViewV2).
  const aggregates = useMemo(() => {
    const grouped = new Map<
      string,
      { item_id: string; item_name: string; orders: StandingBuyOrder[] }
    >()
    for (const bo of activeOrders) {
      const existing = grouped.get(bo.game_item_id)
      if (existing) {
        existing.orders.push(bo)
      } else {
        grouped.set(bo.game_item_id, {
          item_id: bo.game_item_id,
          item_name: bo.game_item_name,
          orders: [bo],
        })
      }
    }
    return Array.from(grouped.values())
  }, [activeOrders])

  const handleChangePage = useCallback((_: unknown, newPage: number) => {
    setPage(newPage)
    ref.current?.scrollIntoView({ block: "end", behavior: "smooth" })
  }, [])

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPerPage(parseInt(event.target.value, 10))
      setPage(0)
    },
    [],
  )

  // Match ListingSearchV2's breakpoints EXACTLY so buy-order cards are the same
  // size as main-search cards (same per-row count at each width).
  const gridBreakpoints = useMemo(() => {
    const sidebarInLayout = !showMobileSidebar
    const base = { xs: 6, sm: 4, md: 4, lg: 3, xl: 2.4, xxl: 2, xxxl: 12 / 8 }
    if (!sidebarInLayout || drawerOpen) return base
    return { xs: 6, sm: 4, md: 4, lg: 2.4, xl: 2, xxl: 12 / 7, xxxl: 12 / 8 }
  }, [showMobileSidebar, drawerOpen])

  const loading = isLoading || isFetching

  const cardGrid = (
    <>
      <div ref={ref} style={{ position: "absolute", top: 0 }} />
      <Grid container spacing={1}>
        {loading ? (
          new Array(Math.min(perPage, 12))
            .fill(undefined)
            .map((_, i) => (
              <Grid item {...gridBreakpoints} key={i}>
                <ListingSkeleton index={i} />
              </Grid>
            ))
        ) : activeOrders.length === 0 ? (
          <Grid item xs={12}>
            <EmptyListings
              isSearchResult={false}
              showCreateAction={false}
              action={{
                label: t(
                  "buyOrderActions.createBuyOrder",
                  "Create Buy Order",
                ),
                onClick: () => setShowForm(true),
                variant: "contained" as const,
              }}
            />
          </Grid>
        ) : viewMode === "list" ? (
          <Grid item xs={12}>
            <BuyOrdersTableV2 aggregates={aggregates} />
          </Grid>
        ) : (
          activeOrders.map((order, index) => (
            <Grid item {...gridBreakpoints} key={order.buy_order_id}>
              <BuyOrderCard order={order} index={index} />
            </Grid>
          ))
        )}
      </Grid>
      <Divider light sx={{ my: 1 }} />
      <ListingPagination
        count={data?.total || activeOrders.length}
        page={page}
        rowsPerPage={perPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </>
  )

  const createButton = (
    <Button
      variant="contained"
      color="primary"
      startIcon={<AddRounded />}
      onClick={() => setShowForm((s) => !s)}
      sx={{ flexShrink: 0, whiteSpace: "nowrap" }}
    >
      {t("BuyOrdersRedesign.createBuyOrder", "Create buy order")}
    </Button>
  )

  const createForm = (
    <Collapse in={showForm} unmountOnExit>
      <Box sx={{ mb: 1.5 }}>
        <CreateBuyOrderForm onDone={() => setShowForm(false)} />
      </Box>
    </Collapse>
  )

  const searchRow = (
    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <UnifiedSearchBar
          tokens={marketSearchTokens}
          onChange={handleMarketTokensChange}
          mode="market"
          placeholder="Search buy orders..."
        />
      </Box>
      <ViewModeToggle mode={viewMode} onChange={setViewMode} />
      {createButton}
    </Box>
  )

  return (
    <>
      <Helmet>
        <title>
          {t("BuyOrdersRedesign.title", "Buy Orders")}
          {data?.total ? ` (${data.total})` : ""}
        </title>
      </Helmet>

      {showMobileSidebar && <MarketSidebarV2 />}

      <Container maxWidth={"xxxl"} sx={{ padding: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          {showMobileSidebar ? (
            <Grid container spacing={theme.layoutSpacing.layout}>
              <Grid item xs={12}>
                <HideOnScroll>
                  <MarketNavArea />
                </HideOnScroll>
              </Grid>
              <Grid item xs={12}>
                <Divider light />
              </Grid>
              <Grid item xs={12}>
                {searchRow}
              </Grid>
              <Grid item xs={12}>
                {createForm}
                {cardGrid}
              </Grid>
            </Grid>
          ) : (
            <Stack
              direction="row"
              justifyContent="center"
              spacing={theme.layoutSpacing.layout}
              sx={{ width: "100%", maxWidth: "xxxl" }}
            >
              <Paper
                sx={{
                  position: "sticky",
                  top: "calc(64px + 16px)",
                  maxHeight: "calc(100vh - 64px - 32px)",
                  height: "fit-content",
                  width: 300,
                  flexShrink: 0,
                  overflowY: "auto",
                }}
              >
                <MarketSearchAreaV2 />
              </Paper>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ mb: 1.5 }}>{searchRow}</Box>
                {createForm}
                {cardGrid}
              </Box>
            </Stack>
          )}
        </Box>
      </Container>
    </>
  )
}

/**
 * Card for an individual active buy order. Matches BuyOrdersViewV2's card
 * sizing and per-theme visual treatment (dark = full-bleed image + gradient +
 * overlaid text; light = fixed-height image + content below) via ListingWrapper.
 */
function BuyOrderCard({
  order,
  index,
}: {
  order: StandingBuyOrder
  index: number
}) {
  const theme = useTheme<ExtendedTheme>()
  const { t, i18n } = useTranslation()

  const remaining = Math.max(
    0,
    (order.quantity ?? 0) - (order.quantity_fulfilled ?? 0),
  )
  const imageUrl = order.photos?.[0]?.url || FALLBACK_IMAGE_URL
  const isDark = theme.palette.mode === "dark"

  const visibilityLabel =
    order.visibility === "roster_only"
      ? t("BuyOrdersRedesign.rosterOnly", "Roster")
      : order.visibility === "private"
        ? t("BuyOrdersRedesign.targeted", "Targeted")
        : t("BuyOrdersRedesign.public", "Public")

  return (
    <ListingWrapper useFixedWidth={false}>
      <Fade in timeout={500} style={{ transitionDelay: `${50 + 50 * index}ms` }}>
        <Card sx={{ height: 300, position: "relative" }}>
          <CardMedia
            component="img"
            loading="lazy"
            image={imageUrl}
            sx={{
              width: "100%",
              objectFit: "cover",
              ...(isDark
                ? { height: "100%", aspectRatio: "16/9" }
                : { height: 180, aspectRatio: "16/9" }),
              overflow: "hidden",
            }}
            onError={({ currentTarget }) => {
              currentTarget.onerror = null
              currentTarget.src = FALLBACK_IMAGE_URL
            }}
            alt={`Image of ${order.game_item_name}`}
          />
          <Box
            sx={{
              ...(theme.palette.mode === "light" ? { display: "none" } : {}),
              position: "absolute",
              zIndex: 3,
              top: 0,
              left: 0,
              height: "100%",
              width: "100%",
              borderRadius: theme.spacing(theme.borderRadius.topLevel),
              background: cardFadeGradient(theme, 50, 60),
            }}
          />
          <CardContent
            sx={{
              ...(isDark
                ? { position: "absolute", bottom: 0, zIndex: 4, width: "100%" }
                : {}),
              maxWidth: "100%",
              padding: "8px 12px !important",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 0.5 }}
            >
              <Typography
                variant="h6"
                color="primary"
                fontWeight="bold"
                noWrap
                sx={{ fontSize: "0.95rem" }}
              >
                {formatPrice(order.price_per_unit)}
              </Typography>
              <Chip
                label={visibilityLabel}
                size="small"
                color="info"
                variant="outlined"
                sx={{ height: 20, "& .MuiChip-label": { fontSize: "0.65rem", px: 0.75 } }}
              />
            </Stack>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: "0.75rem",
                lineHeight: 1.3,
                maxHeight: 36,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                mb: 0.5,
              }}
              title={order.game_item_name}
            >
              {order.game_item_name}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "0.7rem", lineHeight: 1, display: "block" }}
            >
              {remaining.toLocaleString(i18n.language)} /{" "}
              {(order.quantity ?? 0).toLocaleString(i18n.language)}{" "}
              {t("market.requested", "requested")}
            </Typography>
            {/* Fulfilment is not wired in Phase 0. Rather than show a disabled
                button (dead affordance), we hide it — it'll be added back as a
                real action when the fulfil flow is wired. */}
          </CardContent>
        </Card>
      </Fade>
    </ListingWrapper>
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
        <Grid2 container spacing={2} sx={{ mt: 0.5 }}>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <TextField
              select={false}
              fullWidth
              label={t("BuyOrdersRedesign.itemSearch", "Item")}
              value={itemQuery}
              onChange={(e) => setItemQuery(e.target.value)}
              helperText={
                item
                  ? t("BuyOrdersRedesign.selected", "Selected: {{name}}", {
                      name: item.name,
                    })
                  : t(
                      "BuyOrdersRedesign.typeToSearch",
                      "Type to search the catalog",
                    )
              }
            />
            {!item && (itemResults?.length ?? 0) > 0 && itemQuery.length > 0 && (
              <Box
                sx={{
                  mt: 1,
                  maxHeight: 180,
                  overflowY: "auto",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
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
          </Grid2>
          <Grid2 size={{ xs: 6, md: 3 }}>
            <TextField
              fullWidth
              type="number"
              label={t("BuyOrdersRedesign.maxPriceLabel", "Max price / unit")}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </Grid2>
          <Grid2 size={{ xs: 6, md: 3 }}>
            <TextField
              fullWidth
              type="number"
              label={t("BuyOrdersRedesign.quantityLabel", "Quantity")}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </Grid2>
          <Grid2 size={{ xs: 6, md: 4 }}>
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
          </Grid2>
          <Grid2 size={{ xs: 6, md: 4 }}>
            <TextField
              select
              fullWidth
              label={t("BuyOrdersRedesign.visibilityLabel", "Visibility")}
              value={visibility}
              onChange={(e) =>
                setVisibility(e.target.value as BuyOrderVisibility)
              }
            >
              <MenuItem value="public">
                {t("BuyOrdersRedesign.public", "Public")}
              </MenuItem>
              <MenuItem value="roster_only">
                {t("BuyOrdersRedesign.rosterOnly", "Roster only")}
              </MenuItem>
              <MenuItem value="private">
                {t("BuyOrdersRedesign.targeted", "Targeted")}
              </MenuItem>
            </TextField>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              label={t(
                "BuyOrdersRedesign.negotiableLabel",
                "Accept counter-offers?",
              )}
              value={negotiable ? "yes" : "no"}
              onChange={(e) => setNegotiable(e.target.value === "yes")}
            >
              <MenuItem value="no">{t("BuyOrdersRedesign.no", "No")}</MenuItem>
              <MenuItem value="yes">
                {t("BuyOrdersRedesign.yes", "Yes")}
              </MenuItem>
            </TextField>
          </Grid2>
        </Grid2>

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
