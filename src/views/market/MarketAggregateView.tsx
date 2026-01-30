import React, {
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Fade,
  Grid,
  IconButton,
  InputAdornment,
  Link as MaterialLink,
  Paper,
  TableCell,
  tableCellClasses,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useGetUserProfileQuery } from "../../store/profile"
import {
  AddShoppingCartRounded,
  EditRounded,
  VisibilityRounded,
  ZoomInRounded,
} from "@mui/icons-material"
import {
  BuyOrder,
  MarketAggregate,
  MarketAggregateListing,
} from "../../features/market"
import {
  useMarketCancelBuyOrderMutation,
  useMarketFulfillBuyOrderMutation,
  useMarketGetAggregateChartByIDQuery,
  useMarketGetAggregateHistoryByIDQuery,
  useMarketUpdateAggregateAdminMutation,
} from "../../features/market"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { MarkdownRender } from "../../components/markdown/Markdown"
import { useCookies } from "react-cookie"
import { FRONTEND_URL } from "../../util/constants"
import { Cart } from "../../datatypes/Cart"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { ListingNameAndRating } from "../../components/rating/ListingRating"
import { HeadCell, PaginatedTable } from "../../components/table/PaginatedTable"
import { Helmet } from "react-helmet"
import { ImagePreviewModal } from "../../components/modal/ImagePreviewModal"
import { ImageSearch } from "../../features/market/components/ImageSearch"
import { useCurrentMarketListing } from "../../features/market"
import { BuyOrderForm } from "../../features/market"
import { Rating } from "../../datatypes/Contractor"
import { Order } from "../../datatypes/Order"
import { HeaderTitle } from "../../components/typography/HeaderTitle"
import { Section } from "../../components/paper/Section"
import {
  DynamicApexChart,
  DynamicKlineChart,
} from "../../components/charts/DynamicCharts"
import { NumericFormat } from "react-number-format"
import { Stack } from "@mui/system"
import { useTranslation } from "react-i18next" // Localization

// Localized headCells only here!
const headCells: readonly HeadCell<
  MarketAggregateListing & { rating: number }
>[] = [
  {
    id: "rating",
    numeric: false,
    disablePadding: false,
    label: "MarketAggregateView.sellerRating",
  },
  {
    id: "price",
    numeric: true,
    disablePadding: false,
    label: "MarketAggregateView.price",
  },
  {
    id: "quantity_available",
    numeric: true,
    disablePadding: false,
    label: "MarketAggregateView.quantityAvailable",
  },
  {
    id: "listing_id",
    numeric: true,
    disablePadding: false,
    noSort: true,
    label: "",
  },
]

const buyOrderHeadCells: readonly HeadCell<
  BuyOrder & { rating: Rating; total: number }
>[] = [
  {
    id: "rating",
    numeric: false,
    disablePadding: false,
    label: "MarketAggregateView.buyer",
  },
  {
    id: "price",
    numeric: true,
    disablePadding: false,
    label: "MarketAggregateView.price",
  },
  {
    id: "quantity",
    numeric: true,
    disablePadding: false,
    label: "MarketAggregateView.quantity",
  },
  {
    id: "total",
    numeric: true,
    disablePadding: false,
    noSort: false,
    label: "MarketAggregateView.total",
  },
  {
    id: "buy_order_id",
    numeric: true,
    disablePadding: false,
    noSort: true,
    label: "",
  },
]

