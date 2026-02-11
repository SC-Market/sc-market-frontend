import { BaseSkeleton } from "./BaseSkeleton"

import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Avatar from '@mui/material/Avatar';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Skeleton from '@mui/material/Skeleton';
import { SkeletonProps } from '@mui/material/SkeletonProps';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import SecurityRounded from '@mui/icons-material/SecurityRounded';

export interface CardSkeletonProps {
  showHeader?: boolean
  showActions?: boolean
  lines?: number
  height?: number
}

/**
 * Skeleton component for card-based layouts
 * Matches the layout of Material-UI Card components
 */
export function CardSkeleton({
  showHeader = true,
  showActions = false,
  lines = 3,
  height,
}: CardSkeletonProps) {
  return (
    <Card sx={height ? { height } : undefined}>
      {showHeader && (
        <CardHeader
          avatar={<BaseSkeleton variant="circular" width={40} height={40} />}
          title={<BaseSkeleton variant="text" width="60%" height={24} />}
          subheader={<BaseSkeleton variant="text" width="40%" height={20} />}
          action={
            showActions ? (
              <Box sx={{ display: "flex", gap: 1 }}>
                <BaseSkeleton variant="circular" width={32} height={32} />
                <BaseSkeleton variant="circular" width={32} height={32} />
              </Box>
            ) : undefined
          }
        />
      )}
      <CardContent>
        <Stack spacing={1}>
          {Array.from({ length: lines }).map((_, i) => (
            <BaseSkeleton
              key={i}
              variant="text"
              width={i === lines - 1 ? "80%" : "100%"}
              height={20}
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}
