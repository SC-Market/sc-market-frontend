import React, { useMemo, useState } from "react"
import {
  Box,
  Breadcrumbs,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Fade,
  Grid,
  IconButton,
  Link as MaterialLink,
  MenuItem,
  Paper,
  Select,
  Typography,
} from "@mui/material"
import { Link } from "react-router-dom"
import { getRelativeTime } from "../../util/time"
import { Section } from "../../components/paper/Section"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useGetUserProfileQuery } from "../../store/profile"
import {
  CreateRounded,
  PersonRounded,
  RefreshRounded,
  ZoomInRounded,
} from "@mui/icons-material"
import { useCurrentMarketListing } from "../../hooks/market/CurrentMarketItem"
import { MarketMultiple } from "../../datatypes/MarketListing"
import { UserList } from "../../components/list/UserList"
import { OrderList } from "../../components/list/OrderList"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { MarkdownRender } from "../../components/markdown/Markdown"
import { Helmet } from "react-helmet"
import { FRONTEND_URL } from "../../util/constants"
import { ListingNameAndRating } from "../../components/rating/ListingRating"
import { has_permission } from "../contractor/OrgRoles"
import { ImagePreviewModal } from "../../components/modal/ImagePreviewModal"
import {
  dateDiffInDays,
  ListingDetailItem,
  PurchaseArea,
} from "./MarketListingView"
import { Stack } from "@mui/system"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import moment from "moment/moment"
import { ClockAlert } from "mdi-material-ui"
import { useTranslation } from "react-i18next"

