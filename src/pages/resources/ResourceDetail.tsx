/**
 * ResourceDetail - Full resource information with blueprint usage and market data
 * Requirements: 44.5, 44.6, 44.8, 44.9, 44.10
 */

import React from "react"
import {
  Grid,
  Paper,
  Typography,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Box,
  Button,
} from "@mui/material"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { useGetResourceQuery } from "../../store/api/v2/market"

export function ResourceDetail() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { resource_id } = useParams<{ resource_id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, error } = useGetResourceQuery({ resourceId: resource_id! })

  if (isLoading) {
    return (
      <StandardPageLayout title={t("resources.detail", "Resource Details")} sidebarOpen={true}>
        <Grid item xs={12}>
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        </Grid>
      </StandardPageLayout>
    )
  }

  if (error || !data) {
    return (
      <StandardPageLayout title={t("resources.detail", "Resource Details")} sidebarOpen={true}>
        <Grid item xs={12}>
          <Alert severity="error">{t("resources.notFound", "Resource not found.")}</Alert>
        </Grid>
      </StandardPageLayout>
    )
  }

  const { resource, blueprints_requiring, market_price } = data
  const acquisitionMethods = [
    resource.can_be_mined && t("resources.mined", "Mined"),
    resource.can_be_purchased && t("resources.purchased", "Purchased"),
    resource.can_be_salvaged && t("resources.salvaged", "Salvaged"),
    resource.can_be_looted && t("resources.looted", "Looted"),
  ].filter(Boolean) as string[]

  return (
    <StandardPageLayout
      title={resource.resource_name}
      headerTitle={resource.resource_name}
      sidebarOpen={true}
      maxWidth="lg"
    >
      {/* Resource Info */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {t("resources.details", "Details")}
          </Typography>
          <Stack spacing={1}>
            <Typography variant="body2">
              <strong>{t("resources.category", "Category")}:</strong>{" "}
              {resource.resource_category}
              {resource.resource_subcategory && ` / ${resource.resource_subcategory}`}
            </Typography>
            {resource.base_value != null && (
              <Typography variant="body2">
                <strong>{t("resources.baseValue", "Base Value")}:</strong>{" "}
                {resource.base_value.toLocaleString()} aUEC
              </Typography>
            )}
            {resource.max_stack_size != null && (
              <Typography variant="body2">
                <strong>{t("resources.maxStack", "Max Stack")}:</strong>{" "}
                {resource.max_stack_size.toLocaleString()}
              </Typography>
            )}
            <Box>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>{t("resources.acquisition", "Acquisition")}:</strong>
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                {acquisitionMethods.map((m) => (
                  <Chip key={m} label={m} size="small" />
                ))}
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Grid>

      {/* Market Price */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {t("resources.marketPrice", "Market Price")}
          </Typography>
          {market_price ? (
            <Stack spacing={1}>
              {market_price.min_price != null && (
                <Typography variant="body2">
                  <strong>{t("resources.minPrice", "Min")}:</strong>{" "}
                  {market_price.min_price.toLocaleString()} aUEC
                </Typography>
              )}
              {market_price.max_price != null && (
                <Typography variant="body2">
                  <strong>{t("resources.maxPrice", "Max")}:</strong>{" "}
                  {market_price.max_price.toLocaleString()} aUEC
                </Typography>
              )}
              {market_price.average_price != null && (
                <Typography variant="body2">
                  <strong>{t("resources.avgPrice", "Average")}:</strong>{" "}
                  {market_price.average_price.toLocaleString()} aUEC
                </Typography>
              )}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t("resources.noMarketData", "No market data available.")}
            </Typography>
          )}
          <Button
            component={Link}
            to={`/market?query=${encodeURIComponent(resource.resource_name)}`}
            size="small"
            sx={{ mt: 1 }}
          >
            {t("resources.viewOnMarket", "View on Market")}
          </Button>
        </Paper>
      </Grid>

      {/* Quality Bands */}
      {resource.quality_bands && resource.quality_bands.length > 0 && (
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t("resources.qualityTiers", "Quality Tiers")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t("resources.qualityTiersDescription", "Mined quality is bucketed into discrete tiers. Raw quality within a range maps to a fixed value.")}
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t("resources.qualityRange", "Quality Range")}</TableCell>
                    <TableCell align="right">{t("resources.mappedValue", "Effective Quality")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resource.quality_bands.map((band) => (
                    <TableRow key={band.start}>
                      <TableCell>{band.start}–{band.end}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={band.mappedValue}
                          size="small"
                          color={band.mappedValue >= 900 ? "secondary" : band.mappedValue >= 700 ? "primary" : "default"}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      )}

      {/* Blueprints Requiring This Resource */}
      {blueprints_requiring.length > 0 && (
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t("resources.usedIn", "Used in Blueprints")} ({blueprints_requiring.length})
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t("resources.craftedItem", "Crafted Item")}</TableCell>
                    <TableCell align="right">{t("resources.qtyRequired", "Qty Required")}</TableCell>
                    <TableCell align="right">{t("resources.minTier", "Min Tier")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {blueprints_requiring.map((bp) => (
                    <TableRow
                      key={bp.blueprint_id}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => navigate(`/blueprints/${bp.blueprint_name || bp.blueprint_id}`)}
                    >
                      <TableCell>{bp.output_item_name || bp.blueprint_name}</TableCell>
                      <TableCell align="right">{bp.quantity_required}</TableCell>
                      <TableCell align="right">
                        {bp.min_quality_tier ? `Tier ${bp.min_quality_tier}` : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      )}
    </StandardPageLayout>
  )
}
