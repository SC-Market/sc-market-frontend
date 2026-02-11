/**
 * Validation for market listing photo uploads.
 * Kept in domain so API layer stays thin.
 */
import Alert from '@mui/material/Alert';

import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from '@mui/material/Snackbar';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { responsiveFontSizes } from '@mui/material/styles';
import CarRentalRounded from '@mui/icons-material/CarRentalRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';

export type PhotoUploadParams = | { status: "valid"; listingId: string; photos: File[] }
| { status: "invalid"; error: string };

export function validatePhotoUploadParams(
  listingId: string | undefined,
  photos: File[],
): PhotoUploadParams {
  if (!listingId) {
    return {
      status: "invalid",
      error: "Listing ID is required for photo upload",
    }
  }
  if (!photos || photos.length === 0) {
    return { status: "invalid", error: "At least one photo is required" }
  }
  return { status: "valid", listingId, photos }
}
