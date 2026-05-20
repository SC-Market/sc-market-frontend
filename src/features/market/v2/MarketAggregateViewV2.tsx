import React, {
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Fade,
  Grid,
  IconButton,
  InputAdornment,
  Link as MaterialLink,
  Paper,
  Stack,
  TableCell,
  tableCellClasses,
  TableRow,
  TextField,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { HapticButton } from "../../../components/haptic";
import { ExtendedTheme } from "../../../hooks/styles/Theme";
import { useCurrentOrg } from "../../../hooks/login/CurrentOrg";
import { useGetUserProfileQuery } from "../../profile/api/profileApi";
import {
  AddShoppingCartRounded,
  EditRounded,
  VisibilityRounded,
  ZoomInRounded,
} from "@mui/icons-material";
import { useAlertHook } from "../../../hooks/alert/AlertHook";
import { MarkdownRender } from "../../../components/markdown/Markdown.lazy";
import { useCookies } from "react-cookie";
import { FRONTEND_URL } from "../../../util/constants";
import { Cart } from "../../../datatypes/Cart";
import { Link, useNavigate, useParams } from "react-router-dom";
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import { ListingNameAndRating } from "../../../components/rating/ListingRating";
import {
  HeadCell,
  PaginatedTable,
} from "../../../components/table/PaginatedTable";
import { Helmet } from "react-helmet";
import { ImagePreviewModal } from "../../../components/modal/ImagePreviewModal";
import { ImageSearch } from "../components/ImageSearch";
import { HeaderTitle } from "../../../components/typography/HeaderTitle";
import { Section } from "../../../components/paper/Section";
import { DynamicKlineChart } from "../../../components/charts/DynamicCharts";
import { MuiAreaChart, MuiBarChart } from "../../../components/charts/MuiCharts";
import { NumericFormat } from "react-number-format";
import { useTranslation } from "react-i18next";
import { QualityBadge } from "../../../components/market/v2/QualityBadge";
import { QualityHistogram } from "../../../components/market/v2/QualityHistogram";
import { QualityFilter } from "../../../components/market/v2/QualityFilter";
import { VariantSelector } from "../../../components/market/v2/VariantSelector";
import { CreateBuyOrderV2 } from "./components/CreateBuyOrderV2";
import { MarketAggregateViewV2Admin } from "./MarketAggregateViewV2Admin";
import { useGetListingsQuery, useGetQualityDistributionQuery, useGetPriceHistoryQuery, useSearchBuyOrdersQuery, useFulfillBuyOrderMutation, useCancelBuyOrderMutation, type StandingBuyOrder } from "../../../store/api/v2/market";
import type { GameItemListingResult, GameItemQualityDistribution, PriceDataPoint } from "../../../store/api/v2/market";

/**
 * MarketAggregateViewV2 Component
 * 
 * Task: 11.5 Implement MarketAggregateViewV2 component
 * Requirements: 41.1-41.12
 * 
 * Displays aggregate view of all listings for a game item with quality tier breakdown.
 * Maintains visual parity with V1 MarketAggregateView while adding V2-specific features:
 * - Quality distribution chart
 * - Price comparison table by quality tier
 * - Quality tier filter
 * - Seller ratings and badges
 * - Add to Cart for each listing with variant selection
 * 
 * Visual Parity Requirements:
 * - Reuse image paper styling (minHeight: 400, borderRadius)
 * - Reuse Card layout for item details
 * - Reuse PaginatedTable for listings
 * - Reuse HeaderTitle for sections
 * - Reuse Section for charts
 * - Maintain identical typography and spacing
 * 
 * V2 Enhancements:
 * - Display quality distribution histogram
 * - Show price ranges by quality tier
 * - Filter listings by quality tier
 * - Display variant information in listings
 * - Support variant selection in Add to Cart
 */

// Localized headCells for sell orders table
const headCells: readonly HeadCell<AggregateListingV2Row>[] = [
  {
    id: "seller_name",
    numeric: false,
    disablePadding: false,
    label: "MarketAggregateView.sellerRating",
  },
  {
    id: "quality_tier_min",
    numeric: false,
    disablePadding: false,
    label: "Quality Tier",
  },
  {
    id: "price_min",
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
];

// Localized headCells for buy orders table
const buyOrderHeadCells: readonly HeadCell<BuyOrderV2Row>[] = [
  {
    id: "buyer_name",
    numeric: false,
    disablePadding: false,
    label: "MarketAggregateView.buyer",
  },
  {
    id: "quality_tier_min",
    numeric: false,
    disablePadding: false,
    label: "Quality Tier",
  },
  {
    id: "price_per_unit",
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
];

/** Row shape for aggregate listings table */
export interface AggregateListingV2Row {
  listing_id: string;
  seller_id: string;
  seller_slug: string;
  seller_name: string;
  seller_type: "user" | "contractor";
  seller_rating: number;
  price_min: number;
  price_max: number;
  quantity_available: number;
  quality_tier_min: number | null;
  quality_tier_max: number | null;
  variant_count: number;
}

/** Row shape for buy orders table */
/** Buy order row type — uses generated StandingBuyOrder + computed total */
type BuyOrderV2Row = StandingBuyOrder & { total?: number | null }

/** Game item aggregate data */
export interface GameItemAggregateV2 {
  game_item: {
    id: string;
    name: string;
    type: string;
    description: string;
    image_url: string;
  };
  quality_distribution: Array<{
    quality_tier: number;
    listing_count: number;
    total_quantity: number;
    min_price: number;
    avg_price: number;
    max_price: number;
    seller_count: number;
  }>;
  listings: AggregateListingV2Row[];
  buy_orders: BuyOrderV2Row[];
  price_history: Array<{
    timestamp: string;
    quality_tier: number | null;
    avg_price: number;
    min_price: number;
    max_price: number;
    volume: number;
  }>;
}

export function MarketAggregateViewV2() {
  const { t } = useTranslation();
  const { id: gameItemId } = useParams<{ id: string }>();
  const { data: profile } = useGetUserProfileQuery();
  const [currentOrg] = useCurrentOrg();
  const theme = useTheme<ExtendedTheme>();
  const issueAlert = useAlertHook();
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [updateImageModalOpen, setUpdateImageModalOpen] = useState(false);
  const [selectedQualityTier, setSelectedQualityTier] = useState<number | null>(null);

  const { data: listingsData, isLoading: listingsLoading, error: listingsError } = useGetListingsQuery({ id: gameItemId! }, { skip: !gameItemId });
  const { data: qualityData } = useGetQualityDistributionQuery({ gameItemId: gameItemId! }, { skip: !gameItemId });
  const { data: priceData } = useGetPriceHistoryQuery({ gameItemId: gameItemId! }, { skip: !gameItemId });
  const { data: buyOrdersData } = useSearchBuyOrdersQuery({ gameItemId: gameItemId! }, { skip: !gameItemId });

  const isLoading = listingsLoading;
  const error = listingsError;

  // Compose aggregate data from multiple API responses
  const complete: GameItemAggregateV2 = useMemo(() => ({
    game_item: listingsData?.game_item
      ? { ...listingsData.game_item, description: "", image_url: listingsData.game_item.image_url || "" }
      : { id: gameItemId || "", name: "", type: "", description: "", image_url: "" },
    quality_distribution: (qualityData?.distribution || []).map((d) => ({
      quality_tier: d.quality_tier,
      listing_count: d.listing_count,
      total_quantity: d.quantity_available,
      min_price: d.min_price,
      avg_price: d.avg_price,
      max_price: d.max_price,
      seller_count: d.seller_count,
    })),
    listings: (listingsData?.listings || []).map((l): AggregateListingV2Row => ({
      listing_id: l.listing_id,
      seller_id: l.seller_id,
      seller_slug: l.seller_slug,
      seller_name: l.seller_name,
      seller_type: l.seller_type,
      seller_rating: l.seller_rating,
      price_min: l.price_min,
      price_max: l.price_max,
      quantity_available: l.quantity_available,
      quality_tier_min: l.quality_tier_min ?? null,
      quality_tier_max: l.quality_tier_max ?? null,
      variant_count: l.variant_count,
    })),
    buy_orders: buyOrdersData?.buy_orders || [],
    price_history: (priceData?.data || []).map((p) => ({
      timestamp: p.timestamp,
      quality_tier: p.quality_tier ?? null,
      avg_price: p.avg_price,
      min_price: p.min_price,
      max_price: p.max_price,
      volume: p.volume,
    })),
  }), [listingsData, qualityData, priceData, buyOrdersData, gameItemId]);
  const { game_item, quality_distribution, listings, buy_orders, price_history } = complete;

  // Filter listings by selected quality tier
  const filteredListings = useMemo(() => {
    if (!selectedQualityTier) return listings;
    return listings.filter(
      (listing) =>
        listing.quality_tier_min !== null &&
        listing.quality_tier_max !== null &&
        listing.quality_tier_min <= selectedQualityTier &&
        listing.quality_tier_max >= selectedQualityTier
    );
  }, [listings, selectedQualityTier]);

  // Transform quality distribution for histogram
  const histogramData = useMemo(() => {
    const totalListings = quality_distribution.reduce(
      (sum, item) => sum + item.listing_count,
      0
    );

    return quality_distribution.map((item) => ({
      tier: item.quality_tier,
      count: item.listing_count,
      percentage: totalListings > 0 ? (item.listing_count / totalListings) * 100 : 0,
      averagePrice: item.avg_price,
    }));
  }, [quality_distribution]);

  // TODO: Implement image update mutation
  const updateAggregate = async (_data: { photo?: string }) => {
    // await updateAggregateV2Mutation({ game_item_id: game_item.id, data });
  };

  // Admin preview: exchange-terminal redesign
  if (profile?.role === "admin") {
    return (
      <StandardPageLayout
        title={game_item.name || "Market Item"}
        headerTitle={game_item.name}
        breadcrumbs={[
          { label: t("sidebar.market_short", "Market"), href: "/market" },
          ...(game_item.type && game_item.type !== "Other" ? [{ label: game_item.type, href: `/market?type=${encodeURIComponent(game_item.type)}` }] : []),
          { label: game_item.name || "Item" },
        ]}
        isLoading={isLoading}
        error={error}
        sidebarOpen={true}
        maxWidth="xl"
      >
        <MarketAggregateViewV2Admin complete={complete} gameItemId={gameItemId!} />
      </StandardPageLayout>
    );
  }

  return (
    <StandardPageLayout
      title={game_item.name || "Market Item"}
      headerTitle={game_item.name}
      breadcrumbs={[
        { label: t("sidebar.market_short", "Market"), href: "/market" },
        ...(game_item.type && game_item.type !== "Other" ? [{ label: game_item.type, href: `/market?type=${encodeURIComponent(game_item.type)}` }] : []),
        { label: game_item.name || "Item" },
      ]}
      isLoading={isLoading}
      error={error}
      sidebarOpen={true}
      maxWidth="xl"
    >
    <Grid item xs={12}>
    <Grid container spacing={2}>
      {/* SEO */}
      <Helmet>
        <title>{game_item.name} — SC Market</title>
        <meta property="og:title" content={game_item.name} />
        <meta property="og:url" content={`${FRONTEND_URL}/market/aggregate/${game_item.id}`} />
        {game_item.image_url && <meta property="og:image" content={game_item.image_url} />}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: game_item.name,
          image: game_item.image_url || undefined,
          url: `${FRONTEND_URL}/market/aggregate/${game_item.id}`,
          offers: {
            "@type": "AggregateOffer",
            offerCount: listings.length,
            lowPrice: listings.length ? Math.min(...listings.map(l => l.price_min)) : undefined,
            highPrice: listings.length ? Math.max(...listings.map(l => l.price_max)) : undefined,
            priceCurrency: "aUEC",
          },
        })}</script>
      </Helmet>

      {/* Image Section */}
      <Grid item xs={12} lg={4}>
        <ImagePreviewModal
          images={[game_item.image_url]}
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
                    await updateAggregate({ photo: arg });
                  }
                }}
              />
              <IconButton
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setUpdateImageModalOpen(true);
                  return false;
                }}
                sx={{ top: 4, left: 4, position: "absolute" }}
              >
                <EditRounded />
              </IconButton>
            </>
          )}
          <img
            loading="lazy"
            style={{
              display: "block",
              maxHeight: "100%",
              maxWidth: "100%",
              margin: "auto",
            }}
            src={game_item.image_url}
            alt={t(
              "marketAggregateView.productImage",
              "Product image for {{title}}",
              { title: game_item.name }
            )}
            onError={({ currentTarget }) => {
              currentTarget.onerror = null;
              currentTarget.src =
                "https://cdn.robertsspaceindustries.com/static/images/Temp/default-image.png";
            }}
          />
        </Paper>
        <Helmet>
          <meta name="description" content={game_item.description} />
          <meta property="og:type" content="website" />
          <meta
            property="og:url"
            content={`${FRONTEND_URL}/market/aggregate/${game_item.id}`}
          />
          <meta property="og:title" content={game_item.name} />
          <meta property="og:description" content={game_item.description} />
          <meta property="og:image" content={game_item.image_url} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta
            name="twitter:url"
            content={`${FRONTEND_URL}/market/aggregate/${game_item.id}`}
          />
          <meta name="twitter:title" content={game_item.name} />
          <meta name="twitter:description" content={game_item.description} />
          <meta name="twitter:image" content={game_item.image_url} />
        </Helmet>
      </Grid>

      {/* Item Details Card */}
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
                      to={`/market?type=${encodeURIComponent(game_item.type)}`}
                    >
                      {game_item.type}
                    </MaterialLink>
                    <MaterialLink
                      component={Link}
                      underline="hover"
                      color="text.secondary"
                      to={`/market?query=${encodeURIComponent(game_item.name)}`}
                    >
                      {game_item.name}
                    </MaterialLink>
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
                    {game_item.name}
                  </Typography>
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
                  <MarkdownRender text={game_item.description} />
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Grid>

      {/* Quality Distribution Histogram */}
      <Grid item xs={12} lg={6}>
        <QualityHistogram
          distribution={histogramData}
          title={t("market.qualityDistribution", "Quality Distribution")}
          showPrices={true}
        />
      </Grid>

      {/* Price Comparison Table by Quality Tier */}
      <Grid item xs={12} lg={6}>
        <Section xs={12} title={t("market.priceByQuality", "Price by Quality Tier")}>
          <Grid item xs={12}>
            <PriceComparisonTable distribution={quality_distribution} />
          </Grid>
        </Section>
      </Grid>

      {/* Quality Tier Filter */}
      <Grid item xs={12}>
        <QualityFilter
          minTier={selectedQualityTier}
          maxTier={selectedQualityTier}
          onMinTierChange={setSelectedQualityTier}
          onMaxTierChange={setSelectedQualityTier}
        />
      </Grid>

      {/* Sell Orders Section */}
      <Grid item xs={12}>
        <HeaderTitle>
          {t("MarketAggregateView.sellOrders")}
          {selectedQualityTier && ` - Tier ${selectedQualityTier}`}
        </HeaderTitle>
      </Grid>
      <Grid item xs={12}>
        <PaginatedTable
          disableSelect
          rows={filteredListings
            .filter((l) => l.quantity_available > 0)
            .map((l) => ({
              ...l,
              rating: l.seller_rating,
            }))}
          initialSort={"price_min"}
          keyAttr={"listing_id"}
          headCells={headCells}
          generateRow={AggregateRowV2}
        />
      </Grid>

      {/* Buy Orders Section */}
      <Grid item xs={12}>
        <HeaderTitle>{t("MarketAggregateView.buyOrders")}</HeaderTitle>
      </Grid>
      <Grid item xs={12}>
        <PaginatedTable
          disableSelect
          rows={buy_orders.map((o) => ({
            ...o,
            total:
              o.negotiable
                ? null
                : o.price_per_unit * o.quantity,
          }))}
          initialSort={"price_per_unit"}
          keyAttr={"buy_order_id"}
          headCells={buyOrderHeadCells}
          generateRow={BuyOrderRowV2}
        />
      </Grid>

      {/* Create Buy Order Form */}
      <CreateBuyOrderV2 gameItem={game_item} />

      {/* Buy/Sell Wall Charts */}
      <Grid item xs={12}>
        <AggregateBuySellWallV2 aggregate={complete} />
      </Grid>

      {/* Price History Chart */}
      <Grid item xs={12}>
        <HeaderTitle>{t("MarketAggregateView.priceHistory")}</HeaderTitle>
      </Grid>
      <Grid item xs={12}>
        <AggregateChartV2 key={gameItemId} aggregate={complete} />
      </Grid>
    </Grid>
    </Grid>
    </StandardPageLayout>
  );
}

