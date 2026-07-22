/**
 * WikiCommodityDetail — detail page for a single commodity/resource.
 * Shows mining locations, purchase locations, blueprints that need it, market price.
 */

import React from "react"
import { Helmet } from "react-helmet"
import {
  Box, Button, Card, CardContent, Chip, Grid, Typography, Alert, Stack, Divider,
  Table, TableBody, TableCell, TableHead, TableRow, Paper, Avatar,
} from "@mui/material"
import { useParams, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useGetResourceQuery } from "../../store/api/v2/market"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { DetailPageSkeleton } from "../../components/game-data/GameDataSkeletons"
import { GameItemAvatar } from "../../components/game-data/GameItemAvatar"
import { getCommodityColor } from "../../util/gameIcons"
import { formatPrice } from "../../util/formatPrice"
import { CheckCircle, Cancel, TerrainRounded, StoreRounded, BuildRounded, HardwareRounded, ShoppingCart } from "@mui/icons-material"
import { useSearchOresQuery } from "../../store/api/v2/market"
import { FRONTEND_URL } from "../../util/constants"
import { WIKI_PATHS, MARKET_PATHS, GAME_DATA_PATHS } from "../../routes/paths"

function BoolChip({ value, label }: { value: boolean; label: string }) {
  return (
    <Chip
      icon={value ? <CheckCircle sx={{ fontSize: 14 }} /> : <Cancel sx={{ fontSize: 14 }} />}
      label={label}
      size="small"
      color={value ? "success" : "default"}
      variant={value ? "filled" : "outlined"}
      sx={{ height: 22, fontSize: "0.7rem" }}
    />
  )
}

