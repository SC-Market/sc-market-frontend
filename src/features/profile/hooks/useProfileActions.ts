import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  useUpdateProfile,
  useProfileUploadAvatarMutation,
} from "../../../store/profile"
import { useAlertHook } from "../../../hooks/alert/AlertHook"

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
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import { useTheme } from '@mui/material/styles';
import MaterialLink from '@mui/material/Link';
import Collapse from '@mui/material/Collapse';
import ListItem from '@mui/material/ListItem';
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
import CreateRounded from '@mui/icons-material/CreateRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import StorefrontRounded from '@mui/icons-material/StorefrontRounded';
import UpdateRounded from '@mui/icons-material/UpdateRounded';

export function useProfileActions() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [updateProfile] = useUpdateProfile()
  const [uploadAvatar, { isLoading: isUploadingAvatar }] =
    useProfileUploadAvatarMutation()

  const [avatarFileInputRef, setAvatarFileInputRef] =
    useState<HTMLInputElement | null>(null)

  async function submitUpdate(data: { about?: string; display_name?: string }) {
    const res: { data?: unknown; error?: unknown } = await updateProfile(data)
    if (res?.data && !res?.error) {
      issueAlert({ message: t("viewProfile.submitted"), severity: "success" })
    } else {
      issueAlert({
        message: `${t("viewProfile.failed")} ${
          (res?.error as { error?: string; data?: { error?: string } })
            ?.error ||
          (res?.error as { error?: string; data?: { error?: string } })?.data
            ?.error ||
          res?.error
        }`,
        severity: "error",
      })
    }
    return false
  }

  function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 1 * 1000 * 1000) {
      issueAlert({
        message: t("viewProfile.avatar_too_large", {
          defaultValue: "Avatar must be less than 1MB",
        }),
        severity: "error",
      })
      return
    }
    uploadAvatar(file)
      .unwrap()
      .then(() => {
        issueAlert({
          message: t("viewProfile.avatar_uploaded", {
            defaultValue: "Avatar uploaded successfully",
          }),
          severity: "success",
        })
      })
      .catch(issueAlert)
      .finally(() => {
        if (avatarFileInputRef) avatarFileInputRef.value = ""
      })
  }

  return {
    submitUpdate,
    handleAvatarUpload,
    isUploadingAvatar,
    avatarFileInputRef,
    setAvatarFileInputRef,
  }
}
