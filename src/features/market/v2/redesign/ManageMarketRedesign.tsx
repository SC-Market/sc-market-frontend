import React, { Fragment, useMemo, useState } from "react"
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Collapse,
  Container,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material"
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded"
import RefreshRounded from "@mui/icons-material/RefreshRounded"
import AddRounded from "@mui/icons-material/AddRounded"
import StorefrontRounded from "@mui/icons-material/StorefrontRounded"
import { Link as RouterLink } from "react-router-dom"
import { Helmet } from "react-helmet"
import { useTranslation } from "react-i18next"
import { FALLBACK_IMAGE_URL } from "../../../../util/constants"
import { formatPrice, formatPriceRange } from "../../../../util/formatPrice"
import {
  useGetMyShopsQuery,
  useGetMyListingsQuery,
  useGetStockLotsQuery,
} from "../../../../store/api/v2/market"
import type {
  MyListingItem,
  StockLotDetail,
} from "../../../../store/api/v2/market"

/**
 * ManageMarketRedesign — Phase 0 of the Market redesign (behind the
 * `market_v2_redesign` feature flag). ONE page (§8.4) that replaces the five
 * stock/inventory surfaces: a table of the shop's listings, each row expanding
 * inline to its backing lots (quantity by location + holder, listed vs.
 * unlisted). An actor/shop switcher includes an "Everything I own" cross-shop
 * scope (§8.8) which adds a Shop column.
 *
 * Reads are wired to the real hooks (my-listings + stock-lots). Inline edit
 * affordances (price / qty / status / cross-shop move) are Phase 0: visual only
 * because the current backend can't honor them shop-scoped without more plumbing.
 */

const ALL_SCOPE = "__all__"

export function ManageMarketRedesign() {
  const { t } = useTranslation()

  const { data: shops } = useGetMyShopsQuery()
  const manageableShops = useMemo(
    () => (shops ?? []).filter((s) => s.permissions?.manage_market !== false),
    [shops],
  )

  const [scope, setScope] = useState<string>("")
  // Default to the first manageable shop (guardrail §8.8: single-shop is default).
  const effectiveScope = scope || manageableShops[0]?.shop_id || ""
  const isAllScope = effectiveScope === ALL_SCOPE

  const currentShop = manageableShops.find((s) => s.shop_id === effectiveScope)
  const spectrumId = currentShop?.owner_contractor_spectrum_id || undefined

  const { data: listingsData, isLoading, error } = useGetMyListingsQuery({
    pageSize: 100,
    shopId: isAllScope ? undefined : effectiveScope || undefined,
    spectrumId: isAllScope ? undefined : spectrumId,
  })

  const listings = listingsData?.listings ?? []

  const shopNameById = useMemo(() => {
    const m = new Map<string, string>()
    for (const s of manageableShops) m.set(s.shop_id, s.name)
    return m
  }, [manageableShops])

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Helmet>
        <title>{t("ManageMarketRedesign.title", "Manage Market")}</title>
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
            {t("ManageMarketRedesign.heading", "Manage Market")}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.primary" }}>
            {t(
              "ManageMarketRedesign.subheading",
              "Everything you sell in one place. Expand a row to see the stock behind it.",
            )}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <TextField
            select
            size="small"
            label={t("ManageMarketRedesign.actor", "Storefront")}
            value={effectiveScope}
            onChange={(e) => setScope(e.target.value)}
            sx={{ minWidth: 220 }}
            InputProps={{
              startAdornment: <StorefrontRounded sx={{ mr: 1, color: "text.primary" }} />,
            }}
          >
            <MenuItem value={ALL_SCOPE}>
              {t("ManageMarketRedesign.everythingIOwn", "Everything I own")}
            </MenuItem>
            {manageableShops.map((s) => (
              <MenuItem key={s.shop_id} value={s.shop_id}>
                {s.name}
                {s.is_org_owned ? ` (${t("ManageMarketRedesign.org", "org")})` : ""}
              </MenuItem>
            ))}
          </TextField>
          <Button
            component={RouterLink}
            to="/market/create"
            variant="contained"
            color="primary"
            startIcon={<AddRounded />}
          >
            {t("ManageMarketRedesign.createListing", "Create listing")}
          </Button>
        </Stack>
      </Stack>

      {isAllScope && (
        <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
          {t(
            "ManageMarketRedesign.allScopeNote",
            "Showing everything you own across shops. The Shop column shows where each listing currently sells.",
          )}
        </Alert>
      )}

      {isLoading && (
        <Typography sx={{ color: "text.primary", py: 6, textAlign: "center" }}>
          {t("ManageMarketRedesign.loading", "Loading your listings…")}
        </Typography>
      )}
      {error && (
        <Typography sx={{ color: "error.main", py: 6, textAlign: "center" }}>
          {t("ManageMarketRedesign.error", "Failed to load your listings.")}
        </Typography>
      )}

      {!isLoading && !error && (
        <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, overflow: "hidden" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 40 }} />
                <TableCell>{t("ManageMarketRedesign.colItem", "Item")}</TableCell>
                {isAllScope && (
                  <TableCell>{t("ManageMarketRedesign.colShop", "Shop")}</TableCell>
                )}
                <TableCell align="right">{t("ManageMarketRedesign.colPrice", "Price")}</TableCell>
                <TableCell align="right">{t("ManageMarketRedesign.colQty", "Available")}</TableCell>
                <TableCell>{t("ManageMarketRedesign.colStatus", "Status")}</TableCell>
                <TableCell align="right">{t("ManageMarketRedesign.colActions", "Actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {listings.map((l) => (
                <ListingRow
                  key={l.listing_id}
                  listing={l}
                  showShop={isAllScope}
                  shopName={shopNameById.get(currentShop?.shop_id ?? "") ?? ""}
                />
              ))}
            </TableBody>
          </Table>

          {listings.length === 0 && (
            <Typography sx={{ color: "text.primary", py: 6, textAlign: "center" }}>
              {t("ManageMarketRedesign.empty", "Nothing here yet. Create your first listing.")}
            </Typography>
          )}
        </Box>
      )}
    </Container>
  )
}

