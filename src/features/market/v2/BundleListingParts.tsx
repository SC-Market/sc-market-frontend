import { Box, Divider, Grid, Stack, Typography } from "@mui/material"
import { Link } from "react-router-dom"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { useTranslation } from "react-i18next"
import { QualityBadge } from "../../../components/market/v2/QualityBadge"
import { SHOP_PATHS } from "../../../routes/paths"
import { useFormatters } from "../../../util/format"
import { BundleListingV2 } from "./bundleListing"

/** Compact shop link for the seller section (replaces UserList for shop context) */
export function ShopSellerLink(props: {
  name: string
  slug: string
  avatar?: string
  rating?: number
  title?: string
}) {
  return (
    <Box>
      {props.title && (
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ pl: 2, pt: 1 }}
        >
          {props.title}
        </Typography>
      )}
      <Box
        component={Link}
        to={SHOP_PATHS.profile(props.slug)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2,
          py: 1,
          textDecoration: "none",
          color: "inherit",
          "&:hover": { bgcolor: "action.hover" },
          borderRadius: 1,
        }}
      >
        <Box
          component="img"
          src={props.avatar || undefined}
          alt={props.name}
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1,
            objectFit: "cover",
            bgcolor: "action.disabledBackground",
          }}
        />
        <Typography variant="body1">{props.name}</Typography>
      </Box>
    </Box>
  )
}

/**
 * BundlePurchaseArea - Purchase controls for bundle with variant selection
 *
 * Requirements: 42.7, 42.8, 42.9
 * Displays bundle total, variant selection status, and purchase button
 */
export function BundlePurchaseArea({
  listing,
  selectedVariants,
  bundleTotal,
  allVariantsSelected,
}: {
  listing: BundleListingV2
  selectedVariants: Record<string, string>
  bundleTotal: number
  allVariantsSelected: boolean
}) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  return (
    <Box sx={{ padding: 2 }}>
      <Grid container spacing={2}>
        {/* Bundle Items Summary */}
        <Grid item xs={12}>
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            color="text.secondary"
          >
            {t("market.bundleContents", "Bundle Contents")}
          </Typography>
          <Stack spacing={1} sx={{ marginTop: 1 }}>
            {listing.items.map((item) => {
              const selectedVariantId = selectedVariants[item.item_id]
              const selectedVariant =
                selectedVariantId &&
                item.variants.find((v) => v.variant_id === selectedVariantId)
              const autoSelectedVariant =
                item.variants.length === 1 ? item.variants[0] : null
              const variant = selectedVariant || autoSelectedVariant

              return (
                <Box
                  key={item.item_id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 1,
                    backgroundColor: theme.palette.background.default,
                    borderRadius: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" color="text.primary">
                      {item.game_item.name}
                    </Typography>
                    {variant && variant.attributes.quality_tier && (
                      <QualityBadge
                        tier={variant.attributes.quality_tier}
                        size="small"
                      />
                    )}
                  </Box>
                  <Typography variant="body2" color="primary" fontWeight="bold">
                    {variant
                      ? `${fmt.number(variant.price)} aUEC`
                      : t("market.selectVariant", "Select Variant")}
                  </Typography>
                </Box>
              )
            })}
          </Stack>
        </Grid>

        {/* Bundle Total */}
        <Grid item xs={12}>
          <Divider />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 2,
            }}
          >
            <Typography variant="h6" fontWeight="bold" color="text.secondary">
              {t("market.bundleTotal", "Bundle Total")}
            </Typography>
            <Typography variant="h5" color="primary" fontWeight="bold">
              {allVariantsSelected
                ? `${fmt.number(bundleTotal)} aUEC`
                : t("market.selectAllVariants", "Select all variants")}
            </Typography>
          </Box>
        </Grid>

        {/* Purchase Button */}
        <Grid item xs={12}>
          <Stack direction="row" spacing={2}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {allVariantsSelected
                  ? t("market.readyToPurchase", "Ready to purchase")
                  : t(
                      "market.selectVariantsPrompt",
                      "Please select a variant for each item",
                    )}
              </Typography>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}

/**
 * VariantDetailsTable - Displays variant attributes, quantities, and prices
 *
 * Requirements: 42.5, 42.6
 * Shows quality tier, attributes, quantity, and price for each variant
 */
export function VariantDetailsTable({
  variants,
}: {
  variants: Array<{
    variant_id: string
    attributes: {
      quality_tier?: number
      quality_value?: number
      crafted_source?: string
    }
    display_name: string
    short_name: string
    quantity: number
    price: number
  }>
}) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  return (
    <Box sx={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: theme.spacing(1) }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {t("market.quality", "Quality")}
              </Typography>
            </th>
            <th style={{ textAlign: "left", padding: theme.spacing(1) }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {t("market.variant", "Variant")}
              </Typography>
            </th>
            <th style={{ textAlign: "right", padding: theme.spacing(1) }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {t("market.quantity", "Quantity")}
              </Typography>
            </th>
            <th style={{ textAlign: "right", padding: theme.spacing(1) }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {t("market.price", "Price")}
              </Typography>
            </th>
          </tr>
        </thead>
        <tbody>
          {variants.map((variant) => (
            <tr key={variant.variant_id}>
              <td style={{ padding: theme.spacing(1) }}>
                {variant.attributes.quality_tier ? (
                  <QualityBadge
                    tier={variant.attributes.quality_tier}
                    size="small"
                  />
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    -
                  </Typography>
                )}
              </td>
              <td style={{ padding: theme.spacing(1) }}>
                <Typography variant="body2">{variant.display_name}</Typography>
              </td>
              <td style={{ textAlign: "right", padding: theme.spacing(1) }}>
                <Typography variant="body2">
                  {fmt.number(variant.quantity)}
                </Typography>
              </td>
              <td style={{ textAlign: "right", padding: theme.spacing(1) }}>
                <Typography variant="body2" color="primary">
                  {fmt.number(variant.price)} aUEC
                </Typography>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  )
}
