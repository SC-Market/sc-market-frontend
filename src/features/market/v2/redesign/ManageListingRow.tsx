import { Fragment, useState } from "react"
import {
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material"
import { ImageAvatar } from "../../../../components/avatar/ImageAvatar"
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded"
import RefreshRounded from "@mui/icons-material/RefreshRounded"
import AddRounded from "@mui/icons-material/AddRounded"
import { Link as RouterLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { FALLBACK_IMAGE_URL } from "../../../../util/constants"
import { useGetStockLotsQuery } from "../../../../store/api/v2/market"
import type {
  MyListingItem,
  StockLotDetail,
} from "../../../../store/api/v2/market"
import { MARKET_PATHS } from "../../../../routes/paths"
import { useFormatters } from "../../../../util/format"

export function ListingRow({
  listing,
  showShop,
  shopName,
}: {
  listing: MyListingItem
  showShop: boolean
  shopName: string
}) {
  const fmt = useFormatters()
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
      <TableRow
        hover
        sx={{ "& > *": { borderBottom: open ? "unset" : undefined } }}
      >
        <TableCell>
          <IconButton
            size="small"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={t(
              "ManageMarketRedesign.toggleLots",
              "Show lots for {{title}}",
              {
                title: listing.title,
              },
            )}
          >
            <ExpandMoreRounded
              sx={{
                transform: open ? "rotate(180deg)" : "none",
                transition: "transform .2s",
              }}
            />
          </IconButton>
        </TableCell>
        <TableCell>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <ImageAvatar
              variant="rounded"
              src={listing.photo || FALLBACK_IMAGE_URL}
              alt={listing.title}
              sx={{ width: 36, height: 36 }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="body2"
                component={RouterLink}
                to={MARKET_PATHS.listing(listing.listing_id, listing.title)}
                sx={{ color: "text.secondary", textDecoration: "none" }}
                noWrap
              >
                {listing.title}
              </Typography>
              {listing.variant_count > 1 && (
                <Typography
                  variant="caption"
                  sx={{ color: "text.primary", display: "block" }}
                >
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
            <Chip
              label={shopName || "—"}
              size="small"
              variant="outlined"
              sx={{ color: "text.primary" }}
            />
          </TableCell>
        )}
        <TableCell
          align="right"
          sx={{ color: "primary.main", fontWeight: 700 }}
        >
          {fmt.priceRange(listing.price_min, listing.price_max)}
        </TableCell>
        <TableCell align="right" sx={{ color: "text.primary" }}>
          {fmt.number(listing.quantity_available) ?? "—"}
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
          <Tooltip
            title={t("ManageMarketRedesign.refresh", "Refresh (coming soon)")}
          >
            <span>
              <IconButton
                size="small"
                disabled
                aria-label={t(
                  "ManageMarketRedesign.refresh",
                  "Refresh (coming soon)",
                )}
              >
                <RefreshRounded fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell
          colSpan={colSpan}
          sx={{ py: 0, borderBottom: open ? undefined : "none" }}
        >
          <Collapse in={open} timeout="auto" unmountOnExit>
            <LotBreakdown listingId={listing.listing_id} />
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  )
}

function LotBreakdown({ listingId }: { listingId: string }) {
  const fmt = useFormatters()
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
          {t(
            "ManageMarketRedesign.noLots",
            "No stock lots recorded for this listing.",
          )}
        </Typography>
      ) : (
        <Table size="small" sx={{ mt: 0.5 }}>
          <TableHead>
            <TableRow>
              <TableCell>
                {t("ManageMarketRedesign.lotVariant", "Variant")}
              </TableCell>
              <TableCell>
                {t("ManageMarketRedesign.lotLocation", "Location")}
              </TableCell>
              <TableCell>
                {t("ManageMarketRedesign.lotHolder", "Holder")}
              </TableCell>
              <TableCell align="right">
                {t("ManageMarketRedesign.lotQty", "Quantity")}
              </TableCell>
              <TableCell align="right">
                {t("ManageMarketRedesign.lotAllocated", "Allocated")}
              </TableCell>
              <TableCell>
                {t("ManageMarketRedesign.lotListed", "Listed")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lots.map((lot) => (
              <TableRow key={lot.lot_id}>
                <TableCell sx={{ color: "text.secondary" }}>
                  {lot.variant?.short_name || lot.variant?.display_name || "—"}
                </TableCell>
                <TableCell sx={{ color: "text.primary" }}>
                  {lot.location?.name ??
                    t("ManageMarketRedesign.unspecified", "Unspecified")}
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {lot.owner?.avatar_url && (
                      <ImageAvatar
                        alt=""
                        src={lot.owner.avatar_url}
                        sx={{ width: 20, height: 20 }}
                      />
                    )}
                    <Typography variant="body2" sx={{ color: "text.primary" }}>
                      {lot.owner?.display_name || lot.owner?.username || "—"}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell align="right" sx={{ color: "text.primary" }}>
                  {fmt.number(lot.quantity_total)}
                </TableCell>
                <TableCell align="right" sx={{ color: "text.primary" }}>
                  {fmt.number(lot.quantity_allocated) ?? 0}
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
