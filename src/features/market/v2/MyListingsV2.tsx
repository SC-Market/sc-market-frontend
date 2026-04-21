import React, { useMemo, useCallback, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Select,
  Stack,
  Typography,
  useMediaQuery,
  Fade,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ExtendedTheme } from "../../../hooks/styles/Theme";
import { useGetMyListingsQuery } from "../../../store/api/v2/market";
import type { MyListingItem } from "../../../store/api/v2/market";
import { ListingSkeleton } from "../../../components/skeletons";
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout";
import { ListingPagination } from "../components/listings/ListingPagination";
import { EmptyListings } from "../../../components/empty-states";
import { useDrawerOpen } from "../../../hooks/layout/Drawer";
import { EditRounded } from "@mui/icons-material";
import { getRelativeTime } from "../../../util/time";

/**
 * MyListingsV2 - Dashboard for sellers to view and manage their V2 listings
 * 
 * Maintains visual parity with V1 ItemListings component.
 * Uses RTK Query hook (useGetMyListingsQuery) for API calls.
 * Displays listing title, status, created date, variant count, total quantity,
 * price range, and quality tier range.
 * Provides status filter dropdown and pagination controls.
 * Links to listing detail page and provides edit button for each listing.
 * 
 * **Validates: Requirements 19.1-19.12**
 */
