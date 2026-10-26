import React from "react"
import { Grid, Skeleton } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { MetricSection } from "../../views/orders/OrderMetrics"

/**
 * The weekly stats row while loading: the same MetricSections with their real
 * (static) titles, and a text skeleton in place of each number.
 */
export function OrderStatisticsSkeleton() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  return (
    <Grid
      container
      spacing={theme.layoutSpacing.layout}
      justifyContent={"center"}
    >
      <MetricSection
        title={t("landing.ordersThisWeek")}
        body={<Skeleton width="4ch" />}
      />
      <MetricSection
        title={t("landing.valueOfOrdersThisWeek")}
        body={<Skeleton width="14ch" />}
      />
    </Grid>
  )
}
