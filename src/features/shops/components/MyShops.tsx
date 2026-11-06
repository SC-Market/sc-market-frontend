import { Link as RouterLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Skeleton,
  Container,
  Grid,
  Chip,
  Stack,
  useTheme,
} from "@mui/material"
import { ImageAvatar } from "../../../components/avatar/ImageAvatar"
import {
  AddRounded,
  StoreRounded,
  PersonRounded,
  GroupsRounded,
  VisibilityRounded,
  SettingsRounded,
  CalendarTodayRounded,
} from "@mui/icons-material"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { useGetMyShopsQuery } from "../../../store/api/v2/market"
import { useQuickCreateShop } from "../hooks/useShopActions"
import type { ShopResponse } from "../../../store/api/v2/market"
import { SHOP_PATHS } from "../../../routes/paths"
import { usePageReady } from "../../../components/metadata/PageReady"
import { useFormatters } from "../../../util/format"

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

function ShopManagementCard({ shop }: { shop: ShopResponse }) {
  const fmt = useFormatters()
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const isPersonal = !shop.is_org_owned

  return (
    <Card
      sx={{
        mb: 2,
        transition: "all 0.25s ease",
        position: "relative",
        overflow: "visible",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: `0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px ${theme.palette.primary.main}22`,
          transform: "translateY(-2px)",
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: theme.palette.primary.main,
          opacity: 0,
          transition: "opacity 0.25s ease",
          borderRadius: "4px 4px 0 0",
        },
        "&:hover::before": {
          opacity: 1,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header: Logo + Name + Status + Owner badge */}
        <Box
          sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2.5 }}
        >
          <ImageAvatar
            alt=""
            src={shop.logo_url || undefined}
            variant="rounded"
            sx={{
              width: 64,
              height: 64,
              fontSize: "1.5rem",
              fontWeight: 700,
              bgcolor: "primary.dark",
            }}
          >
            {getInitials(shop.name)}
          </ImageAvatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 0.5 }}
            >
              <Typography variant="h5" fontWeight={700} noWrap>
                {shop.name}
              </Typography>
              <Chip
                label={
                  shop.status === "active"
                    ? t("shops.mine.active")
                    : shop.status
                }
                size="small"
                color={shop.status === "active" ? "success" : "default"}
                variant="outlined"
                sx={{ fontWeight: 600, textTransform: "capitalize" }}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              /shops/{shop.slug}
            </Typography>
          </Box>

          <Chip
            icon={isPersonal ? <PersonRounded /> : <GroupsRounded />}
            label={
              isPersonal
                ? t("shops.mine.personal")
                : t("shops.mine.organization")
            }
            size="small"
            variant="outlined"
            sx={{ flexShrink: 0 }}
          />
        </Box>

        {/* Stats row */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
            gap: 1.5,
            mb: 2.5,
            p: 2,
            bgcolor: "action.hover",
            borderRadius: 2,
            border: 1,
            borderColor: "divider",
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" fontWeight={700} color="primary.main">
              {shop.tags.length}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
            >
              {t("shops.mine.tags")}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" fontWeight={700}>
              {shop.supported_languages.length}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
            >
              {t("shops.mine.languages")}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" fontWeight={700}>
              {shop.accepts_custom_orders
                ? t("shops.mine.yes")
                : t("shops.mine.no")}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
            >
              {t("shops.mine.customOrders")}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" fontWeight={700}>
              {shop.status === "active" ? t("shops.mine.live") : shop.status}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
            >
              {t("shops.mine.status")}
            </Typography>
          </Box>
        </Box>

        {/* Action buttons */}
        <Stack
          direction="row"
          spacing={1}
          sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}
        >
          <Button
            variant="outlined"
            size="small"
            startIcon={<VisibilityRounded />}
            component={RouterLink}
            to={SHOP_PATHS.profile(shop.slug)}
          >
            {t("shops.mine.viewShop")}
          </Button>
          {shop.permissions?.can_manage && (
            <Button
              variant="contained"
              size="small"
              startIcon={<SettingsRounded />}
              component={RouterLink}
              to={SHOP_PATHS.settings(shop.slug)}
            >
              {t("shops.mine.manage")}
            </Button>
          )}
        </Stack>

        {/* Footer: Tags + Created date */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pt: 2,
            borderTop: 1,
            borderColor: "divider",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ flexWrap: "wrap", gap: 0.5 }}
          >
            {shop.tags.length > 0 ? (
              shop.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{ textTransform: "capitalize", fontSize: "0.7rem" }}
                />
              ))
            ) : (
              <Typography
                variant="caption"
                color="text.secondary"
                fontStyle="italic"
              >
                {t("shops.mine.noTags")}
              </Typography>
            )}
          </Stack>

          <Stack direction="row" alignItems="center" spacing={0.5}>
            <CalendarTodayRounded
              sx={{ fontSize: 14, color: "text.secondary" }}
            />
            <Typography variant="caption" color="text.secondary">
              {t("shops.mine.created", {
                date: fmt.date(shop.created_at, {
                  month: "short",
                  year: "numeric",
                }),
              })}
            </Typography>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  )
}

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