export function MyListingsV2() {
  const theme = useTheme<ExtendedTheme>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen] = useDrawerOpen();

  // State for filters and pagination
  const [status, setStatus] = useState<string>("active");
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(isMobile ? 12 : 48);

  // Fetch listings using RTK Query
  const {
    data: results,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetMyListingsQuery({
    status: status as "active" | "sold" | "expired" | "cancelled" | undefined,
    page: page + 1, // Convert 0-based to 1-based
    pageSize: perPage,
    sortBy: "created_at",
    sortOrder: "desc",
  });

  const { listings = [], total = 0, page: currentPage = 1, page_size: currentPageSize = 48 } = results || {};

  // Grid breakpoints - match V1 exactly
  const gridBreakpoints = useMemo(() => {
    const sidebarInLayout = false; // No sidebar for my listings
    const base = { xs: 6, sm: 4, md: 4, lg: 3, xl: 2.4, xxl: 2, xxxl: 12 / 8 };
    if (!sidebarInLayout || drawerOpen) return base;
    return { xs: 6, sm: 4, md: 4, lg: 2.4, xl: 2, xxl: 12 / 7, xxxl: 12 / 8 };
  }, [drawerOpen]);

  // Pagination handlers
  const ref = useRef<HTMLDivElement>(null);

  const handleChangePage = useCallback(
    (event: unknown, newPage: number) => {
      setPage(newPage);
      if (ref.current) {
        ref.current.scrollIntoView({
          block: "end",
          behavior: "smooth",
        });
      }
    },
    [],
  );

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPerPage(parseInt(event.target.value, 10));
      setPage(0);
    },
    [],
  );

  const handleStatusChange = useCallback(
    (event: React.ChangeEvent<{ value: unknown }>) => {
      setStatus(event.target.value as string);
      setPage(0); // Reset to first page
    },
    [],
  );

  return (
    <StandardPageLayout
      title={t("sidebar.my_market_listings", "My Listings")}
      headerTitle={t("sidebar.my_market_listings", "My Listings")}
      breadcrumbs={[
        { label: t("sidebar.market_short", "Market"), href: "/market" },
        { label: t("sidebar.my_market_listings", "My Listings") },
      ]}
      sidebarOpen={true}
      maxWidth="lg"
      isLoading={isLoading && !listings.length}
    >
    <Grid item xs={12}>
    <Grid container spacing={1}>
        <div ref={ref} style={{ position: "absolute", top: 0 }} />

        {/* Status Filter */}
        <Grid item xs={12}>
          <Box sx={{ mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="status-filter-label">
                {t("myListings.statusFilter", "Status")}
              </InputLabel>
              <Select
                labelId="status-filter-label"
                value={status}
                label={t("myListings.statusFilter", "Status")}
                onChange={handleStatusChange as any}
              >
                <MenuItem value="active">
                  {t("myListings.status.active", "Active")}
                </MenuItem>
                <MenuItem value="sold">
                  {t("myListings.status.sold", "Sold")}
                </MenuItem>
                <MenuItem value="expired">
                  {t("myListings.status.expired", "Expired")}
                </MenuItem>
                <MenuItem value="cancelled">
                  {t("myListings.status.cancelled", "Cancelled")}
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Grid>

        {/* Listings Grid */}
        <Grid item xs={12}>
          <ListingGrid
            listings={listings}
            loading={isLoading || isFetching}
            error={!!error}
            onRetry={refetch}
            gridBreakpoints={gridBreakpoints}
          />
        </Grid>

        <Grid item xs={12}>
          <Divider light />
        </Grid>

        {/* Pagination */}
        <Grid item xs={12}>
          <ListingPagination
            count={total}
            page={page}
            rowsPerPage={perPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Grid>
      </Grid>
    </Grid>
    </StandardPageLayout>
  );
}

/**
 * ListingGrid - Grid display for my listings with loading and empty states
 */
interface ListingGridProps {
  listings: MyListingItem[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  gridBreakpoints: Record<string, number>;
}

const ListingGrid = React.forwardRef<HTMLDivElement, ListingGridProps>(
  ({ listings, loading, error, onRetry, gridBreakpoints }, ref) => {
    const { t } = useTranslation();

    if (loading) {
      return (
        <Grid container spacing={1} sx={{ width: "100%" }}>
          {new Array(16).fill(undefined).map((_, i) => (
            <Grid item {...gridBreakpoints} key={i}>
              <ListingSkeleton index={i} sidebarOpen={false} />
            </Grid>
          ))}
        </Grid>
      );
    }

    if (listings.length === 0) {
      return (
        <Grid item xs={12}>
          <EmptyListings
            isSearchResult={false}
            isError={error}
            onRetry={onRetry}
            showCreateAction={true}
            title={t("myListings.empty.title", "No listings found")}
            description={t(
              "myListings.empty.description",
              "You haven't created any listings yet. Create your first listing to get started!",
            )}
          />
        </Grid>
      );
    }

    return (
      <>
        <div ref={ref} style={{ position: "absolute", top: 0 }} />
        <Grid container spacing={1} sx={{ width: "100%" }}>
          {listings.map((listing, index) => (
            <Grid item {...gridBreakpoints} key={listing.listing_id}>
              <MyListingCard listing={listing} index={index} />
            </Grid>
          ))}
        </Grid>
      </>
    );
  }
);

ListingGrid.displayName = "ListingGrid";

/**
 * MyListingCard - Card component for displaying a single listing in my listings dashboard
 * 
 * Maintains identical styling to V1 (minHeight: 400, padding: 3, Fade animation).
 * Displays listing title, status, created date, variant count, total quantity,
 * price range, and quality tier range.
 * Provides link to listing detail page and edit button.
 */
interface MyListingCardProps {
  listing: MyListingItem;
  index: number;
}

function MyListingCard({ listing, index }: MyListingCardProps) {
  const theme = useTheme<ExtendedTheme>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Format price range
  const priceRange = useMemo(() => {
    if (listing.price_min === listing.price_max) {
      return `${listing.price_min.toLocaleString()} aUEC`;
    }
    return `${listing.price_min.toLocaleString()} - ${listing.price_max.toLocaleString()} aUEC`;
  }, [listing.price_min, listing.price_max]);

  // Format quality tier range
  const qualityRange = useMemo(() => {
    if (!listing.quality_tier_min || !listing.quality_tier_max) {
      return null;
    }
    if (listing.quality_tier_min === listing.quality_tier_max) {
      return `Tier ${listing.quality_tier_min}`;
    }
    return `Tier ${listing.quality_tier_min}-${listing.quality_tier_max}`;
  }, [listing.quality_tier_min, listing.quality_tier_max]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "success";
      case "sold":
        return "info";
      case "expired":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const handleCardClick = useCallback(() => {
    navigate(`/market/${listing.listing_id}`);
  }, [navigate, listing.listing_id]);

  const handleEditClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card click
      navigate(`/market_edit/${listing.listing_id}`);
    },
    [navigate, listing.listing_id],
  );

  return (
    <Fade
      in={true}
      timeout={500}
      style={{ transitionDelay: `${50 + 50 * index}ms` }}
    >
      <Card
        sx={{
          minHeight: 400,
          padding: 3,
          cursor: "pointer",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: theme.shadows[8],
          },
          position: "relative",
        }}
        onClick={handleCardClick}
      >
        <CardContent sx={{ padding: 0 }}>
          <Stack spacing={2}>
            {/* Status Chip */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Chip
                label={listing.status.toUpperCase()}
                color={getStatusColor(listing.status) as any}
                size="small"
              />
              <Button
                size="small"
                startIcon={<EditRounded />}
                onClick={handleEditClick}
                sx={{ minWidth: "auto" }}
              >
                {t("myListings.edit", "Edit")}
              </Button>
            </Box>

            {/* Title */}
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {listing.title}
            </Typography>

            <Divider />

            {/* Variant Count */}
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t("myListings.variants", "Variants")}
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {listing.variant_count} {listing.variant_count === 1 ? "variant" : "variants"}
              </Typography>
            </Box>

            {/* Total Quantity */}
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t("myListings.quantity", "Total Quantity")}
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {listing.quantity_available.toLocaleString()}
              </Typography>
            </Box>

            {/* Price Range */}
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t("myListings.priceRange", "Price Range")}
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {priceRange}
              </Typography>
            </Box>

            {/* Quality Tier Range */}
            {qualityRange && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t("myListings.qualityRange", "Quality Range")}
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {qualityRange}
                </Typography>
              </Box>
            )}

            {/* Created Date */}
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t("myListings.created", "Created")}
              </Typography>
              <Typography variant="body2">
                {getRelativeTime(new Date(listing.created_at))}
              </Typography>
            </Box>

            {/* Updated Date */}
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t("myListings.updated", "Last Updated")}
              </Typography>
              <Typography variant="body2">
                {getRelativeTime(new Date(listing.updated_at))}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Fade>
  );
}
