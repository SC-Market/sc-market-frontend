import React from "react"
import {
  Box,
  Button,
  Chip,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material"
import { Helmet } from "@unhead/react/helmet"
import { Link, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"
import { useGetStorefrontsQuery } from "../../store/api/v2/market"
import {
  StorefrontCard,
  STOREFRONT_CARD_HEIGHT,
} from "../../features/storefront/components/StorefrontCard"
import { EnquireBrandedStorefront } from "../../features/storefront/components/EnquireBrandedStorefront"
import {
  STOREFRONTS_PAGE_SIZE,
  storefrontsHubArgs,
} from "../../features/storefront/domain"
import { PATHS } from "../../routes/paths"
import { storefrontsSeoText } from "../../seo/hubHeads"
import { pagedPath } from "../../seo/queryIndexing"
import {
  CARD_GRID_PAGE_SIZE_OPTIONS,
  NumberedPagination,
  parsePageSize,
} from "../../components/pagination/NumberedPagination"
import { usePageReady } from "../../components/metadata/PageReady"
import { isPrimaryLoading } from "../../components/metadata/pageReadyStore"
import { FRONTEND_URL } from "../../util/constants"
import { HelpLink } from "../../features/help/components/HelpLink"
import { scrollPageToTop } from "../../components/layout/pageScroll"

/**
 * /storefronts: verified orgs' storefronts (backend: RSI-verified, a public
 * listing or an active service; showcase orgs first), a page at a time.
 * The page is in the URL (?page=N, like /shops), so each page has its own
 * crawlable, self-canonical URL (src/seo/queryIndexing.ts); the focus
 * filter (?field=) is a noindex variant. Page 1 is prerendered at build time
 * (src/prerender/paths.ts); the browser revalidates it on mount.
 */
export function StorefrontsHub() {
  const { t } = useTranslation()
  const seo = storefrontsSeoText(t)
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number(searchParams.get("page")) || 1)
  const field = searchParams.get("field") || null
  const pageSize = parsePageSize(
    searchParams.get("page_size"),
    CARD_GRID_PAGE_SIZE_OPTIONS,
    STOREFRONTS_PAGE_SIZE,
  )
  const { data, isLoading, isFetching, currentData } = useGetStorefrontsQuery(
    storefrontsHubArgs(page, field, pageSize),
    {
      refetchOnMountOrArgChange: true,
    },
  )
  usePageReady(isPrimaryLoading({ isLoading, isFetching, currentData }))
  const storefronts = data?.storefronts ?? []
  const fields = data?.fields ?? []
  const totalPages = data ? Math.ceil(data.total / pageSize) : 0

  const setPage = (next: number) => {
    const params = new URLSearchParams(searchParams)
    if (next > 1) params.set("page", String(next))
    else params.delete("page")
    setSearchParams(params, { replace: next === 1 })
  }
  const setPageSize = (size: number) => {
    const params = new URLSearchParams(searchParams)
    params.delete("page")
    if (size !== STOREFRONTS_PAGE_SIZE) params.set("page_size", String(size))
    else params.delete("page_size")
    setSearchParams(params)
  }
  // A new filter starts on its first page.
  const setField = (next: string | null) =>
    setSearchParams(next ? { field: next } : {})

  return (
    <StandardPageLayout
      title={seo.title}
      description={seo.description}
      headerTitle={seo.title}
      sidebarOpen
      maxWidth="lg"
    >
      {/* Only the bare ?page=N pages are indexable, so only they link up (prev/next). */}
      {!field && (
        <Helmet>
          {page > 1 && (
            <link
              rel="prev"
              href={`${FRONTEND_URL}${pagedPath(PATHS.storefronts, page - 1)}`}
            />
          )}
          {page < totalPages && (
            <link
              rel="next"
              href={`${FRONTEND_URL}${pagedPath(PATHS.storefronts, page + 1)}`}
            />
          )}
        </Helmet>
      )}
      <Grid item xs={12}>
        <Stack spacing={2}>
          <Typography color="text.primary">
            {t(
              "storefront.hub.intro",
              "Shops, services and recruiting from verified Star Citizen orgs, each on one page. Orders go straight to the org.",
            )}
          </Typography>
          {fields.length > 1 && (
            <Stack
              direction="row"
              flexWrap="wrap"
              useFlexGap
              spacing={1}
              aria-label={t("storefront.hub.filter", "Filter by focus")}
            >
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
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(3, minmax(0, 1fr))",
              },
            }}
          >
            {isLoading
              ? Array.from({ length: 6 }, (_, i) => (
                  <Skeleton
                    key={i}
                    variant="rounded"
                    height={STOREFRONT_CARD_HEIGHT}
                  />
                ))
              : storefronts.map((s) => (
                  <StorefrontCard key={s.spectrum_id} storefront={s} />
                ))}
          </Box>
          {!isLoading && storefronts.length === 0 && (
            <Typography color="text.primary">
              {t("storefront.hub.empty", "No storefronts yet.")}
            </Typography>
          )}
          {data && data.total > 0 && (
            <NumberedPagination
              count={data.total}
              page={page - 1}
              rowsPerPage={pageSize}
              onPageChange={(newPage) => {
                setPage(newPage + 1)
                scrollPageToTop()
              }}
              rowsPerPageOptions={CARD_GRID_PAGE_SIZE_OPTIONS}
              onRowsPerPageChange={setPageSize}
              link={{ path: PATHS.storefronts, searchParams }}
            />
          )}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ sm: "center" }}
            sx={{ pt: 2 }}
          >
            <Typography color="text.primary">
              {t(
                "storefront.hub.yourOrg",
                "Run an org? Verify it, open a shop and it can be listed here.",
              )}
            </Typography>
            <HelpLink guide="storefrontDirectory" />
            <Button
              component={Link}
              to={PATHS.orgRegister}
              variant="outlined"
              size="small"
            >
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
