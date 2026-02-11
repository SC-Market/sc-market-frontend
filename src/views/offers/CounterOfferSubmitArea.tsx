import LoadingButton from "@mui/lab/LoadingButton"
import { Stack } from "@mui/system"
import React, { useCallback } from "react"
import { OfferSession, useCounterOfferMutation } from "../../store/offer"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { useNavigate } from "react-router-dom"
import { useCounterOffer } from "../../hooks/offer/CounterOfferDetails"
import Grid from "@mui/material/Grid"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Fade from '@mui/material/Fade';
import IconButton from '@mui/material/IconButton';
import MaterialLink from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Avatar from '@mui/material/Avatar';
import LinearProgress from '@mui/material/LinearProgress';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CardActions from '@mui/material/CardActions';
import CardMedia from '@mui/material/CardMedia';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Table from '@mui/material/Table';
import CreateRounded from '@mui/icons-material/CreateRounded';
import PersonRounded from '@mui/icons-material/PersonRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import ZoomInRounded from '@mui/icons-material/ZoomInRounded';
import LocalShipping from '@mui/icons-material/LocalShipping';
import DeleteRounded from '@mui/icons-material/DeleteRounded';

export function CounterOfferSubmitArea(props: { session: OfferSession }) {
  const { session } = props
  const [counterOffer, { isLoading: counterOfferLoading }] =
    useCounterOfferMutation()
  const issueAlert = useAlertHook()
  const navigate = useNavigate()
  const [body, setBody] = useCounterOffer()
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()

  const counterOfferCallback = useCallback(() => {
    counterOffer(body)
      .unwrap()
      .then((result) => {
        issueAlert({
          message: t("CounterOfferSubmitArea.counterOfferSubmitted", {
            defaultValue: "Counter offer submitted successfully",
          }),
          severity: "success",
        })
        navigate(`/offer/${session.id}`)
      })
      .catch(issueAlert)
  }, [counterOffer, body, navigate, session.id, issueAlert, t])

  return (
    <Grid item xs={12}>
      <Stack
        direction="row"
        justifyContent={"right"}
        spacing={theme.layoutSpacing.compact}
      >
        <LoadingButton
          color={"secondary"}
          variant={"contained"}
          loading={counterOfferLoading}
          onClick={counterOfferCallback}
        >
          {t("CounterOfferSubmitArea.submitCounterOffer")}
        </LoadingButton>
      </Stack>
    </Grid>
  )
}
