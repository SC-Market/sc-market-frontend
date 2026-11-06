import {
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  TextField,
  Typography,
} from "@mui/material"
import { Section } from "../../components/paper/Section"
import React, { useCallback, useState } from "react"
import { useParams } from "react-router-dom"
import { useCreateWebhook } from "../../features/notifications/hooks/useNotificationChannelActions"
import { URL_REGEX } from "../../util/parsing"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

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
  const { contractor_id } = useParams<{ contractor_id: string }>()
  const [name, setName] = useState("")
  const [url, setURL] = useState("")
  const [actions, setActions] = useState<string[]>([])

  const createWebhook = useCreateWebhook(!!props.org, contractor_id)
  const { t } = useTranslation()

  const submitCreateForm = useCallback(async () => {
    await createWebhook(name, url, actions)
    return false
  }, [createWebhook, name, url, actions])

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
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
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
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
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
          <NotificationActionCheck
            actions={actions}
            setActions={setActions}
            label={t(
              "AddNotificationWebhook.publicContractCreated",
              "New public contracts (site-wide)",
            )}
            action_name={"public_contract_create"}
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
