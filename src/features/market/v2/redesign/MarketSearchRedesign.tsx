import React, { useMemo, useState } from "react"
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Collapse,
  Container,
  Divider,
  Fade,
  Grow,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material"
import Grid from "@mui/material/Grid2"
import { useTheme } from "@mui/material/styles"
import SearchRounded from "@mui/icons-material/SearchRounded"
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded"
import GroupsRounded from "@mui/icons-material/GroupsRounded"
import { Link as RouterLink } from "react-router-dom"
import { Helmet } from "react-helmet"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import { FALLBACK_IMAGE_URL } from "../../../../util/constants"
import { formatPrice, formatPriceRange } from "../../../../util/formatPrice"
import { formatMarketUrl } from "../../domain/urls"
import {
  useSearchListingsQuery,
  useSearchGameItemAggregatesQuery,
  useGetListingsQuery,
} from "../../../../store/api/v2/market"
import type {
  ListingSearchResult,
  GameItemAggregate,
  GameItemListingResult,
} from "../../../../store/api/v2/market"
import { isFungibleType } from "./fungibility"

/**
 * MarketSearchRedesign — Phase 0 of the Market redesign (behind the
 * `market_v2_redesign` feature flag). Frontend-only, on the existing V2 API.
 *
 * Two-lane hybrid so aggregation is COMPLETE (server-side), not limited to the
 * current page's results:
 *  - Fungible items (raw goods, per ./fungibility.ts) come from
 *    `/game-items/aggregates` → one expandable group card per item, with the
 *    full seller list fetched on expand from `/game-items/{id}/listings`.
 *  - Non-fungible items come from `/listings/search` → one standalone card per
 *    listing (photo, title, shop). Each item appears in exactly one lane
 *    (cross-filtered by fungibility), so there are no duplicates.
 *
 * See MARKET_V2_RESEARCH.md §8.3, §11.4, §7 Phase 0.
 */

type SortKey = "price" | "quality" | "rating" | "recent"

type GridItem =
  | { kind: "group"; key: string; agg: GameItemAggregate }
  | { kind: "single"; key: string; listing: ListingSearchResult }

function sortValue(item: GridItem, key: SortKey): number {
  if (item.kind === "group") {
    const a = item.agg
    switch (key) {
      case "price":
        return a.min_price ?? 0
      case "quality":
        return a.quality_tier_max ?? 0
      case "rating":
        return 0 // aggregate has no rating; ranks after rated singles on desc
      case "recent":
        return 0 // aggregate has no timestamp
    }
  }
  const l = item.listing
  switch (key) {
    case "price":
      return l.price_min ?? 0
    case "quality":
      return l.quality_tier_max ?? 0
    case "rating":
      return l.shop_rating ?? 0
    case "recent":
      return new Date(l.updated_at ?? l.created_at ?? 0).getTime()
  }
}

function sortGrid(items: GridItem[], key: SortKey): GridItem[] {
  const asc = key === "price"
  return [...items].sort((a, b) =>
    asc ? sortValue(a, key) - sortValue(b, key) : sortValue(b, key) - sortValue(a, key),
  )
}

