import { BACKEND_URL, isCitizenIdEnabled } from "../../util/constants"
import React from "react"
import { useLocation, useSearchParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { CitizenIDLogo } from "../icon/CitizenIDLogo"

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
import { ButtonProps } from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import MaterialLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { GridProps } from '@mui/material/Grid';
import ButtonGroup from '@mui/material/ButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import CookieRounded from '@mui/icons-material/CookieRounded';
import ZoomIn from '@mui/icons-material/ZoomIn';
import ZoomOut from '@mui/icons-material/ZoomOut';
import FitScreen from '@mui/icons-material/FitScreen';
import Close from '@mui/icons-material/Close';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRounded from '@mui/icons-material/KeyboardArrowUpRounded';

export function CitizenIDSignUpButton() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { t } = useTranslation()

  if (!isCitizenIdEnabled) {
    return null
  }

  // Get redirect path from query params (if coming from pageAuthentication redirect)
  // Otherwise use current pathname
  const redirectPath = searchParams.get("redirect") || location.pathname

  return (
    <Button
      onClick={() => {
        window.location.href = `${BACKEND_URL}/auth/citizenid?path=${encodeURIComponent(redirectPath)}&action=signup`
      }}
      color="primary"
      variant="contained"
      startIcon={<CitizenIDLogo />}
      aria-label={t("auth.signUpWithCitizenID", "Sign up with Citizen iD")}
      aria-describedby="citizenid-signup-description"
    >
      {t("auth.signUpWithCitizenID", "Sign up with Citizen iD")}
      <span id="citizenid-signup-description" className="sr-only">
        {t(
          "accessibility.signUpWithCitizenIDDescription",
          "Create a new account using your Citizen iD account",
        )}
      </span>
    </Button>
  )
}
