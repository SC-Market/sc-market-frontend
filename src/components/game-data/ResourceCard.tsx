/**
 * ResourceCard - Display resource information in card format
 * Requirements: 44.1, 44.2, 44.3, 44.8
 */

import React from "react"
import { Card, CardActionArea, CardContent, Chip, Stack, Typography } from "@mui/material"
import { type ResourceSearchResult } from "../../store/api/v2/market"

interface ResourceCardProps {
  resource: ResourceSearchResult
  onClick?: (resourceId: string) => void
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onClick }) => {
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
