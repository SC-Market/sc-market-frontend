import { Paper, Stack, TableCell, TableRow } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { BaseSkeleton } from "../../../components/skeletons/BaseSkeleton"

/** Skeleton for buy order table rows (3 columns, no checkbox). */
export function BuyOrderRowSkeleton() {
  const theme = useTheme<ExtendedTheme>()
  return (
    <TableRow>
      <TableCell
        sx={{
          width: { xs: "45%", sm: "auto" },
          minWidth: 0,
          padding: { xs: theme.spacing(0.75), sm: theme.spacing(2) },
        }}
      >
        <Stack
          spacing={theme.layoutSpacing.compact}
          direction="row"
          alignItems="center"
        >
          <Paper
            sx={{
              padding: { xs: 0.25, sm: 0.5 },
              bgcolor: theme.palette.background.default,
              minWidth: { xs: 40, sm: 50 },
              flexShrink: 0,
            }}
          >
            <Stack direction="column" alignItems="center">
              <BaseSkeleton
                variant="text"
                width={30}
                height={12}
                sx={{ mb: 0.5 }}
              />
              <BaseSkeleton variant="text" width={24} height={20} />
            </Stack>
          </Paper>
          <Stack direction="column" sx={{ flex: 1, minWidth: 0 }}>
            <BaseSkeleton
              variant="text"
              width="80%"
              height={18}
              sx={{ mb: 0.5 }}
            />
            <BaseSkeleton variant="text" width="60%" height={14} />
          </Stack>
        </Stack>
      </TableCell>
      <TableCell
        align="right"
        sx={{ padding: { xs: theme.spacing(0.75), sm: theme.spacing(2) } }}
      >
        <BaseSkeleton
          variant="text"
          width={40}
          height={18}
          sx={{ ml: "auto" }}
        />
      </TableCell>
      <TableCell
        align="right"
        sx={{ padding: { xs: theme.spacing(0.75), sm: theme.spacing(2) } }}
      >
        <BaseSkeleton
          variant="text"
          width={60}
          height={18}
          sx={{ ml: "auto" }}
        />
      </TableCell>
      <TableCell
        align="right"
        sx={{
          padding: { xs: theme.spacing(0.75), sm: theme.spacing(2) },
          minWidth: 100,
        }}
      >
        <BaseSkeleton
          variant="rectangular"
          width={70}
          height={32}
          sx={{ borderRadius: 1, ml: "auto" }}
        />
      </TableCell>
    </TableRow>
  )
}
