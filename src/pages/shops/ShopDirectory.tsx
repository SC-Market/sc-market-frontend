import { useState } from "react"
import { Link as RouterLink } from "react-router-dom"
import {
  Container,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Avatar,
  Rating,
  Box,
  Chip,
  Skeleton,
  MenuItem,
  InputAdornment,
  Fade,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { Search, StorefrontRounded } from "@mui/icons-material"
import { useBrowseShopsQuery } from "../../store/api/v2/market"
import type { ShopPublicResponse } from "../../store/api/v2/market"
import { useDebounce } from "../../hooks/useDebounce"
import type { ExtendedTheme } from "../../hooks/styles/Theme"

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
  const theme = useTheme<ExtendedTheme>()
  const [search, setSearch] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sortIndex, setSortIndex] = useState(0)

  const debouncedSearch = useDebounce(search, 300)
  const currentSort = SORT_OPTIONS[sortIndex]

  const { data, isLoading } = useBrowseShopsQuery({
    search: debouncedSearch || undefined,
    tag: selectedTag || undefined,
    sortBy: currentSort.sortBy,
    sortOrder: currentSort.sortOrder,
    pageSize: 40,
  })

  const handleTagToggle = (tag: string) => {
    setSelectedTag((prev) => (prev === tag ? null : tag))
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
              <Fade
                in
                timeout={400}
                style={{ transitionDelay: `${50 + 30 * index}ms` }}
              >
                <Card
                  sx={{
                    height: "100%",
                    transition: "box-shadow 0.2s, transform 0.2s",
                    "&:hover": {
                      boxShadow: 6,
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <CardActionArea
                    component={RouterLink}
                    to={`/shops/${shop.slug}`}
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "stretch",
                    }}
                  >
                    <CardContent
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        flex: 1,
                        p: 2,
                      }}
                    >
                      {/* Shop identity row */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                        }}
                      >
                        <Avatar
                          src={shop.logo_url || undefined}
                          variant="rounded"
                          sx={{ width: 48, height: 48 }}
                        >
                          {shop.name[0]}
                        </Avatar>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            variant="subtitle1"
                            noWrap
                            fontWeight={700}
                          >
                            {shop.name}
                          </Typography>
                          {shop.owner && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                            >
                              by {shop.owner.name}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {/* Rating */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <Rating
                          value={shop.rating || 0}
                          precision={0.5}
                          readOnly
                          size="small"
                        />
                        <Typography variant="caption" color="text.secondary">
                          ({shop.rating_count})
                        </Typography>
                      </Box>

                      {/* Tags */}
                      {shop.tags.length > 0 && (
                        <Box
                          sx={{
                            display: "flex",
                            gap: 0.5,
                            flexWrap: "wrap",
                          }}
                        >
                          {shop.tags.slice(0, 3).map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              variant="outlined"
                              color="primary"
                              sx={{ fontSize: "0.65rem", height: 20 }}
                            />
                          ))}
                        </Box>
                      )}

                      {/* Stats */}
                      <Box
                        sx={{
                          display: "flex",
                          gap: 2,
                        }}
                      >
                        {shop.listing_count != null && (
                          <Typography variant="caption" color="text.secondary">
                            {shop.listing_count} listings
                          </Typography>
                        )}
                        {shop.total_sales != null && (
                          <Typography variant="caption" color="text.secondary">
                            {shop.total_sales} sales
                          </Typography>
                        )}
                      </Box>

                      {/* Description */}
                      {shop.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            lineHeight: 1.4,
                            mt: "auto",
                          }}
                        >
                          {shop.description}
                        </Typography>
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Fade>
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
    </Container>
  )
}
