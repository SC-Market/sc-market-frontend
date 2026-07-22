/**
 * Wiki Commodity Browser — filter sidebar + card grid
 * Category and acquisition filters in sidebar; searchable by name.
 */

import React, { useMemo, useCallback } from "react"
import {
  Alert, Avatar, Box, Card, CardActionArea, CardContent, Chip, Divider,
  FormControl, Grid, InputLabel, MenuItem, Pagination, Select, Stack, TextField,
  ToggleButton, ToggleButtonGroup, Typography,
} from "@mui/material"
import { Helmet } from "react-helmet"
import HardwareRoundedIcon from "@mui/icons-material/HardwareRounded"
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"
import ConstructionIcon from "@mui/icons-material/Construction"
import InventoryIcon from "@mui/icons-material/Inventory"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import { useTranslation } from "react-i18next"
import {
  useGetCommoditiesQuery, useGetResourceCategoriesQuery,
} from "../../store/api/v2/market"
import { useNavigate, useSearchParams } from "react-router-dom"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { FilterSidebarLayout } from "../../components/layout/FilterSidebarLayout"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTheme } from "@mui/material/styles"
import { TableSkeleton } from "../../components/game-data/GameDataSkeletons"
import { getCommodityColor } from "../../util/gameIcons"
import { FALLBACK_IMAGE_URL, FRONTEND_URL } from "../../util/constants"
import { WIKI_PATHS } from "../../routes/paths"

type AcqFilter = "all" | "mined" | "purchased" | "salvaged" | "looted"

const ACQ_FILTERS: { value: AcqFilter; label: string; icon: React.ReactNode }[] = [
  { value: "all", label: "All", icon: null },
  { value: "mined", label: "Minable", icon: <HardwareRoundedIcon sx={{ fontSize: 14 }} /> },
  { value: "purchased", label: "Purchasable", icon: <ShoppingCartIcon sx={{ fontSize: 14 }} /> },
  { value: "salvaged", label: "Salvageable", icon: <ConstructionIcon sx={{ fontSize: 14 }} /> },
  { value: "looted", label: "Lootable", icon: <InventoryIcon sx={{ fontSize: 14 }} /> },
]

const ACQ_FILTER_KEYS: Record<AcqFilter, string> = {
  all: "wiki.commodityBrowser.acqFilter.all",
  mined: "wiki.commodityBrowser.acqFilter.mined",
  purchased: "wiki.commodityBrowser.acqFilter.purchased",
  salvaged: "wiki.commodityBrowser.acqFilter.salvaged",
  looted: "wiki.commodityBrowser.acqFilter.looted",
}

function AcqChips({ can_be_mined, can_be_purchased, can_be_salvaged, can_be_looted }: {
  can_be_mined: boolean; can_be_purchased: boolean; can_be_salvaged: boolean; can_be_looted: boolean
}) {
  const { t } = useTranslation()
  const chips: { key: string; label: string; icon: React.ReactElement; color: "success" | "primary" | "warning" | "error" }[] = []
  if (can_be_mined) chips.push({ key: "mine", label: t("wiki.commodityBrowser.acqChip.mine", "Mine"), icon: <HardwareRoundedIcon />, color: "success" })
  if (can_be_purchased) chips.push({ key: "buy", label: t("wiki.commodityBrowser.acqChip.buy", "Buy"), icon: <ShoppingCartIcon />, color: "primary" })
  if (can_be_salvaged) chips.push({ key: "salvage", label: t("wiki.commodityBrowser.acqChip.salvage", "Salvage"), icon: <ConstructionIcon />, color: "warning" })
  if (can_be_looted) chips.push({ key: "loot", label: t("wiki.commodityBrowser.acqChip.loot", "Loot"), icon: <InventoryIcon />, color: "error" })
  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
      {chips.map((c) => (
        <Chip
          key={c.key}
          icon={c.icon}
          label={c.label}
          size="small"
          color={c.color}
          sx={{ height: 18, fontSize: "0.6rem", fontWeight: 600, "& .MuiChip-icon": { fontSize: 11 } }}
        />
      ))}
    </Stack>
  )
}