export function MarketAggregateView() {
  const { t } = useTranslation() // Localization hook
  const [complete] = useCurrentMarketListing<MarketAggregate>()
  const { listings, details, photos } = complete
  const { data: profile } = useGetUserProfileQuery()
  const [currentOrg] = useCurrentOrg()

  // const amContractor = useMemo(() => currentOrg?.spectrum_id === listing?.contractor_seller?.spectrum_id, [currentOrg?.spectrum_id, listing?.contractor_seller])
  // const amSeller = useMemo(() => (profile?.username === listing?.user_seller?.username) && !currentOrg, [currentOrg, listing?.user_seller?.username, profile?.username])

  // const amContractorManager = useMemo(() =>
  //         amContractor && ['admin', 'owner']
  //             .includes(
  //                 currentOrg?.members.find(item => item.username === profile?.username)?.role || 'nobody'
  //             ),
  //     [currentOrg, profile, amContractor]
  // )

  // const amRelated = useMemo(() => amSeller || amContractorManager || profile?.role === 'admin', [amSeller, amContractorManager, profile?.role])

  // const {data: contractor} = useGetContractorBySpectrumIDQuery(listing.contractor_seller?.spectrum_id!, {skip: !listing.contractor_seller})

  const theme = useTheme<ExtendedTheme>()
  const issueAlert = useAlertHook()
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [updateImageModalOpen, setUpdateImageModalOpen] = useState(false)
  const [updateAggregate] = useMarketUpdateAggregateAdminMutation()

  return (
    <>
      <Grid item xs={12} lg={4}>
        <ImagePreviewModal
          images={photos}
          open={imageModalOpen}
          onClose={() => setImageModalOpen(false)}
        />
        <Paper
          sx={{
            borderRadius: (theme) => theme.spacing(theme.borderRadius.image),
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

          {profile?.role === "admin" && (
            <>
              <ImageSearch
                open={updateImageModalOpen}
                setOpen={setUpdateImageModalOpen}
                callback={async (arg) => {
                  if (arg) {
                    await updateAggregate({
                      game_item_id: details.game_item_id!,
                      data: { photo: arg },
                    })
                  }
                }}
              />
              <IconButton
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  setUpdateImageModalOpen(true)
                  return false
                }}
                sx={{ top: 4, left: 4, position: "absolute" }}
              >
                <EditRounded />
              </IconButton>
            </>
          )}
          <img
            // component="img"
            loading="lazy"
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
            content={`${FRONTEND_URL}/market/aggregate/${details.game_item_id}`}
          />
          <meta property="og:title" content={details.title} />
          <meta property="og:description" content={details.description} />
          <meta property="og:image" content={photos[0]} />

          {/* Twitter Card Meta Tags */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta
            name="twitter:url"
            content={`${FRONTEND_URL}/market/aggregate/${details.game_item_id}`}
          />
          <meta name="twitter:title" content={details.title} />
          <meta name="twitter:description" content={details.description} />
          <meta name="twitter:image" content={photos[0]} />

          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              description: details.description,
              name: details.title,
              kind: details.item_type,
              image: photos[0],
              offers: {
                "@type": "AggregateOffer",
                offerCount: listings.length,
                lowPrice: listings.reduce(
                  (c, l) => (c < l.price ? c : l.price),
                  listings[0]?.price || 0,
                ),
                highPrice: listings.reduce(
                  (c, l) => (c > l.price ? c : l.price),
                  listings[0]?.price || 0,
                ),
                priceCurrency: "JPY",
              },
            })}
          </script>
        </Helmet>
      </Grid>
      <Grid item xs={12} lg={8}>
        <Fade in={true}>
          <Card
            sx={{
              borderRadius: (theme) => theme.spacing(theme.borderRadius.image),
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
                      {t("MarketAggregateView.market")}
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
                    {details.title}
                  </Typography>
                </Stack>
              }
              // subheader={
              //     <Box sx={{padding: 1.5, paddingLeft: 0}} display={'flex'}
              //          alignItems={'center'}>
              //         {
              //             dateDiffInDays(new Date(), new Date(listing.timestamp)) <= 1 &&
              //             <Chip
              //                 color={'secondary'}
              //                 label={"New"}
              //                 sx={{
              //                     marginRight: 1,
              //                     textTransform: 'uppercase',
              //                     fontSize: '0.85em',
              //                     fontWeight: 'bold'
              //                 }}
              //             />
              //         }
              //         <ListingNameAndRating user={listing.user_seller}
              //                              contractor={listing.contractor_seller}/>
              //         <Typography
              //             display={'inline'}
              //             color={"text.primary"}
              //             variant={'subtitle2'}
              //         >
              //             &nbsp; - {getRelativeTime(new Date(listing.timestamp))}
              //         </Typography>
              //     </Box>
              // }
            />
            <CardContent
              sx={{
                width: "auto",
                minHeight: 192,
                padding: 3,
                paddingTop: 0,
              }}
            >
              <Divider light />
              <Box sx={{ padding: 2 }}>
                <Typography
                  variant={"subtitle1"}
                  fontWeight={"bold"}
                  color={"text.secondary"}
                >
                  {t("MarketAggregateView.description")}
                </Typography>
                <Typography>
                  <MarkdownRender text={details.description} />
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Grid>
      <HeaderTitle>{t("MarketAggregateView.sellOrders")}</HeaderTitle>
      <Grid item xs={12}>
        <PaginatedTable
          disableSelect
          rows={listings
            .filter((l) => l.quantity_available)
            .map((l) => ({
              ...l,
              rating:
                l.user_seller?.rating.avg_rating ||
                l.contractor_seller?.rating.avg_rating ||
                0,
            }))}
          initialSort={"price"}
          keyAttr={"listing_id"}
          headCells={headCells}
          generateRow={AggregateRow}
        />
        {/*{listing.listings.map((l, index) => <AggregateRow listing={l} index={index}/>)}*/}
      </Grid>
      <HeaderTitle>{t("MarketAggregateView.buyOrders")}</HeaderTitle>
      <Grid item xs={12}>
        <PaginatedTable
          disableSelect
          rows={(complete?.buy_orders || []).map((o) => ({
            ...o,
            rating: o.buyer.rating,
            total: o.price * o.quantity,
          }))}
          initialSort={"price"}
          keyAttr={"buy_order_id"}
          headCells={buyOrderHeadCells}
          generateRow={BuyOrderRow}
        />
        {/*{listing.listings.map((l, index) => <AggregateRow listing={l} index={index}/>)}*/}
      </Grid>
      <BuyOrderForm aggregate={complete} />
      <AggregateBuySellWall aggregate={complete} />
      <HeaderTitle>{t("MarketAggregateView.priceHistory")}</HeaderTitle>
      <AggregateChart aggregate={complete} />
    </>
  )
}

