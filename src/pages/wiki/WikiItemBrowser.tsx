/**
 * Wiki Item Browser — unified search + filter sidebar
 * Sidebar: type, size, grade, manufacturer as clickable filter pills.
 * Main: UnifiedSearchBar (token-based) + card grid or table.
 */

import React, { useState, useMemo, useCallback } from "react"
import {
  Box, Card, CardContent, CardMedia, Grid, Typography, Pagination, Alert, Chip, Stack,
  ToggleButtonGroup, ToggleButton, Table, TableBody, TableCell, TableHead, TableRow,
  Paper, Avatar, Divider,
} from "@mui/material"
import { Helmet } from "react-helmet"
import { GridViewRounded, ViewListRounded } from "@mui/icons-material"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import { useSearchItemsQuery, type WikiItemSearchResult } from "../../store/api/v2/market"
import { useNavigate, useSearchParams } from "react-router-dom"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { FilterSidebarLayout } from "../../components/layout/FilterSidebarLayout"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { FALLBACK_IMAGE_URL, FRONTEND_URL } from "../../util/constants"
import { CardGridSkeleton } from "../../components/game-data/GameDataSkeletons"
import { getFactionIcon } from "../../util/gameIcons"
import {
  UnifiedSearchBar, wikiItemsTokensToParams, wikiItemsParamsToTokens, type SearchToken,
} from "../../components/game-data/UnifiedSearchBar"

const CARD_HEIGHT = 280
const gridBreakpoints = { xs: 6, sm: 4, md: 4, lg: 3, xl: 2.4 }

// Common item types for the sidebar filter
const ITEM_TYPES = [
  "Weapon", "Armor", "Ship Weapon", "Shield", "Quantum Drive",
  "Power Plant", "Cooler", "Missile", "Mining Head", "Tool",
]
const SIZES = ["1", "2", "3", "4", "5", "6", "7", "8"]
const GRADES = ["A", "B", "C", "D"]

