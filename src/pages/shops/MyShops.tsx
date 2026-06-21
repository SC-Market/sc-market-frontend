import { Link as RouterLink } from "react-router-dom"
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Skeleton,
  Container,
  Grid,
} from "@mui/material"
import { Add, Store } from "@mui/icons-material"
import { useGetMyShopsQuery, useQuickCreateShopMutation } from "../../store/api/v2/market"

export function MyShops() {
  const { data: shops, isLoading } = useGetMyShopsQuery()
  const [quickCreate, { isLoading: isCreating }] = useQuickCreateShopMutation()

  const handleQuickCreate = async () => {
    await quickCreate({ quickCreateShopRequest: { owner_type: "user" } })
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>My Shops</Typography>
        <Grid container spacing={2}>
          {[1, 2].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">My Shops</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleQuickCreate}
          disabled={isCreating}
        >
          Create Shop
        </Button>
      </Box>

      {shops && shops.length === 0 && (
        <Card sx={{ textAlign: "center", py: 6 }}>
          <Store sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            You don't have any shops yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create a shop to start selling on SC Market
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleQuickCreate} disabled={isCreating}>
            Create Your First Shop
          </Button>
        </Card>
      )}

      <Grid container spacing={2}>
        {shops?.map((shop) => (
          <Grid item xs={12} sm={6} md={4} key={shop.shop_id}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                  <Avatar src={shop.logo_url || undefined} sx={{ width: 40, height: 40 }}>
                    {shop.name[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" noWrap>{shop.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      /{shop.slug}
                    </Typography>
                  </Box>
                </Box>
                {shop.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }} noWrap>
                    {shop.description}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button size="small" component={RouterLink} to={`/shops/${shop.slug}`}>
                  View
                </Button>
                <Button size="small" component={RouterLink} to={`/dashboard/shops/${shop.shop_id}`}>
                  Manage
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}
