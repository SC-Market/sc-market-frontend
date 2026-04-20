import React, { useMemo, useCallback, useRef, useState, useEffect } from "react";
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
  Alert,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ExtendedTheme } from "../../../hooks/styles/Theme";
import { useSearchListingsQuery } from "../../../store/api/v2/market";
import type { ListingSearchResult } from "../../../store/api/v2/market";
import { ListingSkeleton } from "../../../components/skeletons";
import { ListingPagination } from "../components/listings/ListingPagination";
import { EmptyListings } from "../../../components/empty-states";
import { useDrawerOpen } from "../../../hooks/layout/Drawer";
import { EditRounded, BusinessRounded } from "@mui/icons-material";
import { getRelativeTime } from "../../../util/time";
import { useCurrentOrg } from "../../../hooks/login/CurrentOrg";
import { useGetUserProfileQuery } from "../../../store/profile";
import { has_permission } from "../../../views/contractor/OrgRoles";

/**
 * ContractorListingsV2 - Display contractor organization listings with V2 variant support
 * 
 * This component displays all listings created by a contractor organization.
 * It maintains visual parity with V1 contractor views while adding quality tier support.
 * 
 * Features:
 * - Uses useSearchListingsQuery hook with contractor filtering
 * - Shows variant information (quality tier, attributes, pricing)
 * - Displays organization branding
 * - Filters by organization
 * - Validates contractor permissions before operations
 * - Maintains visual parity with V1 contractor views
 * 
 * **Validates: Requirements 44.5-44.10**
 */
export function ContractorListingsV2() {
  const theme = useTheme<ExtendedTheme>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen] = useDrawerOpen();
  const { contractor_id } = useParams<{ contractor_id: string }>();

  // Get current organization and user profile for permission checks
  const [currentOrg] = useCurrentOrg();
  const { data: profile } = useGetUserProfileQuery();

  // State for pagination
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(isMobile ? 12 : 48);

  // Check if user has manage_market permission for this contractor
  const canManageListings = useMemo(() => {
    if (!currentOrg || !profile || currentOrg.spectrum_id !== contractor_id) {
      return false;
    }
    return has_permission(currentOrg, profile, "manage_market", profile?.contractors);
  }, [currentOrg, profile, contractor_id]);

  // Fetch contractor listings using RTK Query search endpoint
  // Filter by seller_type = 'contractor' and seller_id = contractor_id
  const {
    data: results,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useSearchListingsQuery({
    contractorSpectrumId: contractor_id,
    page: page + 1, // Convert 0-based to 1-based
    pageSize: perPage,
    sortBy: "created_at",
    sortOrder: "desc",
  });

  const contractorListings = useMemo(() => {
    return results?.listings || [];
  }, [results?.listings]);

  const total = results?.total || 0;

  // Grid breakpoints - match V1 exactly
  const gridBreakpoints = useMemo(() => {
    const sidebarInLayout = false; // No sidebar for contractor listings
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

  // Show warning if API doesn't support contractor filtering yet
  const showApiWarning = useMemo(() => {
    // If we have results but no contractor listings, the API might not support filtering
    return results && results.listings.length > 0 && contractorListings.length === 0;
  }, [results, contractorListings]);

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={1}>
        <div ref={ref} style={{ position: "absolute", top: 0 }} />

        {/* Organization Header */}
        <Grid item xs={12}>
          <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
            <BusinessRounded sx={{ fontSize: 40, color: "primary.main" }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {t("contractorListings.title", "Organization Listings")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentOrg?.name || contractor_id}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* API Warning */}
        {showApiWarning && (
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 2 }}>
              {t(
                "contractorListings.apiWarning",
                "Note: Contractor-specific listing endpoint is not yet implemented. Showing filtered results from general search."
              )}
            </Alert>
          </Grid>
        )}

        {/* Permission Warning */}
        {!canManageListings && currentOrg?.spectrum_id === contractor_id && (
          <Grid item xs={12}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              {t(
                "contractorListings.permissionWarning",
                "You do not have permission to manage listings for this organization. Contact an administrator for access."
              )}
            </Alert>
          </Grid>
        )}

        {/* Listings Grid */}
        <Grid item xs={12}>
          <ListingGrid
            listings={contractorListings}
            loading={isLoading || isFetching}
            error={!!error}
            onRetry={refetch}
            gridBreakpoints={gridBreakpoints}
            canManage={canManageListings}
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
    </Box>
  );
}

