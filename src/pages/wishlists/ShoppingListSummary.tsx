import { Box, Typography, Card, CardContent, Stack, Grid } from "@mui/material"
import { ImageAvatar } from "../../components/avatar/ImageAvatar"
import {
  ShoppingCartRounded,
  CheckCircleRounded,
  WarningRounded,
  CancelRounded,
} from "@mui/icons-material"
import { type ShoppingListResponse } from "../../store/api/v2/market"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

/** Counts of materials needed, fully, partly and not stocked. */
export function ShoppingListSummary({
  data,
  materialCount,
}: {
  data: ShoppingListResponse
  materialCount: number
}) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <ImageAvatar alt="" sx={{ bgcolor: theme.palette.primary.main }}>
                <ShoppingCartRounded />
              </ImageAvatar>
              <Box>
                <Typography variant="h4">{materialCount}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("shoppingListUi.totalMaterials")}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <ImageAvatar alt="" sx={{ bgcolor: theme.palette.success.main }}>
                <CheckCircleRounded />
              </ImageAvatar>
              <Box>
                <Typography variant="h4">
                  {data.materials_fully_stocked}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("shoppingListUi.fullyStocked")}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <ImageAvatar alt="" sx={{ bgcolor: theme.palette.warning.main }}>
                <WarningRounded />
              </ImageAvatar>
              <Box>
                <Typography variant="h4">
                  {data.materials_partially_stocked}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("shoppingListUi.partiallyStocked")}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <ImageAvatar alt="" sx={{ bgcolor: theme.palette.error.main }}>
                <CancelRounded />
              </ImageAvatar>
              <Box>
                <Typography variant="h4">
                  {data.materials_not_stocked}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("shoppingListUi.notStocked")}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
