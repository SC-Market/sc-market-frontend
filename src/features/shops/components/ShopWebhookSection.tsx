import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { DeleteRounded } from "@mui/icons-material"
import { useGetShopWebhooksQuery } from "../../../store/api/v2/market"
import { useShopWebhooks } from "../hooks/useShopSettingsActions"
import { WEBHOOK_ACTIONS } from "../domain/webhookEvents"
import { HelpLink } from "../../help/components/HelpLink"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { FormPaper } from "../../../components/paper/FormPaper"
import { URL_REGEX } from "../../../util/parsing"
import AddRounded from "@mui/icons-material/AddRounded"

// Catalog key for each webhook event's label and description.
export const WEBHOOK_ACTION_KEYS: Record<string, string> = {
  order_create: "orderCreate",
  order_assigned: "orderAssigned",
  order_status_change: "orderStatusChange",
  order_review: "orderReview",
  market_item_bid: "marketItemBid",
  public_contract_create: "publicContractCreate",
}

export function ShopWebhookSection({ shopId }: { shopId: string }) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { data: webhooks = [] } = useGetShopWebhooksQuery({ shopId })
  const shopWebhooks = useShopWebhooks(shopId)

  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [actions, setActions] = useState<string[]>([])

  const { create: createWebhook, remove: handleDelete } = shopWebhooks
  const handleCreate = useCallback(async () => {
    if (await createWebhook({ name, webhook_url: url, actions })) {
      setName("")
      setUrl("")
      setActions([])
    }
  }, [name, url, actions, createWebhook])

  const toggleAction = (action_name: string, checked: boolean) => {
    if (checked) {
      setActions((prev) =>
        prev.includes(action_name) ? prev : [...prev, action_name],
      )
    } else {
      setActions((prev) => prev.filter((a) => a !== action_name))
    }
  }

  return (
    <FormPaper
      title={t("Webhooks.title")}
      subtitle={t("shopsUi.webhooks.subtitle")}
    >
      <Grid item xs={12}>
        <HelpLink guide="webhooks" />
      </Grid>
      {webhooks.length > 0 && (
        <Grid item xs={12}>
          {webhooks.map((w) => (
            <Grid
              container
              key={w.webhook_id}
              alignItems="center"
              sx={{ py: 0.5 }}
            >
              <Grid item xs>
                <Typography variant="body2" color="text.secondary">
                  {w.name}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.primary"
                  sx={{ wordBreak: "break-all" }}
                >
                  {w.webhook_url}
                </Typography>
              </Grid>
              <Grid item>
                <IconButton
                  size="small"
                  onClick={() => handleDelete(w.webhook_id)}
                  aria-label={t("shopsUi.webhooks.deleteLabel", {
                    name: w.name,
                  })}
                >
                  <DeleteRounded
                    fontSize="small"
                    sx={{ color: theme.palette.error.main }}
                  />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Divider sx={{ my: 2 }} />
        </Grid>
      )}

      <Grid item xs={12}>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          fontWeight="bold"
        >
          {t("shopsUi.webhooks.add")}
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          size="small"
          label={t("AddNotificationWebhook.webhookName")}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          size="small"
          label={t("AddNotificationWebhook.webhookUrl")}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
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
          direction="column"
        >
          {WEBHOOK_ACTIONS.map(({ action_name }) => (
            <Grid item key={action_name}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={actions.includes(action_name)}
                    onChange={(e) =>
                      toggleAction(action_name, e.target.checked)
                    }
                    size="small"
                  />
                }
                label={
                  <span>
                    {t(
                      `shopsUi.webhooks.actions.${WEBHOOK_ACTION_KEYS[action_name]}.label`,
                    )}
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block" }}
                    >
                      {t(
                        `shopsUi.webhooks.actions.${WEBHOOK_ACTION_KEYS[action_name]}.description`,
                      )}
                    </Typography>
                  </span>
                }
              />
            </Grid>
          ))}
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Button
          variant="outlined"
          color="neutral"
          disabled={
            !name.trim() ||
            !url.trim() ||
            !url.match(URL_REGEX) ||
            actions.length === 0
          }
          onClick={handleCreate}
          startIcon={<AddRounded />}
        >
          {t("shopsUi.webhooks.add")}
        </Button>
      </Grid>
    </FormPaper>
  )
}
