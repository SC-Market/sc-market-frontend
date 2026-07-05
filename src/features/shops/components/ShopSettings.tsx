import React, { useCallback, useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import {
  Autocomplete,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Switch,
  TextField,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import LoadingButton from "@mui/lab/LoadingButton"
import { DeleteRounded, SaveRounded } from "@mui/icons-material"
import { useShopRouteContext } from "../../../components/router/ShopContextFromRoute"
import {
  useUpdateShopMutation,
  useGetShopWebhooksQuery,
  useCreateShopWebhookMutation,
  useDeleteShopWebhookMutation,
} from "../../../store/api/v2/market"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { FormPaper } from "../../../components/paper/FormPaper"
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout"
import { URL_REGEX } from "../../../util/parsing"
import { ShopBlocklistSection } from "./ShopBlocklist"

const AVAILABLE_TAGS = [
  "Weapons",
  "Armor",
  "Components",
  "Cargo",
  "Mining",
  "Salvage",
  "Medical",
  "Vehicles",
  "Services",
] as const

const AVAILABLE_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "es", label: "Spanish" },
  { code: "ja", label: "Japanese" },
  { code: "uk", label: "Ukrainian" },
  { code: "zh", label: "Chinese" },
] as const

const WEBHOOK_ACTIONS: { label: string; action_name: string }[] = [
  { label: "Order Created", action_name: "order_create" },
  { label: "Order Assigned", action_name: "order_assigned" },
  { label: "Public Order Created", action_name: "public_order_create" },
  { label: "Order Status Change", action_name: "order_status_change" },
  { label: "Order Review", action_name: "order_review" },
  { label: "Order Comment", action_name: "order_comment" },
  { label: "Market Bid", action_name: "market_item_bid" },
]

function ShopWebhookSection({ shopId }: { shopId: string }) {
  const theme = useTheme<ExtendedTheme>()
  const issueAlert = useAlertHook()

  const { data: webhooks = [] } = useGetShopWebhooksQuery({ shopId })
  const [createWebhook] = useCreateShopWebhookMutation()
  const [deleteWebhook] = useDeleteShopWebhookMutation()

  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [actions, setActions] = useState<string[]>([])

  const handleCreate = useCallback(async () => {
    try {
      await createWebhook({
        shopId,
        createShopWebhookRequest: { name, webhook_url: url, actions },
      }).unwrap()
      setName("")
      setUrl("")
      setActions([])
      issueAlert({ message: "Webhook created", severity: "success" })
    } catch (err) {
      issueAlert(err as { status: number; data: { message?: string } })
    }
  }, [shopId, name, url, actions, createWebhook, issueAlert])

  const handleDelete = useCallback(
    async (webhookId: string) => {
      try {
        await deleteWebhook({ shopId, webhookId }).unwrap()
        issueAlert({ message: "Webhook deleted", severity: "success" })
      } catch (err) {
        issueAlert(err as { status: number; data: { message?: string } })
      }
    },
    [shopId, deleteWebhook, issueAlert],
  )

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
      title="Webhooks"
      subtitle="Receive notifications at a URL when events happen in this shop"
    >
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
                  aria-label={`Delete webhook ${w.name}`}
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
          Add Webhook
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          size="small"
          label="Webhook Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          color="secondary"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          size="small"
          label="Webhook URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          color="secondary"
          error={!!url && !url.match(URL_REGEX)}
          helperText={
            !!url && !url.match(URL_REGEX) ? "Invalid URL" : undefined
          }
        />
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={theme.layoutSpacing.compact} direction="column">
          {WEBHOOK_ACTIONS.map(({ label, action_name }) => (
            <Grid item key={action_name}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={actions.includes(action_name)}
                    onChange={(e) => toggleAction(action_name, e.target.checked)}
                    color="secondary"
                    size="small"
                  />
                }
                label={label}
              />
            </Grid>
          ))}
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Button
          variant="outlined"
          color="secondary"
          disabled={!name.trim() || !url.trim() || !url.match(URL_REGEX) || actions.length === 0}
          onClick={handleCreate}
        >
          Add Webhook
        </Button>
      </Grid>
    </FormPaper>
  )
}

