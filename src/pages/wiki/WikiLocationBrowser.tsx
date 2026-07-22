/**
 * Wiki Location Browser — system hierarchy with filter sidebar
 * Stanton / Pyro / Nyx selector, type filter, amenity highlights.
 */

import React, { useMemo, useState } from "react"
import {
  Alert, Box, Card, CardActionArea, CardContent, Chip, Collapse, Divider,
  FormControl, Grid, InputLabel, List, ListItem, ListItemButton, ListItemText,
  MenuItem, Paper, Select, Stack, TextField, ToggleButton, ToggleButtonGroup,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import {
  ExpandLess, ExpandMore, HardwareRounded, Hotel,
  LocalHospital, Storefront, FlightLand, Build, ShoppingBag, Public,
} from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import {
  useGetLocationsQuery,
  useGetLocationDetailQuery,
  type WikiLocationNode,
} from "../../store/api/v2/market"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { FilterSidebarLayout } from "../../components/layout/FilterSidebarLayout"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { TableSkeleton } from "../../components/game-data/GameDataSkeletons"

const SYSTEM_COLORS: Record<string, string> = {
  Stanton: "#00bcd4",
  Pyro: "#ff9800",
  Nyx: "#4caf50",
}

const TYPE_FILTERS = ["All", "Planet", "Moon", "Station", "Outpost"] as const

function getAmenityIcon(amenity: string) {
  const a = amenity.toLowerCase()
  if (a.includes("refin")) return <HardwareRounded sx={{ fontSize: 12 }} />
  if (a.includes("hospital") || a.includes("clinic") || a.includes("medical")) return <LocalHospital sx={{ fontSize: 12 }} />
  if (a.includes("trading") || a.includes("commodity")) return <Storefront sx={{ fontSize: 12 }} />
  if (a.includes("hangar") || a.includes("landing")) return <FlightLand sx={{ fontSize: 12 }} />
  if (a.includes("repair")) return <Build sx={{ fontSize: 12 }} />
  if (a.includes("buy") || a.includes("shop") || a.includes("store")) return <ShoppingBag sx={{ fontSize: 12 }} />
  return null
}

function getAmenityColor(amenity: string): "success" | "info" | "warning" | "default" | "primary" {
  const a = amenity.toLowerCase()
  if (a.includes("refin") || a.includes("mining")) return "success"
  if (a.includes("hospital") || a.includes("clinic") || a.includes("medical")) return "info"
  if (a.includes("trading") || a.includes("commodity")) return "warning"
  if (a.includes("buy") || a.includes("shop") || a.includes("store")) return "primary"
  return "default"
}

function filterTree(nodes: WikiLocationNode[], search: string, typeFilter: string, systemFilter: string): WikiLocationNode[] {
  const s = search.toLowerCase()
  const matchesFilter = (n: WikiLocationNode): boolean => {
    const nameMatch = !s || n.name.toLowerCase().includes(s)
    const typeMatch = typeFilter === "All" || n.type?.toLowerCase() === typeFilter.toLowerCase()
    const sysMatch = systemFilter === "All" || n.jurisdiction === systemFilter
    if (nameMatch && typeMatch && sysMatch) return true
    return n.children.some(matchesFilter)
  }
  const prune = (nodes: WikiLocationNode[]): WikiLocationNode[] =>
    nodes.filter(matchesFilter).map((n) => ({ ...n, children: prune(n.children) }))
  return prune(nodes)
}

function MiningLocationSummary({ locationCode }: { locationCode: string }) {
  const { t } = useTranslation()
  const { data, isLoading } = useGetLocationDetailQuery({ name: locationCode })
  if (isLoading || !data?.groups?.length) return null
  return (
    <Box sx={{ mt: 1 }}>
      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
        <HardwareRounded sx={{ fontSize: 13, color: "text.secondary" }} />
        <Typography variant="caption" fontWeight={600} color="text.secondary">{t("wiki.locationBrowser.miningResources", "Mining Resources")}</Typography>
      </Stack>
      {(data.groups || []).map((g) => (
        <Box key={g.groupName} sx={{ mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
            {(g.groupName || "").replace("_Mineables", "").replace("SpaceShip", "Ship")} ({g.groupProbability}%)
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {(g.ores || []).slice(0, 6).map((ore) => (
              <Chip
                key={ore.presetName}
                label={`${ore.elementName || ore.presetName} ${ore.relativeProbability?.toFixed(1)}%`}
                size="small"
                variant="outlined"
                sx={{ height: 18, fontSize: "0.6rem" }}
              />
            ))}
          </Stack>
        </Box>
      ))}
    </Box>
  )
}

function LocationDetail({ node }: { node: WikiLocationNode }) {
  const { t } = useTranslation()
  const isMineableType = ["planet", "moon"].includes(node.type?.toLowerCase() || "")
  const miningCode = node.id?.includes(".") ? node.id.split(".").pop() : null
  const systemColor = node.jurisdiction ? SYSTEM_COLORS[node.jurisdiction] : undefined

  return (
    <Box sx={{ mx: 1, mb: 0.5, p: 1.5, bgcolor: "action.hover", borderRadius: 1 }}>
      {node.description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {node.description}
        </Typography>
      )}
      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
        {node.jurisdiction && (
          <Chip
            label={node.jurisdiction}
            size="small"
            sx={{ bgcolor: systemColor, color: "#fff", fontWeight: 600, height: 22, fontSize: "0.7rem" }}
          />
        )}
        {node.respawnType && node.respawnType !== "None" && (
          <Chip
            icon={<Hotel sx={{ fontSize: 14 }} />}
            label={`${t("wiki.locationBrowser.respawn", "Respawn")}: ${node.respawnType}`}
            size="small"
            color="info"
            variant="outlined"
            sx={{ height: 22, fontSize: "0.7rem" }}
          />
        )}
      </Stack>
      {(node.size != null || node.qtArrivalRadius != null || node.qtObstructionRadius != null) && (
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          {node.size != null && (
            <Typography variant="caption" color="text.secondary">{t("wiki.locationBrowser.size", "Size")}: {node.size.toLocaleString()} km</Typography>
          )}
          {node.qtArrivalRadius != null && (
            <Typography variant="caption" color="text.secondary">{t("wiki.locationBrowser.qtArrival", "QT Arrival")}: {node.qtArrivalRadius.toLocaleString()} km</Typography>
          )}
        </Stack>
      )}
      {node.amenities.length > 0 && (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {node.amenities.map((a) => (
            <Chip
              key={a}
              icon={getAmenityIcon(a) || undefined}
              label={a}
              size="small"
              color={getAmenityColor(a)}
              variant="outlined"
              sx={{ height: 20, fontSize: "0.65rem" }}
            />
          ))}
        </Stack>
      )}
      {isMineableType && miningCode && <MiningLocationSummary locationCode={miningCode} />}
    </Box>
  )
}

function LocationTreeItem({ node, level }: { node: WikiLocationNode; level: number }) {
  const [open, setOpen] = useState(false)
  const hasChildren = node.children.length > 0
  const typeLower = node.type?.toLowerCase() || ""
  const systemColor = node.jurisdiction ? SYSTEM_COLORS[node.jurisdiction] : undefined

  const typeColor = ((): "primary" | "secondary" | "warning" | "default" => {
    switch (typeLower) {
      case "planet": return "secondary"
      case "moon": return "default"
      case "station": return "primary"
      case "outpost": return "warning"
      default: return "primary"
    }
  })()

  return (
    <>
      <ListItem disablePadding sx={{ pl: level * 2 }}>
        <ListItemButton onClick={() => setOpen(!open)} sx={{ borderRadius: 1 }}>
          {/* System color dot for top-level items */}
          {level === 0 && systemColor && (
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: systemColor, mr: 1.5, flexShrink: 0 }} />
          )}
          {node.navIcon && (
            <Typography sx={{ mr: 1, fontSize: 16 }}>{node.navIcon}</Typography>
          )}
          <ListItemText primary={node.name} primaryTypographyProps={{ fontWeight: 600, variant: "body2" }} />
          <Chip label={node.type} size="small" color={typeColor} sx={{ mr: 1, height: 20, fontSize: "0.65rem" }} />
          {node.amenities.slice(0, 2).map((a) => (
            <Chip
              key={a}
              icon={getAmenityIcon(a) || undefined}
              label={a}
              size="small"
              color={getAmenityColor(a)}
              variant="outlined"
              sx={{ mr: 0.5, height: 18, fontSize: "0.6rem", display: { xs: "none", md: "flex" } }}
            />
          ))}
          {open ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
        </ListItemButton>
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box sx={{ pl: level * 2 }}>
          <LocationDetail node={node} />
        </Box>
        {hasChildren && (
          <List component="div" disablePadding>
            {node.children.map((child) => (
              <LocationTreeItem key={child.id} node={child} level={level + 1} />
            ))}
          </List>
        )}
      </Collapse>
    </>
  )
}

export function WikiLocationBrowser() {
  const { t } = useTranslation()
  const { data: locations, isLoading, error } = useGetLocationsQuery({})
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("All")
  const [systemFilter, setSystemFilter] = useState<string>("All")

  const systems = useMemo(() => {
    if (!locations) return []
    const found = new Set<string>()
    const walk = (nodes: WikiLocationNode[]) => nodes.forEach((n) => {
      if (n.jurisdiction) found.add(n.jurisdiction)
      walk(n.children)
    })
    walk(locations)
    return ["All", ...Array.from(found).sort()]
  }, [locations])

  const filtered = useMemo(
    () => locations && (search || typeFilter !== "All" || systemFilter !== "All")
      ? filterTree(locations, search, typeFilter, systemFilter)
      : locations,
    [locations, search, typeFilter, systemFilter],
  )

  const title = t("wiki.locations.title", "Star Map & Locations")

  const filtersContent = (
    <Stack spacing={2}>
      {/* System selector */}
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, mb: 1, display: "block" }}>
          {t("wiki.locationBrowser.system", "System")}
        </Typography>
        <Stack spacing={0.5}>
          {systems.map((sys) => {
            const color = sys !== "All" ? SYSTEM_COLORS[sys] : undefined
            const active = systemFilter === sys
            return (
              <Box
                key={sys}
                onClick={() => setSystemFilter(sys)}
                sx={{
                  display: "flex", alignItems: "center", gap: 1, px: 1.5, py: 0.75,
                  borderRadius: 1, cursor: "pointer", transition: "background 0.12s",
                  bgcolor: active ? (color ? `${color}22` : "action.selected") : "transparent",
                  border: "1px solid",
                  borderColor: active ? (color ?? "primary.main") : "transparent",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                {color && (
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: color, flexShrink: 0 }} />
                )}
                <Typography variant="body2" fontWeight={active ? 700 : 400} sx={{ flex: 1 }}>{sys === "All" ? t("wiki.locationBrowser.allSystems", "All") : sys}</Typography>
              </Box>
            )
          })}
        </Stack>
      </Box>

      <Divider />

      {/* Type filter */}
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, mb: 0.5, display: "block" }}>
          {t("wiki.locationBrowser.type", "Type")}
        </Typography>
        <ToggleButtonGroup
          orientation="vertical"
          value={typeFilter}
          exclusive
          onChange={(_, v) => { if (v !== null) setTypeFilter(v) }}
          fullWidth
          size="small"
        >
          {TYPE_FILTERS.map((f) => (
            <ToggleButton key={f} value={f} sx={{ justifyContent: "flex-start", textTransform: "none", fontSize: "0.8rem" }}>
              {f === "All" ? t("wiki.locationBrowser.allTypes", "All Types") : `${f}s`}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
    </Stack>
  )

  if (isLoading) {
    return (
      <StandardPageLayout title={title} headerTitle={title} sidebarOpen={true} maxWidth="xl">
        <Grid item xs={12}><TableSkeleton rows={12} /></Grid>
      </StandardPageLayout>
    )
  }

  if (error) {
    return (
      <StandardPageLayout title={title} headerTitle={title} sidebarOpen={true} maxWidth="xl">
        <Grid item xs={12}>
          <Alert severity="error">{t("wiki.locationBrowser.loadError", "Failed to load locations. Please try again.")}</Alert>
        </Grid>
      </StandardPageLayout>
    )
  }

  return (
    <StandardPageLayout title={title} headerTitle={title} sidebarOpen={true} maxWidth="xl">
      <Grid item xs={12}>
        <FilterSidebarLayout filters={filtersContent} filterTitle={t("wiki.locationBrowser.filters", "Filters")} sidebarWidth={200}>
          <TextField
            size="small"
            fullWidth
            placeholder={t("wiki.locations.search", "Search locations...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mb: 2, maxWidth: 400 }}
          />
          <Card>
            <CardContent sx={{ p: 1 }}>
              {filtered && filtered.length > 0 ? (
                <List disablePadding>
                  {filtered.map((loc) => (
                    <LocationTreeItem key={loc.id} node={loc} level={0} />
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                  {t("wiki.locations.noResults", "No locations found")}
                </Typography>
              )}
            </CardContent>
          </Card>
        </FilterSidebarLayout>
      </Grid>
    </StandardPageLayout>
  )
}
