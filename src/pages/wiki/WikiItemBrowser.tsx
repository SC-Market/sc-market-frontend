/**
 * Wiki Item Browser — matches market V2 search card layout with unified search
 */

import React, { useState, useMemo } from "react"
import {
  Card, CardContent, CardMedia, Grid, Typography, Pagination, Alert, Chip, Stack, Box,
  ToggleButtonGroup, ToggleButton, Table, TableBody, TableCell, TableHead, TableRow, Paper, Avatar,
} from "@mui/material"
import { GridViewRounded, ViewListRounded } from "@mui/icons-material"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import { useSearchItemsQuery, type WikiItemSearchResult } from "../../store/api/v2/market"
import { useNavigate, useSearchParams } from "react-router-dom"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { FALLBACK_IMAGE_URL } from "../../util/constants"
import { CardGridSkeleton } from "../../components/game-data/GameDataSkeletons"
import { getFactionIcon } from "../../util/gameIcons"
import { UnifiedSearchBar, wikiItemsTokensToParams, wikiItemsParamsToTokens, type SearchToken } from "../../components/game-data/UnifiedSearchBar"

const CARD_HEIGHT = 300
const gridBreakpoints = { xs: 6, sm: 4, md: 4, lg: 3, xl: 2.4 }

function ItemGridCard({ item, onClick }: { item: WikiItemSearchResult; onClick: () => void }) {
  return (
    <Card sx={{ cursor: "pointer", height: CARD_HEIGHT, display: "flex", flexDirection: "column", transition: "transform 0.15s", "&:hover": { transform: "translateY(-2px)", boxShadow: 4 } }}
      onClick={onClick}>
      <CardMedia component="img" height="180" image={item.image_url || item.thumbnail_path || getFactionIcon(item.manufacturer) || FALLBACK_IMAGE_URL}
        alt={item.name} sx={{ objectFit: "contain", bgcolor: "background.default", p: 1 }}
        onError={({ currentTarget }) => { currentTarget.onerror = null; currentTarget.src = FALLBACK_IMAGE_URL }} />
      <CardContent sx={{ p: 1.5, pt: 1, flex: 1, overflow: "hidden", "&:last-child": { pb: 1.5 } }}>
        <Typography variant="subtitle2" noWrap fontWeight={600} title={item.name}>{item.name}</Typography>
        <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap" useFlexGap>
          {item.type && <Chip label={item.display_type || item.type} size="small" color="primary" sx={{ height: 18, fontSize: "0.65rem" }} />}
          {item.size != null && <Chip label={`S${item.size}`} size="small" sx={{ height: 18, fontSize: "0.65rem" }} />}
          {item.grade && <Chip label={item.grade} size="small" sx={{ height: 18, fontSize: "0.65rem" }} />}
        </Stack>
        {item.manufacturer && (
          <Typography variant="caption" color="text.secondary" noWrap sx={{ mt: 0.5, display: "block" }}>{item.manufacturer}</Typography>
        )}
      </CardContent>
    </Card>
  )
}

function ItemListRow({ item, onClick }: { item: WikiItemSearchResult; onClick: () => void }) {
  return (
    <TableRow hover sx={{ cursor: "pointer" }} onClick={onClick}>
      <TableCell sx={{ py: 0.5, width: 40 }}>
        <Avatar src={item.image_url || item.thumbnail_path || getFactionIcon(item.manufacturer) || FALLBACK_IMAGE_URL}
          variant="rounded" sx={{ width: 32, height: 32, bgcolor: "background.default" }}
          imgProps={{ style: { objectFit: "contain" } }} />
      </TableCell>
      <TableCell sx={{ py: 0.5 }}><Typography variant="body2" fontWeight={600}>{item.name}</Typography></TableCell>
      <TableCell sx={{ py: 0.5 }}><Chip label={item.display_type || item.type || "—"} size="small" color="primary" sx={{ height: 18, fontSize: "0.65rem" }} /></TableCell>
      <TableCell sx={{ py: 0.5 }}>{item.size != null ? `S${item.size}` : "—"}</TableCell>
      <TableCell sx={{ py: 0.5 }}>{item.grade || "—"}</TableCell>
      <TableCell sx={{ py: 0.5 }}><Typography variant="caption" color="text.secondary">{item.manufacturer || "—"}</Typography></TableCell>
    </TableRow>
  )
}

export function WikiItemBrowser() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const page = Number(searchParams.get("page")) || 1
  const [viewMode, setViewMode] = useState<"grid" | "list">(
    () => (localStorage.getItem("wiki-items-view") as "grid" | "list") || "grid"
  )

  const searchTokens = useMemo(() => wikiItemsParamsToTokens(searchParams), [searchParams])
  const queryParams = useMemo(() => wikiItemsTokensToParams(searchTokens), [searchTokens])

  const handleTokensChange = (tokens: SearchToken[]) => {
    const params = new URLSearchParams(wikiItemsTokensToParams(tokens))
    setSearchParams(params, { replace: true })
  }

  const { data, isLoading, error } = useSearchItemsQuery({
    text: queryParams.q || undefined,
    type: queryParams.type || undefined,
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

  return (
    <StandardPageLayout
      title={t("wiki.items.title", "Game Items Database")}
      headerTitle={t("wiki.items.title", "Game Items Database")}
      sidebarOpen={true} maxWidth="xl"
    >
      <Grid item xs={12}>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2 }}>
          <UnifiedSearchBar tokens={searchTokens} onChange={handleTokensChange} mode="wiki-items"
            placeholder="Search items, types, manufacturers..." />
          {data && (
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
              {data.total.toLocaleString()}
            </Typography>
          )}
          <ToggleButtonGroup size="small" value={viewMode} exclusive
            onChange={(_, v) => { if (v) { setViewMode(v); localStorage.setItem("wiki-items-view", v) } }}>
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
      </Grid>
    </StandardPageLayout>
  )
}
