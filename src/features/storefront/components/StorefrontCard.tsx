import React from "react"
import { Avatar, Box, Chip, Paper, Stack, Typography } from "@mui/material"
import VerifiedRounded from "@mui/icons-material/VerifiedRounded"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import type { StorefrontCard as StorefrontCardData } from "../../../store/api/v2/market"
import { ORG_PATHS, SHOP_PATHS } from "../../../routes/paths"
import { ratingLabel } from "../domain"

/** Fixed card height, so the hub and the homepage row never shift. */
export const STOREFRONT_CARD_HEIGHT = 168

/**
 * One org in the Storefronts hub (and the homepage row): a link to its
 * storefront. A service-only org (services, no listings) is tagged
 * "Services" and links to its shop's services.
 */
export function StorefrontCard(props: { storefront: StorefrontCardData }) {
  const { t } = useTranslation()
  const s = props.storefront
  const rating = ratingLabel(s.avg_rating)
  const serviceOnly = s.active_listings === 0 && s.active_services > 0
  const to =
    serviceOnly && s.services_shop_slug
      ? SHOP_PATHS.profileTab(s.services_shop_slug, "services")
      : ORG_PATHS.profile(s.spectrum_id)
  return (
    <Paper
      component={Link}
      to={to}
      sx={{
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        height: STOREFRONT_CARD_HEIGHT,
        textDecoration: "none",
        overflow: "hidden",
      }}
      data-testid="storefront-card"
    >
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{ minWidth: 0 }}
      >
        <Avatar
          src={s.logo_url ?? undefined}
          alt=""
          variant="rounded"
          sx={{ width: 44, height: 44 }}
        />
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography color="text.secondary" fontWeight={700} noWrap>
              {s.name}
            </Typography>
            <VerifiedRounded
              color="primary"
              sx={{ fontSize: 16 }}
              titleAccess={t("storefront.verified.label", "Verified org")}
            />
          </Stack>
          <Typography
            variant="caption"
            color="text.primary"
            noWrap
            component="p"
          >
            {[
              s.active_listings > 0 || s.active_services === 0
                ? t("storefront.embed.listings", {
                    n: s.active_listings,
                    defaultValue: "{{n}} listings",
                  })
                : null,
              s.active_services > 0
                ? t("storefront.embed.services", {
                    n: s.active_services,
                    defaultValue: "{{n}} services",
                  })
                : null,
              s.completed_orders > 0
                ? t("storefront.embed.completed", {
                    n: s.completed_orders,
                    defaultValue: "{{n}} completed orders",
                  })
                : null,
              rating ? `${rating}★` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </Typography>
        </Box>
      </Stack>
      <Typography
        variant="body2"
        color="text.primary"
        sx={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {s.tagline}
      </Typography>
      <Stack
        direction="row"
        spacing={0.5}
        sx={{ mt: "auto", overflow: "hidden" }}
      >
        {serviceOnly && (
          <Chip
            label={t("storefront.hub.servicesTag", "Services")}
            size="small"
            color="primary"
            variant="outlined"
            data-testid="storefront-card-services-tag"
          />
        )}
        {s.fields.slice(0, serviceOnly ? 2 : 3).map((field) => (
          <Chip
            key={field}
            label={field}
            size="small"
            variant="outlined"
            sx={{ textTransform: "capitalize" }}
          />
        ))}
      </Stack>
    </Paper>
  )
}