export function WikiCommodityDetail() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, error } = useGetResourceQuery({ resourceId: id! }, { skip: !id })

  const r = data?.resource
  const bps = data?.blueprints_requiring || []
  const price = data?.market_price

  const acquisitionMethods = [
    r?.can_be_mined && "Mining",
    r?.can_be_purchased && "Purchase",
    r?.can_be_salvaged && "Salvage",
    r?.can_be_looted && "Looting",
  ].filter(Boolean).join(", ")

  const seoTitle = r ? `${r.resource_name} — Star Citizen Commodity | SC Market` : "Commodity Detail | SC Market"
  const seoDescription = r ? `${r.resource_name} — ${r.resource_category} commodity. ${acquisitionMethods || "Various acquisition methods"}. View mining locations, market price, and quality tiers.`.slice(0, 160) : ""
  const canonicalUrl = `${FRONTEND_URL}${WIKI_PATHS.commodity(id!)}`
  const ogImage = r?.resource_icon || `${FRONTEND_URL}/logo512.png`

  return (
    <StandardPageLayout
      title={seoTitle}
      description={seoDescription}
      canonicalUrl={WIKI_PATHS.commodity(id!)}
      headerTitle={r?.resource_name || t("wiki.commodityDetail.headerTitle", "Commodity Detail")}
      breadcrumbs={[
        { label: t("wiki.commodityDetail.breadcrumbWiki", "Wiki"), href: WIKI_PATHS.hub },
        { label: t("wiki.commodityDetail.breadcrumbCommodities", "Commodities"), href: WIKI_PATHS.commodities },
        { label: r?.resource_name || t("wiki.commodityDetail.breadcrumbDetail", "Detail") },
      ]}
      isLoading={isLoading}
      skeleton={<DetailPageSkeleton />}
      error={error || undefined}
      sidebarOpen={true}
      maxWidth="md"
    >
      {r && (
        <>
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
                name: r.resource_name,
                description: seoDescription,
                ...(r.resource_icon && { image: r.resource_icon }),
                url: canonicalUrl,
                category: r.resource_category,
                ...(price && (price.min_price || price.max_price) && {
                  offers: {
                    "@type": "AggregateOffer",
                    lowPrice: price.min_price,
                    highPrice: price.max_price,
                    priceCurrency: "aUEC",
                  },
                }),
              })}
            </script>
          </Helmet>
          <Grid item xs={12}>
          {/* Header */}
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <GameItemAvatar
              name={r.resource_name}
              iconUrl={r.resource_icon}
              subType={r.resource_subcategory}
              size={48}
              sx={{ bgcolor: getCommodityColor(r.resource_subcategory) || "primary.main" }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight={700}>{r.resource_name}</Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                <Chip label={r.resource_category} size="small" variant="outlined" />
                {r.resource_subcategory && <Chip label={r.resource_subcategory} size="small" variant="outlined" />}
              </Stack>
            </Box>
          </Stack>

          {/* Acquisition methods + stats */}
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            <BoolChip value={r.can_be_mined} label={t("wiki.commodityDetail.acqMining", "Mining")} />
            <BoolChip value={r.can_be_purchased} label={t("wiki.commodityDetail.acqPurchase", "Purchase")} />
            <BoolChip value={r.can_be_salvaged} label={t("wiki.commodityDetail.acqSalvage", "Salvage")} />
            <BoolChip value={r.can_be_looted} label={t("wiki.commodityDetail.acqLoot", "Loot")} />
            {r.base_value != null && <Chip label={`${t("wiki.commodityDetail.baseLabel", "Base")}: ${r.base_value} aUEC`} size="small" variant="outlined" />}
            {r.max_stack_size != null && <Chip label={`${t("wiki.commodityDetail.stackLabel", "Stack")}: ${r.max_stack_size} SCU`} size="small" variant="outlined" />}
          </Stack>

          {/* Market Price */}
          {price && (price.average_price || price.min_price) && (
            <Card sx={{ mb: 2 }}>
              <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Typography variant="subtitle2" gutterBottom>{t("wiki.commodityDetail.marketPrice", "Market Price")}</Typography>
                <Stack direction="row" spacing={3} alignItems="center">
                  {price.min_price != null && <Box><Typography variant="caption" color="text.secondary">{t("wiki.commodityDetail.priceMin", "Min")}</Typography><Typography variant="body1" fontWeight={600}>{formatPrice(price.min_price)}</Typography></Box>}
                  {price.average_price != null && <Box><Typography variant="caption" color="text.secondary">{t("wiki.commodityDetail.priceAvg", "Avg")}</Typography><Typography variant="body1" fontWeight={600}>{formatPrice(price.average_price)}</Typography></Box>}
                  {price.max_price != null && <Box><Typography variant="caption" color="text.secondary">{t("wiki.commodityDetail.priceMax", "Max")}</Typography><Typography variant="body1" fontWeight={600}>{formatPrice(price.max_price)}</Typography></Box>}
                  <Box sx={{ flex: 1 }} />
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ShoppingCart />}
                    onClick={() => navigate(`${MARKET_PATHS.search}?item=${encodeURIComponent(r.resource_name)}`)}
                  >
                    {t("wiki.commodityDetail.viewOnMarket", "View on Market")}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          )}

          <Grid container spacing={2}>
            {/* Mining Locations */}
            {r.mining_locations && r.mining_locations.length > 0 && (
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      <TerrainRounded sx={{ fontSize: 16, mr: 0.5, verticalAlign: "text-bottom" }} />
                      {t("wiki.commodityDetail.miningLocations", "Mining Locations")} ({r.mining_locations.length})
                    </Typography>
                    <Table size="small">
                      <TableBody>
                        {r.mining_locations.map((loc, i) => (
                          <TableRow key={i}>
                            <TableCell>{loc.location_detail || loc.planet_moon || t("wiki.commodityDetail.unknown", "Unknown")}</TableCell>
                            <TableCell align="right">
                              {loc.star_system && <Chip label={loc.star_system} size="small" variant="outlined" sx={{ height: 18, fontSize: "0.65rem" }} />}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Mining Data from P4K */}
            <MiningDataSection resourceName={r.resource_name} />

            {/* Purchase Locations */}
            {r.purchase_locations && r.purchase_locations.length > 0 && (
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      <StoreRounded sx={{ fontSize: 16, mr: 0.5, verticalAlign: "text-bottom" }} />
                      {t("wiki.commodityDetail.purchaseLocations", "Purchase Locations")} ({r.purchase_locations.length})
                    </Typography>
                    <Table size="small">
                      <TableBody>
                        {r.purchase_locations.map((loc, i) => (
                          <TableRow key={i}>
                            <TableCell>{loc.station || loc.planet_moon || t("wiki.commodityDetail.unknown", "Unknown")}</TableCell>
                            <TableCell align="right">
                              {loc.average_price != null && <Typography variant="caption">{formatPrice(loc.average_price)}</Typography>}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Blueprints Requiring This Resource */}
            {bps.length > 0 && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      <BuildRounded sx={{ fontSize: 16, mr: 0.5, verticalAlign: "text-bottom" }} />
                      {t("wiki.commodityDetail.usedInBlueprints", "Used in Blueprints")} ({bps.length})
                    </Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      {bps.map((bp) => (
                        <Chip
                          key={bp.blueprint_id}
                          label={bp.output_item_name || bp.blueprint_name}
                          size="small"
                          sx={{ cursor: "pointer", height: 24 }}
                          onClick={() => navigate(GAME_DATA_PATHS.blueprint(bp.blueprint_id))}
                        />
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Grid>
        </>
      )}
    </StandardPageLayout>
  )
}

function MiningDataSection({ resourceName }: { resourceName: string }) {
  const { t } = useTranslation()
  // Search for ores matching this resource name
  const { data } = useSearchOresQuery({ text: resourceName, pageSize: 5 })
  const ores = data?.ores || []
  if (!ores.length) return null

  const ore = ores[0]
  return (
    <Grid item xs={12} md={6}>
      <Card>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            <HardwareRounded sx={{ fontSize: 16, mr: 0.5, verticalAlign: "text-bottom" }} />
            {t("wiki.commodityDetail.miningStats", "Mining Stats")}
          </Typography>
          <Stack spacing={0.5}>
            {ore.instability != null && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">{t("wiki.commodityDetail.instability", "Instability")}</Typography>
                <Typography variant="caption" fontWeight={600}>{ore.instability}</Typography>
              </Stack>
            )}
            {ore.resistance != null && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">{t("wiki.commodityDetail.resistance", "Resistance")}</Typography>
                <Typography variant="caption" fontWeight={600}>{ore.resistance}</Typography>
              </Stack>
            )}
            {ore.explosionMultiplier != null && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">{t("wiki.commodityDetail.explosionRisk", "Explosion Risk")}</Typography>
                <Typography variant="caption" fontWeight={600}>{ore.explosionMultiplier}</Typography>
              </Stack>
            )}
            {(ore.topLocations?.length ?? 0) > 0 && (
              <>
                <Divider sx={{ my: 0.5 }} />
                <Typography variant="caption" color="text.secondary" fontWeight={600}>{t("wiki.commodityDetail.bestLocations", "Best Locations")}</Typography>
                {(ore.topLocations || []).map((loc) => (
                  <Stack key={loc.name} direction="row" justifyContent="space-between">
                    <Typography variant="caption">{loc.name}</Typography>
                    <Typography variant="caption" color="primary">{loc.probability?.toFixed(1)}%</Typography>
                  </Stack>
                ))}
              </>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  )
}
