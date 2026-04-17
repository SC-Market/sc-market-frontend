import React, { useMemo, useCallback, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Fade,
  Grid,
  InputAdornment,
  Paper,
  Stack,
  TableCell,
  tableCellClasses,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { AddShoppingCartRounded, VisibilityRounded } from "@mui/icons-material";
import { Link, useParams } from "react-router-dom";
import { NumericFormat } from "react-number-format";
import { useTranslation } from "react-i18next";
import { useCookies } from "react-cookie";

import type { ExtendedTheme } from "../../../hooks/styles/Theme";
import { useGetListingsQuery } from "../../../store/api/v2/market";
import type {
  GameItemListingResult,
  GameItemQualityDistribution,
} from "../../../store/api/v2/market";
import { QualityHistogram } from "../../../components/market/v2/QualityHistogram";
import { QualityBadge } from "../../../components/market/v2/QualityBadge";
import { VariantSelector } from "../../../components/market/v2/VariantSelector";
import { ListingNameAndRating } from "../../../components/rating/ListingRating";
import { PaginatedTable, HeadCell } from "../../../components/table/PaginatedTable";
import { useAlertHook } from "../../../hooks/alert/AlertHook";
import { HapticButton } from "../../../components/haptic";
import { Cart } from "../../../datatypes/Cart";
import { HeaderTitle } from "../../../components/typography/HeaderTitle";
import { Section } from "../../../components/paper/Section";

// Table column definitions for listings
const headCells: readonly HeadCell<GameItemListingResult>[] = [
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

/**
 * GameItemListingsV2 - Aggregate view of all listings for a specific game item
 * 
 * Requirements: 39.1-39.12
 * 
 * Features:
 * - Displays QualityHistogram showing distribution (39.4)
 * - Shows price ranges by quality_tier in table format (39.5)
 * - Provides quality_tier filter dropdown (39.6)
 * - Displays individual listings with variant information (39.7)
 * - Shows seller comparison for same quality_tier (39.8)
 * - Highlights best price per quality_tier (39.9)
 * - Provides "Add to Cart" with variant selection (39.10)
 * - Reuses MarketSidebar for filters (39.12)
 * - Maintains visual parity with V1 game item view (39.2)
 */
export function GameItemListingsV2() {
  const { t, i18n } = useTranslation();
  const theme = useTheme<ExtendedTheme>();
  const { id: gameItemId } = useParams<{ id: string }>();
  const [selectedQualityTier, setSelectedQualityTier] = useState<number | null>(null);

  // Fetch game item listings with quality distribution
  const {
    data: gameItemData,
    isLoading,
    error,
    refetch,
  } = useGetListingsQuery(
    {
      id: gameItemId!,
      qualityTier: selectedQualityTier ?? undefined,
    },
    { skip: !gameItemId },
  );

  const {
    game_item,
    quality_distribution = [],
    listings = [],
    total = 0,
  } = gameItemData || {};

  // Transform quality distribution for histogram
  const histogramData = useMemo(() => {
    if (!quality_distribution || quality_distribution.length === 0) {
      return [];
    }

    const totalListings = quality_distribution.reduce(
      (sum, item) => sum + item.listing_count,
      0,
    );

    return quality_distribution.map((item) => ({
      tier: item.quality_tier,
      count: item.listing_count,
      percentage: totalListings > 0 ? (item.listing_count / totalListings) * 100 : 0,
      averagePrice: item.price_avg,
    }));
  }, [quality_distribution]);

  // Find best price per quality tier
  const bestPriceByTier = useMemo(() => {
    const priceMap = new Map<number, number>();
    
    listings.forEach((listing) => {
      const tier = listing.quality_tier_min ?? 0;
      const price = listing.price_min;
      
      if (tier > 0 && price > 0) {
        const currentBest = priceMap.get(tier);
        if (!currentBest || price < currentBest) {
          priceMap.set(tier, price);
        }
      }
    });
    
    return priceMap;
  }, [listings]);

  // Quality tier filter handler
  const handleQualityTierChange = useCallback((tier: number | null) => {
    setSelectedQualityTier(tier);
  }, []);

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography>Loading...</Typography>
        </Grid>
      </Grid>
    );
  }

  if (error || !game_item) {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography color="error">
            Failed to load game item listings
          </Typography>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={2}>
      {/* Game Item Header */}
      <Grid item xs={12} lg={4}>
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
        >
          <img
            loading="lazy"
            style={{
              display: "block",
              maxHeight: "100%",
              maxWidth: "100%",
              margin: "auto",
            }}
            src={game_item.image_url || "https://cdn.robertsspaceindustries.com/static/images/Temp/default-image.png"}
            alt={game_item.name}
            onError={({ currentTarget }) => {
              currentTarget.onerror = null;
              currentTarget.src =
                "https://cdn.robertsspaceindustries.com/static/images/Temp/default-image.png";
            }}
          />
        </Paper>
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
                <Typography
                  variant="h5"
                  color="text.secondary"
                  fontWeight="bold"
                >
                  {game_item.name}
                </Typography>
              }
              subheader={
                <Typography variant="subtitle2" color="text.primary">
                  {game_item.type}
                </Typography>
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
                  variant="subtitle1"
                  fontWeight="bold"
                  color="text.secondary"
                >
                  {t("MarketAggregateView.description")}
                </Typography>
                <Typography>No description available</Typography>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Grid>

      {/* Quality Distribution Histogram */}
      <Grid item xs={12} lg={4}>
        <QualityHistogram
          distribution={histogramData}
          title="Quality Distribution"
          showPrices={true}
        />
      </Grid>

      {/* Price Ranges by Quality Tier */}
      <Grid item xs={12} lg={8}>
        <Section xs={12} title="Price Ranges by Quality Tier">
          <Grid item xs={12}>
            <PriceRangeTable distribution={quality_distribution} />
          </Grid>
        </Section>
      </Grid>

      {/* Quality Tier Filter */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="subtitle2" fontWeight="bold">
              Filter by Quality Tier:
            </Typography>
            <TextField
              select
              size="small"
              color="secondary"
              label="Quality Tier"
              value={selectedQualityTier ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                handleQualityTierChange(value === "" ? null : Number(value));
              }}
              sx={{ minWidth: 200 }}
              SelectProps={{
                native: true,
              }}
            >
              <option value="">All Tiers</option>
              <option value="1">Tier 1 (Bronze)</option>
              <option value="2">Tier 2 (Silver)</option>
              <option value="3">Tier 3 (Gold)</option>
              <option value="4">Tier 4 (Platinum)</option>
              <option value="5">Tier 5 (Diamond)</option>
            </TextField>
            {selectedQualityTier && (
              <Button
                size="small"
                onClick={() => handleQualityTierChange(null)}
              >
                Clear Filter
              </Button>
            )}
          </Stack>
        </Paper>
      </Grid>

      {/* Listings Table */}
      <Grid item xs={12}>
        <HeaderTitle>
          {t("MarketAggregateView.sellOrders")}
          {selectedQualityTier && ` - Tier ${selectedQualityTier}`}
        </HeaderTitle>
      </Grid>
      <Grid item xs={12}>
        <PaginatedTable
          disableSelect
          rows={listings.map((listing) => ({
            ...listing,
            isBestPrice: bestPriceByTier.get(listing.quality_tier_min ?? 0) === listing.price_min,
          }))}
          initialSort="price_min"
          keyAttr="listing_id"
          headCells={headCells}
          generateRow={(props) => (
            <GameItemListingRow
              {...props}
              gameItemId={gameItemId!}
            />
          )}
        />
      </Grid>
    </Grid>
  );
}

