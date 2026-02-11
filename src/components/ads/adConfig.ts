import { AdConfig } from "./types"
import ionImage from "../../assets/ion.png"
import infernoImage from "../../assets/inferno.png"
import perseusImage from "../../assets/perseus.png"

import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Grid from '@mui/material/Grid';
import Snackbar from '@mui/material/Snackbar';
import CookieRounded from '@mui/icons-material/CookieRounded';

/**
 * Static configuration for market ads.
 * These are "in-universe" Star Citizen ads that appear between listings.
 *
 * To add a new ad:
 * 1. Add a new AdConfig object to this array
 * 2. Ensure the imageUrl points to a valid image (should match listing card dimensions)
 * 3. The ad will automatically rotate with other ads based on position
 */
export const MARKET_ADS: AdConfig[] = [
  {
    id: "ion",
    title: "Ion",
    imageUrl: ionImage,
    linkUrl:
      "https://robertsspaceindustries.com/en/comm-link/transmission/17379-Crusader-Ares",
    description: "Crusader Industries Ares Series",
  },
  {
    id: "inferno",
    title: "Inferno",
    imageUrl: infernoImage,
    linkUrl:
      "https://robertsspaceindustries.com/en/comm-link/transmission/17379-Crusader-Ares",
    description: "Crusader Industries Ares Series",
  },
  {
    id: "perseus",
    title: "Perseus",
    imageUrl: perseusImage,
    linkUrl:
      "https://robertsspaceindustries.com/en/comm-link/transmission/20738-RSI-Perseus",
    description: "RSI Perseus",
  },
]

/**
 * Frequency at which ads appear (every N listings)
 * Ads will appear at positions 24, 48, 72, etc.
 */
export const AD_FREQUENCY = 24
