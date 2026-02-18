import React from "react"
import { Skeleton, Grid } from "@mui/material"

export function AdminOrderStatsSkeleton() {
  return (
    <>
      <Grid item xs={12}>
        <Skeleton width="100%" height={400} />
      </Grid>
      <Grid item xs={12} lg={3}>
        <Skeleton width="100%" height={300} />
      </Grid>
      <Grid item xs={12} lg={3}>
        <Skeleton width="100%" height={300} />
      </Grid>
      <Grid item xs={12} lg={6}>
        <Skeleton width="100%" height={200} />
      </Grid>
    </>
  )
}
