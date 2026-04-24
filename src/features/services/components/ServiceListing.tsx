import { Grid } from "@mui/material"
import type { Service } from "../../orders/domain/types"
import { ServiceListingBase } from "./ServiceListingCard"

export function ServiceListing(props: { service: Service; index: number }) {
  const { service, index } = props

  return (
    <Grid item xs={12} lg={6}>
      <ServiceListingBase service={service} index={index} />
    </Grid>
  )
}
