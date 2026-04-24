import { Box, Grid } from "@mui/material"
import type { Service } from "../../orders/domain/types"
import { ServiceListingBase } from "./ServiceListingCard"

export function HorizontalServiceListings(props: { listings: Service[] }) {
  const { listings } = props

  return (
    <Grid item xs={12}>
      <Box
        display={"flex"}
        sx={{
          maxWidth: "100%",
          overflowX: "scroll",
        }}
      >
        {listings.map((item, index) => (
          <Box
            key={item.service_id}
            sx={{
              marginLeft: 1,
              marginRight: 1,
              width: 400,
              display: "inline-block",
              flexShrink: 0,
            }}
          >
            <ServiceListingBase service={item} key={index} index={index} />
          </Box>
        ))}
      </Box>
    </Grid>
  )
}
