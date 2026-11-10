import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Divider,
  Tooltip,
} from "@mui/material"
import type { SxProps } from "@mui/material"
import DirectionsCarIcon from "@mui/icons-material/DirectionsCarRounded"
import TwoWheelerIcon from "@mui/icons-material/TwoWheelerRounded"
import GroupsIcon from "@mui/icons-material/GroupsRounded"
import StraightenIcon from "@mui/icons-material/StraightenRounded"
import { alpha } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import { type WikiShipSearchResult } from "../../store/api/v2/market"
import { Link as RouterLink } from "react-router-dom"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import {
  ShipSilhouette,
  getShipColor,
} from "../../components/wiki/ShipSilhouette"
import {
  formatShipRole,
  formatShipCareer,
  getShipRoleColor,
} from "../../util/shipDisplay"
import { inAppClick } from "../../components/links/inAppClick"
import { WIKI_PATHS } from "../../routes/paths"
import { orange, purple } from "@mui/material/colors"

export type VehicleCategory = "all" | "ships" | "ground" | "hoverbike"

export const GROUND_PREFIXES = ["grin_", "tmbl_", "rsi_ursa", "rsi_lynx"]

export const HOVERBIKE_PREFIXES = ["xian_nox", "orig_x1", "drak_dragonfly"]

export function getVehicleCategory(
  ship: WikiShipSearchResult,
): "ship" | "ground" | "hoverbike" {
  const code = ship.ship_code?.toLowerCase() ?? ""
  if (HOVERBIKE_PREFIXES.some((p) => code.startsWith(p))) return "hoverbike"
  if (GROUND_PREFIXES.some((p) => code.startsWith(p))) return "ground"
  return "ship"
}

// ─── Section divider with count badge ───────────────────────────────────────
export function SectionHeader({
  label,
  count,
}: {
  label: string
  count: number
}) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ my: 1.5 }}>
      <Typography
        variant="overline"
        sx={{
          whiteSpace: "nowrap",
          fontSize: "0.62rem",
          letterSpacing: "0.12em",
          color: "text.primary",
          fontWeight: 700,
        }}
      >
        {label}
      </Typography>
      <Chip
        label={count}
        size="small"
        sx={{
          height: 16,
          fontSize: "0.6rem",
          bgcolor: (theme) => alpha(theme.palette.text.primary, 0.07),
          color: "text.primary",
          "& .MuiChip-label": { px: 0.75 },
        }}
      />
      <Divider sx={{ flex: 1 }} />
    </Stack>
  )
}

