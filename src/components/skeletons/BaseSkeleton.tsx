import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useTheme, createTheme, ThemeProvider } from "@mui/material/styles";

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
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import useMediaQuery from '@mui/material/useMediaQuery';
import useTheme1 from '@mui/material/styles';
import Skeleton from '@mui/material/Skeleton';
import { SkeletonProps } from '@mui/material/Skeleton';
import SecurityRounded from '@mui/icons-material/SecurityRounded';

export interface BaseSkeletonProps extends Omit<SkeletonProps, "variant"> {
  variant?: "text" | "rectangular" | "circular"
  width?: number | string
  height?: number | string
  animation?: "pulse" | "wave" | false
}

/**
 * Base skeleton component with consistent styling and theme support
 */
export function BaseSkeleton({
  variant = "rectangular",
  width,
  height,
  animation = "pulse",
  sx,
  ...props
}: BaseSkeletonProps) {
  const theme = useTheme<ExtendedTheme>()

  return (
    <Skeleton
      variant={variant}
      width={width}
      height={height}
      animation={animation}
      sx={{
        bgcolor:
          theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.11)"
            : "rgba(0, 0, 0, 0.11)",
        ...sx,
      }}
      {...props}
    />
  )
}
