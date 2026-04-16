import React, { useMemo } from "react"
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Fade,
  IconButton,
  Stack,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material"
import { Link } from "react-router-dom"
import { getRelativeTime } from "../../../util/time"
import {
  CreateRounded,
  PersonRounded,
  RefreshRounded,
  VisibilityRounded,
  WarningRounded,
  SportsEsportsRounded,
} from "@mui/icons-material"
import { MarkdownRender } from "../../../components/markdown/Markdown.lazy"
import { ListingNameAndRating } from "../../../components/rating/ListingRating"
import { subDays } from "date-fns"
import { ClockAlert } from "mdi-material-ui"
import { useTranslation } from "react-i18next"
import { ReportButton } from "../../../components/button/ReportButton"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { useTheme } from "@mui/material/styles"
import { ListingDetailItem } from "../../../features/market/listing-view/components/ListingDetailItem"
import { dateDiffInDays } from "../../../util/dateDiff"
import { SellerStatusBadge } from "../../../components/presence/SellerStatusBadge"
import { useGetListingDetailsQuery } from "../../../store/api/v2/market"
import { VariantBreakdown } from "./VariantBreakdown"

interface ListingDetailV2Props {
  listingId: string
  currentOrg?: any
  profile?: any
  PurchaseArea?: React.ComponentType<{ listing: any }>
  BidArea?: React.ComponentType<{ listing: any }>
}

/**
 * ListingDetailV2 Component
 * 
 * Displays detailed information about a V2 listing including:
 * - Listing metadata (title, description, seller info)
 * - Seller rating and type (user/contractor)
 * - Created date and status
 * - Variant breakdown with quality tiers
 * 
 * CRITICAL: Maintains visual parity with V1 MarketListingDetails component
 * CRITICAL: Uses TSOA-generated RTK Query client (useGetListingDetailsQuery)
 * 
 * Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6
 */
