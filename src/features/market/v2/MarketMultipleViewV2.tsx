import React, { useMemo, useState } from "react";
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
  Stack,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { useParams } from "react-router-dom";
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout";
import { ExtendedTheme } from "../../../hooks/styles/Theme";
import { useGetUserProfileQuery } from "../../profile/api/profileApi";
import { useCurrentOrg } from "../../../hooks/login/CurrentOrg";
import {
  CreateRounded,
  PersonRounded,
  RefreshRounded,
  ZoomInRounded,
} from "@mui/icons-material";
import { ClockAlert } from "mdi-material-ui";
import { getRelativeTime } from "../../../util/time";
import { Section } from "../../../components/paper/Section";
import { UserList } from "../../../components/list/UserList";
import { OrderList } from "../../../components/list/OrderList";
import { MarkdownRender } from "../../../components/markdown/Markdown.lazy";
import { Helmet } from "react-helmet";
import { FRONTEND_URL } from "../../../util/constants";
import { ListingNameAndRating } from "../../../components/rating/ListingRating";
import { has_permission } from "../../../views/contractor/OrgRoles";
import { ImagePreviewModal } from "../../../components/modal/ImagePreviewModal";
import { ListingDetailItem } from "../listing-view/components/ListingDetailItem";
import { dateDiffInDays } from "../../../util/dateDiff";
import { subDays } from "date-fns";
import { useTranslation } from "react-i18next";
import { VariantSelector } from "../../../components/market/v2/VariantSelector";
import { QualityBadge } from "../../../components/market/v2/QualityBadge";
import type { Order } from "../../orders/domain/types"
import { MinimalUser } from "../../../datatypes/User";
import { useGetListingDetailQuery } from "../../../store/api/v2/market";

/**
 * MarketMultipleViewV2 Component
 * 
 * Task: 11.6 Implement MarketMultipleViewV2 component
 * Requirements: 42.1-42.10
 * 
 * Displays bundle listings with multiple items where each item can have different variants
 * with quality tiers. Users can select variants for each item in the bundle and see the
 * total price calculated correctly.
 * 
 * Features:
 * - Display all items in bundle
 * - Show quality tier for each item
 * - Display variant attributes for each item
 * - Calculate bundle total with per-variant pricing
 * - Provide variant selection for each item
 * - Validate availability for entire bundle
 * - Maintain visual parity with V1 MarketMultipleView
 * 
 * Visual Parity Requirements:
 * - Reuse image paper styling (minHeight: 400, borderRadius)
 * - Reuse Card layout for item details
 * - Reuse Section for people and orders
 * - Maintain identical typography and spacing
 * - Use identical breadcrumbs and header structure
 * - Preserve mobile responsiveness
 */

/** Bundle listing item with variant information */
export interface BundleItemV2 {
  item_id: string;
  game_item: {
    id: string;
    name: string;
    type: string;
  };
  pricing_mode: "unified" | "per_variant";
  base_price?: number;
  variants: Array<{
    variant_id: string;
    attributes: {
      quality_tier?: number;
      quality_value?: number;
      crafted_source?: string;
    };
    display_name: string;
    short_name: string;
    quantity: number;
    price: number;
  }>;
}

/** Bundle listing data structure */
export interface BundleListingV2 {
  listing_id: string;
  seller_type: "user" | "contractor";
  title: string;
  description: string;
  status: "active" | "sold" | "expired" | "cancelled";
  created_at: string;
  updated_at: string;
  expires_at: string;
  items: BundleItemV2[];
  photos: string[];
  seller: {
    name: string;
    slug: string;
    display_name?: string;
    username?: string;
    avatar?: string;
    spectrum_id?: string;
    rating: { avg_rating: number };
  };
  orders?: Order[];
}

