import { Link as RouterLink } from "react-router-dom"
import {
  Card,
  CardContent,
  CardActionArea,
  Avatar,
  Rating,
  Box,
  Chip,
  Typography,
  Fade,
} from "@mui/material"
import type { ShopPublicResponse } from "../../../store/api/v2/market"

interface ShopCardProps {
  shop: ShopPublicResponse
  index?: number
}

export function ShopCard({ shop, index = 0 }: ShopCardProps) {
  return (
    <Fade in timeout={400} style={{ transitionDelay: `${50 + 30 * index}ms` }}>
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
  )
}
