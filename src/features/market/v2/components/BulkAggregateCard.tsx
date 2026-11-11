/**
 * One game item on /bulk: its photo, name, quality range, listing count and
 * price range, linking to the item's aggregate page.
 */
import React from "react"
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Stack,
  Typography,
} from "@mui/material"
import { Link as RouterLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import type { GameItemAggregate } from "../../../../store/api/v2/market"
import { MISSING_IMAGE_URL } from "../../../../util/constants"
import { QualityBadge } from "../../../../components/market/v2/QualityBadge"
import { MARKET_PATHS } from "../../../../routes/paths"
import { useFormatters } from "../../../../util/format"

export function AggregateCard({ item }: { item: GameItemAggregate }) {
  const fmt = useFormatters()
  const { t } = useTranslation()

  return (
    <Card
      sx={{
        height: "100%",
        transition: "transform 0.15s",
        "&:hover": { transform: "translateY(-2px)" },
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={MARKET_PATHS.aggregate(item.game_item_id)}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <CardMedia
          component="img"
          image={item.image_url || MISSING_IMAGE_URL}
          alt={item.name}
          sx={{
            height: 120,
            objectFit: "contain",
            bgcolor: "background.default",
            p: 1,
          }}
        />
        <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 }, flex: 1 }}>
          <Typography variant="body2" fontWeight="bold" noWrap>
            {item.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {item.type}
          </Typography>

          <Typography
            variant="subtitle2"
            color="primary"
            fontWeight="bold"
            sx={{ mt: 0.5 }}
          >
            {item.min_price === item.max_price
              ? `${fmt.number(item.min_price)} aUEC`
              : `${fmt.number(item.min_price)} – ${fmt.number(item.max_price)} aUEC`}
          </Typography>

          <Stack
            direction="row"
            spacing={0.5}
            sx={{ mt: 0.5 }}
            flexWrap="wrap"
            useFlexGap
          >
            <Chip
              label={t("marketUi.bulkItems.availableShort", {
                quantity: fmt.number(item.total_quantity),
              })}
              size="small"
              variant="outlined"
            />
            <Chip
              label={t("marketUi.bulkItems.sellerCount", {
                count: item.shop_count,
              })}
              size="small"
              variant="outlined"
            />
          </Stack>

          {(item.quality_tier_min || item.quality_tier_max) && (
            <Box
              sx={{ mt: 0.5, display: "flex", alignItems: "center", gap: 0.25 }}
            >
              <QualityBadge
                tier={item.quality_tier_min || item.quality_tier_max || 1}
                size="small"
              />
              {item.quality_tier_min !== item.quality_tier_max &&
                item.quality_tier_max && (
                  <>
                    <Typography variant="caption" sx={{ mx: 0.25 }}>
                      –
                    </Typography>
                    <QualityBadge tier={item.quality_tier_max} size="small" />
                  </>
                )}
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
