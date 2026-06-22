import { useState } from "react"
import {
  Button,
  Container,
  Typography,
  TextField,
  Grid,
  Box,
  Chip,
  Skeleton,
  MenuItem,
  InputAdornment,
} from "@mui/material"
import { Search, StorefrontRounded } from "@mui/icons-material"
import { useBrowseShopsQuery } from "../../store/api/v2/market"
import { useDebounce } from "../../hooks/useDebounce"
import { ShopCard } from "../../features/shops/components/ShopCard"

const SHOP_TAGS = [
  "Weapons",
  "Armor",
  "Components",
  "Cargo",
  "Mining",
  "Salvage",
  "Medical",
  "Vehicles",
  "Services",
] as const

type SortOption = "rating" | "total_sales" | "created_at" | "name"

interface SortConfig {
  label: string
  sortBy: SortOption
  sortOrder: "asc" | "desc"
}

const SORT_OPTIONS: SortConfig[] = [
  { label: "Top Rated", sortBy: "rating", sortOrder: "desc" },
  { label: "Most Sales", sortBy: "total_sales", sortOrder: "desc" },
  { label: "Newest", sortBy: "created_at", sortOrder: "desc" },
  { label: "Name A-Z", sortBy: "name", sortOrder: "asc" },
]

export function ShopDirectory() {
  const [search, setSearch] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sortIndex, setSortIndex] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 24

  const debouncedSearch = useDebounce(search, 300)
  const currentSort = SORT_OPTIONS[sortIndex]

  const { data, isLoading } = useBrowseShopsQuery({
    search: debouncedSearch || undefined,
    tag: selectedTag || undefined,
    sortBy: currentSort.sortBy,
    sortOrder: currentSort.sortOrder,
    page,
    pageSize,
  })

  const handleTagToggle = (tag: string) => {
    setSelectedTag((prev) => (prev === tag ? null : tag))
    setPage(1)
  }

  return (
    <Container maxWidth="lg" sx={{ pt: 12, pb: 4 }}>
      {/* Header */}
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        Browse Shops
      </Typography>

      {/* Search + Sort */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <TextField
          placeholder="Search shops..."
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
          value={sortIndex}
          onChange={(e) => setSortIndex(Number(e.target.value))}
          sx={{ width: 180 }}
        >
          {SORT_OPTIONS.map((option, idx) => (
            <MenuItem key={option.sortBy} value={idx}>
              {option.label}
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
        <Grid container spacing={2}>
          {Array.from({ length: 12 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Skeleton
                variant="rectangular"
                height={220}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
          ))}
        </Grid>
      ) : data?.shops && data.shops.length > 0 ? (
        <Grid container spacing={2}>
          {data.shops.map((shop, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={shop.shop_id}>
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
            No shops found
          </Typography>
        </Box>
      )}

      {/* Pagination */}
      {data && data.total > pageSize && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            sx={{ mr: 1 }}
          >
            Previous
          </Button>
          <Typography variant="body2" sx={{ display: "flex", alignItems: "center", mx: 2 }}>
            Page {page} of {Math.ceil(data.total / pageSize)}
          </Typography>
          <Button
            disabled={page >= Math.ceil(data.total / pageSize)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </Box>
      )}
    </Container>
  )
}