function FilterSection({
  label, options, selected, onChange,
}: {
  label: string
  options: { value: string; label?: string; count?: number }[]
  selected: string
  onChange: (v: string) => void
}) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, mb: 0.5, display: "block" }}
      >
        {label}
      </Typography>
      <Stack spacing={0.25}>
        {[{ value: "", label: "All" }, ...options].map((opt) => (
          <Box
            key={opt.value}
            onClick={() => onChange(opt.value)}
            sx={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              px: 1.5, py: 0.5, borderRadius: 1, cursor: "pointer", transition: "background 0.12s",
              bgcolor: selected === opt.value ? "action.selected" : "transparent",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <Typography variant="body2" fontWeight={selected === opt.value ? 700 : 400}>
              {opt.label ?? opt.value}
            </Typography>
            {opt.count != null && (
              <Typography variant="caption" color="text.secondary">{opt.count}</Typography>
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  )
}

function ItemGridCard({ item, onClick }: { item: WikiItemSearchResult; onClick: () => void }) {
  return (
    <Card
      sx={{
        cursor: "pointer",
        height: CARD_HEIGHT,
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.15s",
        "&:hover": { transform: "translateY(-2px)" },
      }}
      onClick={onClick}
    >
      <CardMedia
        component="img"
        height="160"
        image={item.image_url || item.thumbnail_path || getFactionIcon(item.manufacturer) || FALLBACK_IMAGE_URL}
        alt={item.name}
        sx={{ objectFit: "contain", bgcolor: "background.default", p: 1 }}
        onError={({ currentTarget }) => { currentTarget.onerror = null; currentTarget.src = FALLBACK_IMAGE_URL }}
      />
      <CardContent sx={{ p: 1.5, pt: 1, flex: 1, overflow: "hidden", "&:last-child": { pb: 1.5 } }}>
        <Typography variant="subtitle2" noWrap fontWeight={600} title={item.name}>{item.name}</Typography>
        <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap" useFlexGap>
          {item.type && (
            <Chip label={item.display_type || item.type} size="small" color="primary" sx={{ height: 18, fontSize: "0.65rem" }} />
          )}
          {item.size != null && (
            <Chip label={`S${item.size}`} size="small" sx={{ height: 18, fontSize: "0.65rem" }} />
          )}
          {item.grade && (
            <Chip label={item.grade} size="small" variant="outlined" sx={{ height: 18, fontSize: "0.65rem" }} />
          )}
        </Stack>
        {item.manufacturer && (
          <Typography variant="caption" color="text.secondary" noWrap sx={{ mt: 0.5, display: "block" }}>
            {item.manufacturer}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

function ItemListRow({ item, onClick }: { item: WikiItemSearchResult; onClick: () => void }) {
  return (
    <TableRow hover sx={{ cursor: "pointer" }} onClick={onClick}>
      <TableCell sx={{ py: 0.5, width: 40 }}>
        <Avatar
          src={item.image_url || item.thumbnail_path || getFactionIcon(item.manufacturer) || FALLBACK_IMAGE_URL}
          variant="rounded"
          sx={{ width: 32, height: 32, bgcolor: "background.default" }}
          imgProps={{ style: { objectFit: "contain" } }}
        />
      </TableCell>
      <TableCell sx={{ py: 0.5 }}>
        <Typography variant="body2" fontWeight={600}>{item.name}</Typography>
      </TableCell>
      <TableCell sx={{ py: 0.5 }}>
        <Chip label={item.display_type || item.type || "—"} size="small" color="primary" sx={{ height: 18, fontSize: "0.65rem" }} />
      </TableCell>
      <TableCell sx={{ py: 0.5 }}>{item.size != null ? `S${item.size}` : "—"}</TableCell>
      <TableCell sx={{ py: 0.5 }}>{item.grade || "—"}</TableCell>
      <TableCell sx={{ py: 0.5 }}>
        <Typography variant="caption" color="text.secondary">{item.manufacturer || "—"}</Typography>
      </TableCell>
    </TableRow>
  )
}

export function WikiItemBrowser() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const page = Number(searchParams.get("page")) || 1
  const typeFilter = searchParams.get("type") || ""
  const sizeFilter = searchParams.get("size") || ""
  const gradeFilter = searchParams.get("grade") || ""

  const [viewMode, setViewMode] = useState<"grid" | "list">(
    () => (localStorage.getItem("wiki-items-view") as "grid" | "list") || "grid",
  )

  const searchTokens = useMemo(() => wikiItemsParamsToTokens(searchParams), [searchParams])
  const queryParams = useMemo(() => wikiItemsTokensToParams(searchTokens), [searchTokens])

  const updateParam = useCallback((key: string, value: string) => {
    const p = new URLSearchParams(searchParams)
    if (value) p.set(key, value); else p.delete(key)
    p.delete("page")
    setSearchParams(p, { replace: true })
  }, [searchParams, setSearchParams])

  const handleTokensChange = (tokens: SearchToken[]) => {
    const params = new URLSearchParams(wikiItemsTokensToParams(tokens))
    if (typeFilter) params.set("type", typeFilter)
    if (sizeFilter) params.set("size", sizeFilter)
    if (gradeFilter) params.set("grade", gradeFilter)
    setSearchParams(params, { replace: true })
  }

  const { data, isLoading, error } = useSearchItemsQuery({
    text: queryParams.q || undefined,
    type: queryParams.type || typeFilter || undefined,
    manufacturer: queryParams.manufacturer || undefined,
    page,
    pageSize: viewMode === "list" ? 30 : 24,
  })

  const handleItemClick = (itemId: string) => navigate(`/wiki/items/${itemId}`)
  const handlePageChange = (_: unknown, value: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", String(value))
    setSearchParams(params, { replace: true })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const totalPages = data ? Math.ceil(data.total / data.page_size) : 0
  const hasFilters = !!(typeFilter || sizeFilter || gradeFilter)

  const pageTitle = useMemo(() => {
    const type = typeFilter || "All"
    return `${type} Items — Star Citizen Game Database | SC Market`
  }, [typeFilter])

  const pageDescription = useMemo(() => {
    const count = data?.total ?? ""
    const type = typeFilter || "Star Citizen"
    return `Browse ${count} ${type} items. Stats, prices, crafting uses, and locations.`
  }, [typeFilter, data?.total])

  const filtersContent = (
    <Stack spacing={2}>
      <FilterSection
        label="Type"
        options={ITEM_TYPES.map((t) => ({ value: t, label: t }))}
        selected={typeFilter}
        onChange={(v) => updateParam("type", v)}
      />

      <Divider />

      <FilterSection
        label="Size"
        options={SIZES.map((s) => ({ value: s, label: `Size ${s}` }))}
        selected={sizeFilter}
        onChange={(v) => updateParam("size", v)}
      />

      <Divider />

      <FilterSection
        label="Grade"
        options={GRADES.map((g) => ({ value: g, label: `${g} Grade` }))}
        selected={gradeFilter}
        onChange={(v) => updateParam("grade", v)}
      />

      {hasFilters && (
        <Chip
          label="Clear filters"
          size="small"
          variant="outlined"
          onClick={() => {
            const p = new URLSearchParams(searchParams)
            p.delete("type"); p.delete("size"); p.delete("grade"); p.delete("page")
            setSearchParams(p, { replace: true })
          }}
          onDelete={() => {
            const p = new URLSearchParams(searchParams)
            p.delete("type"); p.delete("size"); p.delete("grade"); p.delete("page")
            setSearchParams(p, { replace: true })
          }}
          sx={{ alignSelf: "flex-start" }}
        />
      )}
    </Stack>
  )

  return (
    <StandardPageLayout
      title={pageTitle}
      description={pageDescription}
      headerTitle={t("wiki.items.title", "Game Items Database")}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <Helmet>
        {page > 1 && (
          <link rel="prev" href={`${FRONTEND_URL}/wiki/items?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(page - 1) })}`} />
        )}
        {page < totalPages && (
          <link rel="next" href={`${FRONTEND_URL}/wiki/items?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(page + 1) })}`} />
        )}
      </Helmet>
      <Grid item xs={12}>
        <FilterSidebarLayout filters={filtersContent} filterTitle="Filters" sidebarWidth={190}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2 }}>
            <UnifiedSearchBar
              tokens={searchTokens}
              onChange={handleTokensChange}
              mode="wiki-items"
              placeholder="Search items, types, manufacturers..."
            />
            {data && (
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                {data.total.toLocaleString()}
              </Typography>
            )}
            <ToggleButtonGroup
              size="small"
              value={viewMode}
              exclusive
              onChange={(_, v) => { if (v) { setViewMode(v); localStorage.setItem("wiki-items-view", v) } }}
            >
              <ToggleButton value="grid"><GridViewRounded fontSize="small" /></ToggleButton>
              <ToggleButton value="list"><ViewListRounded fontSize="small" /></ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {isLoading && <CardGridSkeleton />}
          {error && <Alert severity="error" sx={{ mb: 2 }}>Failed to load items.</Alert>}

          {data && (
            <>
              {viewMode === "grid" ? (
                <Grid container spacing={1}>
                  {data.items.map((item) => (
                    <Grid item {...gridBreakpoints} key={item.id}>
                      <ItemGridCard item={item} onClick={() => handleItemClick(item.id)} />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Paper>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: 40 }} />
                        <TableCell>Name</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Size</TableCell>
                        <TableCell>Grade</TableCell>
                        <TableCell>Manufacturer</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.items.map((item) => (
                        <ItemListRow key={item.id} item={item} onClick={() => handleItemClick(item.id)} />
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              )}

              {data.items.length === 0 && (
                <Box sx={{ textAlign: "center", py: 6 }}>
                  <Typography color="text.secondary">No results found. Try adjusting your search.</Typography>
                </Box>
              )}

              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
                </Box>
              )}
            </>
          )}
        </FilterSidebarLayout>
      </Grid>
    </StandardPageLayout>
  )
}
