/**
 * Wiki Ship Browser
 *
 * Fetches all ships in one request (pageSize=500), filters + paginates
 * entirely client-side so career/role/text filters work across the full set.
 * Desktop: detail modal overlay. Mobile: navigates to detail page.
 */

import React, { useMemo, useCallback, useState } from "react"
import {
  Box, Card, CardContent, Grid, Typography, Pagination, Alert, Chip, Stack,
  Tooltip, useMediaQuery,
} from "@mui/material"
import GroupsIcon from "@mui/icons-material/Groups"
import StraightenIcon from "@mui/icons-material/Straighten"
import { useTheme } from "@mui/material/styles"
import { useGetShipsQuery } from "../../store/api/v2/market"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { CardGridSkeleton } from "../../components/game-data/GameDataSkeletons"
import { FALLBACK_IMAGE_URL } from "../../util/constants"
import { ShipSilhouette, getShipColor } from "../../components/wiki/ShipSilhouette"
import { ShipDetailModal } from "../../components/game-data/ShipDetailModal"
import { UnifiedSearchBar, shipsParamsToTokens, shipsTokensToParams, type SearchToken } from "../../components/game-data/UnifiedSearchBar"
import { formatShipRole, formatShipCareer, getShipRoleColor } from "../../util/shipDisplay"

const PAGE_SIZE = 24

