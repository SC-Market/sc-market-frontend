import React, { useMemo, useState } from "react"
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
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
import { useSearchListingsQuery } from "../../../../store/api/v2/market"
import type { ListingSearchResult } from "../../../../store/api/v2/market"
import { isFungibleType } from "./fungibility"

/**
 * MarketSearchRedesign — Phase 0 of the Market redesign (behind the
 * `market_v2_redesign` feature flag). Frontend-only: it reads the EXISTING
 * `useSearchListingsQuery` results and derives inline aggregation client-side.
 *
 * Fungibility is not yet exposed by the backend, so it's derived from the item
 * category (see ./fungibility.ts): fungible items (commodities, components,
 * weapons, armor…) that share a name+type collapse into an expandable group
 * card; non-fungible items (ships, bundles) always render as standalone cards
 * even if names collide. See MARKET_V2_RESEARCH.md §8.3, §11.4, §7 Phase 0.
 */

type SortKey = "price" | "quality" | "rating" | "recent"

interface Group {
  key: string
  itemName: string
  itemType: string
  fungible: boolean
  listings: ListingSearchResult[]
  photo?: string
  fromPrice: number
  bestQuality: number
  topRating: number
  newest: number
}

function groupListings(listings: ListingSearchResult[]): Group[] {
  const map = new Map<string, Group>()
  for (const l of listings) {
    const fungible = isFungibleType(l.game_item_type)
    // Fungible items merge by name+type; non-fungible items never merge
    // (each is its own standalone card), so key them by listing id.
    const key = fungible
      ? `${l.game_item_name}::${l.game_item_type}`
      : `nf::${l.listing_id}`
    let g = map.get(key)
    if (!g) {
      g = {
        key,
        itemName: l.game_item_name,
        itemType: l.game_item_type,
        fungible,
        listings: [],
        photo: l.photo ?? undefined,
        fromPrice: Number.POSITIVE_INFINITY,
        bestQuality: 0,
        topRating: 0,
        newest: 0,
      }
      map.set(key, g)
    }
    g.listings.push(l)
    if (!g.photo && l.photo) g.photo = l.photo
    g.fromPrice = Math.min(g.fromPrice, l.price_min ?? Number.POSITIVE_INFINITY)
    g.bestQuality = Math.max(g.bestQuality, l.quality_tier_max ?? 0)
    g.topRating = Math.max(g.topRating, l.shop_rating ?? 0)
    g.newest = Math.max(g.newest, new Date(l.updated_at ?? l.created_at ?? 0).getTime())
  }
  return [...map.values()]
}

function sortGroups(groups: Group[], key: SortKey): Group[] {
  const g = [...groups]
  switch (key) {
    case "price":
      return g.sort((a, b) => a.fromPrice - b.fromPrice)
    case "quality":
      return g.sort((a, b) => b.bestQuality - a.bestQuality)
    case "rating":
      return g.sort((a, b) => b.topRating - a.topRating)
    case "recent":
      return g.sort((a, b) => b.newest - a.newest)
  }
}

function sortListings(listings: ListingSearchResult[], key: SortKey): ListingSearchResult[] {
  const l = [...listings]
  switch (key) {
    case "price":
      return l.sort((a, b) => (a.price_min ?? 0) - (b.price_min ?? 0))
    case "quality":
      return l.sort((a, b) => (b.quality_tier_max ?? 0) - (a.quality_tier_max ?? 0))
    case "rating":
      return l.sort((a, b) => (b.shop_rating ?? 0) - (a.shop_rating ?? 0))
    case "recent":
      return l.sort(
        (a, b) =>
          new Date(b.updated_at ?? b.created_at ?? 0).getTime() -
          new Date(a.updated_at ?? a.created_at ?? 0).getTime(),
      )
  }
}

export function MarketSearchRedesign() {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  const [text, setText] = useState("")
  const [sort, setSort] = useState<SortKey>("price")
  const [expanded, setExpanded] = useState<string | null>(null)

  const { data, isLoading, error } = useSearchListingsQuery({
    text: text || undefined,
    pageSize: 96,
    status: "active",
  })

  const groups = useMemo(() => {
    const listings = data?.listings ?? []
    return sortGroups(groupListings(listings), sort)
  }, [data, sort])

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
        {groups.map((g) =>
          g.fungible && g.listings.length > 1 ? (
            <Grid key={g.key} size={expanded === g.key ? 12 : { xs: 12, sm: 6, md: 4, lg: 3 }}>
              <GroupCard
                group={g}
                sort={sort}
                open={expanded === g.key}
                onToggle={() =>
                  setExpanded((cur) => (cur === g.key ? null : g.key))
                }
              />
            </Grid>
          ) : (
            <Grid key={g.key} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <SingleCard listing={g.listings[0]} />
            </Grid>
          ),
        )}
      </Grid>

      {!isLoading && !error && groups.length === 0 && (
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
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

function GroupCard({
  group,
  sort,
  open,
  onToggle,
}: {
  group: Group
  sort: SortKey
  open: boolean
  onToggle: () => void
}) {
  const { t } = useTranslation()
  const sellers = useMemo(() => sortListings(group.listings, sort), [group.listings, sort])
  const totalQty = group.listings.reduce((s, l) => s + (l.quantity_available ?? 0), 0)
  const maxPrice = Math.max(...group.listings.map((l) => l.price_max ?? l.price_min ?? 0))
  const dense = sellers.length > 6

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
        <ListingImage src={group.photo} alt={group.itemName} height={open ? 140 : 160} />
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
              <Chip label={group.itemType} size="small" variant="outlined" sx={{ color: "text.primary" }} />
              <Chip
                icon={<GroupsRounded />}
                label={t("MarketRedesign.sellersCount", "{{count}} sellers", {
                  count: group.listings.length,
                })}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Stack>
            <Typography variant="subtitle1" noWrap title={group.itemName}>
              {group.itemName}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.primary" }}>
              {t("MarketRedesign.fromPrice", "from")}{" "}
              <Box component="span" sx={{ color: "primary.main", fontWeight: 700 }}>
                {formatPrice(group.fromPrice)}
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
            {formatPriceRange(group.fromPrice, maxPrice)} ·{" "}
            {t("MarketRedesign.sellersCount", "{{count}} sellers", { count: group.listings.length })} ·{" "}
            {t("MarketRedesign.unitsAvailable", "{{count}} units available", { count: totalQty })}
          </Typography>

          {dense ? (
            <Box sx={{ maxHeight: 360, overflowY: "auto" }}>
              <Stack divider={<Divider />}>
                {sellers.map((s, i) => (
                  <Fade key={s.listing_id} in={open} timeout={300} style={{ transitionDelay: open ? `${Math.min(i, 8) * 40}ms` : "0ms" }}>
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
                  <Grow in={open} timeout={300} style={{ transformOrigin: "top", transitionDelay: open ? `${Math.min(i, 8) * 40}ms` : "0ms" }}>
                    <Box sx={{ height: "100%" }}>
                      <SellerSubCard listing={s} best={i === 0} />
                    </Box>
                  </Grow>
                </Grid>
              ))}
            </Grid>
          )}
        </Collapse>
      </CardContent>
    </Card>
  )
}

function SellerRow({ listing, best }: { listing: ListingSearchResult; best: boolean }) {
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

function SellerSubCard({ listing, best }: { listing: ListingSearchResult; best: boolean }) {
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
              ? `${listing.quantity_available.toLocaleString()} available`
              : ""}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
