import {
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  Fade,
  Grid,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import type { ExtendedTheme } from "../../hooks/styles/Theme"
import { BaseSkeleton } from "./BaseSkeleton"

/**
 * Placeholder for one public contract card (ContractListing in
 * views/contracts/ContractListings): same grid cell, card header (title,
 * customer/time/cost line), fixed 120px description and the kind chip +
 * "See more" button row. Contracts have no image column.
 */
export function ContractListingSkeleton({ index = 0 }: { index?: number }) {
  const theme = useTheme<ExtendedTheme>()

  return (
    <Grid item xs={12} lg={6}>
      <Fade
        in={true}
        style={{
          transitionDelay: `${50 + 50 * index}ms`,
          transitionDuration: "500ms",
        }}
      >
        <CardActionArea
          sx={{ borderRadius: theme.spacing(theme.borderRadius.topLevel) }}
        >
          <Card
            sx={{ borderRadius: theme.spacing(theme.borderRadius.topLevel) }}
          >
            <CardHeader
              disableTypography
              title={<BaseSkeleton variant="text" width="55%" height={32} />}
              // Customer, time and cost wrap onto two lines at card width
              subheader={
                <>
                  <BaseSkeleton variant="text" width="55%" height={22} />
                  <BaseSkeleton variant="text" width="35%" height={18} />
                </>
              }
            />
            <CardContent sx={{ width: "auto", height: 120, paddingTop: 0 }}>
              <BaseSkeleton variant="text" width="100%" height={24} />
              <BaseSkeleton variant="text" width="95%" height={24} />
              <BaseSkeleton variant="text" width="90%" height={24} />
              <BaseSkeleton variant="text" width="60%" height={24} />
            </CardContent>
            <CardActions sx={{ padding: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  width: "100%",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <BaseSkeleton
                  variant="rectangular"
                  width={110}
                  height={32}
                  sx={{ borderRadius: 4, marginBottom: 1 }}
                />
                <BaseSkeleton
                  variant="rectangular"
                  width={104}
                  height={36}
                  sx={{ borderRadius: 1 }}
                />
              </Box>
            </CardActions>
          </Card>
        </CardActionArea>
      </Fade>
    </Grid>
  )
}
