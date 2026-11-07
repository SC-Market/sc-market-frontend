import {
  Box,
  Breadcrumbs,
  CardHeader,
  Chip,
  Link,
  Stack,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { Link as RouterLink } from "react-router-dom"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { QualityBadge } from "../../../components/market/v2/QualityBadge"
import { useTranslation } from "react-i18next"
import { ListingDetailItem } from "../listing-view/components/ListingDetailItem"
import {
  PersonRounded,
  AccessTimeRounded,
  VisibilityRounded,
} from "@mui/icons-material"
import { ClockAlert } from "mdi-material-ui"
import { USER_PATHS } from "../../../routes/paths"
import { useFormatters, useNow } from "../../../util/format"
import type { StandingBuyOrder } from "../../../store/api/v2/market"

const STATUS_COLORS: Record<
  string,
  "success" | "warning" | "error" | "default"
> = {
  active: "success",
  fulfilled: "default",
  expired: "warning",
  cancelled: "error",
}

/** Card header: breadcrumbs, item name and status, buyer, visibility, dates. */
export function BuyOrderDetailHeader({
  buyOrder,
  breadcrumbs,
}: {
  buyOrder: StandingBuyOrder
  breadcrumbs: { label: string; href?: string }[]
}) {
  const fmt = useFormatters()
  const now = useNow()
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  return (
    <CardHeader
      disableTypography
      title={
        <Stack direction="column" spacing={theme.layoutSpacing.text}>
          <Breadcrumbs separator="›" sx={{ fontSize: "0.85rem" }}>
            {breadcrumbs.map((crumb, i) =>
              crumb.href && i < breadcrumbs.length - 1 ? (
                <Link
                  key={i}
                  component={RouterLink}
                  to={crumb.href}
                  underline="hover"
                  color="text.secondary"
                  variant="body2"
                >
                  {crumb.label}
                </Link>
              ) : (
                <Typography key={i} variant="body2" color="text.secondary">
                  {crumb.label}
                </Typography>
              ),
            )}
          </Breadcrumbs>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h5" fontWeight="bold">
              {buyOrder.game_item_name}
            </Typography>
            <Chip
              label={buyOrder.status.toUpperCase()}
              color={STATUS_COLORS[buyOrder.status] || "default"}
              size="small"
              variant="outlined"
            />
            {buyOrder.negotiable && (
              <Chip
                label="NEGOTIABLE"
                size="small"
                color="info"
                variant="outlined"
              />
            )}
          </Stack>
        </Stack>
      }
      subheader={
        <Stack direction="column" spacing={0.5} sx={{ mt: 1.5 }}>
          {/* Buyer */}
          <ListingDetailItem icon={<PersonRounded fontSize="small" />}>
            <Link
              component={RouterLink}
              to={USER_PATHS.profile(buyOrder.buyer_name)}
              underline="hover"
              color="text.primary"
              variant="subtitle2"
            >
              {buyOrder.buyer_name}
            </Link>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ ml: 0.5 }}
            >
              {t("marketV2.isLookingFor")}
            </Typography>
          </ListingDetailItem>

          {/* Visibility */}
          {buyOrder.visibility && buyOrder.visibility !== "public" && (
            <ListingDetailItem icon={<VisibilityRounded fontSize="small" />}>
              <Chip
                label={
                  buyOrder.visibility === "roster_only"
                    ? t("marketV2.rosterOnly")
                    : t("marketV2.private")
                }
                size="small"
                variant="outlined"
              />
            </ListingDetailItem>
          )}

          {/* Created */}
          <ListingDetailItem icon={<AccessTimeRounded fontSize="small" />}>
            {t("marketV2.posted", {
              time: fmt.relative(new Date(buyOrder.created_at), now),
            })}
          </ListingDetailItem>

          {/* Expires */}
          {buyOrder.expires_at && (
            <ListingDetailItem icon={<ClockAlert fontSize="small" />}>
              {t("marketV2.expires", {
                time: fmt.relative(new Date(buyOrder.expires_at), now),
              })}
            </ListingDetailItem>
          )}
        </Stack>
      }
    />
  )
}

/** The minimum (and maximum) quality tier or value the buyer accepts. */
export function BuyOrderQualityRequirements({
  buyOrder,
}: {
  buyOrder: StandingBuyOrder
}) {
  const { t } = useTranslation()
  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
        {t("marketV2.qualityRequirements")}
      </Typography>
      {buyOrder.quality_tier_min && (
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <QualityBadge tier={buyOrder.quality_tier_min} size="small" />
          {buyOrder.quality_tier_max &&
            buyOrder.quality_tier_max !== buyOrder.quality_tier_min && (
              <>
                <Typography variant="caption" color="text.secondary">
                  {t("marketV2.rangeTo")}
                </Typography>
                <QualityBadge tier={buyOrder.quality_tier_max} size="small" />
              </>
            )}
        </Stack>
      )}
      {buyOrder.quality_value_min != null && (
        <Typography variant="body2">
          {buyOrder.quality_value_min}
          {buyOrder.quality_value_max != null &&
          buyOrder.quality_value_max !== buyOrder.quality_value_min
            ? ` – ${buyOrder.quality_value_max}`
            : "+"}{" "}
          / 1000 quality
        </Typography>
      )}
    </Box>
  )
}
