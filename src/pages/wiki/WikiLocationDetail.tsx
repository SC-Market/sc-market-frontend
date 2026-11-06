import { Box, Chip, Stack, Typography } from "@mui/material"
import {
  HardwareRounded,
  HotelRounded,
  LocalHospitalRounded,
  StorefrontRounded,
  FlightLandRounded,
  BuildRounded,
  ShoppingBagRounded,
} from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import {
  useGetLocationDetailQuery,
  type WikiLocationNode,
} from "../../store/api/v2/market"
import { useFormatters } from "../../util/format"
import { common, cyan, green, orange } from "@mui/material/colors"

export const SYSTEM_COLORS: Record<string, string> = {
  Stanton: cyan[500],
  Pyro: orange[500],
  Nyx: green[500],
}

export function getAmenityIcon(amenity: string) {
  const a = amenity.toLowerCase()
  if (a.includes("refin")) return <HardwareRounded sx={{ fontSize: 12 }} />
  if (a.includes("hospital") || a.includes("clinic") || a.includes("medical"))
    return <LocalHospitalRounded sx={{ fontSize: 12 }} />
  if (a.includes("trading") || a.includes("commodity"))
    return <StorefrontRounded sx={{ fontSize: 12 }} />
  if (a.includes("hangar") || a.includes("landing"))
    return <FlightLandRounded sx={{ fontSize: 12 }} />
  if (a.includes("repair")) return <BuildRounded sx={{ fontSize: 12 }} />
  if (a.includes("buy") || a.includes("shop") || a.includes("store"))
    return <ShoppingBagRounded sx={{ fontSize: 12 }} />
  return null
}

export function getAmenityColor(
  amenity: string,
): "success" | "info" | "warning" | "default" | "primary" {
  const a = amenity.toLowerCase()
  if (a.includes("refin") || a.includes("mining")) return "success"
  if (a.includes("hospital") || a.includes("clinic") || a.includes("medical"))
    return "info"
  if (a.includes("trading") || a.includes("commodity")) return "warning"
  if (a.includes("buy") || a.includes("shop") || a.includes("store"))
    return "primary"
  return "default"
}

export function MiningLocationSummary({
  locationCode,
}: {
  locationCode: string
}) {
  const { t } = useTranslation()
  const { data, isLoading } = useGetLocationDetailQuery({ name: locationCode })
  if (isLoading || !data?.groups?.length) return null
  return (
    <Box sx={{ mt: 1 }}>
      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
        <HardwareRounded sx={{ fontSize: 13, color: "text.secondary" }} />
        <Typography variant="caption" fontWeight={600} color="text.secondary">
          {t("wiki.locationBrowser.miningResources", "Mining Resources")}
        </Typography>
      </Stack>
      {(data.groups || []).map((g) => (
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

export function LocationDetail({ node }: { node: WikiLocationNode }) {
  const { t } = useTranslation()
  const fmt = useFormatters()
  const isMineableType = ["planet", "moon"].includes(
    node.type?.toLowerCase() || "",
  )
  const miningCode = node.id?.includes(".") ? node.id.split(".").pop() : null
  const systemColor = node.jurisdiction
    ? SYSTEM_COLORS[node.jurisdiction]
    : undefined

  return (
    <Box
      sx={{ mx: 1, mb: 0.5, p: 1.5, bgcolor: "action.hover", borderRadius: 1 }}
    >
      {node.description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {node.description}
        </Typography>
      )}
      <Stack
        direction="row"
        spacing={0.5}
        flexWrap="wrap"
        useFlexGap
        sx={{ mb: 1 }}
      >
        {node.jurisdiction && (
          <Chip
            label={node.jurisdiction}
            size="small"
            sx={{
              bgcolor: systemColor,
              color: common.white,
              fontWeight: 600,
              height: 22,
              fontSize: "0.7rem",
            }}
          />
        )}
        {node.respawnType && node.respawnType !== "None" && (
          <Chip
            icon={<HotelRounded sx={{ fontSize: 14 }} />}
            label={`${t("wiki.locationBrowser.respawn", "Respawn")}: ${node.respawnType}`}
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
              {t("wiki.locationBrowser.size", "Size")}:{" "}
              {t("wikiUi.locationBrowser.kmValue", {
                value: fmt.number(node.size),
              })}
            </Typography>
          )}
          {node.qtArrivalRadius != null && (
            <Typography variant="caption" color="text.secondary">
              {t("wiki.locationBrowser.qtArrival", "QT Arrival")}:{" "}
              {t("wikiUi.locationBrowser.kmValue", {
                value: fmt.number(node.qtArrivalRadius),
              })}
            </Typography>
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
      {isMineableType && miningCode && (
        <MiningLocationSummary locationCode={miningCode} />
      )}
    </Box>
  )
}
