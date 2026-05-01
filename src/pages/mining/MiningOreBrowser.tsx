import React, { useState, useEffect, useMemo } from "react"
import {
  Grid,
  Pagination,
  Alert,
  Box,
  Typography,
  Stack,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  useMediaQuery,
} from "@mui/material"
import { useSearchParams, useNavigate, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useSearchOresQuery, type OreSearchResult } from "../../store/api/v2/market"
import { MiningOreDetailModal } from "./MiningOreDetailModal"
import { UnifiedSearchBar, miningTokensToParams, miningParamsToTokens, type SearchToken } from "../../components/game-data/UnifiedSearchBar"
import { CardGridSkeleton } from "../../components/game-data/GameDataSkeletons"

const RARITY_COLORS: Record<string, string> = {
  common: "#9e9e9e",
  uncommon: "#4caf50",
  rare: "#2196f3",
  epic: "#9c27b0",
  legendary: "#ff9800",
}

function friendlyName(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

const PAGE_SIZE = 24
const microChip = { height: 20, fontSize: "0.7rem", fontWeight: "bold" }

export function MiningOreBrowser() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"))
  const navigate = useNavigate()
  const urlParams = useParams<{ name?: string }>()
  const [searchParams, setSearchParams] = useSearchParams()

  const page = parseInt(searchParams.get("page") || "1") || 1
  const [selectedOre, setSelectedOre] = useState<string | null>(null)

  const searchTokens = useMemo(() => miningParamsToTokens(searchParams), [searchParams])
  const queryParams = useMemo(() => miningTokensToParams(searchTokens), [searchTokens])

  const handleTokensChange = (tokens: SearchToken[]) => {
    const params = new URLSearchParams(miningTokensToParams(tokens))
    params.set("tab", searchParams.get("tab") || "ores")
    setSearchParams(params, { replace: true })
  }

  const handlePageChange = (_: unknown, p: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", String(p))
    setSearchParams(params, { replace: true })
  }

  // Auto-open modal from URL on desktop
  useEffect(() => {
    if (urlParams.name && !isMobile) setSelectedOre(urlParams.name)
  }, [urlParams.name, isMobile])

  const handleOreClick = (oreName: string) => {
    setSelectedOre(oreName)
    const qs = searchParams.toString()
    window.history.replaceState(null, "", `/mining/ores/${oreName}${qs ? `?${qs}` : ""}`)
  }

  const handleModalClose = () => {
    setSelectedOre(null)
    window.history.replaceState(null, "", `/mining?${searchParams.toString()}`)
  }

  const { data, isLoading, error } = useSearchOresQuery({
    text: queryParams.q || undefined,
    system: queryParams.system || undefined,
    miningMethod: (queryParams.mining_method as any) || undefined,
    rarity: (queryParams.rarity as any) || undefined,
    page,
    pageSize: PAGE_SIZE,
  })

  return (
    <>
      <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2 }}>
        <UnifiedSearchBar
          tokens={searchTokens}
          onChange={handleTokensChange}
          mode="mining"
          placeholder="Search ores, systems, rarity..."
        />
        {data && (
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
            {data.total}
          </Typography>
        )}
      </Box>

      {isLoading && <CardGridSkeleton />}
        {error && <Alert severity="error">{t("mining.error", "Failed to load ores.")}</Alert>}
        {data && (
          <>
            <Grid container spacing={theme.layoutSpacing?.layout ?? 2}>
              {data.ores.map((ore) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={ore.name}>
                  <OreCard ore={ore} onClick={() => handleOreClick(ore.name)} />
                </Grid>
              ))}
            </Grid>
            {data.ores.length === 0 && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <Typography color="text.secondary">{t("mining.noOres", "No ores found.")}</Typography>
              </Box>
            )}
            {data.total > PAGE_SIZE && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Pagination
                  count={Math.ceil(data.total / PAGE_SIZE)}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      <MiningOreDetailModal
        oreName={selectedOre}
        open={!!selectedOre}
        onClose={handleModalClose}
      />
    </>
  )
}

function OreCard({ ore, onClick }: { ore: OreSearchResult; onClick: () => void }) {
  const rarityColor = RARITY_COLORS[(ore.rarity || "").toLowerCase()] || "#757575"
  const displayName = ore.displayName || friendlyName(ore.name)

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column", borderLeft: `3px solid ${rarityColor}` }}>
      <CardActionArea onClick={onClick} sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "stretch", justifyContent: "flex-start" }}>
        <CardContent sx={{ p: 1.5, pb: 0 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
            <Typography variant="body2" fontWeight={600} noWrap sx={{ flex: 1 }}>
              {displayName}
            </Typography>
            {ore.rarity && (
              <Chip
                label={ore.rarity.charAt(0).toUpperCase() + ore.rarity.slice(1)}
                size="small"
                sx={{ ...microChip, bgcolor: rarityColor, color: "#fff", ml: 0.5 }}
              />
            )}
          </Box>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 0.5 }}>
            {ore.instability != null && (
              <Chip label={`Inst: ${ore.instability.toFixed(0)}`} size="small" variant="outlined" sx={microChip} />
            )}
            {ore.resistance != null && (
              <Chip label={`Res: ${ore.resistance.toFixed(2)}`} size="small" variant="outlined" sx={microChip} />
            )}
            {ore.explosionMultiplier != null && (
              <Chip label={`Exp: ${ore.explosionMultiplier.toFixed(0)}`} size="small" variant="outlined" sx={microChip} />
            )}
          </Stack>
        </CardContent>
        <Box sx={{ px: 1.5, pb: 1.5, pt: 0.5, mt: "auto" }}>
          {ore.marketPrice != null && (
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="caption" color="text.secondary">Market Price</Typography>
              <Typography variant="caption" color="success.main" fontWeight={600}>
                {ore.marketPrice.toLocaleString()} aUEC
              </Typography>
            </Box>
          )}
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="caption" color="text.secondary">Locations</Typography>
            <Typography variant="caption">{ore.locationCount}</Typography>
          </Box>
          {(ore.topLocations?.length ?? 0) > 0 && (
            <OreLocationChips locations={ore.topLocations || []} />
          )}
        </Box>
      </CardActionArea>
    </Card>
  )
}

const SYSTEM_COLORS: Record<string, string> = {
  Stanton: "#00bcd4",
  Pyro: "#ff9800",
  Nyx: "#4caf50",
}

function OreLocationChips({ locations }: { locations: Array<{ name: string; system: string; probability: number }> }) {
  // Group by system
  const bySystem = new Map<string, Array<{ name: string; probability: number }>>()
  for (const loc of locations) {
    const sys = loc.system || "Unknown"
    const arr = bySystem.get(sys) || []
    arr.push({ name: loc.name, probability: loc.probability })
    bySystem.set(sys, arr)
  }

  return (
    <Box sx={{ mt: 0.5 }}>
      {Array.from(bySystem.entries()).map(([sys, locs]) => {
        const color = SYSTEM_COLORS[sys] || "#9e9e9e"
        return (
          <Box key={sys} sx={{ mb: 0.25 }}>
            <Chip
              label={sys}
              size="small"
              sx={{ height: 16, fontSize: "0.6rem", fontWeight: 700, bgcolor: color + "22", color, mr: 0.5, mb: 0.25 }}
            />
            {locs.slice(0, 3).map((l, i) => (
              <Typography key={i} variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
                {l.name}{i < Math.min(locs.length, 3) - 1 ? ", " : ""}
              </Typography>
            ))}
            {locs.length > 3 && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
                {" "}+{locs.length - 3}
              </Typography>
            )}
          </Box>
        )
      })}
    </Box>
  )
}
