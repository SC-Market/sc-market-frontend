import { Link } from "react-router-dom"
import React from "react"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import useMediaQuery from '@mui/material/useMediaQuery';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import CreateRounded from '@mui/icons-material/CreateRounded';

export function ServiceActions() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  return (
    <Grid container justifyContent={{ xs: "stretch", sm: "flex-end" }}>
      <Grid item xs={12} sm="auto">
        <Link
          to={"/order/service/create"}
          style={{ color: "inherit", textDecoration: "none", display: "block" }}
        >
          <Button
            color={"secondary"}
            startIcon={<CreateRounded />}
            variant={"contained"}
            size={isMobile ? "medium" : "large"}
            fullWidth={isMobile}
          >
            {t("service_actions.create_service", {
              defaultValue: "Create Service",
            })}
          </Button>
        </Link>
      </Grid>
    </Grid>
  )
}