export function MarketMultipleViewV2() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const theme = useTheme<ExtendedTheme>();
  const { data: profile } = useGetUserProfileQuery();
  const [currentOrg] = useCurrentOrg();
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const { data: listingDetail, isLoading, error } = useGetListingDetailQuery({ id: id! }, { skip: !id });

  const complete: BundleListingV2 | null = useMemo(() => {
    if (!listingDetail) return null;
    const { listing, seller, items } = listingDetail;
    return {
      listing_id: listing.listing_id,
      seller_type: listing.seller_type,
      title: listing.title,
      description: listing.description,
      status: listing.status,
      created_at: listing.created_at,
      updated_at: listing.updated_at,
      expires_at: listing.expires_at || listing.updated_at,
      items: items.map((item) => ({
        item_id: item.item_id,
        game_item: {
          id: item.game_item.id,
          name: item.game_item.name,
          type: item.game_item.type,
        },
        pricing_mode: item.pricing_mode,
        base_price: item.base_price,
        variants: item.variants.map((v) => ({
          variant_id: v.variant_id,
          attributes: {
            quality_tier: v.attributes.quality_tier,
            quality_value: v.attributes.quality_value,
            crafted_source: v.attributes.crafted_source,
          },
          display_name: v.display_name,
          short_name: v.short_name,
          quantity: v.quantity,
          price: v.price,
        })),
      })),
      photos: items[0]?.game_item.image_url
        ? [items[0].game_item.image_url]
        : ["https://cdn.robertsspaceindustries.com/static/images/Temp/default-image.png"],
      seller: {
        name: seller.name,
        slug: seller.slug,
        avatar: seller.avatar_url,
        rating: { avg_rating: seller.rating },
      },
      orders: [],
    };
  }, [listingDetail]);
  const currentItem = complete?.items[selectedItemIndex];

  // Permission checks
  const amContractor = useMemo(
    () =>
      currentOrg?.spectrum_id === complete?.seller.slug &&
      complete?.seller_type === "contractor",
    [currentOrg?.spectrum_id, complete?.seller.slug, complete?.seller_type]
  );

  const amSeller = useMemo(
    () =>
      profile?.username === complete?.seller.username &&
      complete?.seller_type === "user" &&
      !currentOrg,
    [currentOrg, complete?.seller.username, complete?.seller_type, profile?.username]
  );

  const amContractorManager = useMemo(
    () =>
      amContractor &&
      has_permission(currentOrg, profile, "manage_market", profile?.contractors),
    [currentOrg, profile, amContractor]
  );

  const amRelated = useMemo(
    () => amSeller || amContractorManager || profile?.role === "admin",
    [amSeller, amContractorManager, profile?.role]
  );

  // Calculate bundle total based on selected variants
  const bundleTotal = useMemo(() => {
    if (!complete) return 0;
    let total = 0;
    for (const item of complete.items) {
      const selectedVariantId = selectedVariants[item.item_id];
      if (selectedVariantId) {
        const variant = item.variants.find((v) => v.variant_id === selectedVariantId);
        if (variant) {
          total += variant.price;
        }
      } else if (item.variants.length === 1) {
        // Auto-select if only one variant
        total += item.variants[0].price;
      }
    }
    return total;
  }, [complete?.items, selectedVariants]);

  // Check if all items have variants selected
  const allVariantsSelected = useMemo(() => {
    if (!complete) return false;
    return complete.items.every((item) => {
      return selectedVariants[item.item_id] || item.variants.length === 1;
    });
  }, [complete?.items, selectedVariants]);

  // Handle variant selection
  const handleVariantChange = (itemId: string, variantId: string | null) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [itemId]: variantId || "",
    }));
  };

  return (
    <StandardPageLayout
      title={complete?.title || "Bundle Listing"}
      headerTitle={complete?.title}
      breadcrumbs={[
        { label: t("sidebar.market_short", "Market"), href: "/market" },
        { label: complete?.title || "Listing" },
      ]}
      isLoading={isLoading}
      error={!complete && !isLoading ? error : undefined}
      sidebarOpen={true}
      maxWidth="xl"
    >
    {complete && currentItem && (
    <>
      <Grid item xs={12} lg={12}>
        <Grid container spacing={theme.layoutSpacing.layout}>
          {/* Image Section */}
          <Grid item xs={12} lg={4}>
            <Grid container spacing={theme.layoutSpacing.layout}>
              <Grid item xs={12} lg={12}>
                <ImagePreviewModal
                  images={complete.photos}
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
                  <img
                    loading="lazy"
                    style={{
                      display: "block",
                      maxHeight: "100%",
                      maxWidth: "100%",
                      margin: "auto",
                    }}
                    src={complete.photos[0]}
                    alt={t("marketMultipleView.productImage", "Product image for {{title}}", {
                      title: complete.title,
                    })}
                    onError={({ currentTarget }) => {
                      currentTarget.onerror = null;
                      currentTarget.src =
                        "https://cdn.robertsspaceindustries.com/static/images/Temp/default-image.png";
                    }}
                  />
                </Paper>

                <Helmet>
                  <meta name="description" content={complete.description} />
                  <meta property="og:type" content="website" />
                  <meta
                    property="og:url"
                    content={`${FRONTEND_URL}/market/multiple/${complete.listing_id}`}
                  />
                  <meta property="og:title" content={complete.title} />
                  <meta property="og:description" content={complete.description} />
                  <meta property="og:image" content={complete.photos[0]} />
                  <meta name="twitter:card" content="summary_large_image" />
                  <meta
                    name="twitter:url"
                    content={`${FRONTEND_URL}/market/multiple/${complete.listing_id}`}
                  />
                  <meta name="twitter:title" content={complete.title} />
                  <meta name="twitter:description" content={complete.description} />
                  <meta name="twitter:image" content={complete.photos[0]} />
                  <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Product",
                    name: complete.title,
                    description: complete.description,
                    image: complete.photos[0],
                    url: `${FRONTEND_URL}/market/multiple/${complete.listing_id}`,
                  })}</script>
                </Helmet>
              </Grid>

              {/* People Section */}
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
                          users={[{
                            name: complete.seller.name,
                            display_name: complete.seller.display_name || complete.seller.name,
                            username: complete.seller.username || complete.seller.name,
                            avatar: complete.seller.avatar || "",
                            rating: {
                              avg_rating: complete.seller.rating.avg_rating,
                              rating_count: 0,
                              total_rating: 0,
                              streak: 0,
                            }
                          } as MinimalUser]}
                          title={t("MarketMultipleView.seller")}
                        />
                      </Grid>
                    </Section>
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Grid>

          {/* Main Content Section */}
          <Grid item xs={12} lg={8}>
            <Grid container spacing={theme.layoutSpacing.layout}>
              <Grid item xs={12}>
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
                                currentItem.game_item.type
                              )}`}
                            >
                              {currentItem.game_item.type}
                            </MaterialLink>
                            {currentItem.game_item.name && (
                              <MaterialLink
                                component={Link}
                                underline="hover"
                                color="text.secondary"
                                to={`/market?query=${encodeURIComponent(
                                  currentItem.game_item.name
                                )}`}
                              >
                                {currentItem.game_item.name}
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
                            {complete.title}{" "}
                            <Typography display={"inline"} sx={{ marginLeft: 1 }}>
                              {dateDiffInDays(
                                new Date(),
                                new Date(complete.created_at)
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
                          <ListingDetailItem icon={<PersonRounded fontSize={"inherit"} />}>
                            <ListingNameAndRating
                              user={
                                complete.seller_type === "user"
                                  ? {
                                      username: complete.seller.username || complete.seller.name,
                                      display_name: complete.seller.display_name || complete.seller.name,
                                      avatar: complete.seller.avatar || "",
                                      rating: {
                                        avg_rating: complete.seller.rating.avg_rating,
                                        rating_count: 0,
                                        total_rating: 0,
                                        streak: 0,
                                      },
                                    }
                                  : undefined
                              }
                              contractor={
                                complete.seller_type === "contractor"
                                  ? {
                                      name: complete.seller.name,
                                      avatar: complete.seller.avatar || "",
                                      spectrum_id: complete.seller.slug,
                                      rating: {
                                        avg_rating: complete.seller.rating.avg_rating,
                                        rating_count: 0,
                                        total_rating: 0,
                                        streak: 0,
                                      },
                                    }
                                  : undefined
                              }
                            />
                          </ListingDetailItem>
                          <ListingDetailItem icon={<CreateRounded fontSize={"inherit"} />}>
                            {t("MarketMultipleView.listed")}{" "}
                            {getRelativeTime(new Date(complete.created_at))}
                          </ListingDetailItem>
                          <ListingDetailItem icon={<RefreshRounded fontSize={"inherit"} />}>
                            {t("MarketMultipleView.updated")}{" "}
                            {getRelativeTime(subDays(new Date(complete.expires_at), 30))}
                          </ListingDetailItem>
                          <ListingDetailItem icon={<ClockAlert fontSize={"inherit"} />}>
                            {t("MarketMultipleView.expires")}{" "}
                            {getRelativeTime(new Date(complete.expires_at))}
                          </ListingDetailItem>
                        </Stack>
                      }
                      action={
                        amRelated ? (
                          <Link to={`/market/multiple/${complete.listing_id}/edit`}>
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
                      {/* Bundle Purchase Area */}
                      {complete.status === "active" && (
                        <>
                          <Divider light />
                          <BundlePurchaseArea
                            listing={complete}
                            selectedVariants={selectedVariants}
                            bundleTotal={bundleTotal}
                            allVariantsSelected={allVariantsSelected}
                          />
                          <Divider light />
                        </>
                      )}

                      {/* Item Selector */}
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
                          onChange={(event) => {
                            const index = complete.items.findIndex(
                              (item) => item.item_id === event.target.value
                            );
                            if (index !== -1) {
                              setSelectedItemIndex(index);
                            }
                          }}
                          value={currentItem.item_id}
                        >
                          {complete.items.map((item) => (
                            <MenuItem value={item.item_id} key={item.item_id}>
                              {item.game_item.name}
                            </MenuItem>
                          ))}
                        </Select>

                        {/* Current Item Details */}
                        <Box sx={{ marginTop: 2 }}>
                          <Typography
                            variant={"subtitle1"}
                            fontWeight={"bold"}
                            color={"text.secondary"}
                          >
                            {currentItem.game_item.name}
                          </Typography>

                          {/* Variant Selection for Current Item */}
                          {currentItem.variants.length > 1 && (
                            <Box sx={{ marginTop: 2, marginBottom: 2 }}>
                              <Typography
                                variant={"subtitle2"}
                                color={"text.secondary"}
                                sx={{ marginBottom: 1 }}
                              >
                                {t("market.selectVariant", "Select Variant")}
                              </Typography>
                              <VariantSelector
                                variants={currentItem.variants}
                                selectedVariantId={selectedVariants[currentItem.item_id]}
                                onVariantChange={(variantId) =>
                                  handleVariantChange(currentItem.item_id, variantId)
                                }
                              />
                            </Box>
                          )}

                          {/* Variant Details Table */}
                          <Box sx={{ marginTop: 2 }}>
                            <Typography
                              variant={"subtitle2"}
                              fontWeight={"bold"}
                              color={"text.secondary"}
                              sx={{ marginBottom: 1 }}
                            >
                              {t("market.availableVariants", "Available Variants")}
                            </Typography>
                            <VariantDetailsTable variants={currentItem.variants} />
                          </Box>
                        </Box>

                        {/* Bundle Description */}
                        <Typography
                          variant={"subtitle1"}
                          fontWeight={"bold"}
                          color={"text.secondary"}
                          sx={{ marginTop: 2 }}
                        >
                          {t("MarketMultipleView.description")}
                        </Typography>
                        <Typography variant={"body2"}>
                          <MarkdownRender text={complete.description} />
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>

              {/* Active Orders Section */}
              {amRelated && !!complete.orders?.length && (
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
                      orders={complete.orders.filter(
                        (o) => !["cancelled", "fulfilled"].includes(o.status)
                      )}
                    />
                  </Grid>
                </Section>
              )}

              {/* Previous Orders Section */}
              {amRelated && !!complete.orders?.length && (
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
                      orders={complete.orders.filter((o) =>
                        ["cancelled", "fulfilled"].includes(o.status)
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
    )}
    </StandardPageLayout>
  );
}

/**
 * BundlePurchaseArea - Purchase controls for bundle with variant selection
 * 
 * Requirements: 42.7, 42.8, 42.9
 * Displays bundle total, variant selection status, and purchase button
 */
function BundlePurchaseArea({
  listing,
  selectedVariants,
  bundleTotal,
  allVariantsSelected,
}: {
  listing: BundleListingV2;
  selectedVariants: Record<string, string>;
  bundleTotal: number;
  allVariantsSelected: boolean;
}) {
  const { t, i18n } = useTranslation();
  const theme = useTheme<ExtendedTheme>();

  return (
    <Box sx={{ padding: 2 }}>
      <Grid container spacing={2}>
        {/* Bundle Items Summary */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" fontWeight="bold" color="text.secondary">
            {t("market.bundleContents", "Bundle Contents")}
          </Typography>
          <Stack spacing={1} sx={{ marginTop: 1 }}>
            {listing.items.map((item) => {
              const selectedVariantId = selectedVariants[item.item_id];
              const selectedVariant =
                selectedVariantId && item.variants.find((v) => v.variant_id === selectedVariantId);
              const autoSelectedVariant = item.variants.length === 1 ? item.variants[0] : null;
              const variant = selectedVariant || autoSelectedVariant;

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
                      <QualityBadge tier={variant.attributes.quality_tier} size="small" />
                    )}
                  </Box>
                  <Typography variant="body2" color="primary" fontWeight="bold">
                    {variant
                      ? `${variant.price.toLocaleString(i18n.language)} aUEC`
                      : t("market.selectVariant", "Select Variant")}
                  </Typography>
                </Box>
              );
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
                ? `${bundleTotal.toLocaleString(i18n.language)} aUEC`
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
                      "Please select a variant for each item"
                    )}
              </Typography>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

/**
 * VariantDetailsTable - Displays variant attributes, quantities, and prices
 * 
 * Requirements: 42.5, 42.6
 * Shows quality tier, attributes, quantity, and price for each variant
 */
function VariantDetailsTable({
  variants,
}: {
  variants: Array<{
    variant_id: string;
    attributes: {
      quality_tier?: number;
      quality_value?: number;
      crafted_source?: string;
    };
    display_name: string;
    short_name: string;
    quantity: number;
    price: number;
  }>;
}) {
  const { t, i18n } = useTranslation();
  const theme = useTheme<ExtendedTheme>();

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
                  <QualityBadge tier={variant.attributes.quality_tier} size="small" />
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
                  {variant.quantity.toLocaleString(i18n.language)}
                </Typography>
              </td>
              <td style={{ textAlign: "right", padding: theme.spacing(1) }}>
                <Typography variant="body2" color="primary">
                  {variant.price.toLocaleString(i18n.language)} aUEC
                </Typography>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
}
