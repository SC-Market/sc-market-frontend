/**
 * MyListingsV2 — V2 equivalent of V1 MyMarketListings.
 *
 * Desktop: three stacked sections (Active / Inactive / Archived) with card grids.
 * Mobile:  single-query list with status-filter tabs + quick-edit bottom sheet + FAB.
 */

import React, { lazy, useCallback, useState } from "react"
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { AddCircleOutlineRounded } from "@mui/icons-material"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import {
  useGetMyListingsQuery,
  useUpdateListingMutation,
  type MyListingItem,
} from "../../../store/api/v2/market"
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout"
import { ManageListingsTabBar } from "../components/ManageListingsTabBar"
import { MobileFAB } from "../../../components/mobile/MobileFAB"
import { PullToRefresh } from "../../../components/gestures"
import { ListingSkeleton } from "../../../components/skeletons"
import { EmptyListings } from "../../../components/empty-states"
import { HeaderTitle } from "../../../components/typography/HeaderTitle"
import { LazySection } from "../../../components/layout/LazySection"
import { useOptionalShopRouteContext } from "../../../components/router/ShopContextFromRoute"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { MobileListingRow } from "./components/MobileListingRow"
import { QuickEditListingSheet } from "./components/QuickEditListingSheet"
import { MyListingCardV2 } from "./components/MyListingCardV2"

// ── Desktop section (unchanged) ───────────────────────────────────────────

function MyListingSectionV2({
  status,
}: {
  status: "active" | "inactive" | "cancelled"
}) {
  const theme = useTheme<ExtendedTheme>()
  const shopCtx = useOptionalShopRouteContext()
  const spectrumId = shopCtx?.shop.owner_contractor_id
  const gridBreakpoints = { xs: 6, sm: 4, md: 4, lg: 3, xl: 2.4 }

  const { data, isLoading, isFetching } = useGetMyListingsQuery({
    status,
    page: 1,
    pageSize: 48,
    sortBy: "created_at",
    sortOrder: "desc",
    spectrumId,
  })

  const listings = data?.listings ?? []
  const loading = isLoading || isFetching

  if (loading) {
    return (
      <Grid container spacing={1}>
        {Array.from({ length: 16 }).map((_, i) => (
          <Grid item {...gridBreakpoints} key={i}>
            <ListingSkeleton index={i} sidebarOpen={false} />
          </Grid>
        ))}
      </Grid>
    )
  }

  if (listings.length === 0) {
    return (
      <Grid item xs={12}>
        <EmptyListings
          isSearchResult={false}
          showCreateAction={status === "active"}
        />
      </Grid>
    )
  }

  return (
    <Grid container spacing={1}>
      {listings.map((listing, index) => (
        <Grid item {...gridBreakpoints} key={listing.listing_id}>
          <MyListingCardV2 listing={listing} index={index} />
        </Grid>
      ))}
    </Grid>
  )
}

// Lazy wrappers so each section loads independently
const ActiveListingsV2 = lazy(() =>
  Promise.resolve({ default: () => <MyListingSectionV2 status="active" /> }),
)
const InactiveListingsV2 = lazy(() =>
  Promise.resolve({ default: () => <MyListingSectionV2 status="inactive" /> }),
)
const ArchivedListingsV2 = lazy(() =>
  Promise.resolve({ default: () => <MyListingSectionV2 status="cancelled" /> }),
)
function ListingsSkeleton() {
  return <Grid item xs={12}><div>Loading…</div></Grid>
}

// ── Mobile view ───────────────────────────────────────────────────────────

type MobileStatus = "active" | "inactive" | "cancelled"

