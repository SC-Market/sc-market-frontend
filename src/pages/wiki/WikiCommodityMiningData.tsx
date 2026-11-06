import {
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
  Stack,
  Divider,
} from "@mui/material"
import { useTranslation } from "react-i18next"
import {
  CheckCircleRounded,
  CancelRounded,
  HardwareRounded,
} from "@mui/icons-material"
import { useSearchOresQuery } from "../../store/api/v2/market"

export function BoolChip({ value, label }: { value: boolean; label: string }) {
  return (
    <Chip
      icon={
        value ? (
          <CheckCircleRounded sx={{ fontSize: 14 }} />
        ) : (
          <CancelRounded sx={{ fontSize: 14 }} />
        )
      }
      label={label}
      size="small"
      color={value ? "success" : "default"}
      variant={value ? "filled" : "outlined"}
      sx={{ height: 22, fontSize: "0.7rem" }}
    />
  )
}

export function MiningDataSection({ resourceName }: { resourceName: string }) {
  const { t } = useTranslation()
  // Search for ores matching this resource name
  const { data } = useSearchOresQuery({ text: resourceName, pageSize: 5 })
  const ores = data?.ores || []
  if (!ores.length) return null

  const ore = ores[0]
  return (
    <Grid item xs={12} md={6}>
      <Card>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            <HardwareRounded
              sx={{ fontSize: 16, mr: 0.5, verticalAlign: "text-bottom" }}
            />
            {t("wiki.commodityDetail.miningStats", "Mining Stats")}
          </Typography>
          <Stack spacing={0.5}>
            {ore.instability != null && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">
                  {t("wiki.commodityDetail.instability", "Instability")}
                </Typography>
                <Typography variant="caption" fontWeight={600}>
                  {ore.instability}
                </Typography>
              </Stack>
            )}
            {ore.resistance != null && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">
                  {t("wiki.commodityDetail.resistance", "Resistance")}
                </Typography>
                <Typography variant="caption" fontWeight={600}>
                  {ore.resistance}
                </Typography>
              </Stack>
            )}
            {ore.explosionMultiplier != null && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">
                  {t("wiki.commodityDetail.explosionRisk", "Explosion Risk")}
                </Typography>
                <Typography variant="caption" fontWeight={600}>
                  {ore.explosionMultiplier}
                </Typography>
              </Stack>
            )}
            {(ore.topLocations?.length ?? 0) > 0 && (
              <>
                <Divider sx={{ my: 0.5 }} />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                >
                  {t("wiki.commodityDetail.bestLocations", "Best Locations")}
                </Typography>
                {(ore.topLocations || []).map((loc) => (
                  <Stack
                    key={loc.name}
                    direction="row"
                    justifyContent="space-between"
                  >
                    <Typography variant="caption">{loc.name}</Typography>
                    <Typography variant="caption" color="primary">
                      {loc.probability?.toFixed(1)}%
                    </Typography>
                  </Stack>
                ))}
              </>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  )
}
