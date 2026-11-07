/**
 * StockManagerV2: the shop's Listings page (/shop/:slug/listings, "Manage
 * Listings"). One row per listing, with quick edits of price, status and
 * quantity. Not the Stock page: the shop's stock lots are managed in
 * BulkStockManagementV2, your own lots across shops on My Stock
 * (pages/inventory). The name is from V1's ManageStock.
 */

import React, { useState, useMemo, useEffect, useRef } from "react"
import { GridRowModesModel, GridRowSelectionModel } from "@mui/x-data-grid"
import { Box, Button, Grid, Paper, Stack } from "@mui/material"
import { useIsMobile } from "../../../hooks/layout/useBreakpoint"
import { useHydratedInitialState } from "../../../hooks/ssr/useHydratedInitialState"
import { AddRounded } from "@mui/icons-material"
import FilterListIcon from "@mui/icons-material/FilterListRounded"
import { Link, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { useShopRouteContext } from "../../../components/router/ShopContextFromRoute"
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout"
import { ManageListingsTabBar } from "../components/ManageListingsTabBar"
import { MarketSearchAreaV2 } from "./MarketSearchAreaV2"
import { BottomSheet } from "../../../components/mobile/BottomSheet"
import { UnderlineLink } from "../../../components/typography/UnderlineLink"
import {
  useGetMyListingsQuery,
  type MyListingItem,
} from "../../../store/api/v2/market"
import { useRenewListings } from "../hooks/useStockListingActions"
import { MARKET_PATHS, SHOP_PATHS } from "../../../routes/paths"
import { ShopManageAccessNotice } from "../../shops/components/ShopManageAccessNotice"
import { ImportFromUexDialog } from "./ImportFromUex"
import { canEditShopListings } from "../../shops/domain/shopPermissions"
import { FirstUseHint } from "../../help/components/FirstUseHint"
import { DiscordUserInstallCta } from "../../discord-install/DiscordUserInstallCta"
import { WipeRelistBanner } from "./components/WipeRelistBanner"
import {
  ListingSelectionContext,
  NewListingRowV2,
} from "./stockListingSelection"
import { ShopListingsGridV2 } from "./ShopListingsGridV2"

declare module "@mui/x-data-grid" {
  interface ToolbarPropsOverrides {
    listings: MyListingItem[]
    setNewRows: React.Dispatch<React.SetStateAction<NewListingRowV2[]>>
    setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>
    isMobile: boolean
    onAddQuickListing?: () => void
    canManage: boolean
  }
}

/**
 * The "Still selling?" notice links here with ?renew=<id>,<id>: renew those
 * listings once (a new month; paused ones are reactivated), say so, and drop
 * the parameter.
 */
function RenewFromLink() {
  const [searchParams, setSearchParams] = useSearchParams()
  const renewListings = useRenewListings()
  // Once per page load: the ref keeps a re-render (or the URL update below)
  // from renewing again.
  const done = useRef(false)
  const renewParam = searchParams.get("renew") || ""

  useEffect(() => {
    if (done.current) return
    const ids = renewParam
      .split(",")
      .map((s) => s.trim())
      .filter((s) => /^[0-9a-f-]{36}$/i.test(s))
      .slice(0, 50)
    if (!ids.length) return
    done.current = true
    void (async () => {
      await renewListings(ids)
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.delete("renew")
          return next
        },
        { replace: true },
      )
    })()
  }, [renewParam, renewListings, setSearchParams])

  return null
}

/* ── Main page component ── */

