import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Fab,
  Fade,
  Grid,
  Typography,
  useMediaQuery,
} from "@mui/material"
import React, { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router-dom"
import { RefreshRounded, EditRounded, ShareRounded } from "@mui/icons-material"
import moment from "moment/moment"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import { ExtendedUniqueSearchResult } from "../../domain/types"
import { useRefreshMarketListingMutation } from "../../api/marketApi"
import { formatMarketUrl } from "../../domain/urls"
import { useCurrentOrg } from "../../../../hooks/login/CurrentOrg"
import { useGetUserProfileQuery } from "../../../../store/profile"
import { useAlertHook } from "../../../../hooks/alert/AlertHook"
import { useMarketSidebarExp } from "../../hooks/MarketSidebar"
import { UnderlineLink } from "../../../../components/typography/UnderlineLink"
import {
  MarketListingRating,
  BadgeDisplay,
} from "../../../../components/rating/ListingRating"
import {
  calculateBadgesFromRating,
  prioritizeBadges,
} from "../../../../util/badges"
import { getRelativeTime } from "../../../../util/time"
import { FALLBACK_IMAGE_URL } from "../../../../util/constants"
import { LongPressMenu } from "../../../../components/gestures"

export function ListingRefreshButton(props: {
  listing: ExtendedUniqueSearchResult
}) {
  const { listing } = props
  const [refresh] = useRefreshMarketListingMutation()

  return (
    <Fab
      sx={{ position: "absolute", right: 8, top: 8 }}
      color={"primary"}
      size={"small"}
      onClick={async (event) => {
        event.preventDefault()
        event.stopPropagation()
        await refresh(listing.listing_id)
      }}
    >
      <RefreshRounded />
    </Fab>
  )
}

export const ItemListingBase = React.memo(
  function ItemListingBase(props: {
    listing: ExtendedUniqueSearchResult
    index: number
  }) {
    const { t, i18n } = useTranslation()
    const { listing, index } = props
    const { user_seller, contractor_seller } = listing
    const theme = useTheme<ExtendedTheme>()
    const isMobile = useMediaQuery(theme.breakpoints.down("md"))
    const navigate = useNavigate()
    const issueAlert = useAlertHook()
    const [timeDisplay, setTimeDisplay] = useState(
      listing.auction_end_time
        ? getRelativeTime(new Date(listing.auction_end_time))
        : "",
    )

    useEffect(() => {
      if (listing.auction_end_time) {
        const interval = setInterval(
          () =>
            listing.auction_end_time &&
            setTimeDisplay(getRelativeTime(new Date(listing.auction_end_time))),
          1000,
        )
        return () => {
          clearInterval(interval)
        }
      }
    }, [listing])
    const ending = useMemo(
      () =>
        timeDisplay.endsWith("seconds") ||
        timeDisplay.endsWith("minutes") ||
        timeDisplay.endsWith("minute") ||
        timeDisplay.endsWith("minute"),
      [timeDisplay],
    )
    const { data: profile } = useGetUserProfileQuery()
    const [currentOrg] = useCurrentOrg()
    const showExpiration = useMemo(
      () =>
        (listing.user_seller === profile?.username ||
          (currentOrg &&
            currentOrg.spectrum_id === listing.contractor_seller)) &&
        listing.expiration &&
        profile,
      [
        currentOrg,
        listing.contractor_seller,
        listing.expiration,
        listing.user_seller,
        profile,
      ],
    )

    // Determine if this is the user's own listing
    const isMyListing = useMemo(
      () =>
        listing.user_seller === profile?.username ||
        (currentOrg && currentOrg.spectrum_id === listing.contractor_seller),
      [
        listing.user_seller,
        listing.contractor_seller,
        profile?.username,
        currentOrg,
      ],
    )

    // Long-press menu actions for my listings
    const longPressActions = useMemo(() => {
      if (!isMyListing) return []
      return [
        {
          label: t("market.editListing", { defaultValue: "Edit Listing" }),
          icon: <EditRounded />,
          onClick: () => navigate(`/market/edit/${listing.listing_id}`),
        },
        {
          label: t("market.shareListing", { defaultValue: "Share" }),
          icon: <ShareRounded />,
          onClick: () => {
            if (navigator.share) {
              navigator
                .share({
                  title: listing.title,
                  text: listing.title,
                  url: `${window.location.origin}${formatMarketUrl(listing)}`,
                })
                .catch(() => {
                  // User cancelled or error occurred
                })
            } else {
              // Fallback: copy to clipboard
              navigator.clipboard.writeText(
                `${window.location.origin}${formatMarketUrl(listing)}`,
              )
              issueAlert({
                message: t("market.linkCopied", {
                  defaultValue: "Link copied to clipboard",
                }),
                severity: "success",
              })
            }
          },
        },
      ]
    }, [isMyListing, listing, navigate, t, issueAlert])

    // Calculate badges for mobile display at top
    const rating = {
      avg_rating: listing.avg_rating,
      rating_count: listing.rating_count || 0,
      total_rating: listing.total_rating,
      streak: listing.rating_streak || 0,
      total_orders: listing.total_orders || 0,
      total_assignments: listing.total_assignments || 0,
      response_rate: listing.response_rate || 0,
    }
    const allBadges =
      listing.badges?.badge_ids || calculateBadgesFromRating(rating)
    const badges = prioritizeBadges(allBadges, 3) // Show up to 3 badges at top

    // Condensed mobile variant (vertical layout, smaller text and height)
    const mobileListingContent = (
      <Fade
        in={true}
        style={{
          transitionDelay: `${50 + 50 * index}ms`,
          transitionDuration: "500ms",
        }}
      >
        <Box
          sx={{
            position: "relative",
            borderRadius: theme.spacing(theme.borderRadius.topLevel),
          }}
        >
          {showExpiration &&
            moment(listing.expiration) <
              moment().add(1, "months").subtract(3, "days") && (
              <ListingRefreshButton listing={listing} />
            )}
          <Link
            to={formatMarketUrl(listing)}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <CardActionArea
              sx={{
                borderRadius: theme.spacing(theme.borderRadius.topLevel),
              }}
            >
              <Card
                sx={{
                  height: 300,
                  position: "relative",
                }}
              >
                {moment(listing.timestamp) > moment().subtract(3, "days") && (
                  <Chip
                    label={t("market.new")}
                    color={"secondary"}
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 4,
                      left: 4,
                      zIndex: 2,
                      textTransform: "uppercase",
                      fontWeight: "bold",
                      fontSize: "0.65rem",
                      height: 18,
                    }}
                  />
                )}
                {listing.quantity_available === 0 && (
                  <Chip
                    label={t("market.outOfStock")}
                    color={"error"}
                    size="small"
                    sx={{
                      position: "absolute",
                      top: listing.internal ? 28 : 4,
                      right: 4,
                      zIndex: 2,
                      textTransform: "uppercase",
                      fontWeight: "bold",
                      fontSize: "0.65rem",
                      height: 18,
                    }}
                  />
                )}
                {listing.internal && (
                  <Chip
                    label={t("market.internalListing")}
                    color={"warning"}
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      zIndex: 2,
                      textTransform: "uppercase",
                      fontWeight: "bold",
                      fontSize: "0.65rem",
                      height: 18,
                    }}
                  />
                )}
                <CardMedia
                  component="img"
                  loading="lazy"
                  image={listing.photo || FALLBACK_IMAGE_URL}
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null
                    currentTarget.src = FALLBACK_IMAGE_URL
                  }}
                  sx={{
                    width: "100%",
                    objectFit: "cover",
                    ...(theme.palette.mode === "dark"
                      ? {
                          height: "100%",
                          aspectRatio: "16/9",
                        }
                      : {
                          height: 150,
                          aspectRatio: "16/9",
                        }),
                    overflow: "hidden",
                  }}
                  alt={`Image of ${listing.title}`}
                />
                <Box
                  sx={{
                    ...(theme.palette.mode === "light"
                      ? {
                          display: "none",
                        }
                      : {}),
                    position: "absolute",
                    zIndex: 3,
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: "100%",
                    borderRadius: theme.spacing(theme.borderRadius.topLevel),
                    background: `linear-gradient(to bottom, transparent, transparent 50%, ${theme.palette.background.sidebar}AA 60%, ${theme.palette.background.sidebar} 100%)`,
                  }}
                />

                <CardContent
                  sx={{
                    ...(theme.palette.mode === "dark"
                      ? {
                          position: "absolute",
                          bottom: 0,
                          zIndex: 4,
                        }
                      : {}),
                    maxWidth: "100%",
                    padding: "8px 12px !important",
                  }}
                >
                  <Typography
                    variant={"h6"}
                    color={"primary"}
                    fontWeight={"bold"}
                    sx={{
                      fontSize: "0.95rem",
                      mb: 0.5,
                    }}
                  >
                    {listing.price.toLocaleString(i18n.language)} aUEC
                  </Typography>
                  <Typography
                    variant={"body2"}
                    color={"text.secondary"}
                    sx={{
                      fontSize: "0.75rem",
                      lineHeight: 1.3,
                      maxHeight: 36,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      mb: 0.5,
                    }}
                  >
                    {listing.title} ({listing.item_type})
                  </Typography>
                  <Box sx={{ mb: 0 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mb: 0.25,
                        flexWrap: "wrap",
                      }}
                    >
                      <UnderlineLink
                        component="span"
                        display={"inline"}
                        noWrap={true}
                        variant={"caption"}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          navigate(
                            user_seller
                              ? `/user/${user_seller}`
                              : `/contractor/${contractor_seller}`,
                          )
                        }}
                        sx={{
                          overflowX: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          cursor: "pointer",
                          fontSize: "0.7rem",
                          lineHeight: 1.2,
                        }}
                      >
                        {user_seller || contractor_seller}
                      </UnderlineLink>
                      {badges.length > 0 && (
                        <BadgeDisplay badges={badges} iconSize="0.7rem" />
                      )}
                    </Box>
                    <Box
                      sx={{
                        fontSize: "0.7rem",
                        lineHeight: 1,
                        display: "flex",
                        alignItems: "center",
                        mt: 0,
                        mb: 0,
                      }}
                    >
                      <MarketListingRating
                        avg_rating={listing.avg_rating}
                        rating_count={listing.rating_count}
                        total_rating={listing.total_rating}
                        rating_streak={listing.rating_streak}
                        total_orders={listing.total_orders}
                        total_assignments={listing.total_assignments}
                        response_rate={listing.response_rate}
                        badge_ids={[]}
                        display_limit={0}
                        showBadges={false}
                      />
                    </Box>
                  </Box>

                  {listing.auction_end_time && (
                    <Typography
                      component="div"
                      display={"block"}
                      sx={{ mb: 0, lineHeight: 1.2 }}
                    >
                      <Typography
                        component="span"
                        display={"inline"}
                        color={ending ? "error.light" : "inherit"}
                        variant={"caption"}
                        sx={{ fontSize: "0.7rem", lineHeight: 1.2 }}
                      >
                        {timeDisplay.endsWith("ago")
                          ? t("market.ended", { time: timeDisplay })
                          : t("market.ending_in", { time: timeDisplay })}
                      </Typography>
                    </Typography>
                  )}
                  {showExpiration && (
                    <Typography
                      component="div"
                      display={"block"}
                      sx={{ mb: 0, lineHeight: 1.2 }}
                    >
                      <Typography
                        component="span"
                        display={"inline"}
                        color={ending ? "error.light" : "inherit"}
                        variant={"caption"}
                        sx={{ fontSize: "0.7rem", lineHeight: 1.2 }}
                      >
                        {t("market.expiration", {
                          time: getRelativeTime(new Date(listing.expiration!)),
                        })}
                      </Typography>
                    </Typography>
                  )}
                  <Typography
                    display={"block"}
                    color={"text.primary"}
                    variant={"caption"}
                    sx={{
                      fontSize: "0.7rem",
                      lineHeight: 1.2,
                      mt: listing.auction_end_time || showExpiration ? 0.25 : 0,
                    }}
                  >
                    {t("market.available", {
                      count: listing.quantity_available,
                    })}
                  </Typography>
                </CardContent>
              </Card>
            </CardActionArea>
          </Link>
        </Box>
      </Fade>
    )

    // Desktop variant (original layout)
    const listingContent = (
      <Fade
        in={true}
        style={{
          transitionDelay: `${50 + 50 * index}ms`,
          transitionDuration: "500ms",
        }}
      >
        <Box
          sx={{
            position: "relative",
            borderRadius: theme.spacing(theme.borderRadius.topLevel),
          }}
        >
          {showExpiration &&
            moment(listing.expiration) <
              moment().add(1, "months").subtract(3, "days") && (
              <ListingRefreshButton listing={listing} />
            )}
          <Link
            to={formatMarketUrl(listing)}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <CardActionArea
              sx={{ borderRadius: theme.spacing(theme.borderRadius.topLevel) }}
            >
              <Card
                sx={{
                  height: 420,
                  position: "relative",
                }}
              >
                {moment(listing.timestamp) > moment().subtract(3, "days") && (
                  <Chip
                    label={t("market.new")}
                    color={"secondary"}
                    sx={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      textTransform: "uppercase",
                      fontWeight: "bold",
                    }}
                  />
                )}
                {listing.quantity_available === 0 && (
                  <Chip
                    label={t("market.outOfStock")}
                    color={"error"}
                    sx={{
                      position: "absolute",
                      top: listing.internal ? 48 : 8,
                      right: 8,
                      textTransform: "uppercase",
                      fontWeight: "bold",
                    }}
                  />
                )}
                {listing.internal && (
                  <Chip
                    label={t("market.internalListing")}
                    color={"warning"}
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      textTransform: "uppercase",
                      fontWeight: "bold",
                    }}
                  />
                )}
                <CardMedia
                  component="img"
                  loading="lazy"
                  image={listing.photo || FALLBACK_IMAGE_URL}
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null
                    currentTarget.src = FALLBACK_IMAGE_URL
                  }}
                  sx={{
                    ...(theme.palette.mode === "dark"
                      ? {
                          height: "100%",
                        }
                      : {
                          height: 244,
                        }),
                    // maxHeight: '100%',
                    overflow: "hidden",
                  }}
                  alt={`Image of ${listing.title}`}
                />
                <Box
                  sx={{
                    ...(theme.palette.mode === "light"
                      ? {
                          display: "none",
                        }
                      : {}),
                    position: "absolute",
                    zIndex: 3,
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: "100%",
                    borderRadius: theme.spacing(theme.borderRadius.topLevel),
                    background: `linear-gradient(to bottom, transparent, transparent 60%, ${theme.palette.background.sidebar}AA 70%, ${theme.palette.background.sidebar} 100%)`,
                  }}
                />

                <CardContent
                  sx={{
                    ...(theme.palette.mode === "dark"
                      ? {
                          position: "absolute",
                          bottom: 0,
                          zIndex: 4,
                        }
                      : {}),
                    maxWidth: "100%",
                  }}
                >
                  <Typography
                    variant={"h5"}
                    color={"primary"}
                    fontWeight={"bold"}
                  >
                    {listing.price.toLocaleString(i18n.language)} aUEC
                  </Typography>
                  <Typography
                    variant={"subtitle2"}
                    color={"text.secondary"}
                    maxHeight={60}
                  >
                    <span
                      style={{
                        lineClamp: "2",
                        textOverflow: "ellipsis",
                        // whiteSpace: "pre-line",
                        overflow: "hidden",
                        WebkitBoxOrient: "vertical",
                        display: "-webkit-box",
                        WebkitLineClamp: "2",
                      }}
                    >
                      {listing.title} ({listing.item_type})
                    </span>{" "}
                  </Typography>
                  <Box sx={{ mb: 0.5 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mb: 0.5,
                        flexWrap: "wrap",
                      }}
                    >
                      <UnderlineLink
                        component="span"
                        display={"inline"}
                        noWrap={true}
                        variant={"subtitle2"}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          navigate(
                            user_seller
                              ? `/user/${user_seller}`
                              : `/contractor/${contractor_seller}`,
                          )
                        }}
                        sx={{
                          overflowX: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          cursor: "pointer",
                        }}
                      >
                        {user_seller || contractor_seller}
                      </UnderlineLink>
                      {badges.length > 0 && (
                        <BadgeDisplay
                          badges={badges}
                          iconSize={isMobile ? "1.5em" : undefined}
                        />
                      )}
                    </Box>
                    <Box
                      sx={{
                        lineHeight: 1,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <MarketListingRating
                        avg_rating={listing.avg_rating}
                        rating_count={listing.rating_count}
                        total_rating={listing.total_rating}
                        rating_streak={listing.rating_streak}
                        total_orders={listing.total_orders}
                        total_assignments={listing.total_assignments}
                        response_rate={listing.response_rate}
                        badge_ids={listing.badges?.badge_ids || null}
                        display_limit={3}
                        iconSize={isMobile ? "1.5em" : undefined}
                        showBadges={false}
                      />
                    </Box>
                  </Box>

                  {listing.auction_end_time && (
                    <Typography component="div" display={"block"}>
                      <Typography
                        component="span"
                        display={"inline"}
                        color={ending ? "error.light" : "inherit"}
                        variant={"subtitle2"}
                      >
                        {timeDisplay.endsWith("ago")
                          ? t("market.ended", { time: timeDisplay })
                          : t("market.ending_in", { time: timeDisplay })}
                      </Typography>
                    </Typography>
                  )}
                  {showExpiration && (
                    <Typography component="div" display={"block"}>
                      <Typography
                        component="span"
                        display={"inline"}
                        color={ending ? "error.light" : "inherit"}
                        variant={"subtitle2"}
                      >
                        {t("market.expiration", {
                          time: getRelativeTime(new Date(listing.expiration!)),
                        })}
                      </Typography>
                    </Typography>
                  )}
                  <Typography
                    display={"block"}
                    color={"text.primary"}
                    variant={"subtitle2"}
                  >
                    {t("market.available", {
                      count: listing.quantity_available,
                    })}
                  </Typography>
                  {listing.languages && listing.languages.length > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.5,
                        flexWrap: "wrap",
                        mt: 1,
                      }}
                    >
                      {listing.languages.map((lang) => (
                        <Chip
                          key={lang.code}
                          label={lang.name}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: "0.7rem" }}
                          onClick={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </CardActionArea>
          </Link>
        </Box>
      </Fade>
    )

    // Wrap with LongPressMenu if actions are available
    if (longPressActions.length > 0 && isMobile) {
      return (
        <LongPressMenu actions={longPressActions} enabled={isMobile}>
          {mobileListingContent}
        </LongPressMenu>
      )
    }

    // Always use mobile variant for compact layout
    return mobileListingContent
  },
  (prevProps, nextProps) => {
    // Custom comparison: only re-render if listing data actually changed
    return (
      prevProps.listing.listing_id === nextProps.listing.listing_id &&
      prevProps.listing.price === nextProps.listing.price &&
      prevProps.listing.quantity_available ===
        nextProps.listing.quantity_available &&
      prevProps.listing.status === nextProps.listing.status &&
      prevProps.listing.expiration === nextProps.listing.expiration &&
      prevProps.index === nextProps.index
    )
  },
)

export function ItemListing(props: {
  listing: ExtendedUniqueSearchResult
  index: number
}) {
  const { listing, index } = props
  const marketSidebarOpen = useMarketSidebarExp()

  return (
    <Grid
      item
      xs={marketSidebarOpen ? 12 : 6}
      sm={marketSidebarOpen ? 12 : 6}
      md={marketSidebarOpen ? 6 : 3}
      lg={marketSidebarOpen ? 4.8 : 2.4}
      xl={marketSidebarOpen ? 4 : 2}
      xxl={marketSidebarOpen ? 3.43 : 1.71}
      sx={{ transition: "0.3s" }}
      // key={listing.listing.listing_id}
    >
      <ItemListingBase listing={listing} index={index} />
    </Grid>
  )
}
