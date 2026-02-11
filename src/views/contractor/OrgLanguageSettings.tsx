import React, { useState, useEffect } from "react"
import { FlatSection } from "../../components/paper/Section"
import { LanguageSelector } from "../../components/settings/LanguageSelector"
import {
  useGetContractorLanguagesQuery,
  useSetContractorLanguagesMutation,
} from "../../store/contractor"
import { useTranslation } from "react-i18next"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { useGetUserProfileQuery } from "../../store/profile"
import { has_permission } from "./OrgRoles"
import LoadingButton from "@mui/lab/LoadingButton"

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Autocomplete from '@mui/material/Autocomplete';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { MenuProps } from '@mui/material/MenuProps';
import ButtonGroup from '@mui/material/ButtonGroup';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import MuiLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Fade from '@mui/material/Fade';
import Skeleton from '@mui/material/Skeleton';
import { AutocompleteRenderInputParams } from '@mui/material/Autocomplete';
import Drawer from '@mui/material/Drawer';
import Rating from '@mui/material/Rating';
import useMediaQuery from '@mui/material/useMediaQuery';
import List from '@mui/material/List';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import Google from '@mui/icons-material/Google';
import ReplyRounded from '@mui/icons-material/ReplyRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import ContentCopyRounded from '@mui/icons-material/ContentCopyRounded';
import CopyAllRounded from '@mui/icons-material/CopyAllRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import Block from '@mui/icons-material/Block';
import PersonRemove from '@mui/icons-material/PersonRemove';

export function OrgLanguageSettings() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()
  const [contractor] = useCurrentOrg()
  const { data: profile } = useGetUserProfileQuery()
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const canManageOrgDetails =
    contractor && profile
      ? has_permission(
          contractor,
          profile,
          "manage_org_details",
          profile?.contractors,
        )
      : false

  const {
    data: languagesData,
    isLoading,
    error,
  } = useGetContractorLanguagesQuery(contractor?.spectrum_id || "", {
    skip: !contractor?.spectrum_id,
  })

  const [setLanguages] = useSetContractorLanguagesMutation()

  // Update local state when data loads
  useEffect(() => {
    if (languagesData?.languages) {
      setSelectedLanguages(languagesData.languages.map((lang) => lang.code))
    }
  }, [languagesData])

  const handleSave = async () => {
    if (!contractor?.spectrum_id) return

    setSaving(true)

    try {
      await setLanguages({
        spectrum_id: contractor.spectrum_id,
        language_codes: selectedLanguages,
      }).unwrap()
      issueAlert({
        message: t(
          "settings.languages.saveSuccess",
          "Languages updated successfully",
        ),
        severity: "success",
      })
    } catch (err: any) {
      issueAlert({
        message:
          err?.data?.error?.message ||
          t("settings.languages.saveError", "Failed to update languages"),
        severity: "error",
      })
    } finally {
      setSaving(false)
    }
  }

  if (!canManageOrgDetails) {
    return (
      <FlatSection title={t("settings.languages.title", "Supported Languages")}>
        <Grid item xs={12}>
          <Alert severity="warning">
            {t(
              "settings.languages.noPermission",
              "You do not have permission to manage organization languages",
            )}
          </Alert>
        </Grid>
      </FlatSection>
    )
  }

  return (
    <FlatSection title={t("settings.languages.title", "Supported Languages")}>
      <Grid item xs={12}>
        <Typography variant="body2" color="text.secondary" paragraph>
          {t(
            "settings.languages.org.description",
            "Select the languages your organization can communicate in.",
          )}
        </Typography>
      </Grid>

      {error && (
        <Grid item xs={12}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {t("settings.languages.loadError", "Failed to load languages")}
          </Alert>
        </Grid>
      )}

      {isLoading ? (
        <Grid item xs={12}>
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        </Grid>
      ) : (
        <>
          <Grid item xs={12}>
            <LanguageSelector
              selectedLanguages={selectedLanguages}
              onChange={setSelectedLanguages}
              label={t("settings.languages.label", "Supported Languages")}
              helperText={t(
                "settings.languages.org.helperText",
                "Select the languages your organization can communicate in",
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <LoadingButton
                variant="outlined"
                onClick={handleSave}
                loading={saving}
                color="primary"
              >
                {t("settings.languages.save", "Save Languages")}
              </LoadingButton>
            </Box>
          </Grid>
        </>
      )}
    </FlatSection>
  )
}
