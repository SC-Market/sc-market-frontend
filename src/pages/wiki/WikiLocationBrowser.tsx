/**
 * Wiki Location Browser
 *
 * Hierarchical starmap (System → Planet → Moon → Station → Outpost)
 * Rich location cards with amenities, jurisdiction, respawn, QT data
 */

import React, { useMemo, useState } from "react"
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import {
  useGetLocationsQuery,
  useGetLocationDetailQuery,
  type WikiLocationNode,
} from "../../store/api/v2/market"
import {
  ExpandLess,
  ExpandMore,
  HardwareRounded,
  Hotel,
} from "@mui/icons-material"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { TableSkeleton } from "../../components/game-data/GameDataSkeletons"

const SYSTEM_COLORS: Record<string, string> = {
  Stanton: "#00bcd4",
  Pyro: "#ff9800",
  Nyx: "#4caf50",
}

const TYPE_FILTERS = ["All", "Planet", "Moon", "Station", "Outpost"] as const

function getAmenityChipColor(
  amenity: string,
): "success" | "info" | "warning" | "default" | "primary" {
  const a = amenity.toLowerCase()
  if (a.includes("refinery") || a.includes("refining")) return "success"
  if (a.includes("hospital") || a.includes("clinic")) return "info"
  if (a.includes("trading") || a.includes("commodity")) return "warning"
  if (a.includes("hangar") || a.includes("landing")) return "default"
  if (a.includes("buy") || a.includes("rent")) return "primary"
  return "default"
}

function filterTree(
  nodes: WikiLocationNode[],
  search: string,
  typeFilter: string,
): WikiLocationNode[] {
  const s = search.toLowerCase()
  const matchesFilter = (n: WikiLocationNode): boolean => {
    const nameMatch = !s || n.name.toLowerCase().includes(s)
    const typeMatch =
      typeFilter === "All" ||
      n.type?.toLowerCase() === typeFilter.toLowerCase()
    if (nameMatch && typeMatch) return true
    return n.children.some(matchesFilter)
  }
  const prune = (nodes: WikiLocationNode[]): WikiLocationNode[] =>
    nodes
      .filter(matchesFilter)
      .map((n) => ({ ...n, children: prune(n.children) }))
  return prune(nodes)
}

// --- Mining summary (lazy-loaded) ---

function MiningLocationSummary({ locationCode }: { locationCode: string }) {
  const { data, isLoading } = useGetLocationDetailQuery({ name: locationCode })

  if (isLoading)
    return (
      <Box sx={{ py: 0.5 }}>
        <CircularProgress size={16} />
      </Box>
    )
  if (!data?.groups?.length) return null

  return (
    <Box sx={{ mt: 1 }}>
      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
        <HardwareRounded sx={{ fontSize: 14, color: "text.secondary" }} />
        <Typography variant="caption" fontWeight={600} color="text.secondary">
          Mining Resources
        </Typography>
      </Stack>
      {(data.groups || []).map((g: any) => (
        <Box key={g.groupName} sx={{ mb: 0.5 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: "0.65rem" }}
          >
            {(g.groupName || "")
              .replace("_Mineables", "")
              .replace("SpaceShip", "Ship")}{" "}
            ({g.groupProbability}%)
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {(g.ores || []).slice(0, 6).map((ore: any) => (
              <Chip
                key={ore.presetName}
                label={`${ore.elementName || ore.presetName} ${ore.relativeProbability?.toFixed(1)}%`}
                size="small"
                sx={{ height: 18, fontSize: "0.6rem" }}
                variant="outlined"
              />
            ))}
          </Stack>
        </Box>
      ))}
    </Box>
  )
}

// --- Location detail card ---