function MobileListingsView() {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const shopCtx = useOptionalShopRouteContext()
  const spectrumId = shopCtx?.shop.owner_contractor_id
  const issueAlert = useAlertHook()
  const [updateListing] = useUpdateListingMutation()

  const [selectedStatus, setSelectedStatus] = useState<MobileStatus>("active")
  const [editTarget, setEditTarget] = useState<MyListingItem | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [archiveTarget, setArchiveTarget] = useState<MyListingItem | null>(null)

  // Prefetch active count to decide whether to show combined view
  const { data: activeData, isLoading: activeLoading } = useGetMyListingsQuery({
    status: "active",
    page: 1,
    pageSize: 1,
    spectrumId,
  })
  const activeCount = activeData?.total ?? 0
  const showCombined = !activeLoading && activeCount === 0 && selectedStatus === "active"

  const { data, isLoading, refetch } = useGetMyListingsQuery({
    status: showCombined ? undefined : selectedStatus,
    page: 1,
    pageSize: 100,
    sortBy: "updated_at",
    sortOrder: "desc",
    spectrumId,
  })

  const listings = data?.listings ?? []
  const total = data?.total ?? 0

  const handleEdit = useCallback((listing: MyListingItem) => {
    setEditTarget(listing)
    setSheetOpen(true)
  }, [])

  const handleArchiveConfirm = useCallback(async () => {
    if (!archiveTarget) return
    try {
      await updateListing({
        id: archiveTarget.listing_id,
        updateListingRequest: { status: "cancelled" },
      }).unwrap()
      issueAlert({
        message: t("myListings.archived", "Listing archived"),
        severity: "success",
      })
    } catch {
      issueAlert({
        message: t("myListings.archiveError", "Failed to archive listing"),
        severity: "error",
      })
    } finally {
      setArchiveTarget(null)
    }
  }, [archiveTarget, updateListing, issueAlert, t])

  const statusTabs: { value: MobileStatus; label: string }[] = [
    { value: "active",    label: t("myListings.active", "Active") },
    { value: "inactive",  label: t("myListings.inactive", "Inactive") },
    { value: "cancelled", label: t("myListings.archived", "Archived") },
  ]

  const currentLabel = statusTabs.find((s) => s.value === selectedStatus)?.label ?? ""

  return (
    <Box sx={{ pb: 10 }}>
      {/* Status filter tabs */}
      <Paper
        variant="outlined"
        sx={{ borderRadius: 0, borderLeft: 0, borderRight: 0, borderTop: 0, mb: 1 }}
      >
        <Tabs
          value={selectedStatus}
          onChange={(_, v: MobileStatus) => setSelectedStatus(v)}
          variant="fullWidth"
          textColor="secondary"
          indicatorColor="secondary"
        >
          {statusTabs.map(({ value, label }) => (
            <Tab
              key={value}
              value={value}
              label={label}
              sx={{ fontSize: "0.8rem", minHeight: 40 }}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Section label */}
      {!isLoading && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            px: 2,
            pt: 0.5,
            pb: 1,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {currentLabel} — {total} {t("myListings.listingsCount", "listings")}
        </Typography>
      )}

      <PullToRefresh onRefresh={() => { refetch() }}>
        <Paper
          variant="outlined"
          sx={{
            borderRadius: theme.spacing(theme.borderRadius.topLevel),
            overflow: "hidden",
          }}
        >
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <ListingSkeleton key={i} index={i} sidebarOpen={false} />
            ))
          ) : listings.length === 0 ? (
            <EmptyListings
              isSearchResult={false}
              showCreateAction={selectedStatus === "active"}
            />
          ) : (
            listings.map((listing) => (
              <MobileListingRow
                key={listing.listing_id}
                listing={listing}
                onEdit={handleEdit}
                onArchive={
                  selectedStatus !== "cancelled" ? setArchiveTarget : undefined
                }
              />
            ))
          )}
        </Paper>
      </PullToRefresh>

      {/* Quick-edit sheet */}
      <QuickEditListingSheet
        listing={editTarget}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />

      {/* Archive confirmation dialog */}
      <Dialog
        open={archiveTarget !== null}
        onClose={() => setArchiveTarget(null)}
      >
        <DialogTitle>
          {t("myListings.archiveTitle", "Archive listing?")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t(
              "myListings.archiveBody",
              '"{{title}}" will be hidden and moved to Archived. You can restore it from the full editor.',
              { title: archiveTarget?.title },
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setArchiveTarget(null)} color="inherit">
            {t("common.cancel", "Cancel")}
          </Button>
          <Button
            onClick={handleArchiveConfirm}
            color="error"
            variant="contained"
          >
            {t("myListings.archiveConfirm", "Archive")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* FAB — create listing */}
      <Link to="/market/create">
        <MobileFAB
          color="secondary"
          aria-label={t("market.createListing", "Create Listing")}
        >
          <AddCircleOutlineRounded />
        </MobileFAB>
      </Link>
    </Box>
  )
}

