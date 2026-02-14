import { Box, Grid, Skeleton } from "@mui/material"
import { ExtendedTheme } from "../../../hooks/styles/Theme"

export function RecentServicesSkeleton() {
  return (
    <Grid item xs={12}>
      <Box
        display={"flex"}
        sx={{
          maxWidth: "100%",
          overflowX: "scroll",
        }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(
          (item, index) => (
            <Box
              key={index}
              sx={{
                marginLeft: 1,
                marginRight: 1,
                width: 400,
                display: "inline-block",
                flexShrink: 0,
              }}
            >
              <Skeleton
                variant={"rectangular"}
                height={400}
                width={250}
                sx={{
                  borderRadius: (theme) =>
                    theme.spacing((theme as ExtendedTheme).borderRadius.image),
                }}
              />
            </Box>
          ),
        )}
      </Box>
    </Grid>
  )
}
