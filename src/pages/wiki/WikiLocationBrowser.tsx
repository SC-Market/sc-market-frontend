/**
 * Wiki Location Browser — system hierarchy with filter sidebar
 * Stanton / Pyro / Nyx selector, type filter, amenity highlights.
 */

import { useMemo, useState } from "react"
import {
  Alert,
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  List,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import {
  useGetLocationsQuery,
  type WikiLocationNode,
} from "../../store/api/v2/market"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { FilterSidebarLayout } from "../../components/layout/FilterSidebarLayout"
import { TableSkeleton } from "../../components/game-data/GameDataSkeletons"
import { wikiLocationsSeoText } from "../../seo/hubHeads"

import { SYSTEM_COLORS } from "./WikiLocationDetail"
import { LocationTreeItem, filterTree } from "./WikiLocationTree"

const TYPE_FILTERS = ["All", "Planet", "Moon", "Station", "Outpost"] as const
const TYPE_FILTER_KEYS: Record<
  Exclude<(typeof TYPE_FILTERS)[number], "All">,
  string
> = {
  Planet: "wikiUi.locationBrowser.typePlanets",
  Moon: "wikiUi.locationBrowser.typeMoons",
  Station: "wikiUi.locationBrowser.typeStations",
  Outpost: "wikiUi.locationBrowser.typeOutposts",
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
    const walk = (nodes: WikiLocationNode[]) =>
      nodes.forEach((n) => {
        if (n.jurisdiction) found.add(n.jurisdiction)
        walk(n.children)
      })
    walk(locations)
    return ["All", ...Array.from(found).sort()]
  }, [locations])

  const filtered = useMemo(
    () =>
      locations && (search || typeFilter !== "All" || systemFilter !== "All")
        ? filterTree(locations, search, typeFilter, systemFilter)
        : locations,
    [locations, search, typeFilter, systemFilter],
  )

  const title = wikiLocationsSeoText(t).title

  const filtersContent = (
    <Stack spacing={2}>
      {/* System selector */}
      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 700,
            mb: 1,
            display: "block",
          }}
        >
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
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 1,
                  cursor: "pointer",
                  transition: "background 0.12s",
                  bgcolor: active
                    ? color
                      ? `${color}22`
                      : "action.selected"
                    : "transparent",
                  border: "1px solid",
                  borderColor: active
                    ? (color ?? "primary.main")
                    : "transparent",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                {color && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: color,
                      flexShrink: 0,
                    }}
                  />
                )}
                <Typography
                  variant="body2"
                  fontWeight={active ? 700 : 400}
                  sx={{ flex: 1 }}
                >
                  {sys === "All"
                    ? t("wiki.locationBrowser.allSystems", "All")
                    : sys}
                </Typography>
              </Box>
            )
          })}
        </Stack>
      </Box>

      <Divider />

      {/* Type filter */}
      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 700,
            mb: 0.5,
            display: "block",
          }}
        >
          {t("wiki.locationBrowser.type", "Type")}
        </Typography>
        <ToggleButtonGroup
          orientation="vertical"
          value={typeFilter}
          exclusive
          onChange={(_, v) => {
            if (v !== null) setTypeFilter(v)
          }}
          fullWidth
          size="small"
        >
          {TYPE_FILTERS.map((f) => (
            <ToggleButton
              key={f}
              value={f}
              sx={{
                justifyContent: "flex-start",
                textTransform: "none",
                fontSize: "0.8rem",
              }}
            >
              {f === "All"
                ? t("wiki.locationBrowser.allTypes", "All Types")
                : t(TYPE_FILTER_KEYS[f])}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
    </Stack>
  )

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
            {t(
              "wiki.locationBrowser.loadError",
              "Failed to load locations. Please try again.",
            )}
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
        <FilterSidebarLayout
          filters={filtersContent}
          filterTitle={t("wiki.locationBrowser.filters", "Filters")}
          sidebarWidth={200}
        >
          <TextField
            size="small"
            fullWidth
            placeholder={t("wiki.locations.search", "Search locations")}
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
        </FilterSidebarLayout>
      </Grid>
    </StandardPageLayout>
  )
}