// ── Page root ─────────────────────────────────────────────────────────────

export function MyListingsV2() {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  if (isMobile) {
    return (
      <StandardPageLayout
        title={t("sidebar.my_market_listings", "My Listings")}
        breadcrumbs={[
          { label: t("sidebar.market_short", "Market"), href: "/market" },
          { label: t("sidebar.my_market_listings", "My Listings") },
        ]}
        headerTitle={
          <ManageListingsTabBar
            title={t("sidebar.my_market_listings", "My Listings")}
          />
        }
        sidebarOpen={false}
        maxWidth="sm"
      >
        <Grid item xs={12}>
          <MobileListingsView />
        </Grid>
      </StandardPageLayout>
    )
  }

  // Desktop — original layout, unchanged
  return (
    <StandardPageLayout
      title={t("sidebar.my_market_listings", "My Listings")}
      breadcrumbs={[
        { label: t("sidebar.market_short", "Market"), href: "/market" },
        { label: t("sidebar.my_market_listings", "My Listings") },
      ]}
      headerTitle={
        <ManageListingsTabBar
          title={t("sidebar.my_market_listings", "My Listings")}
          rightAction={
            <Link to="/market/create" style={{ textDecoration: "none" }}>
              <Button
                variant="contained"
                color="secondary"
                size="small"
                startIcon={<AddCircleOutlineRounded />}
              >
                {t("market.createListing", "Create Listing")}
              </Button>
            </Link>
          }
        />
      }
      sidebarOpen={true}
      maxWidth="lg"
    >
      <Grid item xs={12}>
        <Grid container spacing={theme.layoutSpacing.layout}>
          <LazySection
            component={ActiveListingsV2}
            skeleton={ListingsSkeleton}
            gridProps={{
              item: true, container: true, xs: 12,
              spacing: theme.layoutSpacing.component,
              sx: { transition: "0.3s" },
            }}
          />

          <Grid item container justifyContent="space-between" spacing={theme.layoutSpacing.layout} xs={12}>
            <HeaderTitle lg={12} xl={12}>
              {t("market.inactiveListings", "Inactive Listings")}
            </HeaderTitle>
          </Grid>
          <Grid item xs={12}><Divider light /></Grid>
          <LazySection
            component={InactiveListingsV2}
            skeleton={ListingsSkeleton}
            gridProps={{
              item: true, container: true, xs: 12,
              spacing: theme.layoutSpacing.component,
              sx: { transition: "0.3s" },
            }}
          />

          <Grid item container justifyContent="space-between" spacing={theme.layoutSpacing.layout} xs={12}>
            <HeaderTitle lg={12} xl={12}>
              {t("market.archivedListings", "Archived Listings")}
            </HeaderTitle>
          </Grid>
          <Grid item xs={12}><Divider light /></Grid>
          <LazySection
            component={ArchivedListingsV2}
            skeleton={ListingsSkeleton}
            gridProps={{
              item: true, container: true, xs: 12,
              spacing: theme.layoutSpacing.component,
              sx: { transition: "0.3s" },
            }}
          />
        </Grid>
      </Grid>
    </StandardPageLayout>
  )
}
