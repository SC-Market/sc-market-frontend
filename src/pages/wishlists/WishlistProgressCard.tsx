import { useTranslation } from "react-i18next"
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
} from "@mui/material"
import { type GetWishlistResponse } from "../../store/api/v2/market"
import { useFormatters } from "../../util/format"

/** Progress statistics for a wishlist: items acquired and estimated cost. */
export function WishlistProgressCard({
  statistics,
  fullWidth,
}: {
  statistics: GetWishlistResponse["statistics"]
  fullWidth: boolean
}) {
  const fmt = useFormatters()
  const { t } = useTranslation()
  return (
    <Grid item xs={12} lg={fullWidth ? 12 : 6}>
      <Card sx={{ height: "100%" }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              {t("wishlists.progress", "Progress")}
            </Typography>
            <Typography variant="h5" color="primary" fontWeight="bold">
              {statistics.progress_percentage}%
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={statistics.progress_percentage}
            sx={{ height: 8, borderRadius: 4, mb: 2 }}
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
              gap: 1,
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t("wishlists.totalItems", "Total Items")}
              </Typography>
              <Typography variant="h6">{statistics.total_items}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t("wishlists.completed", "Completed")}
              </Typography>
              <Typography variant="h6" color="success.main">
                {statistics.completed_items}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t("wishlists.remaining", "Remaining")}
              </Typography>
              <Typography variant="h6" color="warning.main">
                {statistics.total_items - statistics.completed_items}
              </Typography>
            </Box>
            {statistics.total_estimated_cost > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t("wishlists.estimatedCost", "Estimated Cost")}
                </Typography>
                <Typography variant="h6">
                  {fmt.number(statistics.total_estimated_cost)} aUEC
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Grid>
  )
}
