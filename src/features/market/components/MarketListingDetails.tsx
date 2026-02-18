import React, { useMemo } from "react"
import {
  Box,
  Breadcrumbs,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Fade,
  IconButton,
  Link as MaterialLink,
  Stack,
  Typography,
} from "@mui/material"
import { Link } from "react-router-dom"
import { getRelativeTime } from "../../../util/time"
import { useGetUserProfileQuery } from "../../../store/profile"
import {
  CreateRounded,
  PersonRounded,
  RefreshRounded,
  VisibilityRounded,
  WarningRounded,
} from "@mui/icons-material"
import { BaseListingType, UniqueListing } from ".."
import { MarkdownRender } from "../../../components/markdown/Markdown.lazy"
import { ListingNameAndRating } from "../../../components/rating/ListingRating"
import { has_permission } from "../../../views/contractor/OrgRoles"
import { subDays } from "date-fns"
import { ClockAlert } from "mdi-material-ui"
import { useTranslation } from "react-i18next"
import { ReportButton } from "../../../components/button/ReportButton"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { useTheme } from "@mui/material/styles"
import { ListingDetailItem } from "../listing-view/components/ListingDetailItem"
import { dateDiffInDays } from "../../../util/dateDiff"
import { useGetGameItemAttributesQuery } from "../../../store/api/attributes"
interface MarketListingDetailsProps {
  listing: BaseListingType
  currentOrg?: any
  profile?: any
  PurchaseArea: React.ComponentType<{ listing: BaseListingType }>
  BidArea: React.ComponentType<{ listing: UniqueListing }>
}

// Component for displaying item attributes
function ItemAttributesSection({ gameItemId }: { gameItemId: string }) {
  const { t } = useTranslation()
  const { data: attributesData } = useGetGameItemAttributesQuery(gameItemId)

  if (!attributesData?.attributes || attributesData.attributes.length === 0) {
    return null
  }

  return (
    <Box sx={{ paddingTop: 2 }}>
      <Typography
        variant={"subtitle1"}
        fontWeight={"bold"}
        color={"text.secondary"}
        sx={{ mb: 1 }}
      >
        {t("MarketListingView.itemAttributes", "Item Attributes")}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 1,
        }}
      >
        {attributesData.attributes.map((attr) => (
          <Box key={attr.attribute_name}>
            <Typography variant="caption" color="text.secondary">
              {attr.display_name}
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {attr.attribute_value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export function MarketListingDetails({
  listing: complete,
  currentOrg,
  profile: profileProp,
  PurchaseArea,
  BidArea,
}: MarketListingDetailsProps) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { listing, details } = complete
  const auction_details =
    complete.type === "unique" ? complete.auction_details : undefined
  const { data: profile } = useGetUserProfileQuery()
  const actualProfile = profileProp || profile

  const [timeDisplay, setTimeDisplay] = React.useState(
    auction_details ? getRelativeTime(new Date(auction_details.end_time)) : "",
  )

  React.useEffect(() => {
    if (auction_details) {
      const interval = setInterval(
        () =>
          auction_details &&
          setTimeDisplay(getRelativeTime(new Date(auction_details.end_time))),
        1000,
      )
      return () => {
        clearInterval(interval)
      }
    }
  }, [auction_details, listing])

  const ending = useMemo(
    () =>
      timeDisplay.endsWith("seconds") ||
      timeDisplay.endsWith("minutes") ||
      timeDisplay.endsWith("minute") ||
      timeDisplay.endsWith("minute"),
    [timeDisplay],
  )

  const amContractor = useMemo(
    () =>
      actualProfile &&
      currentOrg?.spectrum_id === listing.contractor_seller?.spectrum_id,
    [currentOrg?.spectrum_id, listing?.contractor_seller, actualProfile],
  )

  const amSeller = useMemo(
    () =>
      actualProfile &&
      actualProfile?.username === listing.user_seller?.username &&
      !currentOrg,
    [currentOrg, listing?.user_seller?.username, actualProfile?.username],
  )

  const amContractorManager = useMemo(
    () =>
      amContractor &&
      has_permission(
        currentOrg,
        actualProfile,
        "manage_market",
        actualProfile?.contractors,
      ),
    [currentOrg, actualProfile, amContractor],
  )

  const amRelated = useMemo(
    () => amSeller || amContractorManager || actualProfile?.role === "admin",
    [amSeller, amContractorManager, actualProfile?.role],
  )

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
              <Breadcrumbs
                aria-label={t("ui.aria.breadcrumb")}
                color={"text.primary"}
              >
                <MaterialLink
                  component={Link}
                  underline="hover"
                  color="inherit"
                  to="/market"
                >
                  {t("MarketListingView.market")}
                </MaterialLink>
                <MaterialLink
                  component={Link}
                  underline="hover"
                  color="inherit"
                  to={`/market?type=${encodeURIComponent(details.item_type)}`}
                >
                  {details.item_type}
                </MaterialLink>
                {details.item_name && (
                  <MaterialLink
                    component={Link}
                    underline="hover"
                    color="text.secondary"
                    to={`/market?query=${encodeURIComponent(
                      details.item_name,
                    )}`}
                  >
                    {details.item_name}
                  </MaterialLink>
                )}
              </Breadcrumbs>
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
              {auction_details && (
                <Typography
                  display={"inline"}
                  color={ending ? "error.light" : "inherit"}
                >
                  {timeDisplay.endsWith("ago")
                    ? t("MarketListingView.ended")
                    : t("MarketListingView.endingIn")}{" "}
                  {timeDisplay}
                </Typography>
              )}
            </Stack>
          }
          subheader={
            <Box>
              <Stack direction={"column"} alignItems={"left"}>
                <ListingDetailItem
                  icon={<PersonRounded fontSize={"inherit"} />}
                >
                  <ListingNameAndRating
                    user={listing.user_seller}
                    contractor={listing.contractor_seller}
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
                  {(complete.type === "unique" && complete.stats?.view_count
                    ? complete.stats.view_count
                    : 0
                  ).toLocaleString()}
                </ListingDetailItem>

                <ListingDetailItem
                  icon={<WarningRounded fontSize={"inherit"} />}
                >
                  <ReportButton reportedUrl={`/market/${listing.listing_id}`} />
                </ListingDetailItem>

                {listing.languages && listing.languages.length > 0 && (
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
                      {listing.languages.map((lang) => (
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
                  to={`/market_edit/${listing.listing_id}`}
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
              {listing.sale_type === "auction" ? (
                <BidArea listing={complete as UniqueListing} />
              ) : (
                <PurchaseArea listing={complete} />
              )}
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
          {details.game_item_id && (
            <ItemAttributesSection gameItemId={details.game_item_id} />
          )}
        </CardContent>
      </Card>
    </Fade>
  )
}
