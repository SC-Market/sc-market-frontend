import { Grid } from "@mui/material"
import type { Service } from "../../orders/domain/types"
import { ServiceListingBase } from "./ServiceListingCard"

/** The services list's item spans (one column, two from lg). */
export const SERVICE_LISTING_GRID_BREAKPOINTS = { xs: 12, lg: 6 } as const

export function ServiceListing(props: {
  service: Service
  index: number
  priority?: boolean
}) {
  const { service, index, priority } = props

  return (
    <Grid item {...SERVICE_LISTING_GRID_BREAKPOINTS}>
      <ServiceListingBase service={service} index={index} priority={priority} />
    </Grid>
  )
}
