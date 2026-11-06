/**
 * ResourceCard - Display resource information in card format
 * Requirements: 44.1, 44.2, 44.3, 44.8
 */

import React from "react"
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { Link as RouterLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { type ResourceSearchResult } from "../../features/game-data/api/gameDataApi"
import type { ExtendedTheme } from "../../hooks/styles/Theme"

import { useFormatters } from "../../util/format"
interface ResourceCardProps {
  resource: ResourceSearchResult
  to?: string
  onClick?: (resourceId: string) => void
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  to,
  onClick,
}) => {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const theme = useTheme<ExtendedTheme>()
  const acquisitionMethods = [
    resource.can_be_mined && t("wikiUi.resourceCard.mined"),
    resource.can_be_purchased && t("wikiUi.resourceCard.purchased"),
    resource.can_be_salvaged && t("wikiUi.resourceCard.salvaged"),
    resource.can_be_looted && t("wikiUi.resourceCard.looted"),
  ].filter(Boolean) as string[]

  return (
    <Card
      sx={{ height: "100%" }}
      data-testid="resource-card"
      data-id={resource.resource_id}
    >
      <CardActionArea
        {...(to
          ? { component: RouterLink, to }
          : { onClick: () => onClick?.(resource.resource_id) })}
        sx={{ height: "100%", textDecoration: "none", color: "inherit" }}
      >
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom noWrap>
            {resource.resource_name}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {resource.resource_category}
            {resource.resource_subcategory &&
              ` • ${resource.resource_subcategory}`}
          </Typography>
          <Stack
            direction="row"
            spacing={0.5}
            flexWrap="wrap"
            gap={0.5}
            sx={{ mb: 1 }}
          >
            {acquisitionMethods.map((method) => (
              <Chip
                key={method}
                label={method}
                size="small"
                variant="outlined"
              />
            ))}
          </Stack>
          {resource.quality_bands && resource.quality_bands.length > 0 && (
            <Box sx={{ mb: 1 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 0.5, display: "block" }}
              >
                {t("wikiUi.resourceCard.qualityTiers", {
                  count: resource.quality_bands.length,
                })}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: "2px",
                  height: 6,
                  borderRadius: 1,
                  overflow: "hidden",
                }}
              >
                {resource.quality_bands.map((band) => (
                  <Box
                    key={band.start}
                    sx={{
                      flex: band.end - band.start + 1,
                      backgroundColor: theme.palette.primary.main,
                      opacity: 0.3 + (band.mappedValue / 1000) * 0.7,
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            {resource.base_value != null && (
              <Typography variant="caption" color="text.secondary">
                {fmt.number(resource.base_value)} aUEC
              </Typography>
            )}
            {resource.blueprint_count > 0 && (
              <Chip
                label={t("wikiUi.resourceCard.blueprints", {
                  count: resource.blueprint_count,
                })}
                size="small"
                color="info"
              />
            )}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
