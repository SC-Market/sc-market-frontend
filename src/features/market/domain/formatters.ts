/**
 * Market search: URL params ↔ UI state mapping.
 * Keeps mapping/formatting in domain; hooks use these and handle orchestration.
 */

import type { MarketSearchState, SaleType } from "./types"

import Alert from '@mui/material/Alert';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from '@mui/material/Snackbar';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { responsiveFontSizes } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Fab from '@mui/material/Fab';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Modal from '@mui/material/Modal';
import CarRentalRounded from '@mui/icons-material/CarRentalRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import MarkEmailReadRounded from '@mui/icons-material/MarkEmailReadRounded';
import MarkEmailUnreadRounded from '@mui/icons-material/MarkEmailUnreadRounded';
import ShareRounded from '@mui/icons-material/ShareRounded';
import AddAPhotoRounded from '@mui/icons-material/AddAPhotoRounded';
import SaveRounded from '@mui/icons-material/SaveRounded';
import EditRounded from '@mui/icons-material/EditRounded';

/** Read URL params via a simple getter (e.g. URLSearchParams from react-router). */
export type ParamsGetter = (key: string) => string | null

/** Extended params getter that also provides access to all keys */
export type ExtendedParamsGetter = {
  get: (key: string) => string | null
  keys: () => IterableIterator<string>
}

/**
 * Build MarketSearchState from URL params.
 * Used by useMarketSearch to derive state from the URL.
 */
export function paramsToSearchState(
  getParam: ParamsGetter | ExtendedParamsGetter,
  defaultPageSize: number,
): MarketSearchState {
  // Parse attribute parameters from URL
  // Format: ?attr_size=4,5&attr_class=Military
  const attributes: Record<string, string[]> = {}

  // Check if we have the extended getter with keys() method
  if (typeof getParam === "object" && "keys" in getParam && "get" in getParam) {
    // Iterate through all params to find attr_* parameters
    for (const key of getParam.keys()) {
      if (key.startsWith("attr_")) {
        const attrName = key.substring(5) // Remove 'attr_' prefix
        const value = getParam.get(key)
        if (value) {
          attributes[attrName] = value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        }
      }
    }
  }

  // Support both getter function and extended getter object.
  // Use a wrapper so URLSearchParams.get is called with correct 'this' (don't extract .get).
  const get = (key: string): string | null =>
    typeof getParam === "function" ? getParam(key) : getParam.get(key)

  return {
    sort: get("sort") || "activity",
    sale_type: (get("kind") as SaleType) || undefined,
    item_type: get("type") || undefined,
    quantityAvailable:
      get("quantityAvailable") !== null ? +(get("quantityAvailable") ?? 0) : 1,
    minCost: +(get("minCost") ?? 0) || 0,
    maxCost: get("maxCost") ? +(get("maxCost") ?? 0) : undefined,
    query: get("query") || "",
    statuses: get("statuses") || "active",
    index: get("index") ? +(get("index") ?? 0) : undefined,
    page_size: get("page_size") ? +(get("page_size") ?? 0) : defaultPageSize,
    language_codes: get("language_codes")
      ? (get("language_codes") ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined,
    attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
  } as MarketSearchState
}

/**
 * Build URL params object from MarketSearchState (omits defaults).
 * Used by useMarketSearch when applying filters; only defined keys are set.
 */
export function searchStateToParams(
  state: MarketSearchState,
  defaultPageSize: number,
): Record<string, string> {
  const obj: Record<string, string> = {
    ...(state.query ? { query: state.query } : {}),
    ...(state.sale_type && state.sale_type !== "any"
      ? { kind: state.sale_type }
      : {}),
    ...(state.item_type && state.item_type !== "any"
      ? { type: state.item_type }
      : {}),
    ...(state.quantityAvailable !== undefined && state.quantityAvailable !== 1
      ? { quantityAvailable: String(state.quantityAvailable) }
      : {}),
    ...(state.minCost ? { minCost: String(state.minCost) } : {}),
    ...(state.maxCost != null ? { maxCost: String(state.maxCost) } : {}),
    ...(state.sort && state.sort !== "activity" ? { sort: state.sort } : {}),
    ...(state.statuses && state.statuses !== "active"
      ? { statuses: state.statuses }
      : {}),
    ...(state.index !== undefined && state.index !== 0
      ? { index: String(state.index) }
      : {}),
    ...(state.page_size !== undefined && state.page_size !== defaultPageSize
      ? { page_size: String(state.page_size) }
      : {}),
    ...(state.language_codes && state.language_codes.length > 0
      ? { language_codes: state.language_codes.join(",") }
      : {}),
  }

  // Serialize attributes to URL query parameters
  // Format: ?attr_size=4,5&attr_class=Military
  if (state.attributes) {
    Object.entries(state.attributes).forEach(([name, values]) => {
      if (values && values.length > 0) {
        obj[`attr_${name}`] = values.join(",")
      }
    })
  }

  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== ""),
  )
}
