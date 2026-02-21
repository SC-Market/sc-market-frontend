import React from "react"
import { Section } from "../../components/paper/Section"
import { Grid, Skeleton, Box, Divider } from "@mui/material"

export function AuthenticateRSISkeleton() {
  return (
    <Section xs={12} lg={12}>
      <Grid item xs={12}>
        <Skeleton variant="rectangular" height={56} />
      </Grid>
      <Grid item xs={12}>
        <Box sx={{ py: 2 }}>
          <Skeleton variant="text" width="80%" height={24} />
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="rectangular" width={200} height={40} sx={{ mt: 1 }} />
        </Box>
      </Grid>
      <Grid item xs={12} display="flex" alignItems="center">
        <Skeleton variant="text" width="70%" height={20} />
        <Skeleton variant="rectangular" width={42} height={42} sx={{ ml: 1 }} />
      </Grid>
      <Grid item xs={12}>
        <Divider light />
      </Grid>
      <Grid item xs={12}>
        <Box display="flex" justifyContent="space-between">
          <Skeleton variant="rectangular" width={180} height={36} />
          <Skeleton variant="rectangular" width={120} height={36} />
        </Box>
      </Grid>
    </Section>
  )
}
