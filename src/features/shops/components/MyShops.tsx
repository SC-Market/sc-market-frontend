import { Link as RouterLink } from "react-router-dom"
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  Skeleton,
  Container,
  Grid,
  Chip,
  Stack,
  useTheme,
} from "@mui/material"
import {
  Add,
  Store,
  Person,
  Groups,
  Visibility,
  Settings,
  CalendarToday,
} from "@mui/icons-material"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { useGetMyShopsQuery, useQuickCreateShopMutation } from "../../../store/api/v2/market"
import type { ShopResponse } from "../../../store/api/v2/market"

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString(undefined, { month: "short", year: "numeric" })
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

function SummaryStatsBar({ shops }: { shops: ShopResponse[] }) {
  const theme = useTheme<ExtendedTheme>()
  const totalShops = shops.length
  const activeShops = shops.filter((s) => s.status === "active").length

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[
        { label: "Total Shops", value: totalShops.toString() },
        { label: "Active Shops", value: activeShops.toString(), color: "success.main" },
        { label: "Custom Orders", value: shops.filter((s) => s.accepts_custom_orders).length.toString() },
        { label: "Languages", value: [...new Set(shops.flatMap((s) => s.supported_languages))].length.toString(), color: "secondary.main" },
      ].map((stat) => (
        <Grid item xs={6} md={3} key={stat.label}>
          <Card
            variant="outlined"
            sx={{
              p: 2,
              transition: "border-color 0.2s",
              "&:hover": { borderColor: theme.palette.divider },
            }}
          >
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ fontSize: "0.7rem", letterSpacing: "0.1em" }}
            >
              {stat.label}
            </Typography>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ color: stat.color || "text.primary", lineHeight: 1.2 }}
            >
              {stat.value}
            </Typography>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

function ShopManagementCard({ shop }: { shop: ShopResponse }) {
  const theme = useTheme<ExtendedTheme>()
  const isPersonal = !shop.owner_contractor_id

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
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
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
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2.5 }}>
          <Avatar
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
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
              <Typography variant="h5" fontWeight={700} noWrap>
                {shop.name}
              </Typography>
              <Chip
                label={shop.status === "active" ? "Active" : shop.status}
                size="small"
                color={shop.status === "active" ? "success" : "default"}
                variant="outlined"
                sx={{ fontWeight: 600, textTransform: "capitalize" }}
              />
            </Stack>
            <Typography
              variant="body2"
              color="text.secondary"
              
            >
              /shops/{shop.slug}
            </Typography>
          </Box>

          <Chip
            icon={isPersonal ? <Person /> : <Groups />}
            label={isPersonal ? "Personal" : "Organization"}
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
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Tags
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" fontWeight={700}>
              {shop.supported_languages.length}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Languages
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" fontWeight={700}>
              {shop.accepts_custom_orders ? "Yes" : "No"}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Custom Orders
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" fontWeight={700}>
              {shop.status === "active" ? "Live" : shop.status}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Status
            </Typography>
          </Box>
        </Box>

        {/* Action buttons */}
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Visibility />}
            component={RouterLink}
            to={`/shops/${shop.slug}`}
          >
            View Shop
          </Button>
          {shop.permissions?.can_manage && (
            <Button
              variant="contained"
              size="small"
              startIcon={<Settings />}
              component={RouterLink}
              to={`/shop/${shop.slug}/settings`}
            >
              Manage
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
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", gap: 0.5 }}>
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
              <Typography variant="caption" color="text.secondary" fontStyle="italic">
                No tags yet
              </Typography>
            )}
          </Stack>

          <Stack direction="row" alignItems="center" spacing={0.5}>
            <CalendarToday sx={{ fontSize: 14, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary">
              Created {formatDate(shop.created_at)}
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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Skeleton variant="text" width={200} height={40} />
        <Skeleton variant="rectangular" width={140} height={36} sx={{ borderRadius: 1 }} />
      </Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={6} md={3} key={i}>
            <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
          </Grid>
        ))}
      </Grid>
      {[1, 2].map((i) => (
        <Skeleton key={i} variant="rectangular" height={240} sx={{ borderRadius: 2, mb: 2 }} />
      ))}
    </Container>
  )
}

function EmptyState({ onCreateClick, isCreating }: { onCreateClick: () => void; isCreating: boolean }) {
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
        <Store sx={{ fontSize: 36, color: "text.secondary" }} />
      </Box>

      <Typography variant="h5" fontWeight={600}>
        You don&apos;t have any shops yet
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
        Create a shop to start selling on SC Market. Set up your storefront in minutes.
      </Typography>

      <Card variant="outlined" sx={{ p: 2, mt: 1, textAlign: "left" }}>
        <Stack spacing={1}>
          {[
            "Custom branding with banner and logo",
            "List items, services, and bundles",
            "Track sales, reviews, and analytics",
          ].map((feature) => (
            <Stack key={feature} direction="row" alignItems="center" spacing={1}>
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
        startIcon={<Add />}
        onClick={onCreateClick}
        disabled={isCreating}
        sx={{ mt: 1 }}
      >
        Create Your First Shop
      </Button>
    </Box>
  )
}

export function MyShops() {
  const { data: shops, isLoading } = useGetMyShopsQuery()
  const [quickCreate, { isLoading: isCreating }] = useQuickCreateShopMutation()

  const handleQuickCreate = async () => {
    await quickCreate({ quickCreateShopRequest: { owner_type: "user" } })
  }

  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <Container maxWidth="lg" sx={{ pt: 12, pb: 4 }}>
      {/* Page header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ textTransform: "uppercase", letterSpacing: "0.03em" }}>
            My Shops
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage your shops, listings, and orders
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleQuickCreate}
          disabled={isCreating}
        >
          Create Shop
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
