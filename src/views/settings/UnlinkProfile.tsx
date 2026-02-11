import React from "react"
import { useProfileUnlinkAccountMutation } from "../../store/profile"
import { useTranslation } from "react-i18next"
import LoadingButton from "@mui/lab/LoadingButton"
import { FlatSection } from "../../components/paper/Section"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { BottomSheet } from "../../components/mobile/BottomSheet"

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
import List from '@mui/material/List';
import CircularProgress from '@mui/material/CircularProgress';
import Fab from '@mui/material/Fab';
import Popover from '@mui/material/Popover';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import CreateRounded from '@mui/icons-material/CreateRounded';
import SettingsRounded from '@mui/icons-material/SettingsRounded';
import StoreRounded from '@mui/icons-material/StoreRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import DescriptionRounded from '@mui/icons-material/DescriptionRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import ForumRounded from '@mui/icons-material/ForumRounded';
import DashboardRounded from '@mui/icons-material/DashboardRounded';
import BusinessRounded from '@mui/icons-material/BusinessRounded';
import CalendarMonthRounded from '@mui/icons-material/CalendarMonthRounded';
import ListAltRounded from '@mui/icons-material/ListAltRounded';
import WarehouseRounded from '@mui/icons-material/WarehouseRounded';
import DashboardCustomizeRounded from '@mui/icons-material/DashboardCustomizeRounded';
import AssignmentTurnedInRounded from '@mui/icons-material/AssignmentTurnedInRounded';
import Block from '@mui/icons-material/Block';
import PersonRemove from '@mui/icons-material/PersonRemove';

export function UnlinkProfile() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [unlinkAccount, { isLoading, isSuccess, isError, error }] =
    useProfileUnlinkAccountMutation()
  const [open, setOpen] = React.useState(false)

  const handleUnlinkClick = () => {
    setOpen(true)
  }

  const handleConfirmUnlink = () => {
    unlinkAccount()
    setOpen(false)
  }

  const handleCancelUnlink = () => {
    setOpen(false)
  }

  return (
    <>
      <FlatSection title={t("settings.profile.unlinkTitle")}>
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary" paragraph>
            {t("settings.profile.unlinkDescription")}
          </Typography>
        </Grid>

        <Grid item xs={12} display="flex" justifyContent="flex-end">
          <Button
            variant="outlined"
            color="error"
            onClick={handleUnlinkClick}
            disabled={isLoading}
          >
            {t("settings.profile.unlinkButton")}
          </Button>
        </Grid>

        {isSuccess && (
          <Grid item xs={12}>
            <Alert severity="success">
              {t("settings.profile.unlinkSuccess")}
            </Alert>
          </Grid>
        )}

        {isError && (
          <Grid item xs={12}>
            <Alert severity="error">
              {t("settings.profile.unlinkError")}
              {error && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {"data" in error &&
                  typeof error.data === "object" &&
                  error.data &&
                  "message" in error.data
                    ? String(error.data.message)
                    : "Unknown error occurred"}
                </Typography>
              )}
            </Alert>
          </Grid>
        )}
      </FlatSection>

      {/* On mobile, use BottomSheet */}
      {isMobile ? (
        <BottomSheet
          open={open}
          onClose={handleCancelUnlink}
          title={t("settings.profile.unlinkDialogTitle")}
          maxHeight="90vh"
        >
          <DialogContentText id="unlink-dialog-description">
            {t("settings.profile.unlinkDialogDescription")}
          </DialogContentText>
          <Box
            sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}
          >
            <Button onClick={handleCancelUnlink}>
              {t("settings.profile.unlinkDialogCancel")}
            </Button>
            <LoadingButton
              onClick={handleConfirmUnlink}
              color="error"
              loading={isLoading}
              variant="contained"
            >
              {t("settings.profile.unlinkDialogConfirm")}
            </LoadingButton>
          </Box>
        </BottomSheet>
      ) : (
        <Dialog
          open={open}
          onClose={handleCancelUnlink}
          aria-labelledby="unlink-dialog-title"
          aria-describedby="unlink-dialog-description"
        >
          <DialogTitle id="unlink-dialog-title">
            {t("settings.profile.unlinkDialogTitle")}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="unlink-dialog-description">
              {t("settings.profile.unlinkDialogDescription")}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelUnlink}>
              {t("settings.profile.unlinkDialogCancel")}
            </Button>
            <LoadingButton
              onClick={handleConfirmUnlink}
              color="error"
              loading={isLoading}
              variant="contained"
            >
              {t("settings.profile.unlinkDialogConfirm")}
            </LoadingButton>
          </DialogActions>
        </Dialog>
      )}
    </>
  )
}