export function AggregateRow(props: {
  row: MarketAggregateListing & { rating: number }
  index: number
  onClick?: MouseEventHandler
  isItemSelected: boolean
  labelId: string
}) {
  const { t, i18n } = useTranslation()
  const { row: listing, index } = props
  const [quantity, setQuantity] = useState(1)
  const issueAlert = useAlertHook()
  const [cookies, setCookie] = useCookies(["market_cart"])
  const [justAddedToCart, setJustAddedToCart] = useState(false)

  const addToCart = useCallback(async () => {
    const cart: Cart = cookies.market_cart || []
    let found = false
    for (const seller of cart) {
      if (
        seller.contractor_seller_id &&
        seller.contractor_seller_id === listing.contractor_seller?.spectrum_id
      ) {
        seller.items.push({
          listing_id: listing.listing_id,
          aggregate_id: listing.aggregate_id,
          quantity,
          type: "aggregate_composite",
        })
        found = true
        break
      } else if (
        seller.user_seller_id &&
        seller.user_seller_id === listing.user_seller?.username
      ) {
        seller.items.push({
          listing_id: listing.listing_id,
          aggregate_id: listing.aggregate_id,
          quantity,
          type: "aggregate_composite",
        })
        found = true
        break
      }
    }

    if (!found) {
      cart.push({
        user_seller_id: listing.user_seller?.username,
        contractor_seller_id: listing.contractor_seller?.spectrum_id,
        items: [
          {
            listing_id: listing.listing_id,
            aggregate_id: listing.aggregate_id,
            quantity,
            type: "aggregate_composite",
          },
        ],
      })
    }

    setCookie("market_cart", cart, {
      path: "/",
      sameSite: "strict",
      maxAge: 2592000, // 30 days in seconds - cart items may become unavailable or prices may change
    })
    issueAlert({
      message: t("MarketAggregateView.addedToCart"),
      severity: "success",
    })
    setJustAddedToCart(true)
  }, [cookies.market_cart, listing, quantity, setCookie, t, issueAlert])

  return (
    <TableRow
      hover
      // onClick={onClick}
      role="checkbox"
      // aria-checked={isItemSelected}
      tabIndex={-1}
      key={index}
      // selected={isItemSelected}
      // component={Link} to={`/contract/${row.order_id}`}
      sx={{
        textDecoration: "none",
        color: "inherit",
        borderBottom: "none",
        border: "none",
        [`& .${tableCellClasses.root}`]: {},
      }}
    >
      <TableCell align={"left"}>
        <Box
          sx={{
            alignItems: "center",
            display: "inline-flex",
          }}
        >
          <ListingNameAndRating
            user={listing.user_seller}
            contractor={listing.contractor_seller}
          />
        </Box>
      </TableCell>

      <TableCell
        align={"right"}
        onClick={(event) => {
          event.stopPropagation()
        }}
      >
        <Typography variant={"subtitle2"} color={"primary"}>
          {listing.price.toLocaleString(i18n.language)} aUEC
        </Typography>
      </TableCell>

      <TableCell
        align={"right"}
        onClick={(event) => {
          event.stopPropagation()
        }}
      >
        <NumericFormat
          decimalScale={0}
          allowNegative={false}
          customInput={TextField}
          thousandSeparator
          onValueChange={async (values, sourceInfo) => {
            setQuantity(values.floatValue || 0)
            setJustAddedToCart(false)
          }}
          inputProps={{
            inputMode: "numeric",
            pattern: "[0-9]*",
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="start">
                {t("MarketAggregateView.ofAvailable", {
                  count: listing.quantity_available,
                })}
              </InputAdornment>
            ),
            inputMode: "numeric",
          }}
          size="small"
          label={t("MarketAggregateView.quantityToBuy")}
          value={quantity}
          color={"secondary"}
        />
      </TableCell>

      <TableCell
        align={"right"}
        onClick={(event) => {
          event.stopPropagation()
        }}
      >
        {justAddedToCart ? (
          <Button
            component={Link}
            to="/market/cart"
            variant={"contained"}
            color={"secondary"}
            size={"large"}
          >
            <VisibilityRounded />
          </Button>
        ) : (
          <Button
            variant={"contained"}
            color={"primary"}
            size={"large"}
            onClick={addToCart}
          >
            <AddShoppingCartRounded />
          </Button>
        )}
      </TableCell>
    </TableRow>
  )
}

