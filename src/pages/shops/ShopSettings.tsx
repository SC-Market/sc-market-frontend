import React from "react"
import { Box, Container, Typography } from "@mui/material"
import { useShopRouteContext } from "../../components/router/ShopContextFromRoute"

export function ShopSettings() {
  const { shop } = useShopRouteContext()

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          {shop.name}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Settings page coming soon.
        </Typography>
      </Box>
    </Container>
  )
}
