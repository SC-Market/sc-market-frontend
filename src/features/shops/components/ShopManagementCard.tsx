import { Link as RouterLink } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  useTheme,
} from "@mui/material"
import { ImageAvatar } from "../../../components/avatar/ImageAvatar"
import {
  PersonRounded,
  GroupsRounded,
  CalendarTodayRounded,
} from "@mui/icons-material"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import type { ShopResponse } from "../../../store/api/v2/market"
import { SHOP_PATHS } from "../../../routes/paths"
import { useFormatters } from "../../../util/format"

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

export function ShopManagementCard({ shop }: { shop: ShopResponse }) {
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
            component={RouterLink}
            to={SHOP_PATHS.profile(shop.slug)}
          >
            {t("shops.mine.viewShop")}
          </Button>
          {shop.permissions?.can_manage && (
            <Button
              variant="contained"
              size="small"
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
