import { useMemo } from "react"
import { Box, Typography, Link as MuiLink } from "@mui/material"
import { useTranslation } from "react-i18next"
import { Link as RouterLink } from "react-router-dom"
import { WIKI_PATHS } from "../../routes/paths"

// ─── Main component ──────────────────────────────────────────────────────────
/**
 * Every ship and vehicle as a plain A–Z link list under the grid: the grid
 * pages 24 at a time, so without this the page (prerendered for crawlers)
 * linked only the first page of ships.
 */
export function AllShipsIndex(props: {
  ships: { id: string; name: string }[]
}) {
  const { t } = useTranslation()
  const sorted = useMemo(
    () => [...props.ships].sort((a, b) => a.name.localeCompare(b.name, "en")),
    [props.ships],
  )
  return (
    <Box
      component="nav"
      aria-label={t("wiki.shipBrowser.allShips", "All ships and vehicles")}
      sx={{ mt: 6 }}
    >
      <Typography
        variant="h6"
        component="h2"
        color="text.secondary"
        sx={{ mb: 1 }}
      >
        {t("wiki.shipBrowser.allShips", "All ships and vehicles")} (
        {sorted.length})
      </Typography>
      <Box
        component="ul"
        sx={{ listStyle: "none", p: 0, m: 0, columnWidth: 220, columnGap: 3 }}
      >
        {sorted.map((ship) => (
          <Box
            component="li"
            key={ship.id}
            sx={{ breakInside: "avoid", py: 0.25 }}
          >
            <MuiLink
              component={RouterLink}
              to={WIKI_PATHS.ship(ship.id, ship.name)}
              variant="body2"
              color="text.primary"
              underline="hover"
            >
              {ship.name}
            </MuiLink>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
