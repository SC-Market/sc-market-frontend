/**
 * Wiki Item Detail
 * 
 * Full stats and description, then "How to get it" (player listings,
 * missions, blueprints, in-game shops, resource info: ItemAcquisitionSection)
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
  Alert,
  Button,
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
import { useGetItemDetailQuery, useGetAcquisitionQuery, useAddBlueprintToInventoryMutation, useRemoveBlueprintFromInventoryMutation, type BlueprintReference } from "../../store/api/v2/market"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useCartDrawer } from "../../features/market/hooks/AddToCartContext"
import { formatQuantity } from "../../util/formatQuantity"
import { PriceHistoryChartV2 } from "../../features/market/v2/components/PriceHistoryChartV2"
import { QualityDistributionChart } from "../../features/market/v2/components/QualityDistributionChart"
import { DISASSEMBLY_EFFICIENCY, DISASSEMBLY_TIME_SECONDS, formatCraftingTime } from "../../constants/crafting"
import { WIKI_PATHS, GAME_DATA_PATHS } from "../../routes/paths"
import { ItemAcquisitionSection } from "../../components/game-data/ItemAcquisitionSection"
import { AnswerLead } from "../../components/game-data/AnswerSummary"
import { buildItemSummary } from "../../util/answerContent"
import { FRONTEND_URL } from "../../util/constants"
import { DetailPageSkeleton } from "../../components/game-data/GameDataSkeletons"
import { buildItemHead } from "../../seo/gameDataHeads"
import { headDescription } from "../../seo/pageHead"
import { SeoHead } from "../../seo/SeoHead"
import { usePageReady } from "../../components/metadata/PageReady"
import { isPrimaryLoading } from "../../components/metadata/pageReadyStore"
import { WatchPriceButton } from "../../features/price-alerts/components/WatchPriceButton"

import { useFormatters } from "../../util/format"
const TAB_OVERVIEW = 0
const TAB_CRAFTING = 1
const TAB_DISASSEMBLY = 2

export function WikiItemDetail() {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const theme = useTheme<ExtendedTheme>()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: item, isLoading, error, isFetching: pageIsFetching, currentData: pageCurrentData } = useGetItemDetailQuery({ id: id! })
  // Primary content: drives main[data-ready].
  usePageReady(
    isPrimaryLoading({ isLoading, isFetching: pageIsFetching, currentData: pageCurrentData }),
  )
  const { openAddToCart } = useCartDrawer()

  // How to get it: player listings, missions, blueprints, in-game shops
  // and resource info in one document (takes the UUID or the short slug).
  const { data: acquisition } = useGetAcquisitionQuery({ id: id! }, { skip: !id })

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

  const head = buildItemHead(item, FRONTEND_URL, acquisition)
  const seoTitle = head.title
  const seoDescription = headDescription(head)
  // Built from the resolved item, not the raw path param: this page is reachable
  // by full UUID or short slug, and the sitemap only lists the slug form.
  const canonicalPath = WIKI_PATHS.item(item.id, item.name)
  const answerSummary = buildItemSummary(item, t, fmt.locale)

  return (
    <StandardPageLayout
      title={seoTitle}
      description={seoDescription}
      canonicalUrl={canonicalPath}
      headerTitle={item.name}
      breadcrumbs={[
        { label: t("wiki.itemDetail.breadcrumbWiki", "Wiki"), href: WIKI_PATHS.hub },
        { label: t("wiki.itemDetail.breadcrumbItems", "Items"), href: WIKI_PATHS.items },
        { label: item.name },
      ]}
      sidebarOpen={true}
      maxWidth="md"
    >
      <SeoHead head={head} />
      <Grid item xs={12}>
        <AnswerLead summary={answerSummary} />
        <Grid container spacing={3}>
          {/* Main Info */}
          <Grid item xs={12}>
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

                    <Box sx={{ mb: 2 }}>
                      <WatchPriceButton
                        gameItemId={item.id}
                        itemName={item.name}
                        currentPrice={item.market_stats.min_price}
                        qualityRelevant={item.craftable_from.length > 0}
                      />
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {acquisition && (
              <ItemAcquisitionSection doc={acquisition} itemName={item.name} onAddToCart={openAddToCart} />
            )}

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
        </Grid>
      </Grid>
    </StandardPageLayout>
  )
}

