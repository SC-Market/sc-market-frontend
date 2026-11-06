import { useTranslation } from "react-i18next"
import {
  Box,
  Typography,
  Card,
  Button,
  Skeleton,
  Container,
  Grid,
  Stack,
} from "@mui/material"
import { AddRounded, StoreRounded } from "@mui/icons-material"
import { useGetMyShopsQuery } from "../../../store/api/v2/market"
import { useQuickCreateShop } from "../hooks/useShopActions"
import { usePageReady } from "../../../components/metadata/PageReady"
import { ShopManagementCard } from "./ShopManagementCard"

function LoadingSkeleton() {
  return (
    <Container maxWidth="lg" sx={{ pt: 12, pb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Skeleton variant="text" width={200} height={40} />
        <Skeleton
          variant="rectangular"
          width={140}
          height={36}
          sx={{ borderRadius: 1 }}
        />
      </Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={6} md={3} key={i}>
            <Skeleton
              variant="rectangular"
              height={80}
              sx={{ borderRadius: 2 }}
            />
          </Grid>
        ))}
      </Grid>
      {[1, 2].map((i) => (
        <Skeleton
          key={i}
          variant="rectangular"
          height={240}
          sx={{ borderRadius: 2, mb: 2 }}
        />
      ))}
    </Container>
  )
}

function EmptyState({
  onCreateClick,
  isCreating,
}: {
  onCreateClick: () => void
  isCreating: boolean
}) {
  const { t } = useTranslation()
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 10,
        textAlign: "center",
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          bgcolor: "action.hover",
          border: 1,
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <StoreRounded sx={{ fontSize: 36, color: "text.secondary" }} />
      </Box>

      <Typography variant="h5" fontWeight={600}>
        {t("shops.mine.emptyTitle")}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
        {t("shops.mine.emptyBody")}
      </Typography>

      <Card variant="outlined" sx={{ p: 2, mt: 1, textAlign: "left" }}>
        <Stack spacing={1}>
          {[
            t("shops.mine.featureBranding"),
            t("shops.mine.featureListings"),
            t("shops.mine.featureAnalytics"),
          ].map((feature) => (
            <Stack
              key={feature}
              direction="row"
              alignItems="center"
              spacing={1}
            >
              <Box
                component="span"
                sx={{ color: "primary.main", fontSize: 16, lineHeight: 1 }}
              >
                &#10003;
              </Box>
              <Typography variant="body2" color="text.secondary">
                {feature}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Card>

      <Button
        variant="contained"
        size="large"
        startIcon={<AddRounded />}
        onClick={onCreateClick}
        disabled={isCreating}
        sx={{ mt: 1 }}
      >
        {t("shops.mine.createFirst")}
      </Button>
    </Box>
  )
}

export function MyShops() {
  const { t } = useTranslation()
  const { data: shops, isLoading } = useGetMyShopsQuery()
  usePageReady(isLoading)
  const { create: quickCreate, isLoading: isCreating } = useQuickCreateShop()

  const handleQuickCreate = async () => {
    await quickCreate()
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <Container maxWidth="lg" sx={{ pt: 12, pb: 4 }}>
      {/* Page header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ textTransform: "uppercase", letterSpacing: "0.03em" }}
          >
            {t("shops.mine.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t("shops.mine.subtitle")}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddRounded />}
          onClick={handleQuickCreate}
          disabled={isCreating}
        >
          {t("shops.mine.create")}
        </Button>
      </Box>

      {/* Empty state */}
      {shops && shops.length === 0 && (
        <EmptyState onCreateClick={handleQuickCreate} isCreating={isCreating} />
      )}

      {/* Summary stats bar */}

      {/* Shop management cards */}
      {shops?.map((shop) => (
        <ShopManagementCard key={shop.shop_id} shop={shop} />
      ))}
    </Container>
  )
}
