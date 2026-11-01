import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "react-router-dom"
import { linkedPaginationItem } from "../../../components/pagination/linkedPaginationItem"
import { MARKET_PATHS } from "../../../routes/paths"
import {
  Container,
  Typography,
  TextField,
  Grid,
  Box,
  Chip,
  MenuItem,
  Pagination,
  InputAdornment,
} from "@mui/material"
import { Helmet } from "@unhead/react/helmet"
import { Search, StorefrontRounded } from "@mui/icons-material"
import { useBrowseShopsQuery } from "../../../store/api/v2/market"
import { useDebounce } from "../../../hooks/useDebounce"
import { ShopCard } from "./ShopCard"
import { ShopCardGridSkeleton } from "../../../components/skeletons/ShopCardSkeleton"
import {
  SHOP_DIRECTORY_PAGE_SIZE,
  SHOP_GRID_BREAKPOINTS,
  SHOP_TAGS,
} from "../shopDirectoryConfig"
import { FRONTEND_URL } from "../../../util/constants"
import { shopDirectorySeoText } from "../../../seo/hubHeads"
import { usePageReady } from "../../../components/metadata/PageReady"
import { isPrimaryLoading } from "../../../components/metadata/pageReadyStore"

type SortOption = "rating" | "total_sales" | "created_at" | "name"

interface SortConfig {
  label: string
  sortBy: SortOption
  sortOrder: "asc" | "desc"
}

const SORT_OPTIONS: SortConfig[] = [
  { label: "shops.directory.sortTopRated", sortBy: "rating", sortOrder: "desc" },
  { label: "shops.directory.sortMostSales", sortBy: "total_sales", sortOrder: "desc" },
  { label: "shops.directory.sortNewest", sortBy: "created_at", sortOrder: "desc" },
  { label: "shops.directory.sortNameAZ", sortBy: "name", sortOrder: "asc" },
]

export function ShopDirectory() {
  const { t } = useTranslation()
  const [search, setSearch] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sortIndex, setSortIndex] = useState(0)
  // The page is in the URL (?page=N), so each page has its own crawlable,
  // self-canonical URL (src/seo/queryIndexing.ts).
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Math.max(1, Number(searchParams.get("page")) || 1)
  const setPage = (next: number) =>
    setSearchParams(next > 1 ? { page: String(next) } : {}, { replace: next === 1 })
  const pageSize = SHOP_DIRECTORY_PAGE_SIZE

  const debouncedSearch = useDebounce(search, 300)
  const currentSort = SORT_OPTIONS[sortIndex]

  const { data, isLoading, isFetching: pageIsFetching, currentData: pageCurrentData } = useBrowseShopsQuery({
    search: debouncedSearch || undefined,
    tag: selectedTag || undefined,
    sortBy: currentSort.sortBy,
    sortOrder: currentSort.sortOrder,
    page,
    pageSize,
  })
  // Primary content: drives main[data-ready].
  usePageReady(
    isPrimaryLoading({ isLoading, isFetching: pageIsFetching, currentData: pageCurrentData }),
  )

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0

  const { title: pageTitle, description: pageDescription } = useMemo(
    () => shopDirectorySeoText(selectedTag, data?.total),
    [selectedTag, data?.total],
  )

  const handleTagToggle = (tag: string) => {
    setSelectedTag((prev) => (prev === tag ? null : tag))
    setPage(1)
  }

  return (
    <Container maxWidth="lg" sx={{ pt: 12, pb: 4 }}>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        {page > 1 && (
          <link rel="prev" href={`${FRONTEND_URL}/shops?page=${page - 1}${selectedTag ? `&tag=${selectedTag}` : ""}`} />
        )}
        {page < totalPages && (
          <link rel="next" href={`${FRONTEND_URL}/shops?page=${page + 1}${selectedTag ? `&tag=${selectedTag}` : ""}`} />
        )}
      </Helmet>
      {/* Header */}
      <Typography variant="h4" component="h1" fontWeight={700} sx={{ mb: 3 }}>
        {t("shops.directory.title")}
      </Typography>

      {/* Search + Sort */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <TextField
          placeholder={t("shops.directory.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, minWidth: 240 }}
        />
        <TextField
          select
          size="medium"
          inputProps={{ "aria-label": t("shops.directory.sortLabel") }}
          SelectProps={{
            SelectDisplayProps: {
              "aria-label": t("shops.directory.sortLabel"),
              "aria-labelledby": undefined,
            },
          }}
          value={sortIndex}
          onChange={(e) => setSortIndex(Number(e.target.value))}
          sx={{ width: 180 }}
        >
          {SORT_OPTIONS.map((option, idx) => (
            <MenuItem key={option.sortBy} value={idx}>
              {t(option.label)}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Tag filter chips */}
      <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
        {SHOP_TAGS.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            variant={selectedTag === tag ? "filled" : "outlined"}
            color="primary"
            onClick={() => handleTagToggle(tag)}
            sx={{
              fontWeight: selectedTag === tag ? 700 : 500,
              cursor: "pointer",
            }}
          />
        ))}
      </Box>

      {/* Shop grid */}
      {isLoading ? (
        <ShopCardGridSkeleton />
      ) : data?.shops && data.shops.length > 0 ? (
        <Grid container spacing={2}>
          {data.shops.map((shop, index) => (
            <Grid
              item
              {...SHOP_GRID_BREAKPOINTS}
              key={shop.shop_id}
              data-testid="shop-card"
              data-id={shop.slug}
            >
              <ShopCard shop={shop} index={index} />
            </Grid>
          ))}
        </Grid>
      ) : (
        /* Empty state */
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 8,
            gap: 2,
          }}
        >
          <StorefrontRounded
            sx={{ fontSize: 64, color: "text.secondary", opacity: 0.5 }}
          />
          <Typography variant="h6" color="text.secondary">
            {t("shops.directory.empty")}
          </Typography>
        </Box>
      )}

      {/* Pagination */}
      {data && data.total > pageSize && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={Math.ceil(data.total / pageSize)}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            shape="rounded"
            renderItem={linkedPaginationItem(MARKET_PATHS.shops, searchParams)}
          />
        </Box>
      )}
    </Container>
  )
}
