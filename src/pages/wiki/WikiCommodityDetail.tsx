/**
 * WikiCommodityDetail — detail page for a single commodity/resource.
 * Shows mining locations, purchase locations, blueprints that need it, market price.
 */

import React from "react"
import {
  Box, Card, CardContent, Chip, Grid, Typography, Alert, Stack, Divider,
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
import { CheckCircle, Cancel, TerrainRounded, StoreRounded, BuildRounded, HardwareRounded } from "@mui/icons-material"
import { useSearchMiningOresQuery } from "../../store/api/v2/mining"

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

  return (
    <StandardPageLayout
      title={r?.resource_name || "Commodity Detail"}
      headerTitle={r?.resource_name || "Commodity Detail"}
      breadcrumbs={[
        { label: "Wiki", href: "/wiki/commodities" },
        { label: "Commodities", href: "/wiki/commodities" },
        { label: r?.resource_name || "Detail" },
      ]}
      isLoading={isLoading}
      skeleton={<DetailPageSkeleton />}
      error={error || undefined}
      sidebarOpen={true}
      maxWidth="lg"
    >
      {r && (
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
            <BoolChip value={r.can_be_mined} label="Mining" />
            <BoolChip value={r.can_be_purchased} label="Purchase" />
            <BoolChip value={r.can_be_salvaged} label="Salvage" />
            <BoolChip value={r.can_be_looted} label="Loot" />
            {r.base_value != null && <Chip label={`Base: ${r.base_value} aUEC`} size="small" variant="outlined" />}
            {r.max_stack_size != null && <Chip label={`Stack: ${r.max_stack_size} SCU`} size="small" variant="outlined" />}
          </Stack>

          {/* Market Price */}
          {price && (price.average_price || price.min_price) && (
            <Card sx={{ mb: 2 }}>
              <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Typography variant="subtitle2" gutterBottom>Market Price</Typography>
                <Stack direction="row" spacing={3}>
                  {price.min_price != null && <Box><Typography variant="caption" color="text.secondary">Min</Typography><Typography variant="body1" fontWeight={600}>{formatPrice(price.min_price)}</Typography></Box>}
                  {price.average_price != null && <Box><Typography variant="caption" color="text.secondary">Avg</Typography><Typography variant="body1" fontWeight={600}>{formatPrice(price.average_price)}</Typography></Box>}
                  {price.max_price != null && <Box><Typography variant="caption" color="text.secondary">Max</Typography><Typography variant="body1" fontWeight={600}>{formatPrice(price.max_price)}</Typography></Box>}
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
                      Mining Locations ({r.mining_locations.length})
                    </Typography>
                    <Table size="small">
                      <TableBody>
                        {r.mining_locations.map((loc: any, i: number) => (
                          <TableRow key={i}>
                            <TableCell>{loc.location_name || loc.name || "Unknown"}</TableCell>
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
                      Purchase Locations ({r.purchase_locations.length})
                    </Typography>
                    <Table size="small">
                      <TableBody>
                        {r.purchase_locations.map((loc: any, i: number) => (
                          <TableRow key={i}>
                            <TableCell>{loc.location_name || loc.name || "Unknown"}</TableCell>
                            <TableCell align="right">
                              {loc.price != null && <Typography variant="caption">{formatPrice(loc.price)}</Typography>}
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
                      Used in Blueprints ({bps.length})
                    </Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      {bps.map((bp: any) => (
                        <Chip
                          key={bp.blueprint_id}
                          label={bp.output_item_name || bp.blueprint_name}
                          size="small"
                          sx={{ cursor: "pointer", height: 24 }}
                          onClick={() => navigate(`/blueprints/${bp.blueprint_id}`)}
                        />
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Grid>
      )}
    </StandardPageLayout>
  )
}

function MiningDataSection({ resourceName }: { resourceName: string }) {
  // Search for ores matching this resource name
  const { data } = useSearchMiningOresQuery({ text: resourceName, page_size: 5 })
  const ores = data?.ores || []
  if (!ores.length) return null

  const ore = ores[0]
  return (
    <Grid item xs={12} md={6}>
      <Card>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            <HardwareRounded sx={{ fontSize: 16, mr: 0.5, verticalAlign: "text-bottom" }} />
            Mining Stats
          </Typography>
          <Stack spacing={0.5}>
            {ore.instability != null && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">Instability</Typography>
                <Typography variant="caption" fontWeight={600}>{ore.instability}</Typography>
              </Stack>
            )}
            {ore.resistance != null && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">Resistance</Typography>
                <Typography variant="caption" fontWeight={600}>{ore.resistance}</Typography>
              </Stack>
            )}
            {ore.explosion_multiplier != null && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">Explosion Risk</Typography>
                <Typography variant="caption" fontWeight={600}>{ore.explosion_multiplier}</Typography>
              </Stack>
            )}
            {ore.top_locations && ore.top_locations.length > 0 && (
              <>
                <Divider sx={{ my: 0.5 }} />
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Best Locations</Typography>
                {ore.top_locations.map((loc: any) => (
                  <Stack key={loc.location_name} direction="row" justifyContent="space-between">
                    <Typography variant="caption">{loc.location_name}</Typography>
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