export function WikiCommodityBrowser() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const text = searchParams.get("q") || ""
  const category = searchParams.get("category") || ""
  const acq = (searchParams.get("acq") as AcqFilter) || "all"
  const page = Number(searchParams.get("page")) || 1

  const updateParam = useCallback((key: string, value: string) => {
    const p = new URLSearchParams(searchParams)
    if (value) p.set(key, value); else p.delete(key)
    if (key !== "page") p.delete("page")
    setSearchParams(p, { replace: true })
  }, [searchParams, setSearchParams])

  const { data, isLoading, error } = useGetCommoditiesQuery({ category: category || undefined, page, pageSize: 50 })
  const { data: categoriesData } = useGetResourceCategoriesQuery({})

  const categories = useMemo(() => {
    if (!categoriesData) return []
    return [...new Set(categoriesData.map((c) => c.category))].sort()
  }, [categoriesData])

  // Count per category for sidebar
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {}
    if (categoriesData) {
      categoriesData.forEach((c) => {
        map[c.category] = (map[c.category] || 0) + 1
      })
    }
    return map
  }, [categoriesData])

  const filtered = useMemo(() => {
    let items = data?.commodities || []
    if (text) {
      const q = text.toLowerCase()
      items = items.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.resource_category?.toLowerCase().includes(q) ||
        c.resource_subcategory?.toLowerCase().includes(q),
      )
    }
    if (acq !== "all") {
      items = items.filter((c) => {
        if (acq === "mined") return c.can_be_mined
        if (acq === "purchased") return c.can_be_purchased
        if (acq === "salvaged") return c.can_be_salvaged
        if (acq === "looted") return c.can_be_looted
        return true
      })
    }
    return items
  }, [data, text, acq])

  const totalPages = data ? Math.ceil(data.total / data.page_size) : 0
  const hasFilters = !!(category || acq !== "all")

  const pageTitle = useMemo(() => {
    const cat = category || "All"
    return `${cat} Commodities — Star Citizen | SC Market`
  }, [category])

  const pageDescription = useMemo(() => {
    const count = data?.total ?? ""
    return `Browse ${count} Star Citizen commodities. Mining locations, market prices, and quality tiers.`
  }, [data?.total])

  const filtersContent = (
    <Stack spacing={2}>
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, mb: 0.5, display: "block" }}>
          {t("wiki.commodityBrowser.category", "Category")}
        </Typography>
        <Stack spacing={0.25}>
          {[{ label: t("wiki.commodityBrowser.allCategories", "All Categories"), value: "" }, ...categories.map((c) => ({ label: c, value: c }))].map((opt) => (
            <Box
              key={opt.value}
              onClick={() => updateParam("category", opt.value)}
              sx={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                px: 1.5, py: 0.6, borderRadius: 1, cursor: "pointer", transition: "background 0.12s",
                bgcolor: category === opt.value ? "action.selected" : "transparent",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <Typography variant="body2" fontWeight={category === opt.value ? 700 : 400}>{opt.label}</Typography>
              {opt.value && categoryCounts[opt.value] && (
                <Typography variant="caption" color="text.secondary">{categoryCounts[opt.value]}</Typography>
              )}
            </Box>
          ))}
        </Stack>
      </Box>

      <Divider />

      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, mb: 0.5, display: "block" }}>
          {t("wiki.commodityBrowser.acquisition", "Acquisition")}
        </Typography>
        <ToggleButtonGroup
          orientation="vertical"
          value={acq}
          exclusive
          onChange={(_, v) => { if (v !== null) updateParam("acq", v === "all" ? "" : v) }}
          fullWidth
          size="small"
        >
          {ACQ_FILTERS.map(({ value, label, icon }) => (
            <ToggleButton key={value} value={value} sx={{ justifyContent: "flex-start", gap: 1, textTransform: "none", fontSize: "0.8rem" }}>
              {icon}
              {t(ACQ_FILTER_KEYS[value], label)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {hasFilters && (
        <Chip
          label={t("wiki.commodityBrowser.clearFilters", "Clear filters")}
          size="small"
          variant="outlined"
          onClick={() => setSearchParams({ q: text || "" }, { replace: true })}
          onDelete={() => setSearchParams({ q: text || "" }, { replace: true })}
          sx={{ alignSelf: "flex-start" }}
        />
      )}
    </Stack>
  )

  return (
    <StandardPageLayout title={pageTitle} description={pageDescription} headerTitle={t("wiki.commodityBrowser.headerTitle", "Commodities")} sidebarOpen={true} maxWidth="xl">
      <Helmet>
        {page > 1 && (
          <link rel="prev" href={`${FRONTEND_URL}/wiki/commodities?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(page - 1) })}`} />
        )}
        {page < totalPages && (
          <link rel="next" href={`${FRONTEND_URL}/wiki/commodities?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(page + 1) })}`} />
        )}
      </Helmet>
      <Grid item xs={12}>
        <FilterSidebarLayout filters={filtersContent} filterTitle={t("wiki.commodityBrowser.filters", "Filters")} sidebarWidth={210}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2 }}>
            <TextField
              size="small"
              placeholder={t("wiki.commodityBrowser.searchPlaceholder", "Search commodities...")}
              value={text}
              onChange={(e) => updateParam("q", e.target.value)}
              sx={{ flex: 1, maxWidth: 360 }}
            />
            {data && (
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </Typography>
            )}
          </Box>

          {isLoading && <TableSkeleton rows={12} />}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{t("wiki.commodityBrowser.loadError", "Failed to load commodities.")}</Alert>}

          {data && (
            <>
              <Grid container spacing={1.5}>
                {filtered.map((c) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={c.resource_id}>
                    <Card
                      sx={{ cursor: "pointer", height: "100%", transition: "transform 0.15s", "&:hover": { transform: "translateY(-2px)" } }}
                      onClick={() => navigate(WIKI_PATHS.commodity(c.resource_id))}
                    >
                      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                        <Stack direction="row" spacing={1.5} alignItems="flex-start">
                          <Avatar
                            src={c.image_url || FALLBACK_IMAGE_URL}
                            variant="rounded"
                            sx={{
                              width: 40, height: 40, flexShrink: 0,
                              bgcolor: getCommodityColor(c.resource_subcategory) || "grey.800",
                            }}
                            imgProps={{ style: { objectFit: "contain" } }}
                          />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={700} noWrap>{c.name}</Typography>
                            <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap" useFlexGap>
                              <Chip label={c.resource_category} size="small" variant="outlined" sx={{ height: 18, fontSize: "0.65rem" }} />
                              {c.resource_subcategory && (
                                <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "center" }}>
                                  {c.resource_subcategory}
                                </Typography>
                              )}
                            </Stack>
                            <Box sx={{ mt: 0.75 }}>
                              <AcqChips
                                can_be_mined={c.can_be_mined}
                                can_be_purchased={c.can_be_purchased}
                                can_be_salvaged={c.can_be_salvaged}
                                can_be_looted={c.can_be_looted}
                              />
                            </Box>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {filtered.length === 0 && (
                <Box sx={{ textAlign: "center", py: 6 }}>
                  <Typography color="text.secondary">{t("wiki.commodityBrowser.noResults", "No commodities found.")}</Typography>
                </Box>
              )}

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
