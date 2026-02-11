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
import SecurityRounded from '@mui/icons-material/SecurityRounded';

export interface DataGridSkeletonProps {
  /**
   * Number of rows to show in skeleton
   */
  rows?: number
  /**
   * Number of columns to show in skeleton
   */
  columns?: number
  /**
   * Height of each row in pixels
   */
  rowHeight?: number
  /**
   * Whether to show the header row
   */
  showHeader?: boolean
}

/**
 * Skeleton component for data grids and tables
 * Prevents layout shift while data loads
 */
export function DataGridSkeleton({
  rows = 5,
  columns = 4,
  rowHeight = 52,
  showHeader = true,
}: DataGridSkeletonProps) {
  return (
    <Paper
      sx={{
        width: "100%",
        overflow: "hidden",
      }}
    >
      {/* Header row */}
      {showHeader && (
        <Box
          sx={{
            display: "flex",
            gap: 2,
            p: 2,
            borderBottom: 1,
            borderColor: "divider",
            minHeight: rowHeight,
            alignItems: "center",
          }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Box
              key={`header-${colIndex}`}
              sx={{
                flex: colIndex === 0 ? 2 : 1,
              }}
            >
              <BaseSkeleton
                variant="text"
                width={colIndex === 0 ? "80%" : "60%"}
                height={20}
              />
            </Box>
          ))}
        </Box>
      )}

      {/* Data rows */}
      <Stack>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <Box
            key={`row-${rowIndex}`}
            sx={{
              display: "flex",
              gap: 2,
              p: 2,
              borderBottom: rowIndex < rows - 1 ? 1 : 0,
              borderColor: "divider",
              minHeight: rowHeight,
              alignItems: "center",
            }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Box
                key={`cell-${rowIndex}-${colIndex}`}
                sx={{
                  flex: colIndex === 0 ? 2 : 1,
                }}
              >
                <BaseSkeleton
                  variant="text"
                  width={`${60 + Math.random() * 30}%`}
                  height={16}
                />
              </Box>
            ))}
          </Box>
        ))}
      </Stack>
    </Paper>
  )
}