function LocationDetail({ node }: { node: WikiLocationNode }) {
  const theme = useTheme<ExtendedTheme>()
  const isMineableType = ["planet", "moon"].includes(
    node.type?.toLowerCase() || "",
  )
  const miningCode = node.id?.includes(".") ? node.id.split(".").pop() : null
  const systemColor = node.jurisdiction
    ? SYSTEM_COLORS[node.jurisdiction] ?? theme.palette.text.secondary
    : undefined

  return (
    <Box
      sx={{
        mx: 1,
        mb: 0.5,
        p: 1.5,
        bgcolor: "action.hover",
        borderRadius: 1,
      }}
    >
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
            sx={{
              bgcolor: systemColor,
              color: "#fff",
              fontWeight: 600,
              height: 22,
              fontSize: "0.7rem",
            }}
          />
        )}
        {node.respawnType && node.respawnType !== "None" && (
          <Chip
            icon={<Hotel sx={{ fontSize: 14 }} />}
            label={`Respawn: ${node.respawnType}`}
            size="small"
            color="info"
            variant="outlined"
            sx={{ height: 22, fontSize: "0.7rem" }}
          />
        )}
      </Stack>

      {(node.size != null ||
        node.qtArrivalRadius != null ||
        node.qtObstructionRadius != null) && (
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          {node.size != null && (
            <Typography variant="caption" color="text.secondary">
              Size: {node.size.toLocaleString()} km
            </Typography>
          )}
          {node.qtArrivalRadius != null && (
            <Typography variant="caption" color="text.secondary">
              QT Arrival: {node.qtArrivalRadius.toLocaleString()} km
            </Typography>
          )}
          {node.qtObstructionRadius != null && (
            <Typography variant="caption" color="text.secondary">
              QT Obstruction: {node.qtObstructionRadius.toLocaleString()} km
            </Typography>
          )}
        </Stack>
      )}

      {node.amenities.length > 0 && (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {node.amenities.map((a) => (
            <Chip
              key={a}
              label={a}
              size="small"
              color={getAmenityChipColor(a)}
              variant="outlined"
              sx={{ height: 20, fontSize: "0.65rem" }}
            />
          ))}
        </Stack>
      )}

      {isMineableType && miningCode && (
        <MiningLocationSummary locationCode={miningCode} />
      )}
    </Box>
  )
}

// --- Tree item ---

function LocationTreeItem({
  node,
  level,
}: {
  node: WikiLocationNode
  level: number
}) {
  const [open, setOpen] = useState(false)
  const hasChildren = node.children.length > 0
  const typeLower = node.type?.toLowerCase() || ""

  const typeColor = ((): "primary" | "secondary" | "warning" | "default" => {
    switch (typeLower) {
      case "planet":
        return "secondary"
      case "moon":
        return "default"
      case "station":
        return "primary"
      case "outpost":
        return "warning"
      default:
        return "primary"
    }
  })()

  return (
    <>
      <ListItem disablePadding sx={{ pl: level * 2 }}>
        <ListItemButton onClick={() => setOpen(!open)}>
          {node.navIcon && (
            <Typography sx={{ mr: 1, fontSize: 18 }}>{node.navIcon}</Typography>
          )}
          <ListItemText
            primary={node.name}
            primaryTypographyProps={{ fontWeight: 600 }}
          />
          <Chip
            label={node.type}
            size="small"
            color={typeColor}
            sx={{ mr: 1, height: 22, fontSize: "0.7rem" }}
          />
          {open ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box sx={{ pl: level * 2 }}>
          <LocationDetail node={node} />
        </Box>
        {hasChildren && (
          <List component="div" disablePadding>
            {node.children.map((child) => (
              <LocationTreeItem
                key={child.id}
                node={child}
                level={level + 1}
              />
            ))}
          </List>
        )}
      </Collapse>
    </>
  )
}

// --- Main page ---

export function WikiLocationBrowser() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { data: locations, isLoading, error } = useGetLocationsQuery({})
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("All")

  const filtered = useMemo(
    () =>
      locations && (search || typeFilter !== "All")
        ? filterTree(locations, search, typeFilter)
        : locations,
    [locations, search, typeFilter],
  )

  const title = t("wiki.locations.title", "Star Map & Locations")

  if (isLoading) {
    return (
      <StandardPageLayout
        title={title}
        headerTitle={title}
        sidebarOpen={true}
        maxWidth="xl"
      >
        <Grid item xs={12}>
          <TableSkeleton rows={12} />
        </Grid>
      </StandardPageLayout>
    )
  }

  if (error) {
    return (
      <StandardPageLayout
        title={title}
        headerTitle={title}
        sidebarOpen={true}
        maxWidth="xl"
      >
        <Grid item xs={12}>
          <Alert severity="error">
            Failed to load locations. Please try again.
          </Alert>
        </Grid>
      </StandardPageLayout>
    )
  }

  return (
    <StandardPageLayout
      title={title}
      headerTitle={title}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <Grid item xs={12}>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField
            size="small"
            placeholder={t("wiki.locations.search", "Search locations...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, maxWidth: 400 }}
          />
          <TextField
            select
            size="small"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            sx={{ minWidth: 140 }}
          >
            {TYPE_FILTERS.map((f) => (
              <MenuItem key={f} value={f}>
                {f === "All"
                  ? t("wiki.locations.allTypes", "All Types")
                  : `${f}s`}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        <Card>
          <CardContent sx={{ p: 1 }}>
            {filtered && filtered.length > 0 ? (
              <List disablePadding>
                {filtered.map((loc) => (
                  <LocationTreeItem key={loc.id} node={loc} level={0} />
                ))}
              </List>
            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ py: 4 }}
              >
                {t("wiki.locations.noResults", "No locations found")}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </StandardPageLayout>
  )
}
