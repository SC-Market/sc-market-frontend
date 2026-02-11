import { useCurrentOrg } from "../../../hooks/login/CurrentOrg"
import { FlatSection } from "../../../components/paper/Section"
import { MarkdownEditor } from "../../../components/markdown/Markdown"
import React, { useCallback, useEffect, useState } from "react"
import {
  useGetUserProfileQuery,
  useUpdateProfile,
} from "../../../store/profile"
import LoadingButton from "@mui/lab/LoadingButton"
import { useUpdateContractorMutation } from "../../../store/contractor"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { useTranslation } from "react-i18next" // Localization
import { OrderSettings } from "../../../components/settings/OrderSettings"

import { SxProps } from '@mui/material/SxProps';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Breakpoint from '@mui/material/Breakpoint';
import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import MaterialLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Divider from '@mui/material/Divider';
import Autocomplete from '@mui/material/Autocomplete';
import InputAdornment from '@mui/material/InputAdornment';
import ButtonBase from '@mui/material/ButtonBase';
import CardMedia from '@mui/material/CardMedia';
import Modal from '@mui/material/Modal';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import CreateRounded from '@mui/icons-material/CreateRounded';
import DesignServicesRounded from '@mui/icons-material/DesignServicesRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import PersonAddRounded from '@mui/icons-material/PersonAddRounded';
import StarRounded from '@mui/icons-material/StarRounded';
import StorefrontRounded from '@mui/icons-material/StorefrontRounded';
import LinkRounded from '@mui/icons-material/LinkRounded';
import AddRounded from '@mui/icons-material/AddRounded';
import RemoveRounded from '@mui/icons-material/RemoveRounded';
import SaveRounded from '@mui/icons-material/SaveRounded';
import InventoryRounded from '@mui/icons-material/InventoryRounded';
import RadioButtonCheckedRounded from '@mui/icons-material/RadioButtonCheckedRounded';
import RadioButtonUncheckedRounded from '@mui/icons-material/RadioButtonUncheckedRounded';

export function MarketEditTemplate(props: { org?: boolean }) {
  const { t } = useTranslation() // Localization hook

  const [contractor] = useCurrentOrg()
  const { data: profile } = useGetUserProfileQuery()

  const [template, setTemplate] = useState("")

  useEffect(() => {
    setTemplate(
      (props.org
        ? contractor?.market_order_template
        : profile?.market_order_template) || "",
    )
  }, [contractor, props.org, profile])

  const [updateProfile, { isLoading: profileUpdateLoading }] =
    useUpdateProfile()
  const [updateOrg, { isLoading: orgUpdateLoading }] =
    useUpdateContractorMutation()

  const issueAlert = useAlertHook()

  const callback = useCallback(() => {
    let response
    if (props.org) {
      response = updateOrg({
        contractor: contractor!.spectrum_id,
        body: {
          market_order_template: template,
        },
      })
    } else {
      response = updateProfile({
        market_order_template: template,
      })
    }

    response
      .unwrap()
      .then((res) => {
        issueAlert({
          severity: "success",
          message: t("MarketEditTemplate.submitted"),
        })
      })
      .catch((err) => issueAlert(err))
  }, [template, contractor, t, props.org, updateOrg, updateProfile, issueAlert])

  return (
    <>
      <Grid item xs={12}>
        <FlatSection title={t("MarketEditTemplate.title")}>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" paragraph>
              {t("MarketEditTemplate.configure")}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <MarkdownEditor value={template} onChange={setTemplate} />
          </Grid>
          <Grid item xs={12}>
            <LoadingButton
              loading={orgUpdateLoading || profileUpdateLoading}
              onClick={callback}
              variant={"contained"}
              disabled={props.org && !contractor}
            >
              {t("MarketEditTemplate.submit")}
            </LoadingButton>
          </Grid>
        </FlatSection>
      </Grid>

      {/* Order Settings Section */}
      <OrderSettings
        entityType={props.org ? "contractor" : "user"}
        entityId={props.org ? contractor?.spectrum_id : undefined}
      />
    </>
  )
}