export function WikiShipBrowser() {
  const theme = useTheme<ExtendedTheme>()
  const navigate = useNavigate()
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"))
  const [searchParams, setSearchParams] = useSearchParams()
  const urlParams = useParams<{ id?: string }>()

  const page = Number(searchParams.get("page")) || 1

  const searchTokens = useMemo(() => shipsParamsToTokens(searchParams), [searchParams])
  const queryParams = useMemo(() => shipsTokensToParams(searchTokens), [searchTokens])

  const handleTokensChange = (tokens: SearchToken[]) => {
    const params = new URLSearchParams(shipsTokensToParams(tokens))
    setSearchParams(params, { replace: true })
  }

  // Desktop modal state
  const [selectedShipId, setSelectedShipId] = useState<string | null>(null)

  // Auto-open modal if URL has an :id param (desktop only)
  React.useEffect(() => {
    if (urlParams.id && !isMobile) {
      setSelectedShipId(urlParams.id)
    }
  }, [urlParams.id, isMobile])

  // Fetch everything at once — all filtering is client-side
  const { data, isLoading, error } = useGetShipsQuery({ pageSize: 500 })

  const allShips = data?.ships || []

  // All filters client-side over the full set
  const filtered = useMemo(() => {
    let result = allShips
    if (queryParams.manufacturer) result = result.filter(s => s.manufacturer === queryParams.manufacturer)
    if (queryParams.career) result = result.filter(s => s.career?.toLowerCase() === queryParams.career)
    if (queryParams.size) result = result.filter(s => String(s.size) === queryParams.size)
    if (queryParams.q) {
      const q = queryParams.q.toLowerCase()
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.manufacturer?.toLowerCase().includes(q) ||
        s.career?.toLowerCase().includes(q) ||
        formatShipRole(s.role).toLowerCase().includes(q)
      )
    }
    return result
  }, [allShips, queryParams])

  // Client-side pagination
  const totalPages  = Math.ceil(filtered.length / PAGE_SIZE)
  const currentPage = Math.min(page, Math.max(1, totalPages))
  const pageShips   = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const handlePageChange = (_: unknown, p: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", String(p))
    setSearchParams(params, { replace: true })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleShipClick = (shipCode: string | undefined, shipId: string) => {
    const slug = shipCode || shipId
    if (isMobile) {
      navigate(`/wiki/ships/${slug}`)
    } else {
      const params = searchParams.toString()
      const qs = params ? `?${params}` : ""
      navigate(`/wiki/ships/${slug}${qs}`)
      setSelectedShipId(slug)
    }
  }

  return (
    <StandardPageLayout title="Ships Database" headerTitle="Ships Database" sidebarOpen={true} maxWidth="xl">
      <Grid item xs={12}>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2 }}>
          <UnifiedSearchBar tokens={searchTokens} onChange={handleTokensChange} mode="ships"
            placeholder="Search ships, manufacturers, careers..." />
          {data && (
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
              {filtered.length} ship{filtered.length !== 1 ? "s" : ""}
            </Typography>
          )}
        </Box>

        {isLoading && <CardGridSkeleton />}
        {error && <Alert severity="error" sx={{ mb: 2 }}>Failed to load ships.</Alert>}
        {data && (
          <>
            <Grid container spacing={1.5}>
              {pageShips.map((ship) => {
                const color = getShipColor(ship.career, ship.role)
                const chipColor = getShipRoleColor(ship.career, ship.role)
                return (
                  <Grid item xs={6} sm={4} md={3} key={ship.id}>
                    <Card
                      sx={{
                        cursor: "pointer",
                        transition: "transform 0.15s",
                        "&:hover": { transform: "translateY(-3px)" },
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                      }}
                      onClick={() => handleShipClick(ship.ship_code, ship.id)}
                    >
                      <Box
                        sx={{
                          height: 120,
                          bgcolor: "background.default",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                          overflow: "hidden",
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            inset: 0,
                            bgcolor: color,
                            opacity: 0.07,
                          },
                        }}
                      >
                        {ship.ship_code ? (
                          <ShipSilhouette
                            shipCode={ship.ship_code}
                            career={ship.career}
                            role={ship.role}
                            height={100}
                          />
                        ) : (
                          <Box
                            component="img"
                            src={ship.image_url || FALLBACK_IMAGE_URL}
                            alt={ship.name}
                            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        )}
                      </Box>

                      <CardContent sx={{ flex: 1, p: 1.5, "&:last-child": { pb: 1.5 } }}>
                        <Typography variant="body2" fontWeight={700} noWrap>
                          {ship.name}
                        </Typography>
                        <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap" useFlexGap>
                          {ship.career && (
                            <Chip label={formatShipCareer(ship.career)} size="small" color={chipColor} variant="outlined"
                              sx={{ height: 20, fontSize: "0.65rem" }} />
                          )}
                          {ship.role && (
                            <Chip label={formatShipRole(ship.role)} size="small" color={chipColor}
                              sx={{ height: 20, fontSize: "0.65rem" }} />
                          )}
                          {ship.focus && !ship.role && (
                            <Chip label={ship.focus} size="small" color="primary"
                              sx={{ height: 20, fontSize: "0.65rem" }} />
                          )}
                          {ship.size && (
                            <Chip label={`Size ${ship.size}`} size="small"
                              sx={{ height: 20, fontSize: "0.65rem" }} />
                          )}
                        </Stack>
                        {ship.manufacturer && (
                          <Typography variant="caption" color="text.secondary"
                            sx={{ mt: 0.5, display: "block" }}>
                            {ship.manufacturer}
                          </Typography>
                        )}
                        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }} alignItems="center">
                          {ship.crew_size != null && (
                            <Tooltip title="Crew size" arrow>
                              <Stack direction="row" spacing={0.25} alignItems="center">
                                <GroupsIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                                <Typography variant="caption" color="text.secondary">
                                  {ship.crew_size}
                                </Typography>
                              </Stack>
                            </Tooltip>
                          )}
                          {ship.length_m != null && (
                            <Tooltip title={`${ship.length_m}m${ship.width_m ? ` × ${ship.width_m}m` : ""}${ship.height_m ? ` × ${ship.height_m}m` : ""}`} arrow>
                              <Stack direction="row" spacing={0.25} alignItems="center">
                                <StraightenIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                                <Typography variant="caption" color="text.secondary">
                                  {ship.length_m}m
                                </Typography>
                              </Stack>
                            </Tooltip>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                )
              })}
            </Grid>

            {filtered.length === 0 && (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <Typography color="text.secondary">No ships found.</Typography>
              </Box>
            )}

            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}

        <ShipDetailModal
          shipId={selectedShipId}
          open={!!selectedShipId && !isMobile}
          onClose={() => {
            setSelectedShipId(null)
            const params = searchParams.toString()
            const qs = params ? `?${params}` : ""
            navigate(`/wiki/ships${qs}`)
          }}
        />
      </Grid>
    </StandardPageLayout>
  )
}
