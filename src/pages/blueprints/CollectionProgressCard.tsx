import {
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  LinearProgress,
} from "@mui/material"
import { useGetUserBlueprintInventoryQuery } from "../../store/api/v2/market"
import { useTranslation } from "react-i18next"

export function CollectionProgressCard() {
  const { t } = useTranslation()
  const { data } = useGetUserBlueprintInventoryQuery({ page: 1, pageSize: 1 })
  const stats = data?.statistics
  if (!stats) return null
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Typography variant="subtitle2" gutterBottom>
          {t("blueprintsUi.browser.collectionProgress")}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 0.5 }}>
          <Box sx={{ flex: 1 }}>
            <LinearProgress
              variant="determinate"
              value={stats.completion_percentage}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ minWidth: 80 }}
          >
            {stats.completion_percentage.toFixed(1)}%
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          {t("blueprintsUi.browser.collectionCount", {
            owned: stats.total_owned,
            count: stats.total_available,
          })}
        </Typography>
        {stats.recently_acquired_count > 0 && (
          <Chip
            label={t("blueprintsUi.browser.newThisWeek", {
              count: stats.recently_acquired_count,
            })}
            size="small"
            color="primary"
            sx={{ ml: 1, height: 18, fontSize: "0.65rem" }}
          />
        )}
      </CardContent>
    </Card>
  )
}