export function MarketSearchRedesign() {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const [text, setText] = useState("")
  const [sort, setSort] = useState<SortKey>("price")
  const [expanded, setExpanded] = useState<string | null>(null)

  const aggSortBy = sort === "price" ? "price" : "quantity"
  const {
    data: aggData,
    isLoading: aggLoading,
    error: aggError,
  } = useSearchGameItemAggregatesQuery({
    text: text || undefined,
    pageSize: 96,
    sortBy: aggSortBy,
    sortOrder: sort === "price" ? "asc" : "desc",
  })

  const {
    data: listData,
    isLoading: listLoading,
    error: listError,
  } = useSearchListingsQuery({
    text: text || undefined,
    pageSize: 96,
    status: "active",
  })

  const items = useMemo<GridItem[]>(() => {
    const fungibleGroups: GridItem[] = (aggData?.items ?? [])
      .filter((a) => isFungibleType(a.type))
      .map((agg) => ({ kind: "group", key: `g:${agg.game_item_id}`, agg }))

    const nonFungibleCards: GridItem[] = (listData?.listings ?? [])
      .filter((l) => !isFungibleType(l.game_item_type))
      .map((listing) => ({ kind: "single", key: `s:${listing.listing_id}`, listing }))

    return sortGrid([...fungibleGroups, ...nonFungibleCards], sort)
  }, [aggData, listData, sort])

  const isLoading = aggLoading || listLoading
  const error = aggError || listError

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Helmet>
        <title>{t("MarketRedesign.title", "Market")}</title>
      </Helmet>

      <Typography variant="h4" sx={{ color: "text.secondary", mb: 0.5 }}>
        {t("MarketRedesign.heading", "Market")}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.primary", mb: 3 }}>
        {t(
          "MarketRedesign.subheading",
          "One grid. Items sold by multiple sellers group together — expand to compare.",
        )}
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder={t("MarketRedesign.searchPlaceholder", "Search the market…")}
          value={text}
          onChange={(e) => setText(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRounded sx={{ color: "text.primary" }} />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          label={t("MarketRedesign.sortLabel", "Sort by")}
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="price">{t("MarketRedesign.sortPrice", "Price")}</MenuItem>
          <MenuItem value="quality">{t("MarketRedesign.sortQuality", "Quality")}</MenuItem>
          <MenuItem value="rating">{t("MarketRedesign.sortRating", "Rating")}</MenuItem>
          <MenuItem value="recent">{t("MarketRedesign.sortRecent", "Recent")}</MenuItem>
        </TextField>
      </Stack>

      {isLoading && (
        <Typography sx={{ color: "text.primary", py: 6, textAlign: "center" }}>
          {t("MarketRedesign.loading", "Loading listings…")}
        </Typography>
      )}
      {error && (
        <Typography sx={{ color: "error.main", py: 6, textAlign: "center" }}>
          {t("MarketRedesign.error", "Failed to load listings.")}
        </Typography>
      )}

      <Grid container spacing={2.5}>
        {items.map((item) =>
          item.kind === "group" ? (
            <Grid key={item.key} size={expanded === item.key ? 12 : { xs: 12, sm: 6, md: 4, lg: 3 }}>
              <GroupCard
                agg={item.agg}
                sort={sort}
                open={expanded === item.key}
                onToggle={() =>
                  setExpanded((cur) => (cur === item.key ? null : item.key))
                }
              />
            </Grid>
          ) : (
            <Grid key={item.key} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <SingleCard listing={item.listing} />
            </Grid>
          ),
        )}
      </Grid>

      {!isLoading && !error && items.length === 0 && (
        <Typography sx={{ color: "text.primary", py: 6, textAlign: "center" }}>
          {t("MarketRedesign.empty", "No listings match your search.")}
        </Typography>
      )}
    </Container>
  )
}

function ListingImage({ src, alt, height }: { src?: string; alt: string; height: number }) {
  return (
    <CardMedia
      component="img"
      image={src || FALLBACK_IMAGE_URL}
      alt={alt}
      onError={(e) => {
        ;(e.target as HTMLImageElement).src = FALLBACK_IMAGE_URL
      }}
      sx={{
        height,
        objectFit: "cover",
        bgcolor: "background.default",
        // Smoothly animate the image resize as the tile grows to a full row.
        transition: (theme) =>
          theme.transitions.create("height", {
            duration: theme.transitions.duration.standard,
            easing: theme.transitions.easing.easeInOut,
          }),
      }}
    />
  )
}

function SingleCard({ listing }: { listing: ListingSearchResult }) {
  const { t } = useTranslation()
  return (
    <Card sx={{ height: "100%", "&:hover": { borderColor: "secondary.main" } }}>
      <CardActionArea component={RouterLink} to={formatMarketUrl(listing)} sx={{ height: "100%" }}>
        <ListingImage src={listing.photo ?? undefined} alt={listing.title} height={160} />
        <CardContent>
          <Chip
            label={listing.game_item_type}
            size="small"
            variant="outlined"
            sx={{ color: "text.primary", mb: 1 }}
          />
          <Typography variant="subtitle1" noWrap title={listing.title}>
            {listing.title}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.primary" }} noWrap>
            {listing.shop_name}
          </Typography>
          <Typography variant="h6" sx={{ color: "primary.main", mt: 1 }}>
            {formatPriceRange(listing.price_min, listing.price_max)}
          </Typography>
          {listing.quantity_available != null && (
            <Typography variant="caption" sx={{ color: "text.primary" }}>
              {t("MarketRedesign.available", "{{count}} available", {
                count: listing.quantity_available,
              })}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

function GroupCard({
  agg,
  sort,
  open,
  onToggle,
}: {
  agg: GameItemAggregate
  sort: SortKey
  open: boolean
  onToggle: () => void
}) {
  const { t } = useTranslation()

  return (
    <Card
      sx={{
        height: "100%",
        borderColor: open ? "primary.main" : "divider",
        transition: (theme) =>
          theme.transitions.create(["border-color", "box-shadow"], {
            duration: theme.transitions.duration.shorter,
          }),
        boxShadow: open ? 6 : 0,
      }}
    >
      <CardActionArea onClick={onToggle} sx={{ p: 0 }}>
        <ListingImage src={agg.image_url} alt={agg.name} height={open ? 140 : 160} />
      </CardActionArea>
      <CardContent>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          onClick={onToggle}
          sx={{ cursor: "pointer" }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 0.5 }} flexWrap="wrap" useFlexGap>
              <Chip label={agg.type} size="small" variant="outlined" sx={{ color: "text.primary" }} />
              <Chip
                icon={<GroupsRounded />}
                label={t("MarketRedesign.sellersCount", "{{count}} sellers", {
                  count: agg.shop_count,
                })}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Stack>
            <Typography variant="subtitle1" noWrap title={agg.name}>
              {agg.name}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.primary" }}>
              {t("MarketRedesign.fromPrice", "from")}{" "}
              <Box component="span" sx={{ color: "primary.main", fontWeight: 700 }}>
                {formatPrice(agg.min_price)}
              </Box>
            </Typography>
          </Box>
          <Tooltip title={open ? t("MarketRedesign.collapse", "Collapse") : t("MarketRedesign.expand", "Compare sellers")}>
            <IconButton>
              <ExpandMoreRounded
                sx={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}
              />
            </IconButton>
          </Tooltip>
        </Stack>

        <Collapse in={open} timeout="auto" unmountOnExit>
          <Divider sx={{ my: 1.5 }} />
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5 }}>
            {formatPriceRange(agg.min_price, agg.max_price)} ·{" "}
            {t("MarketRedesign.sellersCount", "{{count}} sellers", { count: agg.shop_count })} ·{" "}
            {t("MarketRedesign.unitsAvailable", "{{count}} units available", {
              count: agg.total_quantity,
            })}
          </Typography>
          {open && <GroupSellers gameItemId={agg.game_item_id} sort={sort} />}
        </Collapse>
      </CardContent>
    </Card>
  )
}

/**
 * Fetches the full seller list for a fungible item on expand (complete,
 * server-side — not limited to the search page). Adaptive layout: rich
 * sub-cards for a handful of sellers, a compact scrollable depth list beyond ~6.
 */
function GroupSellers({ gameItemId, sort }: { gameItemId: string; sort: SortKey }) {
  const { t } = useTranslation()
  const sortBy = sort === "rating" ? "shop_rating" : sort === "quality" ? "quality" : sort === "recent" ? "price" : "price"
  const { data, isLoading, error } = useGetListingsQuery({
    id: gameItemId,
    sortBy,
    sortOrder: sort === "price" ? "asc" : "desc",
    pageSize: 100,
  })

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
        <CircularProgress size={24} />
      </Box>
    )
  }
  if (error) {
    return (
      <Typography variant="body2" sx={{ color: "error.main", py: 2 }}>
        {t("MarketRedesign.sellersError", "Couldn't load sellers.")}
      </Typography>
    )
  }

  const sellers = data?.listings ?? []
  const dense = sellers.length > 6

  return dense ? (
    <Box sx={{ maxHeight: 360, overflowY: "auto" }}>
      <Stack divider={<Divider />}>
        {sellers.map((s, i) => (
          <Fade key={s.listing_id} in timeout={300} style={{ transitionDelay: `${Math.min(i, 8) * 40}ms` }}>
            <Box>
              <SellerRow listing={s} best={i === 0} />
            </Box>
          </Fade>
        ))}
      </Stack>
    </Box>
  ) : (
    <Grid container spacing={1.5}>
      {sellers.map((s, i) => (
        <Grid key={s.listing_id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <Grow in timeout={300} style={{ transformOrigin: "top", transitionDelay: `${Math.min(i, 8) * 40}ms` }}>
            <Box sx={{ height: "100%" }}>
              <SellerSubCard listing={s} best={i === 0} />
            </Box>
          </Grow>
        </Grid>
      ))}
    </Grid>
  )
}

function SellerRow({ listing, best }: { listing: GameItemListingResult; best: boolean }) {
  return (
    <Stack
      component={RouterLink}
      to={formatMarketUrl(listing)}
      direction="row"
      spacing={1.5}
      alignItems="center"
      sx={{ py: 1, textDecoration: "none", color: "inherit", "&:hover": { color: "secondary.main" } }}
    >
      <Typography variant="body2" sx={{ flex: 1, color: "text.secondary" }} noWrap>
        {listing.shop_name}
      </Typography>
      {best && <Chip label="Best" size="small" color="primary" sx={{ height: 20 }} />}
      <Typography variant="body2" sx={{ color: "text.primary", width: 90, textAlign: "right" }}>
        {listing.quantity_available != null
          ? listing.quantity_available.toLocaleString()
          : "—"}
      </Typography>
      <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 700, width: 120, textAlign: "right" }}>
        {formatPrice(listing.price_min)}
      </Typography>
    </Stack>
  )
}

function SellerSubCard({ listing, best }: { listing: GameItemListingResult; best: boolean }) {
  const { t } = useTranslation()
  return (
    <Card variant="outlined" sx={{ height: "100%", "&:hover": { borderColor: "secondary.main" } }}>
      <CardActionArea component={RouterLink} to={formatMarketUrl(listing)} sx={{ height: "100%" }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Typography variant="body2" sx={{ color: "text.secondary", flex: 1 }} noWrap>
              {listing.shop_name}
            </Typography>
            {best && <Chip label="Best" size="small" color="primary" sx={{ height: 20 }} />}
          </Stack>
          <Typography variant="h6" sx={{ color: "primary.main" }}>
            {formatPrice(listing.price_min)}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.primary" }}>
            {listing.quantity_available != null
              ? t("MarketRedesign.available", "{{count}} available", {
                  count: listing.quantity_available,
                })
              : ""}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