function ListingRow({
  listing,
  showShop,
  shopName,
}: {
  listing: MyListingItem
  showShop: boolean
  shopName: string
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const statusColor =
    listing.status === "active"
      ? "success"
      : listing.status === "inactive" || listing.status === "expired"
        ? "warning"
        : "default"

  const colSpan = showShop ? 7 : 6

  return (
    <Fragment>
      <TableRow hover sx={{ "& > *": { borderBottom: open ? "unset" : undefined } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen((o) => !o)}>
            <ExpandMoreRounded
              sx={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}
            />
          </IconButton>
        </TableCell>
        <TableCell>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              variant="rounded"
              src={listing.photo || FALLBACK_IMAGE_URL}
              alt={listing.title}
              sx={{ width: 36, height: 36 }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="body2"
                component={RouterLink}
                to="/market/me"
                sx={{ color: "text.secondary", textDecoration: "none" }}
                noWrap
              >
                {listing.title}
              </Typography>
              {listing.variant_count > 1 && (
                <Typography variant="caption" sx={{ color: "text.primary", display: "block" }}>
                  {t("ManageMarketRedesign.variants", "{{count}} options", {
                    count: listing.variant_count,
                  })}
                </Typography>
              )}
            </Box>
          </Stack>
        </TableCell>
        {showShop && (
          <TableCell>
            <Chip label={shopName || "—"} size="small" variant="outlined" sx={{ color: "text.primary" }} />
          </TableCell>
        )}
        <TableCell align="right" sx={{ color: "primary.main", fontWeight: 700 }}>
          {formatPriceRange(listing.price_min, listing.price_max)}
        </TableCell>
        <TableCell align="right" sx={{ color: "text.primary" }}>
          {listing.quantity_available?.toLocaleString() ?? "—"}
        </TableCell>
        <TableCell>
          <Chip
            label={listing.status}
            size="small"
            color={statusColor as never}
            variant="outlined"
          />
        </TableCell>
        <TableCell align="right">
          {/* Phase 0: visual only — inline edit of price/qty/status and refresh
              aren't wired shop-scoped in this phase. */}
          <Tooltip title={t("ManageMarketRedesign.refresh", "Refresh (coming soon)")}>
            <span>
              <IconButton size="small" disabled>
                <RefreshRounded fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={colSpan} sx={{ py: 0, borderBottom: open ? undefined : "none" }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <LotBreakdown listingId={listing.listing_id} />
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  )
}

function LotBreakdown({ listingId }: { listingId: string }) {
  const { t } = useTranslation()
  const { data, isLoading } = useGetStockLotsQuery({ listingId, pageSize: 100 })
  const lots: StockLotDetail[] = data?.lots ?? []

  return (
    <Box sx={{ py: 2, px: 1 }}>
      <Typography variant="overline" sx={{ color: "text.primary" }}>
        {t("ManageMarketRedesign.backingStock", "Backing stock")}
      </Typography>
      {isLoading ? (
        <Typography variant="body2" sx={{ color: "text.primary", py: 1 }}>
          {t("ManageMarketRedesign.loadingLots", "Loading stock…")}
        </Typography>
      ) : lots.length === 0 ? (
        <Typography variant="body2" sx={{ color: "text.primary", py: 1 }}>
          {t("ManageMarketRedesign.noLots", "No stock lots recorded for this listing.")}
        </Typography>
      ) : (
        <Table size="small" sx={{ mt: 0.5 }}>
          <TableHead>
            <TableRow>
              <TableCell>{t("ManageMarketRedesign.lotVariant", "Variant")}</TableCell>
              <TableCell>{t("ManageMarketRedesign.lotLocation", "Location")}</TableCell>
              <TableCell>{t("ManageMarketRedesign.lotHolder", "Holder")}</TableCell>
              <TableCell align="right">{t("ManageMarketRedesign.lotQty", "Quantity")}</TableCell>
              <TableCell align="right">{t("ManageMarketRedesign.lotAllocated", "Allocated")}</TableCell>
              <TableCell>{t("ManageMarketRedesign.lotListed", "Listed")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lots.map((lot) => (
              <TableRow key={lot.lot_id}>
                <TableCell sx={{ color: "text.secondary" }}>
                  {lot.variant?.short_name || lot.variant?.display_name || "—"}
                </TableCell>
                <TableCell sx={{ color: "text.primary" }}>
                  {lot.location?.name ?? t("ManageMarketRedesign.unspecified", "Unspecified")}
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {lot.owner?.avatar_url && (
                      <Avatar src={lot.owner.avatar_url} sx={{ width: 20, height: 20 }} />
                    )}
                    <Typography variant="body2" sx={{ color: "text.primary" }}>
                      {lot.owner?.display_name || lot.owner?.username || "—"}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell align="right" sx={{ color: "text.primary" }}>
                  {lot.quantity_total?.toLocaleString()}
                </TableCell>
                <TableCell align="right" sx={{ color: "text.primary" }}>
                  {lot.quantity_allocated?.toLocaleString() ?? 0}
                </TableCell>
                <TableCell>
                  <Chip
                    label={
                      lot.listed
                        ? t("ManageMarketRedesign.listed", "Listed")
                        : t("ManageMarketRedesign.reserve", "Reserve")
                    }
                    size="small"
                    color={lot.listed ? "primary" : "default"}
                    variant="outlined"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Divider sx={{ my: 1.5 }} />
      {/* Phase 0: visual only — adjust/transfer/allocate lot actions are stubbed. */}
      <Stack direction="row" spacing={1}>
        <Button size="small" disabled startIcon={<AddRounded />}>
          {t("ManageMarketRedesign.addLot", "Add stock")}
        </Button>
        <Button size="small" disabled>
          {t("ManageMarketRedesign.allocate", "Allocate to order")}
        </Button>
      </Stack>
    </Box>
  )
}
