/**
 * OrderDetailsAreaV2 Component
 *
 * Displays detailed order information with variant attributes, quality tiers,
 * and per-variant pricing. Maintains visual parity with V1 OrderDetailsArea.
 *
 * Requirements:
 * - 45.6: Provide OrderDetailsAreaV2 React component
 * - 45.7: Maintain visual parity with V1 OrderDetailsArea
 * - 45.8: Display variant attributes for each item
 * - 45.9: Show quality tier with visual indicators
 * - 45.10: Display per-variant pricing
 * - 45.12: Preserve variant information even if listing deleted
 */

import React, { useMemo } from "react"
import {
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material"
import { Stack } from "@mui/system"
import { format } from "../../../util/time"
import { useGetOrderDetailQuery } from "../../../store/api/v2/market"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { QualityBadge } from "../../../components/market/v2/QualityBadge"
import { OfferMarketListingsV2 } from "./OfferMarketListingsV2"

/**
 * Props for OrderDetailsAreaV2 component
 */
interface OrderDetailsAreaV2Props {
  /** UUID of the order to display */
  orderId: string
}

/**
 * Status color mapping (matching V1 statusColors)
 */
const statusColors = new Map<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning">([
  ["pending", "warning"],
  ["in-progress", "info"],
  ["completed", "success"],
  ["fulfilled", "success"],
  ["cancelled", "error"],
  ["not-started", "default"],
])

/**
 * OrderDetailsAreaV2 Component
 *
 * Displays comprehensive order details including:
 * - Buyer and seller information
 * - Order metadata (date, status, title)
 * - Variant-specific item details with quality tiers
 * - Per-variant pricing breakdown
 * - Total order cost
 *
 * Maintains 100% visual parity with V1 OrderDetailsArea:
 * - Grid item xs={12} lg={8} md={6}
 * - TableContainer with Paper component
 * - Table with aria-label and tableLayout: auto
 * - TableRow with border removal on last child
 * - Stack direction="row" justifyContent="right" for values
 * - Typography variants: body1, subtitle2, caption
 * - Chip for status display with color mapping
 * - Format dates using format() utility
 *
 * Requirements:
 * - 45.7: Maintain visual parity with V1 OrderDetailsArea
 * - 45.8: Display variant attributes for each item (via OfferMarketListingsV2)
 * - 45.9: Show quality tier with visual indicators (QualityBadge)
 * - 45.10: Display per-variant pricing (via OfferMarketListingsV2)
 * - 45.12: Preserve variant information even if listing deleted
 *
 * @example
 * ```tsx
 * <OrderDetailsAreaV2 orderId="123e4567-e89b-12d3-a456-426614174000" />
 * ```
 */
export function OrderDetailsAreaV2(props: OrderDetailsAreaV2Props) {
  const { orderId } = props
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()

  // Requirement 45.6: Use useGetOrderDetailQuery hook
  const { data: orderDetail, isLoading, error } = useGetOrderDetailQuery({
    orderId,
  })

  // Compute status color and label
  const statusColor = useMemo(
    () => statusColors.get(orderDetail?.status || "") || "default",
    [orderDetail?.status],
  )

  // Calculate quality tier range from items
  const qualityTierRange = useMemo(() => {
    if (!orderDetail?.items || orderDetail.items.length === 0) {
      return null
    }

    const tiers = orderDetail.items
      .map((item) => item.variant.attributes.quality_tier)
      .filter((tier): tier is number => tier !== undefined && tier !== null)

    if (tiers.length === 0) {
      return null
    }

    const minTier = Math.min(...tiers)
    const maxTier = Math.max(...tiers)

    if (minTier === maxTier) {
      return minTier
    }

    return `${minTier}-${maxTier}`
  }, [orderDetail?.items])

  // Loading state
  if (isLoading) {
    return (
      <Grid item xs={12} lg={8} md={6} sx={{ minWidth: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      </Grid>
    )
  }

  // Error state
  if (error || !orderDetail) {
    return (
      <Grid item xs={12} lg={8} md={6} sx={{ minWidth: 0 }}>
        <Alert severity="error" sx={{ m: 2 }}>
          {t("orderDetailsArea.failed_to_load", "Failed to load order details. Please try again.")}
        </Alert>
      </Grid>
    )
  }

  // Requirement 45.7: Maintain visual parity with V1 OrderDetailsArea
  return (
    <>
      <Grid item xs={12} lg={8} md={6} sx={{ minWidth: 0 }}>
        <TableContainer
          component={Paper}
          sx={{
            width: "100%",
            overflowX: "auto",
            overflowY: "visible",
          }}
        >
          <Table
            aria-label={t("orderDetailsArea.details_table", "Order Details")}
            sx={{ tableLayout: "auto" }}
          >
            <TableBody>
              {/* Buyer Information */}
              <TableRow
                sx={{
                  "&:last-child td, &:last-child th": { border: 0 },
                }}
              >
                <TableCell component="th" scope="row">
                  {t("orderDetailsArea.customer", "Customer")}
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" justifyContent={"right"}>
                    <Typography variant="body1">
                      {orderDetail.buyer.display_name || orderDetail.buyer.username}
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>

              {/* Seller Information */}
              <TableRow
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {t("orderDetailsArea.seller", "Seller")}
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" justifyContent={"right"}>
                    <Typography variant="body1">
                      {orderDetail.seller.display_name || orderDetail.seller.username}
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>

              {/* Order Date */}
              <TableRow
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {t("orderDetailsArea.date", "Date")}
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" justifyContent={"right"}>
                    <Typography variant="body1">
                      {format(new Date(orderDetail.created_at), "MMMM do yyyy, h:mm:ss a")}
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>

              {/* Order Status */}
              <TableRow
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {t("orderDetailsArea.status", "Status")}
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" justifyContent={"right"}>
                    <Chip
                      label={orderDetail.status}
                      color={statusColor}
                      sx={{ textTransform: "capitalize" }}
                    />
                  </Stack>
                </TableCell>
              </TableRow>

              {/* Quality Tier Range - Requirement 45.9 */}
              {qualityTierRange !== null && (
                <TableRow
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {t("orderDetailsArea.quality_tier", "Quality Tier")}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" justifyContent={"right"}>
                      {typeof qualityTierRange === "number" ? (
                        <QualityBadge tier={qualityTierRange} size="medium" />
                      ) : (
                        <Typography variant="body1">
                          Tier {qualityTierRange}
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              )}

              {/* Total Cost */}
              <TableRow
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {t("orderDetailsArea.order", "Order Total")}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ wordBreak: "break-word", overflowWrap: "break-word" }}
                >
                  <Stack direction="row" justifyContent={"right"}>
                    <Typography
                      color={"text.secondary"}
                      variant={"subtitle2"}
                      sx={{
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                        textAlign: "right",
                      }}
                    >
                      {orderDetail.total_price.toLocaleString(undefined)}{" "}
                      <Typography
                        component="span"
                        color={"text.primary"}
                        variant={"subtitle2"}
                        sx={{
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        aUEC
                      </Typography>
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>

      {/* Order Items with Variant Details - Requirements 45.8, 45.9, 45.10, 45.12 */}
      <OfferMarketListingsV2
        items={orderDetail.items}
        title={t("OfferMarketListings.associatedMarketListings", "Associated Market Listings")}
      />
    </>
  )
}
