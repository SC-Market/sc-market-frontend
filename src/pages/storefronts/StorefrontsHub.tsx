import React, { useMemo, useState } from "react"
import { Box, Button, Chip, Grid, Skeleton, Stack, Typography } from "@mui/material"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { useGetStorefrontsQuery } from "../../store/api/v2/market"
import { StorefrontCard, STOREFRONT_CARD_HEIGHT } from "../../features/storefront/components/StorefrontCard"
import { EnquireBrandedStorefront } from "../../features/storefront/components/EnquireBrandedStorefront"
import { PATHS } from "../../routes/paths"
import { storefrontsSeoText } from "../../seo/hubHeads"
import { usePageReady } from "../../components/metadata/PageReady"

/**
 * /storefronts: verified orgs' storefronts (backend: RSI-verified, at least
 * one public listing; showcase orgs first). Prerendered at build time with
 * that list (src/prerender/paths.ts); the browser revalidates it on mount.
 */
export function StorefrontsHub() {
  const { t } = useTranslation()
  const seo = storefrontsSeoText(t)
  const { data, isLoading } = useGetStorefrontsQuery(undefined, { refetchOnMountOrArgChange: true })
  usePageReady(isLoading)
  const [field, setField] = useState<string | null>(null)
  const storefronts = data?.storefronts ?? []

  const fields = useMemo(() => {
    const counts = new Map<string, number>()
    for (const s of storefronts) for (const f of s.fields) counts.set(f, (counts.get(f) ?? 0) + 1)
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 10).map(([f]) => f)
  }, [storefronts])
  const shown = field ? storefronts.filter((s) => s.fields.includes(field)) : storefronts

  return (
    <StandardPageLayout title={seo.title} description={seo.description} headerTitle={seo.title} sidebarOpen maxWidth="lg">
      <Grid item xs={12}>
        <Stack spacing={2}>
          <Typography color="text.primary">
            {t(
              "storefront.hub.intro",
              "Shops, services and recruiting from verified Star Citizen orgs, each on one page. Orders go straight to the org.",
            )}
          </Typography>
          {fields.length > 1 && (
            <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} aria-label={t("storefront.hub.filter", "Filter by focus")}>
              <Chip
                label={t("storefront.hub.all", "All")}
                color={field === null ? "primary" : "default"}
                onClick={() => setField(null)}
              />
              {fields.map((f) => (
                <Chip
                  key={f}
                  label={f}
                  sx={{ textTransform: "capitalize" }}
                  color={field === f ? "primary" : "default"}
                  onClick={() => setField(field === f ? null : f)}
                />
              ))}
            </Stack>
          )}
          <Box
            sx={{
              display: "grid",
              gap: 1.5,
              gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" },
            }}
          >
            {isLoading
              ? Array.from({ length: 6 }, (_, i) => <Skeleton key={i} variant="rounded" height={STOREFRONT_CARD_HEIGHT} />)
              : shown.map((s) => <StorefrontCard key={s.spectrum_id} storefront={s} />)}
          </Box>
          {!isLoading && storefronts.length === 0 && (
            <Typography color="text.primary">{t("storefront.hub.empty", "No storefronts yet.")}</Typography>
          )}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }} sx={{ pt: 2 }}>
            <Typography color="text.primary">
              {t("storefront.hub.yourOrg", "Run an org? Verify it, open a shop and it can be listed here.")}
            </Typography>
            <Button component={Link} to={PATHS.orgRegister} variant="outlined" size="small">
              {t("storefront.hub.register", "Register your org")}
            </Button>
            <EnquireBrandedStorefront variant="text" />
          </Stack>
        </Stack>
      </Grid>
    </StandardPageLayout>
  )
}

export default StorefrontsHub
