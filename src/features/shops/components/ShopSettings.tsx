import React, { useCallback, useEffect, useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
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
  useGetShopOrderSettingsQuery,
  useUpsertShopOrderSettingMutation,
  useDeleteShopOrderSettingMutation,
  useTransferShopMutation,
} from "../../../store/api/v2/market"
import { useUploadImageMutation } from "../../../store/api/v2/market-overrides"
import { useGetUserProfileQuery } from "../../profile/api/profileApi"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { FormPaper } from "../../../components/paper/FormPaper"
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout"
import { URL_REGEX } from "../../../util/parsing"
import { ShopBlocklistSection } from "./ShopBlocklist"
import { ImageRounded, SwapHorizRounded } from "@mui/icons-material"
import { SHOP_PATHS } from "../../../routes/paths"
import type { ShopResponse } from "../../../store/api/v2/market"

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

function ShopOrderSettingsSection({ shopId }: { shopId: string }) {
  const issueAlert = useAlertHook()
  const { data: settings = [], isLoading } = useGetShopOrderSettingsQuery({ shopId })
  const [upsertSetting] = useUpsertShopOrderSettingMutation()
  const [deleteSetting] = useDeleteShopOrderSettingMutation()
  const [saving, setSaving] = useState(false)

  // Local form state
  const [offerMessage, setOfferMessage] = useState("")
  const [offerEnabled, setOfferEnabled] = useState(true)
  const [orderMessage, setOrderMessage] = useState("")
  const [orderEnabled, setOrderEnabled] = useState(true)
  const [requireAvailability, setRequireAvailability] = useState(false)
  const [stockTiming, setStockTiming] = useState<"on_accepted" | "on_received" | "dont_subtract">("on_accepted")
  const [allocationMode, setAllocationMode] = useState<"auto" | "manual" | "none">("auto")
  const [minOrderSize, setMinOrderSize] = useState("")
  const [minOrderSizeEnabled, setMinOrderSizeEnabled] = useState(false)
  const [maxOrderSize, setMaxOrderSize] = useState("")
  const [maxOrderSizeEnabled, setMaxOrderSizeEnabled] = useState(false)
  const [minOrderValue, setMinOrderValue] = useState("")
  const [minOrderValueEnabled, setMinOrderValueEnabled] = useState(false)
  const [maxOrderValue, setMaxOrderValue] = useState("")
  const [maxOrderValueEnabled, setMaxOrderValueEnabled] = useState(false)

  // Hydrate from fetched settings
  useEffect(() => {
    if (settings.length === 0) return
    const find = (type: string) => settings.find((s) => s.setting_type === type)
    const offer = find("offer_message")
    if (offer) { setOfferMessage(offer.message_content); setOfferEnabled(offer.enabled) }
    const order = find("order_message")
    if (order) { setOrderMessage(order.message_content); setOrderEnabled(order.enabled) }
    const avail = find("require_availability")
    if (avail) setRequireAvailability(avail.enabled)
    const timing = find("stock_subtraction_timing")
    if (timing) setStockTiming(timing.message_content as typeof stockTiming)
    const alloc = find("allocation_mode")
    if (alloc) setAllocationMode(alloc.message_content as typeof allocationMode)
    const mins = find("min_order_size")
    if (mins) { setMinOrderSize(mins.message_content); setMinOrderSizeEnabled(mins.enabled) }
    const maxs = find("max_order_size")
    if (maxs) { setMaxOrderSize(maxs.message_content); setMaxOrderSizeEnabled(maxs.enabled) }
    const minv = find("min_order_value")
    if (minv) { setMinOrderValue(minv.message_content); setMinOrderValueEnabled(minv.enabled) }
    const maxv = find("max_order_value")
    if (maxv) { setMaxOrderValue(maxv.message_content); setMaxOrderValueEnabled(maxv.enabled) }
  }, [settings])

  const handleSave = async () => {
    setSaving(true)
    try {
      // Offer message
      if (offerMessage.trim()) {
        await upsertSetting({ shopId, settingType: "offer_message", upsertShopOrderSettingRequest: { message_content: offerMessage, enabled: offerEnabled } }).unwrap()
      }
      // Order message
      if (orderMessage.trim()) {
        await upsertSetting({ shopId, settingType: "order_message", upsertShopOrderSettingRequest: { message_content: orderMessage, enabled: orderEnabled } }).unwrap()
      }
      // Require availability
      if (requireAvailability) {
        await upsertSetting({ shopId, settingType: "require_availability", upsertShopOrderSettingRequest: { message_content: "", enabled: true } }).unwrap()
      } else {
        const existing = settings.find((s) => s.setting_type === "require_availability")
        if (existing) await deleteSetting({ shopId, settingType: "require_availability" }).unwrap()
      }
      // Stock subtraction timing
      if (stockTiming !== "on_accepted") {
        await upsertSetting({ shopId, settingType: "stock_subtraction_timing", upsertShopOrderSettingRequest: { message_content: stockTiming, enabled: true } }).unwrap()
      } else {
        const existing = settings.find((s) => s.setting_type === "stock_subtraction_timing")
        if (existing) await deleteSetting({ shopId, settingType: "stock_subtraction_timing" }).unwrap()
      }
      // Allocation mode
      if (allocationMode !== "auto") {
        await upsertSetting({ shopId, settingType: "allocation_mode", upsertShopOrderSettingRequest: { message_content: allocationMode, enabled: true } }).unwrap()
      } else {
        const existing = settings.find((s) => s.setting_type === "allocation_mode")
        if (existing) await deleteSetting({ shopId, settingType: "allocation_mode" }).unwrap()
      }
      // Order limits
      const saveLimitSetting = async (type: string, value: string, enabled: boolean) => {
        if (enabled && value.trim()) {
          await upsertSetting({ shopId, settingType: type, upsertShopOrderSettingRequest: { message_content: value.trim(), enabled: true } }).unwrap()
        } else {
          const existing = settings.find((s) => s.setting_type === type)
          if (existing) await deleteSetting({ shopId, settingType: type }).unwrap()
        }
      }
      await saveLimitSetting("min_order_size", minOrderSize, minOrderSizeEnabled)
      await saveLimitSetting("max_order_size", maxOrderSize, maxOrderSizeEnabled)
      await saveLimitSetting("min_order_value", minOrderValue, minOrderValueEnabled)
      await saveLimitSetting("max_order_value", maxOrderValue, maxOrderValueEnabled)

      issueAlert({ message: "Order settings saved", severity: "success" })
    } catch (err) {
      issueAlert(err as { status: number; data: { message?: string } })
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <FormPaper title="Order Settings" subtitle="Loading...">
        <Grid item xs={12}>
          <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>
        </Grid>
      </FormPaper>
    )
  }

  return (
    <>
      {/* Order Messages */}
      <FormPaper title="Order Messages" subtitle="Automated messages sent with offers and orders">
        <Grid item xs={12}>
          <Box mb={2}>
            <FormControlLabel
              control={<Switch checked={offerEnabled} onChange={(e) => setOfferEnabled(e.target.checked)} disabled={saving} />}
              label="Offer message enabled"
            />
            <TextField
              fullWidth multiline rows={3} size="small"
              label="Offer Message"
              value={offerMessage}
              onChange={(e) => setOfferMessage(e.target.value)}
              disabled={saving || !offerEnabled}
              placeholder="Message shown when sending an offer"
            />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box mb={2}>
            <FormControlLabel
              control={<Switch checked={orderEnabled} onChange={(e) => setOrderEnabled(e.target.checked)} disabled={saving} />}
              label="Order message enabled"
            />
            <TextField
              fullWidth multiline rows={3} size="small"
              label="Order Message"
              value={orderMessage}
              onChange={(e) => setOrderMessage(e.target.value)}
              disabled={saving || !orderEnabled}
              placeholder="Message shown when an order is placed"
            />
          </Box>
        </Grid>
      </FormPaper>

      {/* Order Requirements */}
      <FormPaper title="Order Requirements" subtitle="Requirements before orders can be placed">
        <Grid item xs={12}>
          <FormControlLabel
            control={<Switch checked={requireAvailability} onChange={(e) => setRequireAvailability(e.target.checked)} disabled={saving} />}
            label="Require seller availability before accepting orders"
          />
          <Typography variant="body2" color="text.secondary">
            When enabled, buyers must check your availability before placing an order.
          </Typography>
        </Grid>
      </FormPaper>

      {/* Stock Management */}
      <FormPaper title="Stock Management" subtitle="Configure when stock is subtracted from inventory">
        <Grid item xs={12}>
          <FormControl component="fieldset" disabled={saving}>
            <FormLabel component="legend">Stock subtraction timing</FormLabel>
            <RadioGroup value={stockTiming} onChange={(e) => setStockTiming(e.target.value as typeof stockTiming)}>
              <FormControlLabel value="on_accepted" control={<Radio />} label="On order accepted (default)" />
              <FormControlLabel value="on_received" control={<Radio />} label="On order received/fulfilled" />
              <FormControlLabel value="dont_subtract" control={<Radio />} label="Don't subtract stock" />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <FormControl component="fieldset" disabled={saving}>
            <FormLabel component="legend">Allocation mode</FormLabel>
            <RadioGroup value={allocationMode} onChange={(e) => setAllocationMode(e.target.value as typeof allocationMode)}>
              <FormControlLabel value="auto" control={<Radio />} label="Automatic (FIFO)" />
              <FormControlLabel value="manual" control={<Radio />} label="Manual selection" />
              <FormControlLabel value="none" control={<Radio />} label="None (legacy)" />
            </RadioGroup>
          </FormControl>
        </Grid>
      </FormPaper>

      {/* Order Limits */}
      <FormPaper title="Order Limits" subtitle="Set min/max limits for order sizes and values">
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={<Switch checked={minOrderSizeEnabled} onChange={(e) => setMinOrderSizeEnabled(e.target.checked)} disabled={saving} />}
            label="Minimum order size"
          />
          <TextField
            fullWidth type="number" size="small"
            value={minOrderSize}
            onChange={(e) => setMinOrderSize(e.target.value)}
            disabled={saving || !minOrderSizeEnabled}
            InputProps={{ endAdornment: <InputAdornment position="end">items</InputAdornment> }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={<Switch checked={maxOrderSizeEnabled} onChange={(e) => setMaxOrderSizeEnabled(e.target.checked)} disabled={saving} />}
            label="Maximum order size"
          />
          <TextField
            fullWidth type="number" size="small"
            value={maxOrderSize}
            onChange={(e) => setMaxOrderSize(e.target.value)}
            disabled={saving || !maxOrderSizeEnabled}
            InputProps={{ endAdornment: <InputAdornment position="end">items</InputAdornment> }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={<Switch checked={minOrderValueEnabled} onChange={(e) => setMinOrderValueEnabled(e.target.checked)} disabled={saving} />}
            label="Minimum order value"
          />
          <TextField
            fullWidth type="number" size="small"
            value={minOrderValue}
            onChange={(e) => setMinOrderValue(e.target.value)}
            disabled={saving || !minOrderValueEnabled}
            InputProps={{ endAdornment: <InputAdornment position="end">aUEC</InputAdornment> }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={<Switch checked={maxOrderValueEnabled} onChange={(e) => setMaxOrderValueEnabled(e.target.checked)} disabled={saving} />}
            label="Maximum order value"
          />
          <TextField
            fullWidth type="number" size="small"
            value={maxOrderValue}
            onChange={(e) => setMaxOrderValue(e.target.value)}
            disabled={saving || !maxOrderValueEnabled}
            InputProps={{ endAdornment: <InputAdornment position="end">aUEC</InputAdornment> }}
          />
        </Grid>
        <Grid item xs={12}>
          <LoadingButton
            variant="contained"
            color="secondary"
            loading={saving}
            startIcon={<SaveRounded />}
            onClick={handleSave}
          >
            Save Order Settings
          </LoadingButton>
        </Grid>
      </FormPaper>
    </>
  )
}

function ShopTransferSection({ shop }: { shop: ShopResponse }) {
  const navigate = useNavigate()
  const issueAlert = useAlertHook()
  const { data: profile } = useGetUserProfileQuery()
  const [transferShop, { isLoading }] = useTransferShopMutation()

  const [targetType, setTargetType] = useState<"user" | "contractor">(
    "contractor",
  )
  const [contractorSpectrumId, setContractorSpectrumId] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)

  const orgs = profile?.contractors ?? []

  const handleConfirm = async () => {
    try {
      const target_id =
        targetType === "user" ? profile?.username ?? "" : contractorSpectrumId
      // The transfer endpoint expects a user_id for users; profile exposes
      // username, so we transfer to self using the backend's own resolution.
      const result = await transferShop({
        shopId: shop.shop_id,
        transferShopRequest: {
          target_type: targetType,
          target_id,
        },
      }).unwrap()

      setConfirmOpen(false)
      issueAlert({
        message: "Shop ownership transferred",
        severity: "success",
      })
      // Slug is preserved across transfers; navigate to the shop.
      navigate(SHOP_PATHS.listings(result.slug))
    } catch (err) {
      setConfirmOpen(false)
      issueAlert(err as { status: number; data: { message?: string } })
    }
  }

  const canSubmit =
    targetType === "user"
      ? !!profile?.username
      : !!contractorSpectrumId

  const targetLabel =
    targetType === "user"
      ? "your personal account"
      : orgs.find((o) => o.spectrum_id === contractorSpectrumId)?.name ??
        "the selected organization"

  return (
    <FormPaper
      title="Transfer Ownership"
      subtitle="Move this shop to another owner. This action cannot be undone by you."
    >
      <Grid item xs={12}>
        <TextField
          select
          fullWidth
          size="small"
          label="Transfer to"
          value={targetType}
          onChange={(e) => {
            setTargetType(e.target.value as "user" | "contractor")
            setContractorSpectrumId("")
          }}
          color="secondary"
        >
          <MenuItem value="user">My Account</MenuItem>
          <MenuItem value="contractor" disabled={orgs.length === 0}>
            An Organization
          </MenuItem>
        </TextField>
      </Grid>

      {targetType === "contractor" && (
        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            size="small"
            label="Organization"
            value={contractorSpectrumId}
            onChange={(e) => setContractorSpectrumId(e.target.value)}
            color="secondary"
            helperText="You must have Manage Market permission in the target org."
          >
            <MenuItem value="">Select an organization...</MenuItem>
            {orgs.map((org) => (
              <MenuItem key={org.spectrum_id} value={org.spectrum_id}>
                {org.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      )}

      <Grid item xs={12}>
        <Button
          variant="outlined"
          color="warning"
          startIcon={<SwapHorizRounded />}
          disabled={!canSubmit || isLoading}
          onClick={() => setConfirmOpen(true)}
        >
          Transfer Ownership
        </Button>
      </Grid>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Transfer shop ownership?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are about to transfer <strong>{shop.name}</strong> to{" "}
            <strong>{targetLabel}</strong>.
          </DialogContentText>
          <DialogContentText sx={{ mt: 2 }}>
            Ownership will transfer immediately. Active order and offer
            assignments held by people no longer associated with the new owner
            may be reset so the new owner can reclaim them. Completed orders are
            not affected. You may lose access to this shop if you cannot manage
            the new owner.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            color="warning"
            loading={isLoading}
            onClick={handleConfirm}
          >
            Confirm Transfer
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </FormPaper>
  )
}

export function ShopSettings() {
  const { shop } = useShopRouteContext()
  const theme = useTheme<ExtendedTheme>()

  // Redirect if user doesn't have manage_market permission
  if (!shop.permissions?.manage_market) {
    return <Navigate to={SHOP_PATHS.listings(shop.slug)} replace />
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
  const [officialServerId, setOfficialServerId] = useState<string>(
    shop.official_server_id ?? "",
  )
  const [discordThreadChannelId, setDiscordThreadChannelId] = useState<string>(
    shop.discord_thread_channel_id ?? "",
  )
  const [logoResourceId, setLogoResourceId] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(shop.logo_url)
  const [bannerResourceId, setBannerResourceId] = useState<string | null>(null)
  const [bannerUrl, setBannerUrl] = useState<string | null>(shop.banner_url)
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation()

  // Reset form when shop changes (e.g. navigating between shops)
  useEffect(() => {
    setName(shop.name)
    setSlug(shop.slug)
    setDescription(shop.description)
    setTags(shop.tags)
    setSupportedLanguages(shop.supported_languages)
    setAcceptsCustomOrders(shop.accepts_custom_orders)
    setMarketOrderTemplate(shop.market_order_template)
    setOfficialServerId(shop.official_server_id ?? "")
    setDiscordThreadChannelId(shop.discord_thread_channel_id ?? "")
    setLogoResourceId(null)
    setLogoUrl(shop.logo_url)
    setBannerResourceId(null)
    setBannerUrl(shop.banner_url)
  }, [shop])

  const handleImageUpload = async (file: File, kind: "logo" | "banner") => {
    try {
      const result = await uploadImage(file).unwrap()
      if (kind === "logo") {
        setLogoResourceId(result.resource_id)
        setLogoUrl(result.url)
      } else {
        setBannerResourceId(result.resource_id)
        setBannerUrl(result.url)
      }
    } catch (err) {
      issueAlert(err as { status: number; data: { message?: string } })
    }
  }

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
          official_server_id: officialServerId.trim() || null,
          discord_thread_channel_id: discordThreadChannelId.trim() || null,
          ...(logoResourceId ? { logo: logoResourceId } : {}),
          ...(bannerResourceId ? { banner: bannerResourceId } : {}),
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

          {/* Appearance */}
          <FormPaper
            title="Appearance"
            subtitle="Custom logo and banner for your shop (independent of your org)"
          >
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Logo
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  src={logoUrl || undefined}
                  variant="rounded"
                  sx={{ width: 64, height: 64 }}
                >
                  <ImageRounded />
                </Avatar>
                <Button
                  component="label"
                  variant="outlined"
                  size="small"
                  disabled={isUploading}
                >
                  Upload Logo
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, "logo")
                    }}
                  />
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Banner
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 128,
                    height: 64,
                    borderRadius: 1,
                    bgcolor: "background.default",
                    backgroundImage: bannerUrl ? `url(${bannerUrl})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  {!bannerUrl && <ImageRounded color="disabled" />}
                </Box>
                <Button
                  component="label"
                  variant="outlined"
                  size="small"
                  disabled={isUploading}
                >
                  Upload Banner
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, "banner")
                    }}
                  />
                </Button>
              </Stack>
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

          {/* Discord */}
          <FormPaper
            title="Discord"
            subtitle="Where order and offer threads are created for this shop"
          >
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 1 }}>
                This Discord configuration is per-shop. Order and offer threads
                for this shop are created in the server and channel below. If
                left empty, threads fall back to your account or org Discord
                settings. Enter the numeric Discord server (guild) ID and the
                channel ID under which threads should be created — the SC Market
                bot must be a member of that server with access to the channel.
              </Alert>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Discord Server ID"
                value={officialServerId}
                onChange={(e) => setOfficialServerId(e.target.value)}
                fullWidth
                size="small"
                placeholder="e.g. 123456789012345678"
                helperText="Guild ID"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Thread Channel ID"
                value={discordThreadChannelId}
                onChange={(e) => setDiscordThreadChannelId(e.target.value)}
                fullWidth
                size="small"
                placeholder="e.g. 123456789012345678"
                helperText="Channel where threads are created"
              />
            </Grid>
          </FormPaper>

          {/* Order Settings */}
          <ShopOrderSettingsSection shopId={shop.shop_id} />

          {/* Webhooks */}
          <ShopWebhookSection shopId={shop.shop_id} />

          {/* Blocklist */}
          <ShopBlocklistSection shopId={shop.shop_id} />

          {/* Transfer Ownership */}
          <ShopTransferSection shop={shop} />

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
