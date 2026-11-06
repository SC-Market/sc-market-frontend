import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { type SearchToken } from "../../components/game-data/UnifiedSearchBar"
import { formatShipRole } from "../../util/shipDisplay"
import { Box, Chip } from "@mui/material"
import { useTheme, alpha } from "@mui/material/styles"
import { type WikiShipSearchResult } from "../../store/api/v2/market"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { getVehicleCategory } from "./WikiVehicleCard"

/** Filter options and per-category counts derived from the full vehicle list. */
export function useVehicleFacets(allVehicles: WikiShipSearchResult[]) {
  const manufacturers = useMemo(
    () =>
      [
        ...new Set(allVehicles.map((s) => s.manufacturer).filter(Boolean)),
      ].sort() as string[],
    [allVehicles],
  )
  const careers = useMemo(
    () =>
      [
        ...new Set(allVehicles.map((s) => s.career).filter(Boolean)),
      ].sort() as string[],
    [allVehicles],
  )
  const roles = useMemo(
    () =>
      [
        ...new Set(allVehicles.map((s) => s.role).filter(Boolean)),
      ].sort() as string[],
    [allVehicles],
  )
  const sizes = useMemo(
    () =>
      [...new Set(allVehicles.map((s) => s.size).filter(Boolean))].sort(
        (a, b) => Number(a) - Number(b),
      ) as string[],
    [allVehicles],
  )

  const counts = useMemo(
    () => ({
      all: allVehicles.length,
      ships: allVehicles.filter((s) => getVehicleCategory(s) === "ship").length,
      ground: allVehicles.filter((s) => getVehicleCategory(s) === "ground")
        .length,
      hoverbike: allVehicles.filter(
        (s) => getVehicleCategory(s) === "hoverbike",
      ).length,
    }),
    [allVehicles],
  )
  return { manufacturers, careers, roles, sizes, counts }
}

/** The vehicles matching the category, the sidebar filters and the search text. */
export function useFilteredVehicles(
  allVehicles: WikiShipSearchResult[],
  searchTokens: SearchToken[],
  {
    category,
    manufacturer,
    career,
    role,
    size,
  }: {
    category: string
    manufacturer: string
    career: string
    role: string
    size: string
  },
) {
  const { t } = useTranslation()
  return useMemo(() => {
    let result = allVehicles
    if (category !== "all") {
      result = result.filter((s) => {
        const cat = getVehicleCategory(s)
        return category === "ships" ? cat === "ship" : cat === category
      })
    }
    if (manufacturer)
      result = result.filter((s) => s.manufacturer === manufacturer)
    if (career)
      result = result.filter(
        (s) => s.career?.toLowerCase() === career.toLowerCase(),
      )
    if (role)
      result = result.filter(
        (s) =>
          s.role?.toLowerCase().replace(/[^a-z]/g, "") ===
          role.toLowerCase().replace(/[^a-z]/g, ""),
      )
    if (size) result = result.filter((s) => String(s.size) === size)
    const textTokens = searchTokens.filter((tok) => tok.type === "query")
    for (const tok of textTokens) {
      const q = tok.value.toLowerCase()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.manufacturer?.toLowerCase().includes(q) ||
          s.career?.toLowerCase().includes(q) ||
          formatShipRole(s.role, t).toLowerCase().includes(q),
      )
    }
    return result
  }, [allVehicles, category, manufacturer, career, role, size, searchTokens, t])
}

/** Removable chips for the filters currently applied. */
export function ActiveFilterChips({
  chips,
  onRemove,
}: {
  chips: Array<{ label: string; key: string; value: string }>
  onRemove: (key: string) => void
}) {
  const theme = useTheme<ExtendedTheme>()
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 2 }}>
      {chips.map((chip) => (
        <Chip
          key={chip.key}
          label={chip.label}
          size="small"
          onDelete={() => onRemove(chip.key)}
          sx={{
            height: 22,
            fontSize: "0.68rem",
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            color: "primary.main",
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            "& .MuiChip-deleteIcon": {
              color: "primary.main",
              opacity: 0.7,
              fontSize: 14,
            },
            "& .MuiChip-label": { px: 1 },
          }}
        />
      ))}
    </Box>
  )
}
