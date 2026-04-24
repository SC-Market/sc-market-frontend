/**
 * Wiki Commodity Browser — with text search, clickable cards, URL param sync, dynamic categories
 */

import React, { useMemo, useCallback } from "react"
import {
  Box, Card, CardContent, Grid, Typography, TextField,
  MenuItem, Select, FormControl, InputLabel, Pagination, Alert, Chip, Stack,
} from "@mui/material"
import { CheckCircle } from "@mui/icons-material"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import { useGetCommoditiesQuery, useGetResourceCategoriesQuery } from "../../store/api/v2/market"
import { useNavigate, useSearchParams } from "react-router-dom"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { FilterSidebarLayout } from "../../components/layout/FilterSidebarLayout"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { CardGridSkeleton } from "../../components/game-data/GameDataSkeletons"
import { GameItemAvatar } from "../../components/game-data/GameItemAvatar"
import { getCommodityColor } from "../../util/gameIcons"

export function WikiCommodityBrowser() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const text = searchParams.get("q") || ""
  const category = searchParams.get("category") || ""
  const page = Number(searchParams.get("page")) || 1

  const updateParam = useCallback((key: string, value: string) => {
    const p = new URLSearchParams(searchParams)
    if (value) p.set(key, value); else p.delete(key)
    if (key !== "page") p.delete("page")
    setSearchParams(p, { replace: true })
  }, [searchParams, setSearchParams])

  const { data, isLoading, error } = useGetCommoditiesQuery({
    category: category || undefined,
    page,
    pageSize: 24,
  })

  // Dynamic categories from API
  const { data: categoriesData } = useGetResourceCategoriesQuery({})
  const categories = useMemo(() => {
    if (!categoriesData) return []
    return [...new Set(categoriesData.map(c => c.category))].sort()
  }, [categoriesData])

  // Client-side text filter
  const filtered = useMemo(() => {
    const items = data?.commodities || []
    if (!text) return items
    const q = text.toLowerCase()
    return items.filter(c => c.name.toLowerCase().includes(q) || c.resource_category?.toLowerCase().includes(q))
  }, [data, text])

  const totalPages = data ? Math.ceil(data.total / data.page_size) : 0

  const filtersContent = (
    <Stack spacing={1.5}>
      <TextField fullWidth size="small" label="Search commodities" value={text}
        onChange={(e) => updateParam("q", e.target.value)} placeholder="Name or category..." />
      <FormControl fullWidth size="small">
        <InputLabel>Category</InputLabel>
        <Select value={category} label="Category" onChange={(e) => updateParam("category", e.target.value)}>
          <MenuItem value="">All</MenuItem>
          {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </Select>
      </FormControl>
    </Stack>
  )

  return (
    <StandardPageLayout title="Commodities" headerTitle="Commodities" sidebarOpen={true} maxWidth="xl">
      <Grid item xs={12}>
        <FilterSidebarLayout filters={filtersContent} filterTitle="Filters">
          {isLoading && <CardGridSkeleton />}
          {error && <Alert severity="error" sx={{ mb: 2 }}>Failed to load commodities.</Alert>}
          {data && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{filtered.length} commodities</Typography>
              <Grid container spacing={1.5}>
                {filtered.map((commodity) => (
                  <Grid item xs={6} sm={4} md={3} lg={2} key={commodity.resource_id}>
                    <Card sx={{ cursor: "pointer", transition: "transform 0.15s", "&:hover": { transform: "translateY(-3px)" }, height: "100%" }}
                      onClick={() => navigate(`/wiki/commodities/${commodity.resource_id}`)}>
                      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <GameItemAvatar name={commodity.name} iconUrl={commodity.image_url} subType={commodity.resource_subcategory} size={32}
                            sx={{ bgcolor: getCommodityColor(commodity.resource_subcategory) || "primary.main" }} />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={700} noWrap>{commodity.name}</Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>{commodity.resource_category}{commodity.resource_subcategory ? ` · ${commodity.resource_subcategory}` : ""}</Typography>
                          </Box>
                        </Stack>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {commodity.can_be_mined && <Chip icon={<CheckCircle sx={{ fontSize: 12 }} />} label="Mine" size="small" color="success" sx={{ height: 18, fontSize: "0.6rem" }} />}
                          {commodity.can_be_purchased && <Chip icon={<CheckCircle sx={{ fontSize: 12 }} />} label="Buy" size="small" color="info" sx={{ height: 18, fontSize: "0.6rem" }} />}
                          {commodity.can_be_salvaged && <Chip icon={<CheckCircle sx={{ fontSize: 12 }} />} label="Salvage" size="small" sx={{ height: 18, fontSize: "0.6rem" }} />}
                          {commodity.can_be_looted && <Chip icon={<CheckCircle sx={{ fontSize: 12 }} />} label="Loot" size="small" sx={{ height: 18, fontSize: "0.6rem" }} />}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              {filtered.length === 0 && <Box sx={{ textAlign: "center", py: 6 }}><Typography color="text.secondary">No commodities found.</Typography></Box>}
              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  <Pagination count={totalPages} page={page} onChange={(_, p) => updateParam("page", String(p))} color="primary" />
                </Box>
              )}
            </>
          )}
        </FilterSidebarLayout>
      </Grid>
    </StandardPageLayout>
  )
}
