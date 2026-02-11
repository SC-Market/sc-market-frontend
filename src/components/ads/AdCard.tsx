import React from "react"
import { AdConfig } from "./types"
import { useMarketSidebarExp } from "../../features/market"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import Paper from '@mui/material/Paper';
import Fade from '@mui/material/Fade';
import useMediaQuery from '@mui/material/useMediaQuery';
import CookieRounded from '@mui/icons-material/CookieRounded';

interface AdCardProps {
  /** The ad configuration to display */
  ad: AdConfig
  /** Index for animation delay */
  index: number
  /** If true, renders without Grid item wrapper (for use in VirtualizedGrid) */
  noGridWrapper?: boolean
}

/**
 * AdCard component that displays an ad in a Paper component the size of a listing.
 * Opens the ad link in a new tab when clicked.
 */
export function AdCard(props: AdCardProps) {
  const { ad, index, noGridWrapper = false } = props
  const marketSidebarOpen = useMarketSidebarExp()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    window.open(ad.linkUrl, "_blank", "noopener,noreferrer")
  }

  const content = (
    <Fade
      in={true}
      style={{
        transitionDelay: `${50 + 50 * index}ms`,
        transitionDuration: "500ms",
      }}
    >
      <a
        href={ad.linkUrl}
        onClick={handleClick}
        style={{
          textDecoration: "none",
          color: "inherit",
          display: "block",
          width: "100%",
          height: "100%",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            height: isMobile ? 300 : 420,
            position: "relative",
            overflow: "hidden",
            borderRadius: theme.spacing(theme.borderRadius.topLevel),
            cursor: "pointer",
            width: "100%",
            "&:hover": {
              elevation: 6,
            },
          }}
        >
          <img
            src={ad.imageUrl}
            alt={`Ad: ${ad.title}`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
            loading="lazy"
          />
        </Paper>
      </a>
    </Fade>
  )

  if (noGridWrapper) {
    return <Box sx={{ width: "100%", height: "100%" }}>{content}</Box>
  }

  return (
    <Grid
      item
      xs={marketSidebarOpen ? 12 : 6}
      md={marketSidebarOpen ? 12 : 4}
      lg={marketSidebarOpen ? 6 : 4}
      xl={marketSidebarOpen ? 4 : 3}
      xxl={marketSidebarOpen ? 4.8 : 2.4}
      sx={{ transition: "0.3s" }}
    >
      {content}
    </Grid>
  )
}
