/**
 * Wiki Item Detail
 * 
 * Full stats, description, craftable from blueprints, rewarded by missions
 * Links to market listings with active listing count and price range
 * Task 8.10.3
 */

import React, { useState } from "react"
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Tabs,
  Tab,
  TextField,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import { useParams, useNavigate } from "react-router-dom"
import { useGetItemDetailQuery, useSearchListingsQuery, useAddBlueprintToInventoryMutation, useRemoveBlueprintFromInventoryMutation, type BlueprintReference } from "../../store/api/v2/market"
import { useGetItemShopsQuery } from "../../store/api/shops"
import { ShoppingCart, Gavel, Storefront } from "@mui/icons-material"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useCartDrawer } from "../../features/market/hooks/AddToCartContext"
import { formatQuantity } from "../../util/formatQuantity"
import { PriceHistoryChartV2 } from "../../features/market/v2/components/PriceHistoryChartV2"
import { QualityDistributionChart } from "../../features/market/v2/components/QualityDistributionChart"
import { DISASSEMBLY_EFFICIENCY, DISASSEMBLY_TIME_SECONDS, formatCraftingTime } from "../../constants/crafting"
import { MARKET_PATHS, WIKI_PATHS, GAME_DATA_PATHS } from "../../routes/paths"
import { Helmet } from "react-helmet"
import { FRONTEND_URL } from "../../util/constants"
import { DetailPageSkeleton } from "../../components/game-data/GameDataSkeletons"

const TAB_OVERVIEW = 0
const TAB_CRAFTING = 1
const TAB_DISASSEMBLY = 2