// ─── Vehicle card ────────────────────────────────────────────────────────────
export function VehicleCard({
  ship,
  onClick,
}: {
  ship: WikiShipSearchResult
  onClick: () => void
}) {
  const href = WIKI_PATHS.ship(ship.id, ship.name)
  const { t } = useTranslation()
  const vehicleCategory = getVehicleCategory(ship)
  const careerColor = getShipColor(ship.career, ship.role, ship.focus)
  const chipColor = getShipRoleColor(ship.career, ship.role, ship.focus)

  return (
    <Card
      component={RouterLink}
      to={href}
      data-testid="ship-card"
      data-id={ship.id}
      sx={
        {
          cursor: "pointer",
          textDecoration: "none",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transition: "transform 0.15s, border-color 0.15s, box-shadow 0.15s",
          "--career-color": careerColor,
          "&:hover": {
            transform: "translateY(-3px)",
            borderColor: careerColor,
            boxShadow: `0 6px 24px rgba(0,0,0,0.5), 0 0 0 1px ${careerColor}`,
          },
        } as SxProps<ExtendedTheme>
      }
      onClick={inAppClick(onClick)}
    >
      {/* Career accent bar */}
      <Box sx={{ height: 2, bgcolor: careerColor, flexShrink: 0 }} />

      {/* Silhouette */}
      <Box
        sx={{
          height: 150,
          bgcolor: "background.default",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
          // Radial glow at bottom
          "&::before": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "80%",
            height: "55%",
            background: `radial-gradient(ellipse at bottom, ${careerColor}, transparent 70%)`,
            opacity: 0.2,
            pointerEvents: "none",
          },
        }}
      >
        {/* Type badge for ground/hoverbike */}
        {vehicleCategory !== "ship" && (
          <Box
            sx={{
              position: "absolute",
              top: 6,
              left: 6,
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              gap: 0.4,
              px: 0.75,
              py: 0.3,
              borderRadius: 1,
              fontSize: "0.58rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              ...(vehicleCategory === "ground"
                ? {
                    bgcolor: "rgba(255,167,38,0.18)",
                    color: orange[400],
                    border: "1px solid rgba(255,167,38,0.35)",
                  }
                : {
                    bgcolor: "rgba(171,71,188,0.18)",
                    color: purple[200],
                    border: "1px solid rgba(171,71,188,0.35)",
                  }),
            }}
          >
            {vehicleCategory === "ground" ? (
              <DirectionsCarIcon sx={{ fontSize: 10 }} />
            ) : (
              <TwoWheelerIcon sx={{ fontSize: 10 }} />
            )}
            {vehicleCategory === "ground"
              ? t("wiki.shipBrowser.ground", "Ground")
              : t("wiki.shipBrowser.hoverbike", "Hoverbike")}
          </Box>
        )}

        {/* Size badge */}
        {ship.size && (
          <Box
            sx={{
              position: "absolute",
              top: 6,
              right: 6,
              zIndex: 1,
              px: 0.6,
              py: 0.2,
              borderRadius: 0.75,
              fontSize: "0.58rem",
              bgcolor: "rgba(0,0,0,0.55)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "text.primary",
            }}
          >
            S{ship.size}
          </Box>
        )}

        {ship.ship_code ? (
          <ShipSilhouette
            shipCode={ship.ship_code}
            career={ship.career}
            role={ship.role}
            focus={ship.focus}
            height={135}
          />
        ) : ship.image_url ? (
          <Box
            component="img"
            src={ship.image_url}
            alt={ship.name}
            sx={{ width: "100%", height: "100%", objectFit: "contain", p: 1 }}
          />
        ) : null}
      </Box>

      {/* Card info */}
      <CardContent sx={{ flex: 1, p: 1.25, "&:last-child": { pb: 1.25 } }}>
        <Typography
          variant="body2"
          fontWeight={700}
          noWrap
          title={ship.name}
          sx={{
            color: "text.secondary",
            fontSize: "0.78rem",
            lineHeight: 1.2,
            mb: 0.25,
          }}
        >
          {ship.name}
        </Typography>

        {ship.manufacturer && (
          <Typography
            variant="caption"
            sx={{
              color: "text.primary",
              fontSize: "0.62rem",
              display: "block",
              mb: 0.5,
              lineHeight: 1.2,
            }}
            noWrap
          >
            {ship.manufacturer}
          </Typography>
        )}

        <Stack
          direction="row"
          spacing={0.4}
          flexWrap="wrap"
          useFlexGap
          sx={{ mb: 0.5 }}
        >
          {ship.career && (
            <Chip
              label={formatShipCareer(ship.career, t)}
              size="small"
              color={chipColor}
              variant="outlined"
              sx={{
                height: 16,
                fontSize: "0.58rem",
                "& .MuiChip-label": { px: 0.75 },
              }}
            />
          )}
          {ship.role && (
            <Chip
              label={formatShipRole(ship.role, t)}
              size="small"
              sx={{
                height: 16,
                fontSize: "0.58rem",
                bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04),
                color: "text.primary",
                border: (theme) =>
                  `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
                "& .MuiChip-label": { px: 0.75 },
              }}
            />
          )}
          {ship.focus && !ship.career && !ship.role && (
            <Chip
              label={ship.focus}
              size="small"
              sx={{
                height: 16,
                fontSize: "0.58rem",
                "& .MuiChip-label": { px: 0.75 },
              }}
            />
          )}
        </Stack>

        {(ship.crew_size != null || ship.length_m != null) && (
          <Stack direction="row" spacing={1} alignItems="center">
            {ship.crew_size != null && (
              <Tooltip title={t("wiki.shipBrowser.crew", "Crew")} arrow>
                <Stack direction="row" spacing={0.3} alignItems="center">
                  <GroupsIcon
                    sx={{ fontSize: 11, color: "text.disabled", opacity: 0.6 }}
                  />
                  <Typography
                    sx={{ fontSize: "0.62rem", color: "text.primary" }}
                  >
                    {ship.crew_size}
                  </Typography>
                </Stack>
              </Tooltip>
            )}
            {ship.length_m != null && (
              <Tooltip
                title={`${ship.length_m}m${ship.width_m ? ` × ${ship.width_m}m` : ""}${ship.height_m ? ` × ${ship.height_m}m` : ""}`}
                arrow
              >
                <Stack direction="row" spacing={0.3} alignItems="center">
                  <StraightenIcon
                    sx={{ fontSize: 11, color: "text.disabled", opacity: 0.6 }}
                  />
                  <Typography
                    sx={{ fontSize: "0.62rem", color: "text.primary" }}
                  >
                    {ship.length_m}m
                  </Typography>
                </Stack>
              </Tooltip>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  )
}
