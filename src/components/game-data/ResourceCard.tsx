/**
 * ResourceCard - Display resource information in card format
 * Requirements: 44.1, 44.2, 44.3, 44.8
 */

import React from "react"
import { Box, Card, CardActionArea, CardContent, Chip, Stack, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { type ResourceSearchResult } from "../../store/api/v2/market"
import type { ExtendedTheme } from "../../hooks/styles/Theme"

interface ResourceCardProps {
  resource: ResourceSearchResult
  onClick?: (resourceId: string) => void
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onClick }) => {
  const theme = useTheme<ExtendedTheme>()
  const acquisitionMethods = [
    resource.can_be_mined && "Mined",
    resource.can_be_purchased && "Purchased",
    resource.can_be_salvaged && "Salvaged",
    resource.can_be_looted && "Looted",
  ].filter(Boolean) as string[]

  return (
    <Card sx={{ height: "100%" }}>
      <CardActionArea onClick={() => onClick?.(resource.resource_id)} sx={{ height: "100%" }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom noWrap>
            {resource.resource_name}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {resource.resource_category}
            {resource.resource_subcategory && ` • ${resource.resource_subcategory}`}
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5} sx={{ mb: 1 }}>
            {acquisitionMethods.map((method) => (
              <Chip key={method} label={method} size="small" variant="outlined" />
            ))}
          </Stack>
          {resource.quality_bands && resource.quality_bands.length > 0 && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
                {resource.quality_bands.length} quality tiers
              </Typography>
              <Box sx={{ display: "flex", gap: "2px", height: 6, borderRadius: 1, overflow: "hidden" }}>
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
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            {resource.base_value != null && (
              <Typography variant="caption" color="text.secondary">
                {resource.base_value.toLocaleString()} aUEC
              </Typography>
            )}
            {resource.blueprint_count > 0 && (
              <Chip
                label={`${resource.blueprint_count} blueprint${resource.blueprint_count > 1 ? "s" : ""}`}
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