export function StockManagerV2() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useIsMobile()
  const { shop } = useShopRouteContext()
  const [sidebarOpen, setSidebarOpen] = useHydratedInitialState(!isMobile)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(48)
  const [searchParams] = useSearchParams()
  const statusFilter = searchParams.get("status") as
    | "active"
    | "inactive"
    | "expired"
    | "cancelled"
    | null

  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  })

  const { data, isLoading, refetch } = useGetMyListingsQuery({
    status: statusFilter || undefined,
    page: page + 1,
    pageSize,
    sortBy: "updated_at",
    sortOrder: "desc",
    shopId: shop.shop_id,
  })

  const listings = useMemo(() => data?.listings ?? [], [data?.listings])
  const canManage = canEditShopListings(shop)
  const [importOpen, setImportOpen] = useState(false)

  return (
    <StandardPageLayout
      title={t("sidebar.manage_listings")}
      breadcrumbs={[
        {
          label: t("sidebar.market_short", "Market"),
          href: MARKET_PATHS.search,
        },
        { label: t("sidebar.manage_listings", "Manage Listings") },
      ]}
      sidebarOpen={true}
      maxWidth="xl"
      isLoading={isLoading}
    >
      <ListingSelectionContext.Provider
        value={[selectionModel, setSelectionModel]}
      >
        <RenewFromLink />
        {canManage && (
          <Grid item xs={12}>
            <WipeRelistBanner shopId={shop.shop_id} />
          </Grid>
        )}
        <Grid item xs={12}>
          <Grid container spacing={theme.layoutSpacing.layout}>
            {/* Mobile bottom sheet sidebar */}
            {isMobile && (
              <BottomSheet
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                title={t("market.filters", "Filters")}
                maxHeight="90vh"
              >
                <Box sx={{ overflowY: "auto", overflowX: "hidden", pb: 2 }}>
                  <MarketSearchAreaV2 manageMode />
                </Box>
              </BottomSheet>
            )}

            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                {isMobile && (
                  <Button
                    variant="outlined"
                    color="neutral"
                    startIcon={<FilterListIcon />}
                    onClick={() => setSidebarOpen((p) => !p)}
                    sx={{ borderRadius: 2, textTransform: "none" }}
                  >
                    {t("market.filters", "Filters")}
                  </Button>
                )}
                <ManageListingsTabBar
                  title={t("sidebar.manage_listings", "Manage Listings")}
                  rightAction={
                    canManage ? (
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          color="neutral"
                          onClick={() => setImportOpen(true)}
                        >
                          {t("ItemStock.importFromUex", "Import from UEX")}
                        </Button>
                        <Link
                          to={SHOP_PATHS.create(shop.slug)}
                          style={{ textDecoration: "none" }}
                        >
                          <Button
                            variant="contained"
                            startIcon={<AddRounded />}
                            size="large"
                          >
                            {t("market.createListing", "Create Listing")}
                          </Button>
                        </Link>
                      </Stack>
                    ) : undefined
                  }
                />
              </Box>
            </Grid>

            {!canManage && (
              <Grid item xs={12}>
                <ShopManageAccessNotice />
              </Grid>
            )}

            {canManage && (
              <Grid item xs={12} sx={{ "&:empty": { display: "none" } }}>
                <FirstUseHint
                  hint="listingQuantity"
                  title={t("hints.listingQuantity.title")}
                >
                  {t("hints.listingQuantity.body")}
                </FirstUseHint>
              </Grid>
            )}

            {canManage && (
              <Grid item xs={12} sx={{ "&:empty": { display: "none" } }}>
                <DiscordUserInstallCta src="shop_hint" variant="hint" />
              </Grid>
            )}

            {/* Desktop sidebar */}
            {!isMobile && (
              <Grid item xs={12} md={3}>
                <Paper>
                  <MarketSearchAreaV2 manageMode />
                </Paper>
              </Grid>
            )}

            {/* Content area */}
            <Grid item xs={12} md={isMobile ? 12 : 9}>
              <Grid container spacing={theme.layoutSpacing.layout}>
                <Grid item xs={12}>
                  <ShopListingsGridV2
                    listings={listings}
                    total={data?.total ?? 0}
                    page={page}
                    pageSize={pageSize}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                    onRefreshAll={() => {
                      refetch()
                    }}
                    isLoading={isLoading}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Archived listings link */}
            <Grid
              item
              xs={12}
              sx={{ display: "flex", justifyContent: "flex-end" }}
            >
              <Link to={MARKET_PATHS.myListings} style={{ color: "inherit" }}>
                <UnderlineLink>{t("sidebar.archived_listings")}</UnderlineLink>
              </Link>
            </Grid>
          </Grid>
        </Grid>
      </ListingSelectionContext.Provider>
      {canManage && (
        <ImportFromUexDialog
          shopId={shop.shop_id}
          open={importOpen}
          onClose={() => setImportOpen(false)}
        />
      )}
    </StandardPageLayout>
  )
}