export function BuyOrderRow(props: {
  row: BuyOrder & { rating: Rating; total: number }
  index: number
  onClick?: MouseEventHandler
  isItemSelected: boolean
  labelId: string
}) {
  const { t, i18n } = useTranslation()
  const { row: buy_order, index } = props
  const issueAlert = useAlertHook()

  const [fulfillBuyOrder, { isLoading }] = useMarketFulfillBuyOrderMutation()
  const [cancelBuyOrder, { isLoading: cancelIsLoading }] =
    useMarketCancelBuyOrderMutation()
  const navigate = useNavigate()
  const [currentOrg] = useCurrentOrg()
  const { data: profile } = useGetUserProfileQuery()

  const callback = useCallback(async () => {
    fulfillBuyOrder({
      buy_order_id: buy_order.buy_order_id,
      contractor_spectrum_id: currentOrg?.spectrum_id,
    })
      .unwrap()
      .then((order: Order) => {
        issueAlert({
          message: t("MarketAggregateView.submitted"),
          severity: "success",
        })

        navigate(`/contract/${order.order_id}`)
      })
      .catch((err) => issueAlert(err))

    return false
  }, [buy_order, t, issueAlert, fulfillBuyOrder, currentOrg, navigate])

  const cancelCallback = useCallback(async () => {
    cancelBuyOrder(buy_order.buy_order_id)
      .then(() => {
        issueAlert({
          message: t("MarketAggregateView.cancelled"),
          severity: "success",
        })
      })
      .catch(issueAlert)

    return false
  }, [buy_order, t, issueAlert, cancelBuyOrder])

  return (
    <TableRow
      hover
      // onClick={onClick}
      role="checkbox"
      // aria-checked={isItemSelected}
      tabIndex={-1}
      key={index}
      // selected={isItemSelected}
      // component={Link} to={`/contract/${row.order_id}`}
      sx={{
        textDecoration: "none",
        color: "inherit",
        borderBottom: "none",
        border: "none",
        [`& .${tableCellClasses.root}`]: {},
      }}
    >
      <TableCell align={"left"}>
        <Box
          sx={{
            alignItems: "center",
            display: "inline-flex",
          }}
        >
          <ListingNameAndRating user={buy_order.buyer} />
        </Box>
      </TableCell>

      <TableCell
        align={"right"}
        onClick={(event) => {
          event.stopPropagation()
        }}
      >
        <Typography variant={"subtitle2"} color={"primary"}>
          {buy_order.price.toLocaleString(i18n.language)} aUEC
        </Typography>
      </TableCell>

      <TableCell
        align={"right"}
        onClick={(event) => {
          event.stopPropagation()
        }}
      >
        <Typography variant={"subtitle2"} color={"primary"}>
          {buy_order.quantity.toLocaleString(i18n.language)}
        </Typography>
      </TableCell>

      <TableCell
        align={"right"}
        onClick={(event) => {
          event.stopPropagation()
        }}
      >
        <Typography variant={"subtitle2"} color={"primary"}>
          {buy_order.total.toLocaleString(i18n.language)} aUEC
        </Typography>
      </TableCell>

      <TableCell
        align={"right"}
        onClick={(event) => {
          event.stopPropagation()
        }}
      >
        <Button
          variant={"contained"}
          color={"primary"}
          size={"large"}
          onClick={callback}
        >
          {t("MarketAggregateView.fulfill")}
        </Button>
        {buy_order.buyer.username === profile?.username && (
          <Button
            variant={"contained"}
            color={"error"}
            size={"large"}
            onClick={cancelCallback}
            sx={{
              marginLeft: 1,
            }}
          >
            {t("MarketAggregateView.cancel")}
          </Button>
        )}
      </TableCell>
    </TableRow>
  )
}

