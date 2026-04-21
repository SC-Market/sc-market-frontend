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
import { useGetItemDetailQuery, useSearchListingsQuery } from "../../store/api/v2/market"
import { ShoppingCart, Gavel } from "@mui/icons-material"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useCartDrawer } from "../../hooks/market/AddToCartContext"
import { formatQuantity } from "../../util/formatQuantity"

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

  const [tab, setTab] = useState(TAB_OVERVIEW)
  const [disassemblyQty, setDisassemblyQty] = useState(1)

  if (isLoading) {
    return (
      <StandardPageLayout
        title={t("wiki.itemDetail.title", "Item Details")}
        headerTitle={t("wiki.itemDetail.title", "Item Details")}
        sidebarOpen={true}
        maxWidth="xl"
      >
        <Grid item xs={12}>
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
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
        maxWidth="xl"
      >
        <Grid item xs={12}>
          <Alert severity="error">Failed to load item details. Please try again.</Alert>
        </Grid>
      </StandardPageLayout>
    )
  }

  return (
    <StandardPageLayout
      title={t("wiki.itemDetail.title", "Item Details")}
      headerTitle={item.name}
      sidebarOpen={true}
      maxWidth="xl"
    >
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
                      {item.size && <Chip label={`Size ${item.size}`} />}
                      {item.grade && <Chip label={`Grade ${item.grade}`} />}
                      {item.manufacturer && <Chip label={item.manufacturer} />}
                    </Stack>

                    {/* Market Stats */}
                    {item.market_stats.listing_count > 0 && (
                      <Card variant="outlined" sx={{ mt: 2, p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          Market Availability
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.market_stats.listing_count} active listing
                          {item.market_stats.listing_count !== 1 ? "s" : ""}
                        </Typography>
                        {item.market_stats.min_price && item.market_stats.max_price && (
                          <Typography variant="body2" color="text.secondary">
                            Price range: {item.market_stats.min_price.toLocaleString()} -{" "}
                            {item.market_stats.max_price.toLocaleString()} aUEC
                          </Typography>
                        )}
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<ShoppingCart />}
                          sx={{ mt: 2 }}
                          onClick={() => navigate(`/market?item=${item.id}`)}
                        >
                          View on Market
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
                <Tab label="Overview" />
                <Tab label="Crafting" disabled={item.craftable_from.length === 0} />
                <Tab label="Disassembly" />
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
                    Item Attributes
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
                              {typeof value === "object"
                                ? JSON.stringify(value, null, 2)
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

            {/* Related Market Listings */}
            {listingsData && listingsData.listings.length > 0 && (
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h6">
                      Market Listings ({listingsData.total})
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => navigate(`/market?game_item_id=${id}`)}
                    >
                      View All
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
                            onClick={() => navigate(`/market/listing/${listing.listing_id}`)}
                          >
                            <TableCell>
                              <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                {listing.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {listing.seller_name}
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
                                {listing.quantity_available} avail.
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
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Craftable From */}
            {item.craftable_from.length > 0 && (
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Craftable From
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
                          <Chip label={`Tier ${blueprint.tier}`} size="small" />
                        )}
                      </Stack>
                      {blueprint.crafting_time_seconds && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Crafting time: {formatCraftingTime(blueprint.crafting_time_seconds)}
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
                    Rewarded By Missions
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
                        Drop chance: {mission.drop_probability.toFixed(1)}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        via {mission.blueprint_name}
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

function formatCraftingTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (minutes < 60) return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}
