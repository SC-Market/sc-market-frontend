import React from "react"
import { useTranslation } from "react-i18next"

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

interface SentinelCodeProps {
  code: string
}

export function SentinelCode({ code }: SentinelCodeProps) {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <Tooltip title={t("authenticateRSI.click_to_copy", "Click to copy")}>
      <span
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(code)
          } catch (err) {
            // Clipboard API might not be available, but text is still selectable
          }
        }}
        style={{
          color: theme.palette.primary.main,
          backgroundColor: "rgba(0, 0, 0, 0.05)",
          padding: "2px 6px",
          borderRadius: "4px",
          cursor: "pointer",
          userSelect: "text",
          display: "inline-block",
        }}
      >
        {code}
      </span>
    </Tooltip>
  )
}
