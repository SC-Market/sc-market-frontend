/**
 * A craftable item's materials (CraftableItemsView, expanded): each one's
 * stock against what the blueprint needs, its quality range in stock and a
 * progress bar.
 */
import React from "react"
import {
  Box,
  Chip,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import type { CraftableItem } from "../../../../store/api/v2/market"

export function CraftableMaterialsList(props: {
  materials: CraftableItem["materials"]
}) {
  const { t } = useTranslation()
  return (
    <Stack spacing={1.5}>
      {props.materials.map((material) => (
        <Box key={material.game_item_id}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={0.5}
          >
            <Typography variant="body2">{material.material_name}</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography
                variant="body2"
                color={material.is_sufficient ? "success.main" : "error.main"}
              >
                {material.quantity_available} / {material.quantity_required}
              </Typography>
              {material.quality_tier_min !== undefined &&
                material.quality_tier_max !== undefined && (
                  <Tooltip
                    title={t(
                      "CraftableItemsView.qualityRange",
                      "Quality range in stock",
                    )}
                  >
                    <Chip
                      label={`T${material.quality_tier_min}-${material.quality_tier_max}`}
                      size="small"
                      variant="outlined"
                    />
                  </Tooltip>
                )}
            </Stack>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={Math.min(
              100,
              (material.quantity_available / material.quantity_required) * 100,
            )}
            color={material.is_sufficient ? "success" : "error"}
            sx={{ height: 6, borderRadius: 1 }}
          />
        </Box>
      ))}
    </Stack>
  )
}