export function AggregateChart(props: { aggregate: MarketAggregate }) {
  const { aggregate } = props
  const { data: chartData } = useMarketGetAggregateHistoryByIDQuery(
    aggregate.details.game_item_id!,
  )

  return (
    <Section xs={12}>
      <Grid item xs={12}>
        <DynamicKlineChart
          onInit={(kline) => {
            // initialize the chart
            const chart = kline.init(`${aggregate.details.game_item_id}-chart`)
            if (chart) {
              // add data to the chart
              chart.applyNewData(chartData || [])
            }
          }}
          onDispose={(kline) => {
            // destroy chart
            kline.dispose(`${aggregate.details.game_item_id}-chart`)
          }}
        >
          {(kline, loading) => (
            <div
              id={`${aggregate.details.game_item_id}-chart`}
              style={{ width: "100%", height: 400 }}
            />
          )}
        </DynamicKlineChart>
      </Grid>
    </Section>
  )
}

export function AggregateBuySellWall(props: { aggregate: MarketAggregate }) {
  const { t } = useTranslation()
  const { aggregate } = props

  const { series, buyMax, sellMax } = useMemo(() => {
    const bucketCount = 100
    const sellHigh = aggregate.listings.length
      ? aggregate.listings.reduce(
          (high, listing) => (listing.price > high ? listing.price : high),
          aggregate.listings[0].price,
        )
      : 0
    const buyHigh = aggregate.buy_orders.length
      ? aggregate.buy_orders.reduce(
          (high, listing) => (listing.price > high ? listing.price : high),
          aggregate.buy_orders[0].price,
        )
      : 0
    const high = Math.max(sellHigh, buyHigh) * 1.1
    const interval = high / bucketCount

    const sortedSell = [...aggregate.listings]
      .filter((s) => s.quantity_available)
      .sort((a, b) => a.price - b.price)
    const sortedBuy = [...aggregate.buy_orders].sort(
      (a, b) => a.price - b.price,
    )

    const sellPoints = new Array(bucketCount + 1)
      .fill(undefined)
      .map((o, i) => ({ x: interval * i, y: 0 }))
    const buyPoints = new Array(bucketCount + 1)
      .fill(undefined)
      .map((o, i) => ({ x: interval * i, y: 0 }))

    for (const sell of sortedSell) {
      sellPoints[Math.floor(sell.price / interval)].y += 1
    }

    for (const buy of sortedBuy) {
      buyPoints[Math.floor(buy.price / interval)].y += 1
    }

    for (let i = 1; i < bucketCount + 1; i++) {
      sellPoints[i].y += sellPoints[i - 1].y
    }

    const sellMax = sellPoints[bucketCount].y

    for (let i = bucketCount; i > 0; i--) {
      buyPoints[i - 1].y += buyPoints[i].y
    }

    const buyMax = buyPoints[0].y

    return {
      series: [
        sellPoints, //.filter(item => item.y),
        buyPoints, //.filter(item => item.y)
      ],
      high,
      buyMax,
      sellMax,
    }
  }, [aggregate])

  const [sellWall, buyWall] = series
  const yMax = useMemo(() => Math.max(buyMax, sellMax), [buyMax, sellMax])

  return (
    <Section xs={12}>
      <Grid item xs={12}>
        <Box>
          <DynamicApexChart
            width={"100%"}
            height={400}
            type={"area"}
            options={{
              tooltip: {
                x: {
                  formatter: (value: number) =>
                    `${value.toLocaleString(undefined)} aUEC`,
                },
                y: {
                  formatter: (
                    value: number,
                    { series: _, seriesIndex, dataPointIndex, w }: any,
                  ) =>
                    `${value} ${
                      seriesIndex
                        ? t("MarketAggregateView.sellOrdersChart")
                        : t("MarketAggregateView.buyOrdersChart")
                    } ${t("MarketAggregateView.atPrice", {
                      price:
                        series[seriesIndex][dataPointIndex].x.toLocaleString(
                          undefined,
                        ),
                      direction: seriesIndex
                        ? t("MarketAggregateView.orLower")
                        : t("MarketAggregateView.orHigher"),
                    })}`,
                  title: { formatter: (seriesName: string) => "" },
                },
              },
              xaxis: {
                type: "numeric",
                labels: {
                  formatter: (value: number, timestamp?: any, opts?: any) =>
                    `${(+value).toLocaleString()} aUEC`,
                },
              },
              yaxis: {
                forceNiceScale: true,
                min: 0,
                max: yMax,
                labels: {
                  formatter: (value: number, opts?: any) =>
                    Math.floor(value).toLocaleString(undefined),
                },
              },
              dataLabels: {
                enabled: false,
              },
              stroke: {
                curve: "smooth",
              },
              fill: {
                type: "gradient",
                gradient: {
                  shadeIntensity: 1,
                  inverseColors: false,
                  opacityFrom: 0.45,
                  opacityTo: 0.05,
                  stops: [20, 100, 100, 100],
                },
              },
            }}
            series={[
              {
                name: t("MarketAggregateView.buyOrdersChart"),
                data: buyWall,
              },
              {
                name: t("MarketAggregateView.sellOrdersChart"),
                data: sellWall,
              },
            ]}
          />
        </Box>
      </Grid>
    </Section>
  )
}
