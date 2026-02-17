import React from "react"
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Skeleton,
} from "@mui/material"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { useTheme } from "@mui/material/styles"

export function MarketListingDetailsSkeleton() {
  const theme = useTheme<ExtendedTheme>()
  
  return (
    <Card
      sx={{
        minHeight: 400,
      }}
    >
      <CardHeader
        sx={{ padding: 3, paddingBottom: 1 }}
        title={
          <Box>
            {/* Breadcrumbs skeleton */}
            <Skeleton variant="text" width="80%" height={24} />
            {/* Title skeleton */}
            <Skeleton
              variant="text"
              width="70%"
              height={40}
              sx={{ mt: 1 }}
            />
            {/* Meta info skeleton */}
            <Skeleton
              variant="text"
              width="50%"
              height={24}
              sx={{ mt: 1 }}
            />
          </Box>
        }
        subheader={
          <Box sx={{ mt: 2 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton
                key={i}
                variant="text"
                width="60%"
                height={20}
                sx={{ mt: 0.5 }}
              />
            ))}
          </Box>
        }
      />
      <CardContent sx={{ padding: 3, paddingTop: 0 }}>
        {/* Action area skeleton */}
        <Skeleton
          variant="rectangular"
          height={80}
          width="100%"
          sx={{ mb: 2 }}
        />
        {/* Description skeleton */}
        <Skeleton variant="text" width="100%" height={20} />
        <Skeleton variant="text" width="90%" height={20} />
        <Skeleton variant="text" width="85%" height={20} />
        <Skeleton variant="text" width="70%" height={20} />
      </CardContent>
    </Card>
  )
}
