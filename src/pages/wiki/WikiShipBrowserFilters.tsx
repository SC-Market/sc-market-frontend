import React from "react"
import { Box, Divider, Stack, Typography } from "@mui/material"
import { useTheme, alpha } from "@mui/material/styles"
import DirectionsCarIcon from "@mui/icons-material/DirectionsCarRounded"
import TwoWheelerIcon from "@mui/icons-material/TwoWheelerRounded"
import RocketLaunchIcon from "@mui/icons-material/RocketLaunchRounded"
import AppsIcon from "@mui/icons-material/AppsRounded"
import { useTranslation } from "react-i18next"
import {
  blueGrey,
  cyan,
  indigo,
  orange,
  purple,
  red,
  teal,
} from "@mui/material/colors"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { formatShipRole, formatShipCareer } from "../../util/shipDisplay"

// Maps career string → accent color hex
const CAREER_PILL_COLORS: Record<string, string> = {
  combat: red[400],
  exploration: indigo[400],
  industrial: orange[400],
  support: teal[400],
  transporter: purple[400],
  transport: purple[400],
  competition: cyan[400],
  multirole: blueGrey[400],
}

function getCareerPillColor(career: string): string {
  return CAREER_PILL_COLORS[career.toLowerCase()] ?? blueGrey[400]
}

