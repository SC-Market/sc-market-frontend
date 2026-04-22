import React, { useMemo, useCallback, useState } from "react"
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Grid,
  MenuItem,
  Pagination,
  Stack,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { useSearchGameItemAggregatesQuery } from "../../../store/api/v2/market"
import { FALLBACK_IMAGE_URL } from "../../../util/constants"
import { QualityBadge } from "../../../components/market/v2/QualityBadge"

export function BulkItemsPageV2() {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const queryArgs = useMemo(() => ({
    text: searchParams.get("text") || undefined,
    itemType: searchParams.get("item_type") || undefined,
    priceMin: searchParams.get("price_min") ? Number(searchParams.get("price_min")) : undefined,
    priceMax: searchParams.get("price_max") ? Number(searchParams.get("price_max")) : undefined,
    sortBy: (searchParams.get("sort_by") as any) || "quantity",
    sortOrder: (searchParams.get("sort_order") as any) || "desc",
    page: Number(searchParams.get("page")) || 1,
    pageSize: 24,
  }), [searchParams])

  const { data, isLoading } = useSearchGameItemAggregatesQuery(queryArgs)

  const updateParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    params.set("page", "1")
    setSearchParams(params)
  }, [searchParams, setSearchParams])

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / (data?.page_size ?? 24))

  return (
    <Box sx={{ px: { xs: 1, sm: 3 }, py: 2 }}>
      {/* Filters */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
        <TextField
          size="small"
          label={t("bulk.search", "Search items")}
          value={searchParams.get("text") || ""}
          onChange={(e) => updateParam("text", e.target.value)}
          sx={{ minWidth: 200 }}
        />
        <TextField
          select
          size="small"
          label={t("bulk.sortBy", "Sort by")}
          value={queryArgs.sortBy}
          onChange={(e) => updateParam("sort_by", e.target.value)}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="quantity">Quantity</MenuItem>
          <MenuItem value="price">Price</MenuItem>
          <MenuItem value="name">Name</MenuItem>
          <MenuItem value="seller_count">Sellers</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          label={t("bulk.order", "Order")}
          value={queryArgs.sortOrder}
          onChange={(e) => updateParam("sort_order", e.target.value)}
          sx={{ minWidth: 100 }}
        >
          <MenuItem value="asc">Asc</MenuItem>
          <MenuItem value="desc">Desc</MenuItem>
        </TextField>
      </Stack>

      {isLoading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : items.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={8}>
          {t("bulk.noItems", "No bulk items found")}
        </Typography>
      ) : (
        <>
          <Grid container spacing={2}>
            {items.map((item) => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={item.game_item_id}>
                <Card
                  sx={{
                    height: "100%",
                    cursor: "pointer",
                    transition: "transform 0.15s",
                    "&:hover": { transform: "translateY(-2px)" },
                  }}
                >
                  <CardActionArea
                    onClick={() => navigate(`/market/aggregate/${item.game_item_id}`)}
                    sx={{ height: "100%" }}
                  >
                    <CardMedia
                      component="img"
                      image={item.image_url || FALLBACK_IMAGE_URL}
                      alt={item.name}
                      sx={{ height: 120, objectFit: "contain", bgcolor: "background.default", p: 1 }}
                    />
                    <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                      <Typography variant="body2" fontWeight="bold" noWrap>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {item.type}
                      </Typography>
                      <Typography variant="subtitle2" color="primary" fontWeight="bold" sx={{ mt: 0.5 }}>
                        {item.min_price === item.max_price
                          ? `${item.min_price.toLocaleString()} aUEC`
                          : `${item.min_price.toLocaleString()} – ${item.max_price.toLocaleString()} aUEC`}
                      </Typography>
                      <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap" useFlexGap>
                        <Chip label={`${item.total_quantity.toLocaleString()} avail.`} size="small" variant="outlined" />
                        <Chip label={`${item.seller_count} seller${item.seller_count !== 1 ? "s" : ""}`} size="small" variant="outlined" />
                      </Stack>
                      {(item.quality_tier_min || item.quality_tier_max) && (
                        <Box sx={{ mt: 0.5 }}>
                          <QualityBadge tier={item.quality_tier_min || item.quality_tier_max || 1} size="small" />
                          {item.quality_tier_min !== item.quality_tier_max && item.quality_tier_max && (
                            <>
                              <Typography variant="caption" sx={{ mx: 0.25 }}>–</Typography>
                              <QualityBadge tier={item.quality_tier_max} size="small" />
                            </>
                          )}
                        </Box>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" sx={{ mt: 3 }}>
              <Pagination
                count={totalPages}
                page={queryArgs.page}
                onChange={(_, p) => updateParam("page", String(p))}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  )
}
