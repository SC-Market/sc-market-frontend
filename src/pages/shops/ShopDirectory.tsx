import { useState } from "react"
import { Link as RouterLink } from "react-router-dom"
import {
  Container,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  Avatar,
  Rating,
  Box,
  Skeleton,
  MenuItem,
  InputAdornment,
} from "@mui/material"
import { Search } from "@mui/icons-material"
import { useBrowseShopsQuery } from "../../store/api/v2/market"
import { useDebounce } from "../../hooks/useDebounce"

export function ShopDirectory() {
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<"created_at" | "rating" | "name">("rating")
  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading } = useBrowseShopsQuery({
    search: debouncedSearch || undefined,
    sortBy,
    sortOrder: sortBy === "name" ? "asc" : "desc",
    pageSize: 40,
  })

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Shops</Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          size="small"
          placeholder="Search shops..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, maxWidth: 400 }}
        />
        <TextField
          select
          size="small"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          sx={{ width: 160 }}
        >
          <MenuItem value="rating">Top Rated</MenuItem>
          <MenuItem value="created_at">Newest</MenuItem>
          <MenuItem value="name">Name A-Z</MenuItem>
        </TextField>
      </Box>

      {isLoading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={2}>
          {data?.shops.map((shop) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={shop.shop_id}>
              <Card
                component={RouterLink}
                to={`/shops/${shop.slug}`}
                sx={{ textDecoration: "none", height: "100%", "&:hover": { boxShadow: 4 }, transition: "box-shadow 0.2s" }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                    <Avatar src={shop.logo_url || undefined} sx={{ width: 40, height: 40 }}>
                      {shop.name[0]}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="subtitle1" noWrap fontWeight={600}>
                        {shop.name}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                    <Rating value={shop.rating || 0} precision={0.5} readOnly size="small" />
                    <Typography variant="caption" color="text.secondary">
                      ({shop.rating_count})
                    </Typography>
                  </Box>
                  {shop.description && (
                    <Typography variant="body2" color="text.secondary" sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}>
                      {shop.description}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
          {data?.shops.length === 0 && (
            <Grid item xs={12}>
              <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                No shops found
              </Typography>
            </Grid>
          )}
        </Grid>
      )}
    </Container>
  )
}