/**
 * PriceRangeTable - Shows price ranges by quality tier
 * 
 * Requirements: 39.5
 */
function PriceRangeTable({
  distribution,
}: {
  distribution: GameItemQualityDistribution[];
}) {
  const { t, i18n } = useTranslation();
  const theme = useTheme<ExtendedTheme>();

  if (distribution.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
        No price data available
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
                Quality Tier
              </Typography>
            </th>
            <th style={{ textAlign: "right", padding: theme.spacing(1) }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Listings
              </Typography>
            </th>
            <th style={{ textAlign: "right", padding: theme.spacing(1) }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Min Price
              </Typography>
            </th>
            <th style={{ textAlign: "right", padding: theme.spacing(1) }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Avg Price
              </Typography>
            </th>
            <th style={{ textAlign: "right", padding: theme.spacing(1) }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Max Price
              </Typography>
            </th>
            <th style={{ textAlign: "right", padding: theme.spacing(1) }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Total Quantity
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
                <Typography variant="body2">{item.listing_count}</Typography>
              </td>
              <td style={{ textAlign: "right", padding: theme.spacing(1) }}>
                <Typography variant="body2" color="primary">
                  {item.price_min.toLocaleString(i18n.language)} aUEC
                </Typography>
              </td>
              <td style={{ textAlign: "right", padding: theme.spacing(1) }}>
                <Typography variant="body2">
                  {item.price_avg.toLocaleString(i18n.language)} aUEC
                </Typography>
              </td>
              <td style={{ textAlign: "right", padding: theme.spacing(1) }}>
                <Typography variant="body2">
                  {item.price_max.toLocaleString(i18n.language)} aUEC
                </Typography>
              </td>
              <td style={{ textAlign: "right", padding: theme.spacing(1) }}>
                <Typography variant="body2">
                  {item.quantity_available.toLocaleString(i18n.language)}
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
 * GameItemListingRow - Individual listing row with variant selection
 * 
 * Requirements: 39.7, 39.8, 39.9, 39.10
 */
function GameItemListingRow(props: {
  row: GameItemListingResult & { isBestPrice?: boolean };
  index: number;
  onClick?: React.MouseEventHandler;
  isItemSelected: boolean;
  labelId: string;
  gameItemId: string;
}) {
  const { t, i18n } = useTranslation();
  const { row: listing, index, gameItemId } = props;
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const issueAlert = useAlertHook();
  const [cookies, setCookie] = useCookies(["market_cart"]);
  const [justAddedToCart, setJustAddedToCart] = useState(false);

  const addToCart = useCallback(async () => {
    if (!selectedVariantId) {
      issueAlert({
        message: "Please select a variant",
        severity: "warning",
      });
      return;
    }

    const cart: Cart = cookies.market_cart || [];
    let found = false;

    // Find or create seller entry in cart
    for (const seller of cart) {
      if (
        (seller.user_seller_id && seller.user_seller_id === listing.seller_id) ||
        (seller.contractor_seller_id && seller.contractor_seller_id === listing.seller_id)
      ) {
        seller.items.push({
          listing_id: listing.listing_id,
          aggregate_id: gameItemId,
          quantity,
          type: "aggregate_composite",
          variant_id: selectedVariantId,
        });
        found = true;
        break;
      }
    }

    if (!found) {
      cart.push({
        user_seller_id: listing.seller_type === "user" ? listing.seller_id : undefined,
        contractor_seller_id: listing.seller_type === "contractor" ? listing.seller_id : undefined,
        items: [
          {
            listing_id: listing.listing_id,
            aggregate_id: gameItemId,
            quantity,
            type: "aggregate_composite",
            variant_id: selectedVariantId,
          },
        ],
      });
    }

    setCookie("market_cart", cart, {
      path: "/",
      sameSite: "strict",
      maxAge: 2592000, // 30 days
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
    gameItemId,
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
        // Highlight best price
        backgroundColor: props.row.isBestPrice
          ? "rgba(76, 175, 80, 0.08)"
          : "inherit",
        [`& .${tableCellClasses.root}`]: {},
      }}
    >
      {/* Seller Name and Rating */}
      <TableCell align="left">
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
                    } 
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
                    } 
                  }
                : undefined
            }
          />
        </Box>
      </TableCell>

      {/* Quality Tier */}
      <TableCell align="left">
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
            Unspecified
          </Typography>
        )}
      </TableCell>

      {/* Price */}
      <TableCell align="right">
        <Box>
          <Typography
            variant="subtitle2"
            color={props.row.isBestPrice ? "success.main" : "primary"}
            fontWeight={props.row.isBestPrice ? "bold" : "normal"}
          >
            {listing.price_min.toLocaleString(i18n.language)} aUEC
          </Typography>
          {listing.price_min !== listing.price_max && (
            <Typography variant="caption" color="text.secondary">
              - {listing.price_max.toLocaleString(i18n.language)} aUEC
            </Typography>
          )}
          {props.row.isBestPrice && (
            <Typography variant="caption" color="success.main" display="block">
              Best Price
            </Typography>
          )}
        </Box>
      </TableCell>

      {/* Quantity Input */}
      <TableCell align="right">
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
          color="secondary"
        />
      </TableCell>

      {/* Add to Cart Button */}
      <TableCell align="right">
        <Stack direction="column" spacing={1} alignItems="flex-end">
          {/* Add to Cart / View Cart Button */}
          {justAddedToCart ? (
            <Button
              component={Link}
              to="/market/cart"
              variant="contained"
              color="secondary"
              size="large"
            >
              <VisibilityRounded />
            </Button>
          ) : (
            <HapticButton
              variant="contained"
              color="primary"
              size="large"
              onClick={addToCart}
            >
              <AddShoppingCartRounded />
            </HapticButton>
          )}
        </Stack>
      </TableCell>
    </TableRow>
  );
}
