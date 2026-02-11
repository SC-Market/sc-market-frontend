import { Section } from "../../components/paper/Section"
import React, { useCallback, useState } from "react"
import { useProfileCreateWebhook } from "../../store/profile"
import { useCreateContractorWebhookMutation } from "../../store/contractor"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { URL_REGEX } from "../../util/parsing"
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
import Grid from '@mui/material/Grid';
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
import CreateRounded from '@mui/icons-material/CreateRounded';
import PersonRounded from '@mui/icons-material/PersonRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import ZoomInRounded from '@mui/icons-material/ZoomInRounded';
import LocalShipping from '@mui/icons-material/LocalShipping';

// Checkbox item for webhook notification action selection
function NotificationActionCheck(props: {
  label: string
  action_name: string
  actions: string[]
  setActions: (a: string[]) => void
}) {
  const { action_name, setActions, label, actions } = props

  return (
    <Grid item>
      <FormControlLabel
        control={
          <Checkbox
            // checked={state.checkedB}
            onChange={(event: React.ChangeEvent<{ checked: boolean }>) => {
              if (event.target.checked) {
                if (actions.indexOf(action_name) === -1) {
                  setActions([...actions, action_name])
                }
              } else {
                setActions(actions.filter((item) => item !== action_name))
              }
            }}
            color={"secondary"}
            name={label}
          />
        }
        label={label}
      />
    </Grid>
  )
}

export function AddNotificationWebhook(props: { org?: boolean }) {
  const theme = useTheme<ExtendedTheme>()
  const [currentOrg] = useCurrentOrg()
  const [name, setName] = useState("")
  const [url, setURL] = useState("")
  const [actions, setActions] = useState<string[]>([])

  const [
    createUserWebhook, // This is the mutation trigger
  ] = useProfileCreateWebhook()
  const [
    createContractorWebhook, // This is the mutation trigger
  ] = useCreateContractorWebhookMutation()

  const issueAlert = useAlertHook()
  const { t } = useTranslation()

  const submitCreateForm = useCallback(
    async (event: any) => {
      // event.preventDefault();
      let response
      if (props.org) {
        response = createContractorWebhook({
          contractor: currentOrg!.spectrum_id,
          body: {
            name: name,
            webhook_url: url,
            actions,
          },
        })
      } else {
        response = createUserWebhook({
          name: name,
          webhook_url: url,
          actions,
        })
      }

      response
        .unwrap()
        .then((res) => {
          issueAlert({
            message: t("AddNotificationWebhook.submitted"),
            severity: "success",
          })
        })
        .catch((err) => {
          issueAlert(err)
        })

      return false
    },
    [
      createContractorWebhook,
      createUserWebhook,
      currentOrg,
      name,
      props.org,
      issueAlert,
      actions,
      url,
      t,
    ],
  )

  return (
    <Section xs={12} lg={12}>
      <Grid item xs={12}>
        <Typography
          variant={"h6"}
          align={"left"}
          color={"text.secondary"}
          sx={{ fontWeight: "bold" }}
        >
          {t("AddNotificationWebhook.addWebhook")}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Divider light />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          id="name"
          color={"secondary"}
          label={t("AddNotificationWebhook.webhookName")}
          value={name}
          onChange={(event: any) => {
            setName(event.target.value)
          }}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          id="url"
          color={"secondary"}
          label={t("AddNotificationWebhook.webhookUrl")}
          value={url}
          onChange={(event: any) => {
            setURL(event.target.value)
          }}
          error={!!url && !url.match(URL_REGEX)}
          helperText={
            !!url && !url.match(URL_REGEX)
              ? t("AddNotificationWebhook.invalidUrl")
              : undefined
          }
        />
      </Grid>

      <Grid item xs={12}>
        <Grid
          container
          spacing={theme.layoutSpacing.compact}
          direction={"column"}
        >
          <NotificationActionCheck
            actions={actions}
            setActions={setActions}
            label={t("AddNotificationWebhook.orderCreated")}
            action_name={"order_create"}
          />
          <NotificationActionCheck
            actions={actions}
            setActions={setActions}
            label={t("AddNotificationWebhook.orderAssigned")}
            action_name={"order_assigned"}
          />
          <NotificationActionCheck
            actions={actions}
            setActions={setActions}
            label={t("AddNotificationWebhook.publicOrderCreated")}
            action_name={"public_order_create"}
          />
          <NotificationActionCheck
            actions={actions}
            setActions={setActions}
            label={t("AddNotificationWebhook.orderStatusChange")}
            action_name={"order_status_change"}
          />
          <NotificationActionCheck
            actions={actions}
            setActions={setActions}
            label={t("AddNotificationWebhook.orderReview")}
            action_name={"order_review"}
          />
          <NotificationActionCheck
            actions={actions}
            setActions={setActions}
            label={t("AddNotificationWebhook.orderComment")}
            action_name={"order_comment"}
          />
          <NotificationActionCheck
            actions={actions}
            setActions={setActions}
            label={t("AddNotificationWebhook.marketBid")}
            action_name={"market_item_bid"}
          />
          {/*<NotificationActionCheck actions={actions} setActions={setActions} label={"Market Offer Received"}*/}
          {/*                         action_name={"market_item_offer"}/>*/}
        </Grid>
      </Grid>

      <Grid item container justifyContent={"center"}>
        <Button
          variant={"outlined"}
          color={"primary"}
          onClick={submitCreateForm}
        >
          {t("AddNotificationWebhook.submit")}
        </Button>
      </Grid>
    </Section>
  )
}
