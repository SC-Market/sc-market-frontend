import { Card, CardContent, CardHeader, Grid, Stack } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import {
  PageHeaderRowSkeleton,
  StandardPageLayout,
} from "../layout/StandardPageLayout"
import type { ExtendedTheme } from "../../hooks/styles/Theme"
import { MARKET_PATHS } from "../../routes/paths"
import { BaseSkeleton } from "./BaseSkeleton"

/**
 * Body of the listing detail page (features/market/v2/ListingDetailV2) while
 * the listing loads: the breadcrumb and title rows, then the image (4/12 from lg) beside the
 * main card (8/12, min 400px tall), stacked below lg.
 */
export function ListingDetailContentSkeleton({
  withBreadcrumbs = true,
}: {
  /** False for pages that already draw their breadcrumbs while loading. */
  withBreadcrumbs?: boolean
} = {}) {
  const theme = useTheme<ExtendedTheme>()

  return (
    <>
      {/* Breadcrumbs: while loading the page has only "Market", which
          PageBreadcrumbs doesn't draw; once loaded it has 2-4 crumbs */}
      {withBreadcrumbs && (
        <Grid item xs={12}>
          <BaseSkeleton variant="text" width={280} height={24} />
        </Grid>
      )}
      <PageHeaderRowSkeleton width="45%" />
      <Grid item xs={12}>
        <Grid container spacing={theme.layoutSpacing.layout}>
          <Grid item xs={12} lg={4}>
            {/* ImagePreviewPaper is a fixed 400px box */}
            <BaseSkeleton
              variant="rectangular"
              height={400}
              sx={{
                borderRadius: theme.spacing(theme.borderRadius.image),
              }}
            />
          </Grid>
          <Grid item xs={12} lg={8}>
            <Card sx={{ minHeight: 400 }}>
              <CardHeader
                disableTypography
                title={
                  <Stack spacing={theme.layoutSpacing.text}>
                    <BaseSkeleton variant="text" width={220} height={20} />
                    <BaseSkeleton variant="text" width="60%" height={32} />
                  </Stack>
                }
                subheader={
                  <Stack spacing={0.5} sx={{ mt: 1 }}>
                    {[40, 35, 45, 30].map((w, i) => (
                      <BaseSkeleton
                        key={i}
                        variant="text"
                        width={`${w}%`}
                        height={24}
                      />
                    ))}
                  </Stack>
                }
              />
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={1.5}>
                  <BaseSkeleton variant="text" width="30%" height={40} />
                  <BaseSkeleton variant="text" width="90%" height={20} />
                  <BaseSkeleton variant="text" width="80%" height={20} />
                  <BaseSkeleton
                    variant="rectangular"
                    width={200}
                    height={42}
                    sx={{ borderRadius: 1 }}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

/**
 * Body of the aggregate page (MarketAggregateViewV2Admin) while the item's
 * listings load. The page draws its breadcrumbs while loading, but its title
 * row only once the item is known. Sizes are the loaded page's at lg: the
 * 300px item image (4/12) beside the market overview (8/12), then the sell
 * and buy order books side by side (472px), the order depth chart and the
 * buy order form.
 */
export function MarketAggregateContentSkeleton({
  withBreadcrumbs = false,
}: {
  withBreadcrumbs?: boolean
} = {}) {
  const theme = useTheme<ExtendedTheme>()
  const block = (height: number) => (
    <BaseSkeleton
      variant="rectangular"
      height={height}
      sx={{ borderRadius: theme.spacing(theme.borderRadius.topLevel) }}
    />
  )

  return (
    <>
      {withBreadcrumbs && (
        <Grid item xs={12}>
          <BaseSkeleton variant="text" width={280} height={24} />
        </Grid>
      )}
      <PageHeaderRowSkeleton width="45%" />
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} lg={4}>
            {/* The item image paper is a fixed 300px box */}
            <BaseSkeleton
              variant="rectangular"
              height={300}
              sx={{ borderRadius: theme.spacing(theme.borderRadius.image) }}
            />
          </Grid>
          <Grid item xs={12} lg={8}>
            {block(300)}
          </Grid>
          <Grid item xs={12} lg={6}>
            {block(472)}
          </Grid>
          <Grid item xs={12} lg={6}>
            {block(472)}
          </Grid>
          <Grid item xs={12}>
            {block(279)}
          </Grid>
          <Grid item xs={12}>
            {block(530)}
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

/**
 * Route skeleton for /market/aggregate/:id: the "Market" breadcrumb frame
 * (not drawn) around MarketAggregateContentSkeleton.
 */
export function MarketAggregateSkeleton() {
  const { t } = useTranslation()
  return (
    <StandardPageLayout
      noFooter
      breadcrumbs={[
        {
          label: t("sidebar.market_short", "Market"),
          href: MARKET_PATHS.search,
        },
      ]}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <MarketAggregateContentSkeleton withBreadcrumbs />
    </StandardPageLayout>
  )
}

/**
 * Route skeleton for /market/:id (and the aggregate / multiple views, which
 * share the frame): StandardPageLayout with the "Market" breadcrumb the page
 * starts with, around ListingDetailContentSkeleton.
 */
export function MarketListingDetailSkeleton() {
  const { t } = useTranslation()
  return (
    <StandardPageLayout
      noFooter
      breadcrumbs={[
        {
          label: t("sidebar.market_short", "Market"),
          href: MARKET_PATHS.search,
        },
      ]}
      sidebarOpen={true}
      maxWidth="xl"
    >
      <ListingDetailContentSkeleton />
    </StandardPageLayout>
  )
}