export function MarketMultipleView() {
  const { t } = useTranslation()
  const [complete] = useCurrentMarketListing<MarketMultiple>()
  const { default_listing, listings } = complete

  const [currentListing, setCurrentListing] = useState(default_listing)
  const { listing, details, photos } = currentListing

  const { data: profile } = useGetUserProfileQuery()
  const [currentOrg] = useCurrentOrg()

  const amContractor = useMemo(
    () => currentOrg?.spectrum_id === listing.contractor_seller?.spectrum_id,
    [currentOrg?.spectrum_id, listing?.contractor_seller],
  )
  const amSeller = useMemo(
    () => profile?.username === listing.user_seller?.username && !currentOrg,
    [currentOrg, listing?.user_seller?.username, profile?.username],
  )

  const amContractorManager = useMemo(
    () =>
      amContractor &&
      has_permission(
        currentOrg,
        profile,
        "manage_market",
        profile?.contractors,
      ),
    [currentOrg, profile, amContractor],
  )

  const amRelated = useMemo(
    () => amSeller || amContractorManager || profile?.role === "admin",
    [amSeller, amContractorManager, profile?.role],
  )

  // const {data: contractor} = useGetContractorBySpectrumIDQuery(listing.listing.contractor_seller?.spectrum_id!, {skip: !listing.listing.contractor_seller})

  const issueAlert = useAlertHook()
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const theme = useTheme<ExtendedTheme>()

  return (
    <>
      <Grid item xs={12} lg={12}>
        <Grid container spacing={theme.layoutSpacing.layout}>
          <Grid item xs={12} lg={4}>
            <Grid container spacing={theme.layoutSpacing.layout}>
              <Grid item xs={12} lg={12}>
                <ImagePreviewModal
                  images={photos}
                  open={imageModalOpen}
                  onClose={() => setImageModalOpen(false)}
                />
                <Paper
                  sx={{
                    borderRadius: (theme) =>
                      theme.spacing(theme.borderRadius.image),
                    backgroundColor: theme.palette.background.default,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: 400,
                    maxHeight: 600,
                    height: 400,
                    width: "100%",
                    position: "relative",
                  }}
                  onClick={() => setImageModalOpen((o) => !o)}
                >
                  <IconButton sx={{ top: 4, right: 4, position: "absolute" }}>
                    <ZoomInRounded />
                  </IconButton>
                  <img
                    loading="lazy"
                    // component="img"
                    style={{
                      display: "block",
                      maxHeight: "100%",
                      maxWidth: "100%",
                      margin: "auto",
                    }}
                    src={photos[0]}
                    alt={details.description}
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null
                      currentTarget.src =
                        "https://cdn.robertsspaceindustries.com/static/images/Temp/default-image.png"
                    }}
                  />
                </Paper>

                <Helmet>
                  <meta name="description" content={details.description} />

                  {/* Open Graph Meta Tags */}
                  <meta property="og:type" content="website" />
                  <meta
                    property="og:url"
                    content={`${FRONTEND_URL}/market/multiple/${listing.listing_id}`}
                  />
                  <meta property="og:title" content={details.title} />
                  <meta
                    property="og:description"
                    content={details.description}
                  />
                  <meta property="og:image" content={photos[0]} />

                  {/* Twitter Card Meta Tags */}
                  <meta name="twitter:card" content="summary_large_image" />
                  <meta
                    name="twitter:url"
                    content={`${FRONTEND_URL}/market/multiple/${listing.listing_id}`}
                  />
                  <meta name="twitter:title" content={details.title} />
                  <meta
                    name="twitter:description"
                    content={details.description}
                  />
                  <meta name="twitter:image" content={photos[0]} />

                  <script type="application/ld+json">
                    {JSON.stringify({
                      "@context": "https://schema.org",
                      "@type": "Product",
                      seller: {
                        "@type": listing.contractor_seller
                          ? "Contractor"
                          : "User",
                        name:
                          listing.contractor_seller?.name ||
                          listing.user_seller?.display_name,
                      },
                      description: details.description,
                      name: details.title,
                      price: `${listing.price} aUEC`,
                      kind: details.item_type,
                      image: photos[0],
                      offers: {
                        "@type": "Offer",
                        url: `https://sc-market.space/market/${listing.listing_id}`,
                        priceCurrency: "JPY",
                        price: listing.price,
                        // "priceValidUntil": "2020-11-20",
                        // "itemCondition": "https://schema.org/NewCondition",
                        availability:
                          listing.quantity_available > 0
                            ? "https://schema.org/InStock"
                            : "https://schema.org/OutOfStock",
                      },
                    })}
                  </script>
                </Helmet>
              </Grid>

              {amRelated && (
                <Grid item lg={12} xs={12}>
                  <Grid container spacing={theme.layoutSpacing.component}>
                    <Section
                      disablePadding
                      xs={12}
                      title={t("MarketMultipleView.people")}
                      innerJustify={"flex-start"}
                    >
                      <Grid
                        item
                        xs={12}
                        sx={{
                          paddingTop: 2,
                          paddingBottom: 2,
                          boxSizing: "border-box",
                        }}
                      >
                        <UserList
                          users={[
                            listing.user_seller || listing.contractor_seller,
                          ]}
                          title={t("MarketMultipleView.seller")}
                        />
                        {/*{*/}
                        {/*    amRelated &&*/}
                        {/*    (*/}
                        {/*        <UserList users={[]}*/}
                        {/*                  title={listing.sale_type === 'sale' ? 'Customers' : 'Bidders'}/>*/}
                        {/*    )*/}
                        {/*}*/}
                      </Grid>
                    </Section>
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Grid>

          <Grid item xs={12} lg={8}>
            <Grid container spacing={theme.layoutSpacing.layout}>
              <Grid item xs={12}>
                <Fade in={true}>
                  <Card
                    sx={{
                      borderRadius: (theme) =>
                        theme.spacing(theme.borderRadius.image),
                      minHeight: 400,
                    }}
                  >
                    <CardHeader
                      disableTypography
                      sx={{
                        padding: 3,
                        paddingBottom: 0,
                      }}
                      title={
                        <Stack
                          direction={"column"}
                          alignItems={"left"}
                          spacing={theme.layoutSpacing.compact}
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
                              {t("MarketMultipleView.market")}
                            </MaterialLink>
                            <MaterialLink
                              component={Link}
                              underline="hover"
                              color="inherit"
                              to={`/market?type=${encodeURIComponent(
                                details.item_type,
                              )}`}
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
                            {complete.details.title}{" "}
                            <Typography
                              display={"inline"}
                              sx={{ marginLeft: 1 }}
                            >
                              {dateDiffInDays(
                                new Date(),
                                new Date(listing.timestamp),
                              ) <= 1 && (
                                <Chip
                                  color={"secondary"}
                                  label={t("MarketMultipleView.new")}
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
                            {t("MarketMultipleView.listed")}{" "}
                            {getRelativeTime(new Date(listing.timestamp))}
                          </ListingDetailItem>
                          <ListingDetailItem
                            icon={<RefreshRounded fontSize={"inherit"} />}
                          >
                            {t("MarketMultipleView.updated")}{" "}
                            {getRelativeTime(
                              moment(listing.expiration)
                                .subtract(30, "days")
                                .toDate(),
                            )}
                          </ListingDetailItem>
                          <ListingDetailItem
                            icon={<ClockAlert fontSize={"inherit"} />}
                          >
                            {t("MarketMultipleView.expires")}{" "}
                            {getRelativeTime(new Date(listing.expiration))}
                          </ListingDetailItem>
                        </Stack>
                      }
                      action={
                        amRelated ? (
                          <Link
                            to={`/market/multiple/${complete.multiple_id}/edit`}
                          >
                            <IconButton>
                              <CreateRounded
                                style={{ color: theme.palette.text.secondary }}
                              />
                            </IconButton>
                          </Link>
                        ) : undefined
                      }
                    />
                    <CardContent
                      sx={{
                        width: "auto",
                        minHeight: 192,
                        padding: 3,
                      }}
                    >
                      {currentListing.listing.status === "active" && (
                        <>
                          <Divider light />
                          <PurchaseArea listing={currentListing} />
                          <Divider light />
                        </>
                      )}

                      <Box sx={{ paddingTop: 2 }}>
                        <Typography
                          variant={"subtitle1"}
                          fontWeight={"bold"}
                          color={"text.secondary"}
                        >
                          {t("MarketMultipleView.selectItem")}
                        </Typography>
                        <Select
                          sx={{ marginBottom: 1 }}
                          onChange={(event, value) =>
                            setCurrentListing((old) => {
                              const found = listings.find(
                                (l) =>
                                  l.listing.listing_id === event.target.value,
                              )
                              if (found) {
                                return found
                              } else {
                                return old
                              }
                            })
                          }
                          value={currentListing.listing.listing_id}
                        >
                          {complete.listings.map((l) => (
                            <MenuItem
                              value={l.listing.listing_id}
                              key={l.listing.listing_id}
                            >
                              {l.details.title}
                            </MenuItem>
                          ))}
                        </Select>
                        <Typography
                          variant={"subtitle1"}
                          fontWeight={"bold"}
                          color={"text.secondary"}
                        >
                          {t("MarketMultipleView.description")}
                        </Typography>
                        <Typography variant={"body2"}>
                          <MarkdownRender text={details.description} />
                          <Divider light />
                          <MarkdownRender text={complete.details.description} />
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>

              {amRelated && !!listing.orders?.length && (
                <Section
                  disablePadding
                  xs={12}
                  title={t("MarketMultipleView.activeOrders")}
                  innerJustify={"flex-start"}
                >
                  <Grid
                    item
                    xs={12}
                    sx={{
                      paddingTop: 2,
                      paddingBottom: 2,
                      boxSizing: "border-box",
                    }}
                  >
                    <OrderList
                      orders={listing.orders.filter(
                        (o) => !["cancelled", "fulfilled"].includes(o.status),
                      )}
                    />
                  </Grid>
                </Section>
              )}

              {amRelated && !!listing.orders?.length && (
                <Section
                  disablePadding
                  xs={12}
                  title={t("MarketMultipleView.previousOrders")}
                  innerJustify={"flex-start"}
                >
                  <Grid
                    item
                    xs={12}
                    sx={{
                      paddingTop: 2,
                      paddingBottom: 2,
                      boxSizing: "border-box",
                    }}
                  >
                    <OrderList
                      orders={listing.orders.filter((o) =>
                        ["cancelled", "fulfilled"].includes(o.status),
                      )}
                    />
                  </Grid>
                </Section>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}
