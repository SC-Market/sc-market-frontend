import React from 'react'
import { Card, CardContent, CardMedia, Grid, Rating, Skeleton, Typography } from '@mui/material'
import { ShopListing } from '../../datatypes/Shop'
import { useGetShopsQuery } from '../../store/shop'

interface ShopCardProps {
  shop: ShopListing
}

const ShopCard: React.FC<ShopCardProps> = ({ shop }) => {
  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Card sx={{ height: '100%' }}>
        <CardMedia
          component="img"
          height="140"
          image={shop.banner_image || '/default-shop-banner.jpg'}
          alt={shop.shop_name}
        />
        <CardContent>
          <Typography variant="h6" noWrap>
            {shop.shop_name}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            by {shop.owner_name}
          </Typography>
          <Rating value={shop.rating} readOnly size="small" />
          <Typography variant="caption" display="block">
            Sales: {shop.total_sales}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  )
}

const ShopSkeleton = () => (
  <Grid item xs={12} sm={6} md={4} lg={3}>
    <Card>
      <Skeleton variant="rectangular" height={140} />
      <CardContent>
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
      </CardContent>
    </Card>
  </Grid>
)

export function ShopListings() {
  const [page, setPage] = React.useState(0)
  const perPage = 20

  const { data: results, isLoading } = useGetShopsQuery({
    page,
    page_size: perPage,
  })

  return (
    <Grid container spacing={2}>
      {isLoading
        ? Array(8).fill(0).map((_, index) => (
            <ShopSkeleton key={index} />
          ))
        : results?.shops.map((shop) => (
            <ShopCard key={shop.shop_id} shop={shop} />
          ))}
    </Grid>
  )
} 