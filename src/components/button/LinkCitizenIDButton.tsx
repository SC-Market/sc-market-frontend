import { BACKEND_URL, isCitizenIdEnabled } from "../../util/constants"
import React from "react"
import { useLocation } from "react-router-dom"
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

export function LinkCitizenIDButton() {
  const location = useLocation()
  const { t } = useTranslation()

  if (!isCitizenIdEnabled) {
    return null
  }

  return (
    <Button
      onClick={() => {
        window.location.href = `${BACKEND_URL}/auth/citizenid/link`
      }}
      color="primary"
      variant="outlined"
      startIcon={<CitizenIDLogo />}
      aria-label={t("auth.linkCitizenID", "Link Citizen iD")}
      aria-describedby="link-citizenid-description"
    >
      {t("auth.linkCitizenID", "Link Citizen iD")}
      <span id="link-citizenid-description" className="sr-only">
        {t(
          "accessibility.linkCitizenIDDescription",
          "Link your Citizen iD account to your existing account",
        )}
      </span>
    </Button>
  )
}