/** Sidebar filters of the ship browser: category, career, role, manufacturer, size. */
export function ShipBrowserFilters({
  category,
  career,
  role,
  manufacturer,
  size,
  counts,
  careers,
  roles,
  manufacturers,
  sizes,
  hasFilters,
  updateParam,
  onClearAll,
}: {
  category: string
  career: string
  role: string
  manufacturer: string
  size: string
  counts: { all: number; ships: number; ground: number; hoverbike: number }
  careers: string[]
  roles: string[]
  manufacturers: string[]
  sizes: string[]
  hasFilters: boolean
  updateParam: (key: string, value: string) => void
  onClearAll: () => void
}) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  // Theme-aware dropdown arrow (text color, URL-encoded for the data URI)
  const selectArrow = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='${encodeURIComponent(theme.palette.text.disabled)}'/%3E%3C/svg%3E")`

  const CATEGORY_OPTIONS = [
    {
      value: "all",
      label: t("wiki.shipBrowser.categoryAll", "All"),
      icon: <AppsIcon sx={{ fontSize: 16 }} />,
      count: counts.all,
    },
    {
      value: "ships",
      label: t("wiki.shipBrowser.categoryShips", "Ships"),
      icon: <RocketLaunchIcon sx={{ fontSize: 16 }} />,
      count: counts.ships,
    },
    {
      value: "ground",
      label: t("wiki.shipBrowser.categoryGround", "Ground Vehicles"),
      icon: <DirectionsCarIcon sx={{ fontSize: 16 }} />,
      count: counts.ground,
    },
    {
      value: "hoverbike",
      label: t("wiki.shipBrowser.categoryHoverbikes", "Hoverbikes"),
      icon: <TwoWheelerIcon sx={{ fontSize: 16 }} />,
      count: counts.hoverbike,
    },
  ]

  return (
    <Stack spacing={2}>
      {/* Category */}
      <Box>
        <Typography
          sx={{
            fontSize: "0.62rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "text.primary",
            mb: 0.75,
            display: "block",
          }}
        >
          {t("wiki.shipBrowser.filterCategory", "Category")}
        </Typography>
        <Stack spacing={0.25}>
          {CATEGORY_OPTIONS.map((opt) => {
            const isActive = category === opt.value
            return (
              <Box
                key={opt.value}
                component="button"
                onClick={() =>
                  updateParam("category", opt.value === "all" ? "" : opt.value)
                }
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1.25,
                  py: 0.875,
                  borderRadius: 1.5,
                  border: "none",
                  bgcolor: isActive
                    ? alpha(theme.palette.primary.main, 0.12)
                    : "transparent",
                  color: isActive ? "primary.main" : "text.primary",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontFamily: "inherit",
                  width: "100%",
                  textAlign: "left",
                  transition: "background 0.12s, color 0.12s",
                  "&:hover": {
                    bgcolor: isActive
                      ? alpha(theme.palette.primary.main, 0.15)
                      : alpha(theme.palette.text.primary, 0.06),
                  },
                }}
              >
                <Box
                  sx={{
                    opacity: isActive ? 1 : 0.6,
                    display: "flex",
                    color: "inherit",
                  }}
                >
                  {opt.icon}
                </Box>
                <Box sx={{ flex: 1 }}>{opt.label}</Box>
                <Typography
                  component="span"
                  sx={{
                    fontSize: "0.68rem",
                    color: isActive ? "primary.main" : "text.primary",
                    opacity: isActive ? 0.7 : 1,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {opt.count}
                </Typography>
              </Box>
            )
          })}
        </Stack>
      </Box>

      <Divider />

      {/* Career — color-coded pill buttons */}
      <Box>
        <Typography
          sx={{
            fontSize: "0.62rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "text.primary",
            mb: 0.75,
            display: "block",
          }}
        >
          {t("wiki.shipBrowser.filterCareer", "Career")}
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
          {careers.map((c) => {
            const color = getCareerPillColor(c)
            const isActive = career.toLowerCase() === c.toLowerCase()
            return (
              <Box
                key={c}
                component="button"
                onClick={() => updateParam("career", isActive ? "" : c)}
                sx={{
                  px: 1,
                  py: 0.4,
                  borderRadius: 100,
                  border: `1px solid ${color}`,
                  bgcolor: isActive ? alpha(color, 0.15) : "transparent",
                  color: color,
                  cursor: "pointer",
                  fontSize: "0.68rem",
                  fontFamily: "inherit",
                  fontWeight: isActive ? 700 : 400,
                  transition: "background 0.12s, font-weight 0.12s",
                  "&:hover": { bgcolor: alpha(color, 0.12) },
                }}
              >
                {formatShipCareer(c, t)}
              </Box>
            )
          })}
        </Box>
      </Box>

      {/* Role select */}
      <Box>
        <Typography
          sx={{
            fontSize: "0.62rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "text.primary",
            mb: 0.75,
            display: "block",
          }}
        >
          {t("wiki.shipBrowser.filterRole", "Role")}
        </Typography>
        <Box
          component="select"
          aria-label={t("wiki.shipBrowser.filterRole", "Role")}
          value={role}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            updateParam("role", e.target.value)
          }
          sx={{
            width: "100%",
            bgcolor: "background.default",
            border: "1px solid",
            borderColor: role ? "primary.main" : "divider",
            borderRadius: 1.25,
            color: role ? "text.secondary" : "text.primary",
            fontFamily: "inherit",
            fontSize: "0.78rem",
            px: 1.25,
            py: 0.875,
            cursor: "pointer",
            appearance: "none",
            outline: "none",
            backgroundImage: selectArrow,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
            pr: 3.5,
          }}
        >
          <option value="">
            {t("wiki.shipBrowser.allRoles", "All roles")}
          </option>
          {roles.map((r) => (
            <option key={r} value={r}>
              {formatShipRole(r, t)}
            </option>
          ))}
        </Box>
      </Box>

      {/* Manufacturer select */}
      <Box>
        <Typography
          sx={{
            fontSize: "0.62rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "text.primary",
            mb: 0.75,
            display: "block",
          }}
        >
          {t("wiki.shipBrowser.filterManufacturer", "Manufacturer")}
        </Typography>
        <Box
          component="select"
          aria-label={t("wiki.shipBrowser.filterManufacturer", "Manufacturer")}
          value={manufacturer}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            updateParam("manufacturer", e.target.value)
          }
          sx={{
            width: "100%",
            bgcolor: "background.default",
            border: "1px solid",
            borderColor: manufacturer ? "primary.main" : "divider",
            borderRadius: 1.25,
            color: manufacturer ? "text.secondary" : "text.primary",
            fontFamily: "inherit",
            fontSize: "0.78rem",
            px: 1.25,
            py: 0.875,
            cursor: "pointer",
            appearance: "none",
            outline: "none",
            backgroundImage: selectArrow,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
            pr: 3.5,
          }}
        >
          <option value="">
            {t("wiki.shipBrowser.allManufacturers", "All manufacturers")}
          </option>
          {manufacturers.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </Box>
      </Box>

      {/* Size select */}
      <Box>
        <Typography
          sx={{
            fontSize: "0.62rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "text.primary",
            mb: 0.75,
            display: "block",
          }}
        >
          {t("wiki.shipBrowser.filterSize", "Size")}
        </Typography>
        <Box
          component="select"
          aria-label={t("wiki.shipBrowser.filterSize", "Size")}
          value={size}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            updateParam("size", e.target.value)
          }
          sx={{
            width: "100%",
            bgcolor: "background.default",
            border: "1px solid",
            borderColor: size ? "primary.main" : "divider",
            borderRadius: 1.25,
            color: size ? "text.secondary" : "text.primary",
            fontFamily: "inherit",
            fontSize: "0.78rem",
            px: 1.25,
            py: 0.875,
            cursor: "pointer",
            appearance: "none",
            outline: "none",
            backgroundImage: selectArrow,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
            pr: 3.5,
          }}
        >
          <option value="">{t("wiki.shipBrowser.anySize", "Any size")}</option>
          {sizes.map((s) => (
            <option key={s} value={s}>
              {t("wiki.shipBrowser.sizeOption", "Size {{size}}", { size: s })}
            </option>
          ))}
        </Box>
      </Box>

      {hasFilters && (
        <Box
          component="button"
          onClick={onClearAll}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            bgcolor: "transparent",
            color: "text.primary",
            fontFamily: "inherit",
            fontSize: "0.72rem",
            py: 0.75,
            px: 1.5,
            cursor: "pointer",
            width: "100%",
            transition: "border-color 0.12s, color 0.12s",
            "&:hover": { borderColor: "text.disabled", color: "text.primary" },
          }}
        >
          {t("wiki.shipBrowser.clearAllFilters", "Clear all filters")}
        </Box>
      )}
    </Stack>
  )
}