export function ListingDetailV2({
  listingId,
  currentOrg,
  profile,
  PurchaseArea,
  BidArea,
}: ListingDetailV2Props) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  // ⚠️ CRITICAL: Use RTK Query hook from generated API
  const { data: listingData, isLoading, error } = useGetListingDetailsQuery({ listingId })

  // Single documented type extension for V1 fields the API may still return
  type ListingWithV1Fields = NonNullable<typeof listingData>["listing"] & {
    user_seller?: any
    contractor_seller?: any
    languages?: Array<{ code: string; name: string }>
  }
  const listing = listingData?.listing as ListingWithV1Fields

  const amContractor = useMemo(
    () =>
      profile &&
      currentOrg?.spectrum_id === listing?.contractor_seller?.spectrum_id,
    [currentOrg?.spectrum_id, listing, profile],
  )

  const amSeller = useMemo(
    () =>
      profile &&
      profile?.username === listing?.user_seller?.username &&
      !currentOrg,
    [currentOrg, listing, profile?.username],
  )

  const amRelated = useMemo(
    () => amSeller || amContractor || profile?.role === "admin",
    [amSeller, amContractor, profile?.role],
  )

  // Handle loading state
  if (isLoading) {
    return (
      <Card sx={{ minHeight: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Card>
    )
  }

  // Handle error state (including 404)
  if (error || !listingData) {
    return (
      <Card sx={{ minHeight: 400, padding: 3 }}>
        <Alert severity="error">
          {error && "status" in error && error.status === 404
            ? t("MarketListingView.notFound", "Listing not found")
            : t("MarketListingView.error", "Failed to load listing details")}
        </Alert>
      </Card>
    )
  }

  const { details, stats } = listingData
  const seller = listing?.user_seller || listing?.contractor_seller
  const languages = listing?.languages || []

  // Map variant data from the listings field
  const variants = (listingData.listings || []).map((l: any) => ({
    variant_id: l.listing_id || '',
    display_name: l.title || 'Variant',
    short_name: l.item_type || '',
    attributes: {
      quality_tier: l.quality_tier,
      quality_value: l.quality_value,
      quality_source: l.crafted_source,
    },
    quantity: l.quantity_available || 0,
    price: l.price || 0,
  }))

  return (
    <Fade in={true}>
      <Card
        sx={{
          minHeight: 400,
        }}
      >
        <CardHeader
          disableTypography
          sx={{
            padding: 3,
            paddingBottom: 1,
          }}
          title={
            <Stack
              direction={"column"}
              alignItems={"left"}
              spacing={theme.layoutSpacing.text}
              justifyContent={"left"}
            >
              <Typography
                sx={{
                  marginRight: 1,
                  display: "flex",
                  alignItems: "center",
                }}
                variant={"h5"}
                color={"text.secondary"}
                fontWeight={"bold"}
              >
                {details.title}{" "}
                <Typography display={"inline"} sx={{ marginLeft: 1 }}>
                  {dateDiffInDays(new Date(), new Date(listing.timestamp)) <=
                    1 && (
                    <Chip
                      color={"secondary"}
                      label={t("MarketListingView.new")}
                      sx={{
                        marginRight: 1,
                        textTransform: "uppercase",
                        fontSize: "0.85em",
                        fontWeight: "bold",
                      }}
                    />
                  )}
                </Typography>
              </Typography>
            </Stack>
          }
          subheader={
            <Box>
              <Stack direction={"column"} alignItems={"left"}>
                <ListingDetailItem
                  icon={<PersonRounded fontSize={"inherit"} />}
                >
                  <ListingNameAndRating
                    user={listing?.user_seller}
                    contractor={listing?.contractor_seller}
                  />
                </ListingDetailItem>

                <ListingDetailItem
                  icon={<CreateRounded fontSize={"inherit"} />}
                >
                  {t("MarketListingView.listed")}{" "}
                  {getRelativeTime(new Date(listing.timestamp))}
                </ListingDetailItem>

                <ListingDetailItem
                  icon={<RefreshRounded fontSize={"inherit"} />}
                >
                  {t("MarketListingView.updated")}{" "}
                  {getRelativeTime(subDays(new Date(listing.expiration), 30))}
                </ListingDetailItem>

                <ListingDetailItem icon={<ClockAlert fontSize={"inherit"} />}>
                  {t("MarketListingView.expires")}{" "}
                  {getRelativeTime(new Date(listing.expiration))}
                </ListingDetailItem>

                <ListingDetailItem
                  icon={<VisibilityRounded fontSize={"inherit"} />}
                >
                  {t("MarketListingView.views")}{" "}
                  {(stats?.view_count || 0).toLocaleString()}
                </ListingDetailItem>

                {seller && (
                  <ListingDetailItem
                    icon={<SportsEsportsRounded fontSize={"inherit"} />}
                  >
                    <SellerStatusBadge
                      inGame={listing?.user_seller?.in_game}
                      lastSeen={seller.last_seen}
                      membersOnline={listing?.contractor_seller?.members_online}
                    />
                  </ListingDetailItem>
                )}

                <ListingDetailItem
                  icon={<WarningRounded fontSize={"inherit"} />}
                >
                  <ReportButton reportedUrl={`/market/${listing.listing_id}`} />
                </ListingDetailItem>

                {languages && languages.length > 0 && (
                  <ListingDetailItem
                    icon={<PersonRounded fontSize={"inherit"} />}
                  >
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
                      {languages.map((lang) => (
                        <Chip
                          key={lang.code}
                          label={lang.name}
                          size="small"
                          variant="outlined"
                          sx={{ height: 22, fontSize: "0.7rem" }}
                        />
                      ))}
                    </Box>
                  </ListingDetailItem>
                )}
              </Stack>
            </Box>
          }
          action={
            <Stack direction={"row"} spacing={theme.layoutSpacing.compact}>
              {amRelated &&
              listing.status !== "archived" &&
              listing.sale_type !== "auction" ? (
                <Link
                  to={`/market/edit/${listing.listing_id}`}
                  style={{ color: "inherit" }}
                >
                  <IconButton>
                    <CreateRounded style={{ color: "inherit" }} />
                  </IconButton>
                </Link>
              ) : undefined}
            </Stack>
          }
        />
        <CardContent
          sx={{
            width: "auto",
            minHeight: 192,
            padding: 3,
            paddingTop: 0,
          }}
        >
          {listing.status === "active" && (
            <>
              <Divider light />
              {listing.sale_type === "auction" && BidArea ? (
                <BidArea listing={listingData} />
              ) : PurchaseArea ? (
                <PurchaseArea listing={listingData} />
              ) : null}
              <Divider light />
            </>
          )}
          <Box sx={{ paddingTop: 2 }}>
            <Typography
              variant={"subtitle1"}
              fontWeight={"bold"}
              color={"text.secondary"}
            >
              {t("MarketListingView.description")}
            </Typography>
            <Typography variant={"body2"}>
              <MarkdownRender text={details.description} />
            </Typography>
          </Box>

          {/* V2-specific: Variant Breakdown */}
          {listingData.type === "unique" && (
            <Box sx={{ paddingTop: 2 }}>
              <Typography
                variant={"subtitle1"}
                fontWeight={"bold"}
                color={"text.secondary"}
                sx={{ mb: 1 }}
              >
                {t("MarketListingView.variants", "Available Variants")}
              </Typography>
              <VariantBreakdown
                variants={variants}
                onSelectVariant={(variantId) => {
                  console.log("Selected variant:", variantId)
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Fade>
  )
}
