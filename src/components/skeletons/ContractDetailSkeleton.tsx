import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Box,
  Stack,
  Chip,
} from "@mui/material"
import { BaseSkeleton } from "./BaseSkeleton"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTheme } from "@mui/material/styles"

export interface ContractDetailSkeletonProps {
  showActions?: boolean
}

/**
 * Skeleton component for contract detail card
 * Matches the layout of ViewContract component
 */
export function ContractDetailSkeleton({
  showActions = true,
}: ContractDetailSkeletonProps) {
  const theme = useTheme<ExtendedTheme>()

  return (
    <Card
      sx={{
        padding: 3,
      }}
    >
      <CardHeader
        disableTypography
        title={
          <BaseSkeleton variant="text" width={300} height={28} />
        }
        subheader={
          <Box
            sx={{ padding: 1.5, paddingLeft: 0 }}
            display="flex"
            alignItems="center"
          >
            {/* Optional "NEW" chip */}
            <BaseSkeleton
              variant="rectangular"
              width={50}
              height={24}
              sx={{ marginRight: 1, borderRadius: 1 }}
            />
            {/* Customer name and time */}
            <BaseSkeleton variant="text" width={120} height={20} />
            <BaseSkeleton variant="text" width={100} height={20} sx={{ ml: 1 }} />
          </Box>
        }
      />
      <CardContent sx={{ width: "auto", minHeight: 120, paddingTop: 0 }}>
        <Stack spacing={1}>
          <BaseSkeleton variant="text" width="100%" height={20} />
          <BaseSkeleton variant="text" width="95%" height={20} />
          <BaseSkeleton variant="text" width="90%" height={20} />
          <BaseSkeleton variant="text" width="85%" height={20} />
        </Stack>
      </CardContent>
      {showActions && (
        <CardActions>
          <Stack direction="row" spacing={1}>
            <BaseSkeleton
              variant="rectangular"
              width={120}
              height={36}
              sx={{ borderRadius: 1 }}
            />
            <BaseSkeleton
              variant="rectangular"
              width={100}
              height={36}
              sx={{ borderRadius: 1 }}
            />
          </Stack>
        </CardActions>
      )}
    </Card>
  )
}
