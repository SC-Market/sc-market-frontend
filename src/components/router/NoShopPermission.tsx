import React from "react"
import { Link as RouterLink } from "react-router-dom"
import { Button, Grid } from "@mui/material"
import { LockRounded } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { EmptyState } from "../empty-states"
import { ContainerGrid } from "../layout/ContainerGrid"
import { usePageReady } from "../metadata/PageReady"
import { SHOP_PATHS } from "../../routes/paths"
import type { ShopSection } from "../../features/shops/domain/shopPermissions"

/**
 * Shown by ShopContextFromRoute when the user is in the shop's org but their
 * roles don't grant the page's permission (canOpenShopSection): says so and
 * links to the shop page, instead of a page whose actions all fail. Nothing
 * to load, so the page is ready on mount (like NoOrgPermission).
 */
export function NoShopPermission(props: {
  section: ShopSection
  shop: { slug: string; name: string }
}) {
  const { section, shop } = props
  usePageReady(false)
  const { t } = useTranslation()

  return (
    <ContainerGrid sidebarOpen maxWidth="md">
      <Grid item xs={12}>
        <EmptyState
          title={t(`emptyStates.noShopPermission.titles.${section}`)}
          description={t("emptyStates.noShopPermission.description")}
          icon={<LockRounded />}
        >
          <Button
            component={RouterLink}
            to={SHOP_PATHS.profile(shop.slug)}
            variant="contained"
            size="large"
          >
            {t("emptyStates.noShopPermission.backToShop", { shop: shop.name })}
          </Button>
        </EmptyState>
      </Grid>
    </ContainerGrid>
  )
}
