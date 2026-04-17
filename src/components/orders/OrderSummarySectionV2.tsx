import { Box, Typography, Divider, Stack, Link, Chip } from "@mui/material"
import { useTranslation } from "react-i18next"
import { OfferChanges } from "../../util/offerChanges"
import { OrderItemDetail } from "../../store/api/v2/market"
import { QualityBadge } from "../market/v2/QualityBadge"

/**
 * OrderSummarySectionV2 Props
 * 
 * Requirements: 27.8-27.11
 */
interface OrderSummarySectionV2Props {
  /** Array of order items with variant details */
  items?: OrderItemDetail[]
  /** Total order cost in aUEC */
  total_cost: number
  /** Optional change tracking for counter-offers */
  offerChanges?: OfferChanges | null
}

/**
 * OrderSummarySectionV2 - Compact order summary with variant support
 * 
 * Displays order items with variant details in a compact summary format.
 * Maintains 100% visual parity with V1 OrderSummarySection while adding:
 * - Quality tier badges for each item
 * - Variant display names (e.g., "Tier 5 (95.5%) - Crafted")
 * - Per-variant pricing calculations
 * 
 * Requirements: 27.8-27.11
 * - 27.8: Provide OrderSummarySectionV2 React component
 * - 27.9: Maintain visual parity with V1 OrderSummarySection
 * - 27.10: Display quality_tier in order summary
 * - 27.11: Calculate totals with per-variant pricing
 * 
 * Visual Parity Details (from V1 audit):
 * - Box with mt: 2
 * - Divider with my: 2
 * - Stack with spacing: 1, mt: 1
 * - Item rows with display: flex, justifyContent: space-between
 * - Link to listing with textDecoration: none
 * - Typography variant: "body2" for price details
 * - Chip with label: "NEW!", size: "small", color: "primary"
 * - Total row with Typography variant: "subtitle2"
 * - Returns null if no items
 * 
 * @example
 * ```tsx
 * <OrderSummarySectionV2
 *   items={orderDetail.items}
 *   total_cost={orderDetail.total_price}
 *   offerChanges={changes}
 * />
 * ```
 */
export function OrderSummarySectionV2({
  items,
  total_cost,
  offerChanges,
}: OrderSummarySectionV2Props) {
  const { t } = useTranslation()

  // Return null if no items (maintains V1 behavior)
  if (!items || items.length === 0) {
    return null
  }

  // Calculate total from items (per-variant pricing)
  // Requirement 27.11: Calculate totals with per-variant pricing
  const itemsTotal = items.reduce((sum, item) => sum + item.subtotal, 0)

  return (
    <Box sx={{ mt: 2 }}>
      <Divider sx={{ my: 2 }} />
      {t("orderSummary.title", "Order Summary")}
      <Stack spacing={1} sx={{ mt: 1 }}>
        {items.map((item) => {
          const subtotal = item.subtotal
          // Check if this item is new (using listing_id for compatibility)
          const isNew = offerChanges?.addedListings.has(item.listing_id)
          // Check for quantity changes (using listing_id for compatibility)
          const quantityChange = offerChanges?.quantityChanges.get(item.listing_id)

          return (
            <Box
              key={item.order_item_id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box>
                  {/* Link to listing */}
                  <Link
                    href={`/market/${item.listing_id}`}
                    sx={{ textDecoration: "none" }}
                  >
                    {/* Display listing title - placeholder for now */}
                    Listing {item.listing_id.substring(0, 8)}
                  </Link>
                  
                  {/* Variant details with quality badge */}
                  {/* Requirement 27.10: Display quality_tier in order summary */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                    {item.variant.attributes.quality_tier && (
                      <QualityBadge
                        tier={item.variant.attributes.quality_tier}
                        size="small"
                      />
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {item.variant.display_name}
                    </Typography>
                  </Box>
                  
                  {/* Price and quantity details */}
                  {/* Requirement 27.11: Per-variant pricing */}
                  <Typography variant="body2" color="text.secondary">
                    {item.price_per_unit.toLocaleString()} aUEC × {item.quantity}
                    {quantityChange && (
                      <Typography
                        component="span"
                        variant="body2"
                        color="primary"
                        sx={{ ml: 0.5 }}
                      >
                        (was {quantityChange.old})
                      </Typography>
                    )}
                  </Typography>
                </Box>
                
                {/* NEW! chip for added items or quantity changes */}
                {(isNew || quantityChange) && (
                  <Chip label="NEW!" size="small" color="primary" />
                )}
              </Box>
              
              {/* Subtotal */}
              <Typography variant="body1" fontWeight="medium">
                {subtotal.toLocaleString()} aUEC
              </Typography>
            </Box>
          )
        })}
        
        {/* Total row */}
        <Divider />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            {t("orderSummary.total", "Total")}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
            {itemsTotal.toLocaleString()}{" "}
            <Box
              component="span"
              sx={{ color: "text.primary", fontWeight: "bold" }}
            >
              aUEC
            </Box>
          </Typography>
        </Box>
      </Stack>
    </Box>
  )
}
