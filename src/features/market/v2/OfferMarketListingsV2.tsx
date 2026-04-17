import React, { useMemo } from "react"
import {
  Fade,
  Grid,
  Paper,
  Table,
  TableCell,
  TableRow,
  Typography,
  Box,
} from "@mui/material"
import { Stack } from "@mui/system"
import { HeadCell, PaginatedTable } from "../../../components/table/PaginatedTable"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { QualityBadge } from "../../../components/market/v2/QualityBadge"
import { OrderItemDetail } from "../../../store/api/v2/market"

/**
 * ListingRowItemV2 - Extended row item with variant details
 * 
 * Requirements: 27.4-27.7
 * - Display variant details for each order item
 * - Show quality_tier with visual indicators
 * - Display variant attributes in readable format
 * - Show per-variant pricing
 */
interface ListingRowItemV2 {
  order_item_id: string
  listing_id: string
  title: string
  variant_display_name: string
  quality_tier: number | null
  quantity: number
  unit_price: number
  total: number
}

/**
 * OfferListingRowItemV2 - Individual row component with variant display
 * 
 * Maintains visual parity with V1 OfferListingRowItem while adding:
 * - Quality tier badge
 * - Variant display name
 * - Variant attributes in readable format
 * 
 * Requirements: 27.2, 27.5
 */
export function OfferListingRowItemV2(props: {
  row: ListingRowItemV2
  index: number
}) {
  const { row, index } = props

  return (
    <Fade
      in={true}
      style={{
        transitionDelay: `${50 + 50 * index}ms`,
        transitionDuration: "500ms",
      }}
    >
      <TableRow
        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
        tabIndex={-1}
        key={index}
      >
        <TableCell component="th" scope="row">
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {row.title}
            </Typography>
            {/* Variant details with quality badge */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
              {row.quality_tier && (
                <QualityBadge tier={row.quality_tier} size="small" />
              )}
              <Typography variant="body2" color="text.secondary">
                {row.variant_display_name}
              </Typography>
            </Box>
          </Box>
        </TableCell>
        <TableCell align={"right"}>{row.quantity.toLocaleString()}</TableCell>
        <TableCell align={"right"}>
          {row.unit_price.toLocaleString()} aUEC
        </TableCell>
        <TableCell align={"right"}>{row.total.toLocaleString()} aUEC</TableCell>
      </TableRow>
    </Fade>
  )
}

/**
 * Table head cells configuration
 * Maintains identical structure to V1 marketListingHeadCells
 */
export const marketListingHeadCellsV2: readonly HeadCell<ListingRowItemV2>[] = [
  {
    id: "title",
    numeric: false,
    disablePadding: false,
    label: "OfferMarketListings.product",
  },
  {
    id: "quantity",
    numeric: true,
    disablePadding: false,
    label: "OfferMarketListings.qty",
  },
  {
    id: "unit_price",
    numeric: true,
    disablePadding: false,
    label: "OfferMarketListings.unitPrice",
  },
  {
    id: "total",
    numeric: true,
    disablePadding: false,
    label: "OfferMarketListings.total",
  },
]

/**
 * OfferMarketListingsV2 Props
 */
interface OfferMarketListingsV2Props {
  /** Array of order items with variant details */
  items: OrderItemDetail[]
  /** Optional listing title for context */
  title?: string
}

/**
 * OfferMarketListingsV2 - Order display component with variant support
 * 
 * Displays order items in a read-only table format with variant details.
 * Maintains 100% visual parity with V1 OfferMarketListings while adding:
 * - Quality tier badges for each item
 * - Variant display names (e.g., "Tier 5 (95.5%) - Crafted")
 * - Per-variant pricing display
 * 
 * Requirements: 27.1-27.12
 * - 27.1: Provide OfferMarketListingsV2 React component
 * - 27.2: Maintain visual parity with V1 OfferMarketListings
 * - 27.3: Use RTK_Query_Client for API calls (data passed as props)
 * - 27.4: Display variant details for each order item
 * - 27.5: Show quality_tier with visual indicators (QualityBadge)
 * - 27.6: Display variant attributes in readable format (display_name)
 * - 27.7: Show per-variant pricing
 * 
 * Visual Parity Details:
 * - Grid item xs={12} lg={8} md={12}
 * - Paper with padding: 2
 * - Stack with spacing: theme.layoutSpacing.compact
 * - Typography variant: "h5", fontWeight: "bold", color: "text.secondary"
 * - PaginatedTable with initialSort: "quantity"
 * - Fade animation with staggered delay (50 + 50 * index)ms
 * - Total section with Table maxWidth: 350
 * - Empty state with subtitle2 message
 * 
 * @example
 * ```tsx
 * <OfferMarketListingsV2
 *   items={orderDetail.items}
 *   title="Associated Market Listings"
 * />
 * ```
 */
export function OfferMarketListingsV2(props: OfferMarketListingsV2Props) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const { items, title } = props

  // Transform OrderItemDetail[] to ListingRowItemV2[]
  // Requirements: 27.4-27.7
  const extendedListings: ListingRowItemV2[] = useMemo(() => {
    return items.map((item) => ({
      order_item_id: item.order_item_id,
      listing_id: item.listing_id,
      title: `Listing ${item.listing_id.substring(0, 8)}`, // Placeholder - should come from listing data
      variant_display_name: item.variant.display_name,
      quality_tier: item.variant.attributes.quality_tier || null,
      quantity: item.quantity,
      unit_price: item.price_per_unit,
      total: item.subtotal,
    }))
  }, [items])

  // Calculate total price
  const totalPrice = useMemo(() => {
    return extendedListings.reduce((sum, item) => sum + item.total, 0)
  }, [extendedListings])

  if (items.length > 0) {
    return (
      <>
        <Grid item xs={12} lg={8} md={12}>
          <Paper sx={{ padding: 2 }}>
            <Stack spacing={theme.layoutSpacing.compact} direction="column">
              <Typography
                variant={"h5"}
                sx={{ fontWeight: "bold" }}
                color={"text.secondary"}
              >
                {title || t("OfferMarketListings.associatedMarketListings")}
              </Typography>
              <Paper>
                <PaginatedTable
                  rows={extendedListings}
                  initialSort={"quantity"}
                  keyAttr={"order_item_id"}
                  headCells={marketListingHeadCellsV2.map((cell) => ({
                    ...cell,
                    label: t(cell.label),
                  }))}
                  generateRow={OfferListingRowItemV2}
                  disableSelect
                />
              </Paper>
              <Stack
                direction="row"
                justifyContent={"right"}
                alignItems={"right"}
              >
                <Table sx={{ maxWidth: 350 }}>
                  <TableRow>
                    <TableCell>{t("OfferMarketListings.total")}</TableCell>
                    <TableCell align={"right"}>
                      {totalPrice.toLocaleString()} aUEC
                    </TableCell>
                  </TableRow>
                </Table>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </>
    )
  } else {
    return (
      <Grid item xs={12} lg={8} md={12}>
        <Paper sx={{ padding: 2 }}>
          <Stack spacing={theme.layoutSpacing.compact}>
            <Typography
              variant={"h5"}
              sx={{ fontWeight: "bold" }}
              color={"text.secondary"}
            >
              {title || t("OfferMarketListings.associatedMarketListings")}
            </Typography>
            <Typography variant={"subtitle2"}>
              {t("OfferMarketListings.noAssociatedListings")}
            </Typography>
          </Stack>
        </Paper>
      </Grid>
    )
  }
}