export function ShopSettings() {
  const { shop } = useShopRouteContext()
  const theme = useTheme<ExtendedTheme>()

  // Redirect if user doesn't have manage_market permission
  if (!shop.permissions?.manage_market) {
    return <Navigate to={`/shop/${shop.slug}/listings`} replace />
  }
  const [updateShop, { isLoading }] = useUpdateShopMutation()
  const issueAlert = useAlertHook()

  const [name, setName] = useState(shop.name)
  const [slug, setSlug] = useState(shop.slug)
  const [description, setDescription] = useState(shop.description)
  const [tags, setTags] = useState<string[]>(shop.tags)
  const [supportedLanguages, setSupportedLanguages] = useState<string[]>(
    shop.supported_languages,
  )
  const [acceptsCustomOrders, setAcceptsCustomOrders] = useState(
    shop.accepts_custom_orders,
  )
  const [marketOrderTemplate, setMarketOrderTemplate] = useState(
    shop.market_order_template,
  )

  // Reset form when shop changes (e.g. navigating between shops)
  useEffect(() => {
    setName(shop.name)
    setSlug(shop.slug)
    setDescription(shop.description)
    setTags(shop.tags)
    setSupportedLanguages(shop.supported_languages)
    setAcceptsCustomOrders(shop.accepts_custom_orders)
    setMarketOrderTemplate(shop.market_order_template)
  }, [shop])

  const handleSave = async () => {
    try {
      await updateShop({
        shopId: shop.shop_id,
        updateShopRequest: {
          name,
          slug,
          description,
          tags,
          supported_languages: supportedLanguages,
          accepts_custom_orders: acceptsCustomOrders,
          market_order_template: marketOrderTemplate,
        },
      }).unwrap()

      issueAlert({ message: "Shop settings saved", severity: "success" })
    } catch (err) {
      issueAlert(err as { status: number; data: { message?: string } })
    }
  }

  return (
    <StandardPageLayout
      title="Shop Settings"
      headerTitle={
        <Typography variant="h4" fontWeight="bold" color="text.secondary">
          Shop Settings
        </Typography>
      }
      sidebarOpen={true}
      maxWidth="lg"
    >
      <Grid item xs={12}>
        <Grid container spacing={theme.layoutSpacing.layout}>
          {/* General */}
          <FormPaper title="General" subtitle="Basic shop information">
            <Grid item xs={12}>
              <TextField
                label="Shop Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                size="small"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                fullWidth
                size="small"
                helperText={`sc-market.space/shop/${slug || "..."}`}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                size="small"
                multiline
                minRows={3}
              />
            </Grid>
          </FormPaper>

          {/* Categories & Tags */}
          <FormPaper
            title="Categories & Tags"
            subtitle="Help buyers find your shop"
          >
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={AVAILABLE_TAGS.slice()}
                value={tags}
                onChange={(_e, newValue) => setTags(newValue)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...rest } = getTagProps({ index })
                    return (
                      <Chip
                        key={key}
                        label={option}
                        size="small"
                        {...rest}
                      />
                    )
                  })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    placeholder="Add tag"
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={AVAILABLE_LANGUAGES.map((l) => l.code)}
                getOptionLabel={(code) =>
                  AVAILABLE_LANGUAGES.find((l) => l.code === code)?.label ??
                  code
                }
                value={supportedLanguages}
                onChange={(_e, newValue) => setSupportedLanguages(newValue)}
                renderTags={(value, getTagProps) =>
                  value.map((code, index) => {
                    const { key, ...rest } = getTagProps({ index })
                    return (
                      <Chip
                        key={key}
                        label={
                          AVAILABLE_LANGUAGES.find((l) => l.code === code)
                            ?.label ?? code
                        }
                        size="small"
                        {...rest}
                      />
                    )
                  })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Supported Languages"
                    placeholder="Add language"
                    size="small"
                  />
                )}
              />
            </Grid>
          </FormPaper>

          {/* Orders */}
          <FormPaper
            title="Orders"
            subtitle="Configure how buyers interact with your shop"
          >
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={acceptsCustomOrders}
                    onChange={(e) => setAcceptsCustomOrders(e.target.checked)}
                  />
                }
                label="Accept custom orders"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Market Order Template"
                value={marketOrderTemplate}
                onChange={(e) => setMarketOrderTemplate(e.target.value)}
                fullWidth
                size="small"
                multiline
                minRows={4}
                helperText="Template shown to buyers when placing a custom order"
              />
            </Grid>
          </FormPaper>

          {/* Webhooks */}
          <ShopWebhookSection shopId={shop.shop_id} />

          {/* Blocklist */}
          <ShopBlocklistSection shopId={shop.shop_id} />

          {/* Save */}
          <Grid item xs={12} container justifyContent="flex-end">
            <LoadingButton
              variant="contained"
              color="secondary"
              loading={isLoading}
              startIcon={<SaveRounded />}
              onClick={handleSave}
              disabled={!name.trim()}
            >
              Save Changes
            </LoadingButton>
          </Grid>
        </Grid>
      </Grid>
    </StandardPageLayout>
  )
}
