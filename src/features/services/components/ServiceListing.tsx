import { Grid } from "@mui/material"
import { Service } from "../../../datatypes/Order"
import { ServiceListingBase } from "./ServiceListingCard"

export function ServiceListing(props: { service: Service; index: number }) {
  const { service, index } = props

  return (
    <Grid item xs={12} lg={6}>
      <ServiceListingBase service={service} index={index} />
    </Grid>
  )
}