/**
 * ListingGrid - Grid display for contractor listings with loading and empty states
 */
interface ListingGridProps {
  listings: ListingSearchResult[];
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  gridBreakpoints: Record<string, number>;
  canManage: boolean;
}

const ListingGrid = React.forwardRef<HTMLDivElement, ListingGridProps>(
  ({ listings, loading, error, onRetry, gridBreakpoints, canManage }, ref) => {
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
            showCreateAction={canManage}
            title={t("contractorListings.empty.title", "No listings found")}
            description={t(
              "contractorListings.empty.description",
              "This organization hasn't created any listings yet."
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
              <ContractorListingCard
                listing={listing}
                index={index}
                canManage={canManage}
              />
            </Grid>
          ))}
        </Grid>
      </>
    );
  }
);

ListingGrid.displayName = "ListingGrid";

/**
 * ContractorListingCard - Card component for displaying a contractor listing
 * 
 * Maintains identical styling to V1 (minHeight: 400, padding: 3, Fade animation).
 * Displays listing title, organization name, variant count, total quantity,
 * price range, and quality tier range.
 * Shows organization branding and provides link to listing detail page.
 */
interface ContractorListingCardProps {
  listing: ListingSearchResult;
  index: number;
  canManage: boolean;
}

function ContractorListingCard({ listing, index, canManage }: ContractorListingCardProps) {
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

  // Get quality tier color
  const getQualityColor = (tier: number | null | undefined) => {
    if (!tier) return "default";
    if (tier >= 5) return "success";
    if (tier >= 4) return "info";
    if (tier >= 3) return "primary";
    if (tier >= 2) return "warning";
    return "error";
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
            {/* Organization Badge and Edit Button */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Chip
                icon={<BusinessRounded />}
                label={listing.seller_name}
                color="primary"
                size="small"
                variant="outlined"
              />
              {canManage && (
                <Button
                  size="small"
                  startIcon={<EditRounded />}
                  onClick={handleEditClick}
                  sx={{ minWidth: "auto" }}
                >
                  {t("contractorListings.edit", "Edit")}
                </Button>
              )}
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
                {t("contractorListings.variants", "Variants")}
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {listing.variant_count} {listing.variant_count === 1 ? "variant" : "variants"}
              </Typography>
            </Box>

            {/* Total Quantity */}
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t("contractorListings.quantity", "Available Quantity")}
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {listing.quantity_available.toLocaleString()}
              </Typography>
            </Box>

            {/* Price Range */}
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t("contractorListings.priceRange", "Price Range")}
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {priceRange}
              </Typography>
            </Box>

            {/* Quality Tier Range */}
            {qualityRange && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t("contractorListings.qualityRange", "Quality Range")}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                  <Chip
                    label={qualityRange}
                    color={getQualityColor(listing.quality_tier_max) as any}
                    size="small"
                  />
                </Box>
              </Box>
            )}

            {/* Seller Rating */}
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t("contractorListings.rating", "Organization Rating")}
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {listing.seller_rating.toFixed(1)} ⭐
              </Typography>
            </Box>

            {/* Created Date */}
            <Box>
              <Typography variant="caption" color="text.secondary">
                {t("contractorListings.created", "Listed")}
              </Typography>
              <Typography variant="body2">
                {getRelativeTime(new Date(listing.created_at))}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Fade>
  );
}
