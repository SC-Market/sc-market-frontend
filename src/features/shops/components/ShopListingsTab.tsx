import {
  Box,
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { LabeledSwitch } from "../../../components/buttons/LabeledSwitch"
import { SearchRounded } from "@mui/icons-material"
import { useSearchListingsQuery } from "../../../store/api/v2/market"
import { ListingCardV2 } from "../../market/v2/ListingCardV2"
import { LISTING_CARD_HEIGHT } from "../../market/v2/marketSearchLayout"
import {
  CardStub,
  firstScreenCards,
  useFirstScreenRender,
} from "../../../components/grid/firstScreen"
import { formatMarketUrl } from "../../market/domain/urls"
import { SHOP_LISTINGS_PAGE_SIZE } from "../hooks/useShopTab"
import { useRef, useState } from "react"
import { useDebounce } from "../../../hooks/useDebounce"
import {
  SHOP_LISTING_GRID_BREAKPOINTS,
  ShopListingsGridSkeleton,
} from "../../../components/skeletons/ShopProfileSkeleton"
import { usePageReady } from "../../../components/metadata/PageReady"
import { isPrimaryLoading } from "../../../components/metadata/pageReadyStore"
import { useGetUserProfileQuery } from "../../profile/api/profileApi"
import { isSiteAdmin } from "../../../util/siteRole"
import { useTranslation } from "react-i18next"
import {
  CARD_GRID_PAGE_SIZE_OPTIONS,
  NumberedPagination,
} from "../../../components/pagination/NumberedPagination"

export function ShopListingsTab(props: { slug: string }) {
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<"created_at" | "price" | "quantity">(
    "created_at",
  )
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(SHOP_LISTINGS_PAGE_SIZE)
  const listTopRef = useRef<HTMLDivElement>(null)
  const debouncedSearch = useDebounce(search, 300)
  const { t } = useTranslation()
  // Admin-only: also show the shop's unlisted (link-only) listings. The
  // backend honours includeUnlisted for site admins only.
  const { data: profile } = useGetUserProfileQuery()
  const isAdmin = isSiteAdmin(profile)
  const [showUnlisted, setShowUnlisted] = useState(false)

  const {
    data,
    isLoading,
    isFetching: pageIsFetching,
    currentData: pageCurrentData,
  } = useSearchListingsQuery({
    shopSlug: props.slug,
    page,
    pageSize,
    sortBy,
    sortOrder,
    text: debouncedSearch || undefined,
    includeUnlisted: isAdmin && showUnlisted ? true : undefined,
  })
  // Shop listings tab: primary content.
  usePageReady(
    isPrimaryLoading({
      isLoading,
      isFetching: pageIsFetching,
      currentData: pageCurrentData,
    }),
  )
  // Only the first screen of cards in the first commit; the rest right after
  // (components/grid/firstScreen.tsx). Grid spacing={2}: a 16px row gap.
  const firstScreen = firstScreenCards(
    SHOP_LISTING_GRID_BREAKPOINTS,
    LISTING_CARD_HEIGHT + 16,
  )
  const rendered = useFirstScreenRender(
    data?.listings.length ?? 0,
    firstScreen.count,
  )

  return (
    <Box ref={listTopRef}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder={t("shops.profile.searchListings")}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          sx={{ flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRounded fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          size="small"
          inputProps={{ "aria-label": t("shops.profile.sortListings") }}
          SelectProps={{
            SelectDisplayProps: {
              "aria-label": t("shops.profile.sortListings"),
              "aria-labelledby": undefined,
            },
          }}
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [s, o] = e.target.value.split("-") as [
              "created_at" | "price" | "quantity",
              "asc" | "desc",
            ]
            setSortBy(s)
            setSortOrder(o)
            setPage(1)
          }}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="created_at-desc">
            {t("shops.profile.sortNewest")}
          </MenuItem>
          <MenuItem value="created_at-asc">
            {t("shops.profile.sortOldest")}
          </MenuItem>
          <MenuItem value="price-asc">
            {t("shops.profile.sortPriceLow")}
          </MenuItem>
          <MenuItem value="price-desc">
            {t("shops.profile.sortPriceHigh")}
          </MenuItem>
          <MenuItem value="quantity-desc">
            {t("shops.profile.sortMostStock")}
          </MenuItem>
        </TextField>
        {isAdmin && (
          <LabeledSwitch
            size="small"
            checked={showUnlisted}
            onChange={(checked) => {
              setShowUnlisted(checked)
              setPage(1)
            }}
            label={t("market.showUnlistedAdmin", "Show unlisted (admin)")}
            sx={{ whiteSpace: "nowrap", ml: { sm: 1 } }}
          />
        )}
      </Stack>

      {isLoading ? (
        <ShopListingsGridSkeleton />
      ) : !data?.listings.length ? (
        <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
          {search
            ? t("shops.profile.noMatches")
            : t("shops.profile.noListings")}
        </Typography>
      ) : (
        <>
          <Grid container spacing={2}>
            {data.listings.map((listing, index) => (
              <Grid
                item
                {...SHOP_LISTING_GRID_BREAKPOINTS}
                key={listing.listing_id}
              >
                {index >= rendered ? (
                  <CardStub
                    height={LISTING_CARD_HEIGHT}
                    to={formatMarketUrl(listing)}
                    label={listing.title}
                  />
                ) : (
                  <ListingCardV2
                    listing={listing}
                    index={index}
                    priority={index < firstScreen.priorityCount}
                  />
                )}
              </Grid>
            ))}
          </Grid>
          {(data.total || 0) > 0 && (
            <NumberedPagination
              count={data.total || 0}
              page={page - 1}
              rowsPerPage={pageSize}
              onPageChange={(newPage) => {
                setPage(newPage + 1)
                listTopRef.current?.scrollIntoView({
                  block: "start",
                  behavior: "smooth",
                })
              }}
              rowsPerPageOptions={CARD_GRID_PAGE_SIZE_OPTIONS}
              onRowsPerPageChange={(size) => {
                setPageSize(size)
                setPage(1)
              }}
              sx={{ mt: 3 }}
            />
          )}
        </>
      )}
    </Box>
  )
}