/**
 * PriceComparisonTable - Shows price ranges by quality tier
 * 
 * Requirements: 41.5
 */
export function PriceComparisonTable({
  distribution,
}: {
  distribution: Array<{
    quality_tier: number;
    listing_count: number;
    total_quantity: number;
    min_price: number;
    avg_price: number;
    max_price: number;
    seller_count: number;
  }>;
}) {
  const { t, i18n } = useTranslation();
  const theme = useTheme<ExtendedTheme>();

  if (distribution.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
        {t("market.noPriceData", "No price data available")}
      </Typography>
    );
  }

  return (
    <Box sx={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: theme.spacing(1) }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {t("market.qualityTier", "Quality Tier")}
              </Typography>
            </th>
            <th style={{ textAlign: "right", padding: theme.spacing(1) }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {t("market.sellers", "Sellers")}
              </Typography>
            </th>
            <th style={{ textAlign: "right", padding: theme.spacing(1) }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {t("market.minPrice", "Min Price")}
              </Typography>
            </th>
            <th style={{ textAlign: "right", padding: theme.spacing(1) }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {t("market.avgPrice", "Avg Price")}
              </Typography>
            </th>
            <th style={{ textAlign: "right", padding: theme.spacing(1) }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {t("market.maxPrice", "Max Price")}
              </Typography>
            </th>
            <th style={{ textAlign: "right", padding: theme.spacing(1) }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {t("market.totalQuantity", "Total Qty")}
              </Typography>
            </th>
          </tr>
        </thead>
        <tbody>
          {distribution.map((item) => (
            <tr key={item.quality_tier}>
              <td style={{ padding: theme.spacing(1) }}>
                <QualityBadge tier={item.quality_tier} size="small" />
              </td>
              <td style={{ textAlign: "right", padding: theme.spacing(1) }}>
                <Typography variant="body2">{item.seller_count}</Typography>
              </td>
              <td style={{ textAlign: "right", padding: theme.spacing(1) }}>
                <Typography variant="body2" color="primary">
                  {item.min_price.toLocaleString(i18n.language)} aUEC
                </Typography>
              </td>
              <td style={{ textAlign: "right", padding: theme.spacing(1) }}>
                <Typography variant="body2">
                  {item.avg_price.toLocaleString(i18n.language)} aUEC
                </Typography>
              </td>
              <td style={{ textAlign: "right", padding: theme.spacing(1) }}>
                <Typography variant="body2">
                  {item.max_price.toLocaleString(i18n.language)} aUEC
                </Typography>
              </td>
              <td style={{ textAlign: "right", padding: theme.spacing(1) }}>
                <Typography variant="body2">
                  {item.total_quantity.toLocaleString(i18n.language)}
                </Typography>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
}

/**
 * AggregateRowV2 - Individual listing row with variant selection
 * 
 * Requirements: 41.6, 41.7, 41.9, 41.10
 */
export function AggregateRowV2(props: {
  row: AggregateListingV2Row & { rating: number };
  index: number;
  onClick?: MouseEventHandler;
  isItemSelected: boolean;
  labelId: string;
}) {
  const { t, i18n } = useTranslation();
  const { row: listing, index } = props;
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const issueAlert = useAlertHook();
  const [cookies, setCookie] = useCookies(["market_cart"]);
  const [justAddedToCart, setJustAddedToCart] = useState(false);

  const addToCart = useCallback(async () => {
    if (listing.variant_count > 1 && !selectedVariantId) {
      issueAlert({
        message: t("market.selectVariant", "Please select a variant"),
        severity: "warning",
      });
      return;
    }

    const cart: Cart = cookies.market_cart || [];
    let found = false;

    for (const seller of cart) {
      const matchesUser =
        seller.user_seller_id &&
        listing.seller_type === "user" &&
        seller.user_seller_id === listing.seller_id;
      const matchesContractor =
        seller.contractor_seller_id &&
        listing.seller_type === "contractor" &&
        seller.contractor_seller_id === listing.seller_id;

      if (matchesUser || matchesContractor) {
        seller.items.push({
          listing_id: listing.listing_id,
          aggregate_id: listing.listing_id, // TODO: Get actual aggregate_id
          quantity,
          type: "aggregate_composite",
          variant_id: selectedVariantId || undefined,
        });
        found = true;
        break;
      }
    }

    if (!found) {
      cart.push({
        user_seller_id:
          listing.seller_type === "user" ? listing.seller_id : undefined,
        contractor_seller_id:
          listing.seller_type === "contractor" ? listing.seller_id : undefined,
        items: [
          {
            listing_id: listing.listing_id,
            aggregate_id: listing.listing_id, // TODO: Get actual aggregate_id
            quantity,
            type: "aggregate_composite",
            variant_id: selectedVariantId || undefined,
          },
        ],
      });
    }

    setCookie("market_cart", cart, {
      path: "/",
      sameSite: "strict",
      maxAge: 2592000, // 30 days in seconds
    });
    issueAlert({
      message: t("MarketAggregateView.addedToCart"),
      severity: "success",
    });
    setJustAddedToCart(true);
  }, [
    cookies.market_cart,
    listing,
    quantity,
    selectedVariantId,
    setCookie,
    t,
    issueAlert,
  ]);

  return (
    <TableRow
      hover
      role="checkbox"
      tabIndex={-1}
      key={index}
      sx={{
        textDecoration: "none",
        color: "inherit",
        borderBottom: "none",
        border: "none",
        [`& .${tableCellClasses.root}`]: {},
      }}
    >
      {/* Seller Name and Rating */}
      <TableCell align={"left"}>
        <Box
          sx={{
            alignItems: "center",
            display: "inline-flex",
          }}
        >
          <ListingNameAndRating
            user={
              listing.seller_type === "user"
                ? {
                    username: listing.seller_name,
                    display_name: listing.seller_name,
                    avatar: "",
                    rating: { 
                      avg_rating: listing.seller_rating,
                      rating_count: 0,
                      total_rating: 0,
                      streak: 0,
                      total_orders: 0,
                    },
                  }
                : undefined
            }
            contractor={
              listing.seller_type === "contractor"
                ? {
                    name: listing.seller_name,
                    avatar: "",
                    spectrum_id: listing.seller_slug,
                    rating: { 
                      avg_rating: listing.seller_rating,
                      rating_count: 0,
                      total_rating: 0,
                      streak: 0,
                      total_orders: 0,
                    },
                  }
                : undefined
            }
          />
        </Box>
      </TableCell>

      {/* Quality Tier */}
      <TableCell align={"left"}>
        {listing.quality_tier_min && listing.quality_tier_max ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <QualityBadge tier={listing.quality_tier_min} size="small" />
            {listing.quality_tier_min !== listing.quality_tier_max && (
              <>
                <Typography variant="caption">-</Typography>
                <QualityBadge tier={listing.quality_tier_max} size="small" />
              </>
            )}
          </Box>
        ) : (
          <Typography variant="caption" color="text.secondary">
            {t("market.unspecified", "Unspecified")}
          </Typography>
        )}
      </TableCell>

      {/* Price */}
      <TableCell
        align={"right"}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <Box>
          <Typography variant={"subtitle2"} color={"primary"}>
            {listing.price_min.toLocaleString(i18n.language)} aUEC
          </Typography>
          {listing.price_min !== listing.price_max && (
            <Typography variant="caption" color="text.secondary">
              - {listing.price_max.toLocaleString(i18n.language)} aUEC
            </Typography>
          )}
        </Box>
      </TableCell>

      {/* Quantity Input */}
      <TableCell
        align={"right"}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <Stack direction="column" spacing={1} alignItems="flex-end">
          {/* Quantity Input */}
          <NumericFormat
            decimalScale={0}
            allowNegative={false}
            customInput={TextField}
            thousandSeparator
            onValueChange={async (values, sourceInfo) => {
              setQuantity(values.floatValue || 0);
              setJustAddedToCart(false);
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
        </Stack>
      </TableCell>

      {/* Add to Cart Button */}
      <TableCell
        align={"right"}
        onClick={(event) => {
          event.stopPropagation();
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
          <HapticButton
            variant={"contained"}
            color={"primary"}
            size={"large"}
            onClick={addToCart}
            disabled={listing.variant_count > 1 && !selectedVariantId}
          >
            <AddShoppingCartRounded />
          </HapticButton>
        )}
      </TableCell>
    </TableRow>
  );
}

/**
 * BuyOrderRowV2 - Individual buy order row with quality tier requirements
 * 
 * Requirements: 41.6, 41.7, 41.9
 */
export function BuyOrderRowV2(props: {
  row: BuyOrderV2Row & { total: number | null };
  index: number;
  onClick?: MouseEventHandler;
  isItemSelected: boolean;
  labelId: string;
}) {
  const { t, i18n } = useTranslation();
  const { row: buy_order, index } = props;
  const issueAlert = useAlertHook();
  const [fulfillDialogOpen, setFulfillDialogOpen] = useState(false);
  const [agreedPrice, setAgreedPrice] = useState<number>(0);
  const [fulfillQuantity, setFulfillQuantity] = useState<number>(buy_order.quantity - (buy_order.quantity_fulfilled || 0));
  const remaining = buy_order.quantity - (buy_order.quantity_fulfilled || 0);
  const navigate = useNavigate();
  const [currentOrg] = useCurrentOrg();
  const { data: profile } = useGetUserProfileQuery();

  const [fulfillBuyOrderMut, { isLoading: fulfillIsLoading }] = useFulfillBuyOrderMutation();
  const [cancelBuyOrderMut, { isLoading: cancelIsLoading }] = useCancelBuyOrderMutation();
  const isLoading = fulfillIsLoading;

  const doFulfill = useCallback(
    (agreedPricePerUnit?: number, qty?: number) => {
      fulfillBuyOrderMut({
        id: buy_order.buy_order_id,
        body: {
          variant_id: "",
          listing_id: "",
          quantity: qty !== undefined && qty < remaining ? qty : undefined,
        },
      })
        .unwrap()
        .then((result) => {
          issueAlert({
            message: t("MarketAggregateView.submitted"),
            severity: "success",
          });
          if (result.order_id) {
            navigate(`/order/${result.order_id}`);
          }
        })
        .catch((err) => issueAlert({
          message: err?.data?.message || "Failed to fulfill buy order",
          severity: "error",
        }));
    },
    [buy_order, remaining, fulfillBuyOrderMut, issueAlert, navigate, t]
  );

  const callback = useCallback(() => {
    if (buy_order.negotiable || remaining > 1) {
      setAgreedPrice(0);
      setFulfillQuantity(remaining);
      setFulfillDialogOpen(true);
      return false;
    }
    doFulfill();
    return false;
  }, [buy_order.negotiable, remaining, doFulfill]);

  const handleFulfillDialogSubmit = useCallback(() => {
    if (buy_order.negotiable && agreedPrice < 1) {
      issueAlert({
        message: t(
          "buyorder.agreedPriceRequired",
          "Please enter an agreed price per unit (at least 1 aUEC)."
        ),
        severity: "error",
      });
      return;
    }
    if (fulfillQuantity < 1 || fulfillQuantity > remaining) {
      issueAlert({
        message: `Quantity must be between 1 and ${remaining}`,
        severity: "error",
      });
      return;
    }
    doFulfill(agreedPrice, fulfillQuantity);
    setFulfillDialogOpen(false);
  }, [buy_order.negotiable, agreedPrice, fulfillQuantity, remaining, doFulfill, issueAlert, t]);

  const cancelCallback = useCallback(async () => {
    cancelBuyOrderMut({ id: buy_order.buy_order_id })
      .unwrap()
      .then(() => {
        issueAlert({
          message: t("MarketAggregateView.cancelled"),
          severity: "success",
        });
      })
      .catch((err) => issueAlert({
        message: err?.data?.message || "Failed to cancel",
        severity: "error",
      }));
    return false;
  }, [buy_order, t, issueAlert]);

  // Format price display
  const priceDisplay = useMemo(() => {
    if (buy_order.negotiable) {
      return buy_order.price_per_unit >= 1
        ? t("buyorder.negotiableSuggested", "Negotiable (~{{price}} aUEC)", {
            price: buy_order.price_per_unit.toLocaleString(i18n.language),
          })
        : t("buyorder.status.negotiable", "Negotiable");
    }
    return `${buy_order.price_per_unit.toLocaleString(i18n.language)} aUEC`;
  }, [buy_order, t, i18n.language]);

  return (
    <TableRow
      hover
      role="checkbox"
      tabIndex={-1}
      key={index}
      sx={{
        textDecoration: "none",
        color: "inherit",
        borderBottom: "none",
        border: "none",
        [`& .${tableCellClasses.root}`]: {},
      }}
    >
      {/* Buyer Name and Rating */}
      <TableCell align={"left"}>
        <Box
          sx={{
            alignItems: "center",
            display: "inline-flex",
          }}
        >
          <ListingNameAndRating
            user={{
              username: buy_order.buyer_name,
              display_name: buy_order.buyer_name,
              avatar: "",
              rating: { 
                avg_rating: 0,
                rating_count: 0,
                total_rating: 0,
                streak: 0,
                total_orders: 0,
              },
            }}
          />
        </Box>
      </TableCell>

      {/* Quality Tier Requirements */}
      <TableCell align={"left"}>
        {buy_order.quality_tier_min && buy_order.quality_tier_max ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <QualityBadge tier={buy_order.quality_tier_min} size="small" />
            {buy_order.quality_tier_min !== buy_order.quality_tier_max && (
              <>
                <Typography variant="caption">-</Typography>
                <QualityBadge tier={buy_order.quality_tier_max} size="small" />
              </>
            )}
          </Box>
        ) : (
          <Typography variant="caption" color="text.secondary">
            {t("market.anyQuality", "Any Quality")}
          </Typography>
        )}
      </TableCell>

      {/* Price */}
      <TableCell
        align={"right"}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <Typography variant={"subtitle2"} color={"primary"}>
          {priceDisplay}
        </Typography>
      </TableCell>

      {/* Quantity */}
      <TableCell
        align={"right"}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <Typography variant={"subtitle2"} color={"primary"}>
          {buy_order.quantity_fulfilled
            ? `${remaining.toLocaleString(i18n.language)}/${buy_order.quantity.toLocaleString(i18n.language)}`
            : buy_order.quantity.toLocaleString(i18n.language)}
        </Typography>
      </TableCell>

      {/* Total */}
      <TableCell
        align={"right"}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <Typography variant={"subtitle2"} color={"primary"}>
          {buy_order.total != null
            ? `${buy_order.negotiable ? "~" : ""}${buy_order.total.toLocaleString(i18n.language)} aUEC`
            : t("buyorder.status.negotiable", "Negotiable")}
        </Typography>
      </TableCell>

      {/* Actions */}
      <TableCell
        align={"right"}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <Button
          variant={"contained"}
          color={"primary"}
          size={"large"}
          onClick={callback}
          disabled={isLoading}
        >
          {t("MarketAggregateView.fulfill")}
        </Button>
        {buy_order.buyer_id === profile?.username && (
          <Button
            variant={"contained"}
            color={"error"}
            size={"large"}
            onClick={cancelCallback}
            sx={{
              marginLeft: 1,
            }}
            disabled={cancelIsLoading}
          >
            {t("MarketAggregateView.cancel")}
          </Button>
        )}
      </TableCell>

      {/* Fulfill Dialog */}
      <Dialog
        open={fulfillDialogOpen}
        onClose={() => setFulfillDialogOpen(false)}
      >
        <DialogTitle>
          {t("buyorder.fulfillTitle", "Fulfill Buy Order")}
        </DialogTitle>
        <DialogContent>
          {buy_order.negotiable && (
            <>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {t(
                  "buyorder.agreePriceDescription",
                  "This buy order is negotiable. Enter the agreed price per unit in aUEC to fulfill."
                )}
              </Typography>
              <NumericFormat
                decimalScale={0}
                allowNegative={false}
                customInput={TextField}
                thousandSeparator
                fullWidth
                label={t("buyorder.price_per_unit")}
                value={agreedPrice}
                onValueChange={(values) => setAgreedPrice(values.floatValue ?? 0)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="start">aUEC</InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
            </>
          )}
          <NumericFormat
            decimalScale={0}
            allowNegative={false}
            customInput={TextField}
            thousandSeparator
            fullWidth
            label={t("buyorder.fulfillQuantity", "Quantity to fulfill")}
            value={fulfillQuantity}
            onValueChange={(values) => setFulfillQuantity(values.floatValue ?? remaining)}
            helperText={`${remaining.toLocaleString()} ${t("buyorder.remaining", "remaining")}`}
            isAllowed={({ floatValue }) => !floatValue || (floatValue >= 1 && floatValue <= remaining)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFulfillDialogOpen(false)}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={handleFulfillDialogSubmit}
            disabled={isLoading}
          >
            {t("MarketAggregateView.fulfill")}
          </Button>
        </DialogActions>
      </Dialog>
    </TableRow>
  );
}

/**
 * AggregateChartV2 - Price history chart with quality tier support
 * 
 * Requirements: 41.4
 */
export function AggregateChartV2(props: { aggregate: GameItemAggregateV2; qualityTier?: number | null }) {
  const { aggregate, qualityTier } = props;
  const { t } = useTranslation();

  const rawHistory = aggregate.price_history;

  // Filter to selected quality tier when set
  const chartData = useMemo(() => {
    if (qualityTier == null) return rawHistory;
    return rawHistory.filter((d) => d.quality_tier === qualityTier);
  }, [rawHistory, qualityTier]);

  // Transform price history data for chart
  const chartSeries = useMemo(() => {
    if (!chartData || chartData.length === 0) return [];

    // Group by quality tier
    const tierMap = new Map<number | null, Array<{ timestamp: string; avg_price: number }>>();
    
    chartData.forEach((item) => {
      const tier = item.quality_tier;
      if (!tierMap.has(tier)) {
        tierMap.set(tier, []);
      }
      tierMap.get(tier)!.push({
        timestamp: item.timestamp,
        avg_price: item.avg_price,
      });
    });

    // Convert to chart series format
    const series: Array<{ name: string; data: Array<{ x: string; y: number }> }> = [];
    
    tierMap.forEach((data, tier) => {
      series.push({
        name: tier === null 
          ? t("market.allTiers", "All Tiers")
          : t("market.tierN", "Tier {{tier}}", { tier }),
        data: data.map((d) => ({
          x: d.timestamp,
          y: d.avg_price,
        })),
      });
    });

    return series;
  }, [chartData, t]);

  return (
    <Section xs={12}>
      <Grid item xs={12}>
        {chartSeries.length > 0 ? (
          <MuiAreaChart
            series={chartSeries}
            height={400}
            xAxisType="time"
          />
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            {t("market.noPriceHistory", "No price history available")}
          </Typography>
        )}
      </Grid>
    </Section>
  );
}

/**
 * AggregateBuySellWallV2 - Buy/Sell wall charts with quality tier filtering
 * 
 * Requirements: 41.4
 */
export function AggregateBuySellWallV2(props: { aggregate: GameItemAggregateV2; compact?: boolean; qualityTier?: number | null }) {
  const { t } = useTranslation();
  const { aggregate: rawAggregate, compact, qualityTier } = props;

  // Pre-filter listings/buy_orders to selected quality tier
  const aggregate = useMemo(() => {
    if (qualityTier == null) return rawAggregate;
    return {
      ...rawAggregate,
      listings: rawAggregate.listings.filter(
        (l) =>
          l.quality_tier_min != null &&
          l.quality_tier_max != null &&
          l.quality_tier_min <= qualityTier &&
          l.quality_tier_max >= qualityTier
      ),
      buy_orders: rawAggregate.buy_orders.filter(
        (o) =>
          o.quality_tier_min != null &&
          o.quality_tier_max != null &&
          o.quality_tier_min <= qualityTier &&
          o.quality_tier_max >= qualityTier
      ),
    };
  }, [rawAggregate, qualityTier]);

  // Compact mode: non-cumulative density histogram (20 buckets, short bar chart)
  const { compactSellBars, compactBuyBars } = useMemo(() => {
    if (!compact) return { compactSellBars: [] as { x: string; y: number }[], compactBuyBars: [] as { x: string; y: number }[] };
    const BUCKETS = 20;
    const activeSells = aggregate.listings.filter((l) => l.quantity_available > 0);
    const pricedBuys = aggregate.buy_orders.filter((o) => o.price_per_unit > 0);
    if (!activeSells.length && !pricedBuys.length)
      return { compactSellBars: [] as { x: string; y: number }[], compactBuyBars: [] as { x: string; y: number }[] };

    const allPrices = [
      ...activeSells.map((l) => l.price_min),
      ...pricedBuys.map((o) => o.price_per_unit),
    ];
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices) * 1.05;
    const interval = (maxPrice - minPrice) / BUCKETS;
    if (interval === 0)
      return { compactSellBars: [] as { x: string; y: number }[], compactBuyBars: [] as { x: string; y: number }[] };

    const sellBuckets = new Array(BUCKETS).fill(0);
    const buyBuckets = new Array(BUCKETS).fill(0);
    activeSells.forEach((l) => {
      const idx = Math.min(Math.floor((l.price_min - minPrice) / interval), BUCKETS - 1);
      if (idx >= 0) sellBuckets[idx] += l.quantity_available;
    });
    pricedBuys.forEach((o) => {
      const idx = Math.min(Math.floor((o.price_per_unit - minPrice) / interval), BUCKETS - 1);
      if (idx >= 0) buyBuckets[idx] += o.quantity;
    });

    // Label each bucket by its midpoint price
    const fmt = (n: number) => {
      if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
      if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
      return Math.round(n).toString();
    };
    const labels = Array.from({ length: BUCKETS }, (_, i) => fmt(minPrice + interval * (i + 0.5)));
    return {
      compactSellBars: labels.map((x, i) => ({ x, y: sellBuckets[i] })),
      compactBuyBars: labels.map((x, i) => ({ x, y: buyBuckets[i] })),
    };
  }, [compact, aggregate]);

  // Full mode: cumulative supply/demand (skip in compact)
  const { supplyPoints, demandPoints } = useMemo(() => {
    if (compact) return { supplyPoints: [] as { x: number; y: number }[], demandPoints: [] as { x: number; y: number }[] };
    const bucketCount = 100;
    const sellHigh = aggregate.listings.length
      ? aggregate.listings.reduce(
          (high, listing) =>
            listing.price_max > high ? listing.price_max : high,
          aggregate.listings[0].price_max
        )
      : 0;
    const pricedBuyOrders = aggregate.buy_orders.filter(
      (o) => o.price_per_unit != null
    );
    const buyHigh = pricedBuyOrders.length
      ? pricedBuyOrders.reduce(
          (high, listing) =>
            listing.price_per_unit > high ? listing.price_per_unit : high,
          pricedBuyOrders[0].price_per_unit!
        )
      : 0;
    const high = Math.max(sellHigh, buyHigh) * 1.1;
    const interval = high / bucketCount;

    if (interval === 0) {
      return { supplyPoints: [] as {x: number; y: number}[], demandPoints: [] as {x: number; y: number}[] };
    }

    const sortedSell = [...aggregate.listings]
      .filter((s) => s.quantity_available)
      .sort((a, b) => a.price_min - b.price_min);
    const sortedBuy = [...pricedBuyOrders].sort(
      (a, b) => (a.price_per_unit ?? 0) - (b.price_per_unit ?? 0)
    );

    // Cumulative supply: stock available at or below each price bucket
    const supplyPoints = new Array(bucketCount + 1)
      .fill(undefined)
      .map((_, i) => ({ x: interval * i, y: 0 }));
    for (const sell of sortedSell) {
      const index = Math.min(Math.floor(sell.price_min / interval), bucketCount);
      for (let i = index; i < bucketCount + 1; i++) {
        supplyPoints[i].y += sell.quantity_available;
      }
    }

    // Cumulative demand: quantity requested at or above each price bucket
    const demandPoints = new Array(bucketCount + 1)
      .fill(undefined)
      .map((_, i) => ({ x: interval * i, y: 0 }));
    for (const buy of sortedBuy) {
      const index = Math.min(Math.floor((buy.price_per_unit ?? 0) / interval), bucketCount);
      for (let i = 0; i <= index; i++) {
        demandPoints[i].y += buy.quantity;
      }
    }

    return { supplyPoints, demandPoints };
  }, [compact, aggregate]);

  // Compact early return (all hooks have been called above)
  if (compact) {
    if (!compactSellBars.length && !compactBuyBars.length) return null;
    return (
      <MuiBarChart
        series={[
          { name: "Ask (supply)", data: compactSellBars },
          { name: "Bid (demand)", data: compactBuyBars },
        ]}
        height={200}
        xAxisType="category"
        colors={["#22c55e", "#f59e0b"]}
      />
    );
  }

  // Format price bucket values as "1.2k aUEC" etc.
  const formatPrice = (v: Date | number | string) => {
    const n = Number(v);
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
    return Math.round(n).toLocaleString();
  };

  return (
    <Section xs={12} disablePadding>
      <Grid item xs={12}>
        <MuiAreaChart
          series={[
            {
              name: t("MarketAggregateView.stockAvailable", "Supply (stock ≤ price)"),
              data: supplyPoints.map((d: { x: number; y: number }) => ({
                x: d.x.toString(),
                y: d.y,
              })),
            },
            {
              name: t("MarketAggregateView.quantityRequested", "Demand (wanted ≥ price)"),
              data: demandPoints.map((d: { x: number; y: number }) => ({
                x: d.x.toString(),
                y: d.y,
              })),
            },
          ]}
          height={400}
          xAxisType="category"
          colors={["#22c55e", "#f59e0b"]}
          xTickInterval={10}
          xValueFormatter={formatPrice}
        />
      </Grid>
    </Section>
  );
}