export function WikiItemDetail() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: item, isLoading, error } = useGetItemDetailQuery({ id: id! })
  const { openAddToCart } = useCartDrawer()

  // Fetch related market listings for this item
  const { data: listingsData } = useSearchListingsQuery(
    { gameItemId: id!, pageSize: 6, sortBy: "price", sortOrder: "asc" },
    { skip: !id },
  )

  // Fetch NPC shop availability for this item
  const { data: shopAvailability, isLoading: shopsLoading } = useGetItemShopsQuery(
    { itemId: id! },
    { skip: !id },
  )

  const [tab, setTab] = useState(TAB_OVERVIEW)
  const [disassemblyQty, setDisassemblyQty] = useState(1)
  const [addToInventory] = useAddBlueprintToInventoryMutation()
  const [removeFromInventory] = useRemoveBlueprintFromInventoryMutation()

  if (isLoading) {
    return (
      <StandardPageLayout
        title={t("wiki.itemDetail.title", "Item Details")}
        headerTitle={t("wiki.itemDetail.title", "Item Details")}
        sidebarOpen={true}
        maxWidth="md"
      >
        <Grid item xs={12}>
          <DetailPageSkeleton />
        </Grid>
      </StandardPageLayout>
    )
  }

  if (error || !item) {
    return (
      <StandardPageLayout
        title={t("wiki.itemDetail.title", "Item Details")}
        headerTitle={t("wiki.itemDetail.title", "Item Details")}
        sidebarOpen={true}
        maxWidth="md"
      >
        <Grid item xs={12}>
          <Alert severity="error">{t("wiki.itemDetail.loadError", "Failed to load item details. Please try again.")}</Alert>
        </Grid>
      </StandardPageLayout>
    )
  }

  const seoTitle = `${item.name} — Star Citizen Item | SC Market`
  const seoDescription = `${item.name} — ${item.type || "equipment"} item${item.manufacturer ? " by " + item.manufacturer : ""}. View stats, market price, crafting uses, and locations in Star Citizen.`.slice(0, 160)
  const canonicalUrl = `${FRONTEND_URL}/wiki/items/${id}`
  const ogImage = item.image_url || `${FRONTEND_URL}/logo512.png`

  return (
    <StandardPageLayout
      title={seoTitle}
      description={seoDescription}
      canonicalUrl={`/wiki/items/${id}`}
      headerTitle={item.name}
      breadcrumbs={[
        { label: t("wiki.itemDetail.breadcrumbWiki", "Wiki"), href: WIKI_PATHS.hub },
        { label: t("wiki.itemDetail.breadcrumbItems", "Items"), href: WIKI_PATHS.items },
        { label: item.name },
      ]}
      sidebarOpen={true}
      maxWidth="md"
    >
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:type" content="product" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={ogImage} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: item.name,
            description: seoDescription,
            ...(item.image_url && { image: item.image_url }),
            url: canonicalUrl,
            ...(item.manufacturer && { manufacturer: { "@type": "Organization", name: item.manufacturer } }),
            ...(item.market_stats?.listing_count > 0 && {
              offers: {
                "@type": "AggregateOffer",
                lowPrice: item.market_stats.min_price,
                highPrice: item.market_stats.max_price,
                priceCurrency: "aUEC",
                offerCount: item.market_stats.listing_count,
              },
            }),
          })}
        </script>
      </Helmet>
      <Grid item xs={12}>
        <Grid container spacing={3}>
          {/* Main Info */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  {item.image_url && (
                    <Box
                      component="img"
                      src={item.image_url}
                      alt={item.name}
                      sx={{
                        width: 200,
                        height: 200,
                        objectFit: "contain",
                        bgcolor: "background.default",
                        borderRadius: 1,
                      }}
                    />
                  )}
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
                      {item.type && <Chip label={item.type} color="primary" />}
                      {item.size && <Chip label={`${t("wiki.itemDetail.size", "Size")} ${item.size}`} />}
                      {item.grade && <Chip label={`${t("wiki.itemDetail.grade", "Grade")} ${item.grade}`} />}
                      {item.manufacturer && <Chip label={item.manufacturer} clickable onClick={() => navigate(WIKI_PATHS.manufacturer(encodeURIComponent(item.manufacturer!)))} />}
                    </Stack>

                    {/* Market Stats */}
                    {item.market_stats.listing_count > 0 && (
                      <Card variant="outlined" sx={{ mt: 2, p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          {t("wiki.itemDetail.marketAvailability", "Market Availability")}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.market_stats.listing_count} {t("wiki.itemDetail.activeListing", "active listing")}
                          {item.market_stats.listing_count !== 1 ? "s" : ""}
                        </Typography>
                        {item.market_stats.min_price && item.market_stats.max_price && (
                          <Typography variant="body2" color="text.secondary">
                            {t("wiki.itemDetail.priceRange", "Price range")}: {item.market_stats.min_price.toLocaleString()} -{" "}
                            {item.market_stats.max_price.toLocaleString()} aUEC
                          </Typography>
                        )}
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<ShoppingCart />}
                          sx={{ mt: 2 }}
                          onClick={() => navigate(MARKET_PATHS.aggregate(item.id, item.name))}
                        >
                          {t("wiki.itemDetail.viewOnMarket", "View on Market")}
                        </Button>
                      </Card>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 2, mb: 2 }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                <Tab label={t("wiki.itemDetail.tabOverview", "Overview")} />
                <Tab label={t("wiki.itemDetail.tabCrafting", "Crafting")} disabled={item.craftable_from.length === 0} />
                <Tab label={t("wiki.itemDetail.tabDisassembly", "Disassembly")} />
              </Tabs>
            </Box>

            {/* Tab: Overview */}
            {tab === TAB_OVERVIEW && (
              <>
                {/* Attributes */}
                {Object.keys(item.attributes).length > 0 && (
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t("wiki.itemDetail.itemAttributes", "Item Attributes")}
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableBody>
                        {Object.entries(item.attributes).map(([key, value]) => (
                          <TableRow key={key}>
                            <TableCell component="th" scope="row" sx={{ fontWeight: "bold" }}>
                              {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                            </TableCell>
                            <TableCell>
                              {typeof value === "object" && value !== null
                                ? Object.entries(value as Record<string, unknown>).map(([k, v]) => (
                                    <Chip key={k} label={`${k}: ${v}`} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5, height: 20, fontSize: "0.65rem" }} />
                                  ))
                                : String(value)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            )}

            {/* Price History */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>{t("wiki.itemDetail.priceHistory", "Price History")}</Typography>
                <PriceHistoryChartV2 gameItemId={id!} />
              </CardContent>
            </Card>

            {/* Quality Distribution */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>{t("wiki.itemDetail.qualityDistribution", "Quality Distribution")}</Typography>
                <QualityDistributionChart gameItemId={id!} />
              </CardContent>
            </Card>

            {/* Related Market Listings */}
            {listingsData && listingsData.listings.length > 0 && (
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h6">
                      {t("wiki.itemDetail.marketListings", "Market Listings")} ({listingsData.total})
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => navigate(MARKET_PATHS.aggregate(id!))}
                    >
                      {t("wiki.itemDetail.viewAll", "View All")}
                    </Button>
                  </Stack>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableBody>
                        {listingsData.listings.map((listing) => (
                          <TableRow
                            key={listing.listing_id}
                            hover
                            sx={{ cursor: "pointer" }}
                            onClick={() => navigate(MARKET_PATHS.listing(listing.listing_id))}
                          >
                            <TableCell>
                              <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                {listing.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {listing.shop_name}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="bold" color="primary">
                                {listing.price_min === listing.price_max
                                  ? `${listing.price_min.toLocaleString()} aUEC`
                                  : `${listing.price_min.toLocaleString()} – ${listing.price_max.toLocaleString()} aUEC`}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="caption" color="text.secondary">
                                {listing.quantity_available} {t("wiki.itemDetail.available", "avail.")}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openAddToCart(listing.listing_id)
                                }}
                                disabled={listing.quantity_available === 0}
                              >
                                <ShoppingCart fontSize="small" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            )}

            {/* In-Game Shop Availability */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <Storefront color="action" />
                  <Typography variant="h6">{t("wiki.itemDetail.inGameShopAvailability", "In-Game Shop Availability")}</Typography>
                </Stack>
                {shopsLoading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : shopAvailability && shopAvailability.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>{t("wiki.itemDetail.columnShop", "Shop")}</TableCell>
                          <TableCell>{t("wiki.itemDetail.columnLocation", "Location")}</TableCell>
                          <TableCell align="right">{t("wiki.itemDetail.columnBuyPrice", "Buy Price")}</TableCell>
                          <TableCell align="right">{t("wiki.itemDetail.columnSellPrice", "Sell Price")}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {[...shopAvailability]
                          .sort((a, b) => {
                            const aPrice = a.buy_price ?? Infinity
                            const bPrice = b.buy_price ?? Infinity
                            return aPrice - bPrice
                          })
                          .map((shop) => (
                            <TableRow key={shop.shop_id}>
                              <TableCell>
                                <Typography variant="body2" fontWeight="medium">
                                  {shop.shop_name}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={shop.shop_location}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    borderColor: shop.shop_location.toLowerCase().includes("stanton")
                                      ? "info.main"
                                      : shop.shop_location.toLowerCase().includes("pyro")
                                        ? "warning.main"
                                        : "default",
                                    color: shop.shop_location.toLowerCase().includes("stanton")
                                      ? "info.main"
                                      : shop.shop_location.toLowerCase().includes("pyro")
                                        ? "warning.main"
                                        : "text.secondary",
                                  }}
                                />
                              </TableCell>
                              <TableCell align="right">
                                {shop.buy_price != null && shop.buy_price > 0 ? (
                                  <Typography variant="body2" fontWeight="bold" color="primary">
                                    {shop.buy_price.toLocaleString()} aUEC
                                  </Typography>
                                ) : (
                                  <Typography variant="body2" color="text.disabled">
                                    —
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell align="right">
                                {shop.sell_price != null && shop.sell_price > 0 ? (
                                  <Typography variant="body2" color="success.main">
                                    {shop.sell_price.toLocaleString()} aUEC
                                  </Typography>
                                ) : (
                                  <Typography variant="body2" color="text.disabled">
                                    —
                                  </Typography>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {t("wiki.itemDetail.notSoldNpc", "Not sold at any NPC shop")}
                  </Typography>
                )}
              </CardContent>
            </Card>
              </>
            )}

            {/* Tab: Crafting */}
            {tab === TAB_CRAFTING && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>{t("wiki.itemDetail.craftingRecipes", "Crafting Recipes")}</Typography>
                  {item.craftable_from.map((bp) => (
                    <Paper key={bp.blueprint_id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">{bp.blueprint_name}</Typography>
                          <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                            {bp.rarity && <Chip label={bp.rarity} size="small" />}
                            {bp.tier && <Chip label={`${t("wiki.itemDetail.tier", "Tier")} ${bp.tier}`} size="small" />}
                          </Stack>
                        </Box>
                        {bp.crafting_time_seconds && (
                          <Typography variant="body2" color="text.secondary">
                            {formatCraftingTime(bp.crafting_time_seconds)} {t("wiki.itemDetail.perCraft", "per craft")}
                          </Typography>
                        )}
                      </Stack>
                      <Box sx={{ mt: 2 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => navigate(`${GAME_DATA_PATHS.craftingCalculator}?blueprint_id=${bp.blueprint_id}`)}
                        >
                          {t("wiki.itemDetail.openInCalculator", "Open in Calculator")}
                        </Button>
                        <Button
                          size="small"
                          sx={{ ml: 1 }}
                          onClick={() => navigate(GAME_DATA_PATHS.blueprint(bp.blueprint_name || bp.blueprint_id))}
                        >
                          {t("wiki.itemDetail.viewBlueprint", "View Blueprint")}
                        </Button>
                        <Button
                          size="small"
                          variant={((bp as BlueprintReference & { user_owns?: boolean }).user_owns) ? "contained" : "outlined"}
                          sx={{ ml: 1 }}
                          onClick={() => {
                            if ((bp as BlueprintReference & { user_owns?: boolean }).user_owns) {
                              removeFromInventory({ blueprintId: bp.blueprint_id }).catch(() => {})
                            } else {
                              addToInventory({ blueprintId: bp.blueprint_id, body: {} }).catch(() => {})
                            }
                          }}
                        >
                          {(bp as BlueprintReference & { user_owns?: boolean }).user_owns ? t("wiki.itemDetail.owned", "Owned ✓") : t("wiki.itemDetail.markOwned", "Mark Owned")}
                        </Button>
                      </Box>
                    </Paper>
                  ))}
                  {item.craftable_from.length === 0 && (
                    <Typography color="text.secondary">{t("wiki.itemDetail.cannotBeCrafted", "This item cannot be crafted.")}</Typography>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Tab: Disassembly */}
            {tab === TAB_DISASSEMBLY && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>{t("wiki.itemDetail.disassemblyCalculator", "Disassembly Calculator")}</Typography>

                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <TextField
                      size="small"
                      type="number"
                      label={t("wiki.itemDetail.quantityToDisassemble", "Quantity to disassemble")}
                      value={disassemblyQty}
                      onChange={(e) => setDisassemblyQty(Math.max(1, +e.target.value || 1))}
                      inputProps={{ min: 1 }}
                      sx={{ width: 200 }}
                    />
                    <Chip label={`${formatCraftingTime(DISASSEMBLY_TIME_SECONDS * disassemblyQty)} ${t("wiki.itemDetail.total", "total")}`} color="primary" variant="outlined" />
                    <Chip label={`${Math.round(DISASSEMBLY_EFFICIENCY * 100)}% ${t("wiki.itemDetail.recovery", "recovery")}`} variant="outlined" />
                    <Chip label={`${DISASSEMBLY_TIME_SECONDS}s ${t("wiki.itemDetail.perItem", "per item")}`} variant="outlined" />
                  </Stack>

                  {item.craftable_from.length > 0 ? (
                    <>
                      <Alert severity="info" sx={{ mb: 2 }}>
                        {t("wiki.itemDetail.disassemblyInfo", "Disassembly returns {{efficiency}}% of crafting components at {{seconds}} seconds per item. Rare materials (Quantanium, Stileron, Savrilium, Lindinium, Riccite, Ouratite, Saldynium, Janalite) cannot be recovered.", { efficiency: Math.round(DISASSEMBLY_EFFICIENCY * 100), seconds: DISASSEMBLY_TIME_SECONDS })}
                      </Alert>

                      {item.craftable_from.map((bp) => (
                        <Box key={bp.blueprint_id} sx={{ mb: 3 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            {t("wiki.itemDetail.from", "From")}: {bp.blueprint_name}
                          </Typography>
                          <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>{t("wiki.itemDetail.columnComponent", "Component")}</TableCell>
                                  <TableCell align="right">{t("wiki.itemDetail.columnRecipeQty", "Recipe Qty")}</TableCell>
                                  <TableCell align="right">{t("wiki.itemDetail.columnRecoveredPerItem", "Recovered per Item")} ({Math.round(DISASSEMBLY_EFFICIENCY * 100)}%)</TableCell>
                                  <TableCell align="right">{t("wiki.itemDetail.columnTotal", "Total")} ({disassemblyQty}×)</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {/* Blueprint ingredients would go here — need detail query */}
                                <TableRow>
                                  <TableCell colSpan={4}>
                                    <Button
                                      size="small"
                                      onClick={() => navigate(GAME_DATA_PATHS.blueprint(bp.blueprint_name || bp.blueprint_id))}
                                    >
                                      {t("wiki.itemDetail.viewBlueprintFullList", "View blueprint for full ingredient list")}
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      ))}
                    </>
                  ) : (
                    <Alert severity="warning">
                      {t("wiki.itemDetail.noRecipeWarning", "No crafting recipe found for this item — disassembly components unknown.")}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Craftable From */}
            {item.craftable_from.length > 0 && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t("wiki.itemDetail.craftableFrom", "Craftable From")}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {item.craftable_from.map((blueprint) => (
                    <Box key={blueprint.blueprint_id} sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {blueprint.blueprint_name}
                      </Typography>
                      <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                        {blueprint.rarity && (
                          <Chip label={blueprint.rarity} size="small" />
                        )}
                        {blueprint.tier && (
                          <Chip label={`${t("wiki.itemDetail.tier", "Tier")} ${blueprint.tier}`} size="small" />
                        )}
                      </Stack>
                      {blueprint.crafting_time_seconds && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {t("wiki.itemDetail.craftingTime", "Crafting time")}: {formatCraftingTime(blueprint.crafting_time_seconds)}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Rewarded By Missions */}
            {item.rewarded_by.length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t("wiki.itemDetail.rewardedByMissions", "Rewarded By Missions")}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {item.rewarded_by.map((mission) => (
                    <Box key={`${mission.mission_id}-${mission.blueprint_id}`} sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {mission.mission_name}
                      </Typography>
                      {mission.star_system && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {mission.star_system}
                        </Typography>
                      )}
                      <Typography variant="caption" color="primary">
                        {t("wiki.itemDetail.dropChance", "Drop chance")}: {mission.drop_probability.toFixed(1)}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {t("wiki.itemDetail.via", "via")} {mission.blueprint_name}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Grid>
    </StandardPageLayout>
  )
}

