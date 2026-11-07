import {
  CreateRounded,
  LocationOnRounded,
  PersonRounded,
  RefreshRounded,
  ShoppingCartRounded,
  StarRounded,
  VisibilityRounded,
  WarningRounded,
} from "@mui/icons-material"
import { Box, Chip, Link, Stack, Typography } from "@mui/material"
import { ClockAlert } from "mdi-material-ui"
import { useTranslation } from "react-i18next"
import { Link as RouterLink } from "react-router-dom"
import { ReportButton } from "../../../components/button/ReportButton"
import { SellerStatusBadge } from "../../../components/presence/SellerStatusBadge"
import { getLanguageName } from "../../../constants/languages"
import { MARKET_PATHS, SHOP_PATHS } from "../../../routes/paths"
import type { GetListingDetailResponse } from "../../../store/api/v2/market"
import { useFormatters, useNow } from "../../../util/format"
import { ListingDetailItem } from "../listing-view/components/ListingDetailItem"

/** The listing card's facts: seller, activity, locations, dates, views, languages, report. */
export function ListingDetailFacts({
  listing,
  seller,
  allLocations,
}: {
  listing: GetListingDetailResponse["listing"]
  seller: GetListingDetailResponse["seller"]
  allLocations: string[]
}) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const now = useNow()
  return (
    <>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 1 }}>
        <Stack direction="column" spacing={0.5} flex={1}>
          {/* Seller */}
          <ListingDetailItem icon={<PersonRounded fontSize="small" />}>
            <Box
              component="span"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <Link
                component={RouterLink}
                to={SHOP_PATHS.profile(seller.slug)}
                underline="hover"
                color="text.primary"
                variant="subtitle2"
              >
                {seller.name}
              </Link>
              <StarRounded
                sx={{
                  fontSize: "1rem",
                  color: "warning.main",
                }}
              />
              <Typography
                variant="subtitle2"
                color="text.secondary"
                component="span"
              >
                {seller.rating.toFixed(1)}
              </Typography>
            </Box>
          </ListingDetailItem>

          {/* Seller activity: last seen, reply time, completed orders */}
          {seller.activity && (
            <Box sx={{ pl: 3.5 }}>
              <SellerStatusBadge activity={seller.activity} />
            </Box>
          )}

          {/* Locations */}
          {allLocations.length > 0 && (
            <ListingDetailItem icon={<LocationOnRounded fontSize="small" />}>
              {allLocations.join(", ")}
            </ListingDetailItem>
          )}

          {/* Listed date */}
          <ListingDetailItem icon={<CreateRounded fontSize="small" />}>
            {t("MarketListingView.listed", "Listed")}{" "}
            {fmt.relative(listing.created_at, now)}
          </ListingDetailItem>

          {/* Updated date */}
          {listing.updated_at !== listing.created_at && (
            <ListingDetailItem icon={<RefreshRounded fontSize="small" />}>
              {t("MarketListingView.updated", "Updated")}{" "}
              {fmt.relative(listing.updated_at, now)}
            </ListingDetailItem>
          )}
        </Stack>

        <Stack direction="column" spacing={0.5} flex={1}>
          {/* Expires */}
          {listing.expires_at && (
            <ListingDetailItem
              icon={<ClockAlert style={{ fontSize: "1.25rem" }} />}
            >
              {t("MarketListingView.expires", "Expires")}{" "}
              {fmt.relative(listing.expires_at, now)}
            </ListingDetailItem>
          )}

          {/* Views */}
          <ListingDetailItem icon={<VisibilityRounded fontSize="small" />}>
            {t("MarketListingView.views", "Views")} {listing.view_count ?? 0}
          </ListingDetailItem>

          {/* In carts */}
          {(listing.in_carts ?? 0) > 0 && (
            <ListingDetailItem icon={<ShoppingCartRounded fontSize="small" />}>
              {t(
                "MarketListingView.inCarts",
                "{{count}} people have this in their cart",
                { count: listing.in_carts },
              )}
            </ListingDetailItem>
          )}

          {/* Languages */}
          {seller.languages && seller.languages.length > 0 && (
            <ListingDetailItem icon={<PersonRounded fontSize="small" />}>
              <Box
                sx={{
                  display: "flex",
                  gap: 0.5,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  {t("MarketListingView.languages", "Languages")}:
                </Typography>
                {seller.languages.map((lang) => (
                  <Chip
                    key={lang}
                    label={getLanguageName(lang) || lang}
                    size="small"
                    variant="outlined"
                    sx={{
                      height: 22,
                      fontSize: "0.7rem",
                    }}
                  />
                ))}
              </Box>
            </ListingDetailItem>
          )}

          {/* Report */}
          <ListingDetailItem icon={<WarningRounded fontSize="small" />}>
            <ReportButton
              reportedUrl={MARKET_PATHS.listing(listing.listing_id)}
            />
          </ListingDetailItem>
        </Stack>
      </Stack>
    </>
  )
}
