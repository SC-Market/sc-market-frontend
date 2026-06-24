import { Link as RouterLink } from "react-router-dom"
import {
  Card,
  CardActionArea,
  CardContent,
  Avatar,
  Rating,
  Box,
  Chip,
  Typography,
  Fade,
} from "@mui/material"
import { ListAltRounded, ShoppingBagRounded } from "@mui/icons-material"
import type { ShopPublicResponse } from "../../../store/api/v2/market"

interface ShopCardProps {
  shop: ShopPublicResponse
  index?: number
}

export function ShopCard({ shop, index = 0 }: ShopCardProps) {
  return (
    <Fade in timeout={400} style={{ transitionDelay: `${50 + 30 * index}ms` }}>
      <Card sx={{ height: "100%" }}>
        <CardActionArea
          component={RouterLink}
          to={`/shops/${shop.slug}`}
          sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "stretch" }}
        >
          <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1, flex: 1, p: 2 }}>

            {/* Identity: logo + name + owner */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar src={shop.logo_url || undefined} variant="rounded" sx={{ width: 48, height: 48 }}>
                {shop.name[0]}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="subtitle1" noWrap fontWeight={700}>
                  {shop.name}
                </Typography>
                {shop.owner && (
                  <Typography variant="caption" color="text.secondary" noWrap>
                    by {shop.owner.name}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Rating */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Rating value={shop.rating || 0} precision={0.5} readOnly size="small" />
              <Typography variant="caption" color="text.secondary">
                ({shop.rating_count})
              </Typography>
            </Box>

            {/* Tags */}
            {shop.tags.length > 0 && (
              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                {shop.tags.slice(0, 3).map((tag) => (
                  <Chip key={tag} label={tag} size="small" variant="outlined" color="primary" sx={{ fontSize: "0.65rem", height: 20 }} />
                ))}
              </Box>
            )}

            {/* Stats with icons */}
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              {shop.listing_count != null && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
                  <ListAltRounded sx={{ fontSize: 13, color: "text.disabled" }} />
                  <Typography variant="caption" color="text.secondary">
                    {shop.listing_count} listings
                  </Typography>
                </Box>
              )}
              {shop.total_sales != null && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
                  <ShoppingBagRounded sx={{ fontSize: 13, color: "text.disabled" }} />
                  <Typography variant="caption" color="text.secondary">
                    {shop.total_sales} sales
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Languages */}
            {shop.supported_languages.length > 1 && (
              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                {shop.supported_languages.map((lang) => (
                  <Chip key={lang} label={lang.toUpperCase()} size="small" variant="outlined" sx={{ fontSize: "0.6rem", height: 18 }} />
                ))}
              </Box>
            )}

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
  )
}
