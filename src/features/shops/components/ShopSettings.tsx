import React, { useCallback, useEffect, useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { Trans, useTranslation } from "react-i18next"
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
import { useGetContractorBySpectrumIDQuery } from "../../contractor/api/contractorApi"
import { WEBHOOK_ACTIONS } from "../domain/webhookEvents"
import { HelpLink } from "../../help/components/HelpLink"
import { HelpTip } from "../../help/components/HelpTip"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { FormPaper } from "../../../components/paper/FormPaper"
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout"
import { URL_REGEX } from "../../../util/parsing"
import {
  resizeImageFile,
  AVATAR_RESIZE,
  BANNER_RESIZE,
} from "../../../util/imageResize"
import { ShopBlocklistSection } from "./ShopBlocklist"
import { ShopStorefrontSection } from "./ShopStorefrontSection"
import { ImageRounded, SwapHorizRounded } from "@mui/icons-material"
import { SHOP_PATHS } from "../../../routes/paths"
import type {
  ShopResponse,
  ShopSlugAvailabilityResponse,
} from "../../../store/api/v2/market"
import { ShopSlugField } from "./ShopSlugField"
import { shopSlugConflictFromError } from "../shopSlugConflict"
import { shopDiscordChannelError } from "../utils/discordChannel"
import { LinkedDiscordServers } from "../../discord-install/LinkedDiscordServers"

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

// Language codes; labels come from the "languages" catalog namespace.
const AVAILABLE_LANGUAGES = ["en", "fr", "de", "es", "ja", "uk", "zh"] as const

// Catalog key for each webhook event's label and description.
const WEBHOOK_ACTION_KEYS: Record<string, string> = {
  order_create: "orderCreate",
  order_assigned: "orderAssigned",
  order_status_change: "orderStatusChange",
  order_review: "orderReview",
  market_item_bid: "marketItemBid",
  public_contract_create: "publicContractCreate",
}


function ShopWebhookSection({ shopId }: { shopId: string }) {
  const { t } = useTranslation()
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
      issueAlert({ message: t("shopsUi.webhooks.created"), severity: "success" })
    } catch (err) {
      issueAlert(err as { status: number; data: { message?: string } })
    }
  }, [shopId, name, url, actions, createWebhook, issueAlert, t])

  const handleDelete = useCallback(
    async (webhookId: string) => {
      try {
        await deleteWebhook({ shopId, webhookId }).unwrap()
        issueAlert({ message: t("shopsUi.webhooks.deleted"), severity: "success" })
      } catch (err) {
        issueAlert(err as { status: number; data: { message?: string } })
      }
    },
    [shopId, deleteWebhook, issueAlert, t],
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
                  aria-label={t("shopsUi.webhooks.deleteLabel", { name: w.name })}
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
          color="secondary"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          size="small"
          label={t("AddNotificationWebhook.webhookUrl")}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          color="secondary"
          error={!!url && !url.match(URL_REGEX)}
          helperText={
            !!url && !url.match(URL_REGEX)
              ? t("AddNotificationWebhook.invalidUrl")
              : undefined
          }
        />
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={theme.layoutSpacing.compact} direction="column">
          {WEBHOOK_ACTIONS.map(({ action_name }) => (
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
                label={
                  <span>
                    {t(`shopsUi.webhooks.actions.${WEBHOOK_ACTION_KEYS[action_name]}.label`)}
                    <Typography component="span" variant="caption" color="text.secondary" sx={{ display: "block" }}>
                      {t(`shopsUi.webhooks.actions.${WEBHOOK_ACTION_KEYS[action_name]}.description`)}
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
          color="secondary"
          disabled={!name.trim() || !url.trim() || !url.match(URL_REGEX) || actions.length === 0}
          onClick={handleCreate}
        >
          {t("shopsUi.webhooks.add")}
        </Button>
      </Grid>
    </FormPaper>
  )
}

function ShopOrderSettingsSection({ shopId }: { shopId: string }) {
  const { t } = useTranslation()
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
    // A disabled or unknown row counts as the default, as on the server.
    if (timing?.enabled && ["on_received", "dont_subtract"].includes(timing.message_content)) {
      setStockTiming(timing.message_content as typeof stockTiming)
    }
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

      issueAlert({ message: t("shopsUi.orderSettings.saved"), severity: "success" })
    } catch (err) {
      issueAlert(err as { status: number; data: { message?: string } })
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <FormPaper title={t("shopsUi.orderSettings.title")} subtitle={t("shops.profile.loading")}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>
        </Grid>
      </FormPaper>
    )
  }

  return (
    <>
      {/* Order Messages */}
      <FormPaper title={t("shopsUi.orderSettings.messagesTitle")} subtitle={t("shopsUi.orderSettings.messagesSubtitle")}>
        <Grid item xs={12}>
          <Box mb={2}>
            <FormControlLabel
              control={<Switch checked={offerEnabled} onChange={(e) => setOfferEnabled(e.target.checked)} disabled={saving} />}
              label={t("shopsUi.orderSettings.offerEnabled")}
            />
            <TextField
              fullWidth multiline rows={3} size="small"
              label={t("shopsUi.orderSettings.offerMessage")}
              value={offerMessage}
              onChange={(e) => setOfferMessage(e.target.value)}
              disabled={saving || !offerEnabled}
              placeholder={t("shopsUi.orderSettings.offerPlaceholder")}
            />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box mb={2}>
            <FormControlLabel
              control={<Switch checked={orderEnabled} onChange={(e) => setOrderEnabled(e.target.checked)} disabled={saving} />}
              label={t("shopsUi.orderSettings.orderEnabled")}
            />
            <TextField
              fullWidth multiline rows={3} size="small"
              label={t("shopsUi.orderSettings.orderMessage")}
              value={orderMessage}
              onChange={(e) => setOrderMessage(e.target.value)}
              disabled={saving || !orderEnabled}
              placeholder={t("shopsUi.orderSettings.orderPlaceholder")}
            />
          </Box>
        </Grid>
      </FormPaper>

      {/* Order Requirements */}
      <FormPaper title={t("shopsUi.orderSettings.requirementsTitle")} subtitle={t("shopsUi.orderSettings.requirementsSubtitle")}>
        <Grid item xs={12}>
          <FormControlLabel
            control={<Switch checked={requireAvailability} onChange={(e) => setRequireAvailability(e.target.checked)} disabled={saving} />}
            label={t("shopsUi.orderSettings.requireAvailability")}
          />
          <Typography variant="body2" color="text.secondary">
            {t("shopsUi.orderSettings.requireAvailabilityHelp")}
          </Typography>
        </Grid>
      </FormPaper>

      {/* Stock Management */}
      <FormPaper title={t("shopsUi.orderSettings.stockTitle")} subtitle={t("shopsUi.orderSettings.stockSubtitle")}>
        <Grid item xs={12}>
          <HelpLink guide="stockModes" />
        </Grid>
        <Grid item xs={12}>
          <FormControl component="fieldset" disabled={saving}>
            <FormLabel component="legend" sx={{ display: "flex", alignItems: "center" }}>
              {t("shopsUi.orderSettings.stockTiming")}
              <HelpTip label={t("shopsUi.orderSettings.stockTiming")} title={t("help.tips.stockTiming")} />
            </FormLabel>
            <RadioGroup value={stockTiming} onChange={(e) => setStockTiming(e.target.value as typeof stockTiming)}>
              <FormControlLabel value="on_accepted" control={<Radio />} label={t("shopsUi.orderSettings.onAccepted")} />
              <FormControlLabel value="on_received" control={<Radio />} label={t("shopsUi.orderSettings.onReceived")} />
              <FormControlLabel value="dont_subtract" control={<Radio />} label={t("shopsUi.orderSettings.dontSubtract")} />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <FormControl component="fieldset" disabled={saving}>
            <FormLabel component="legend" sx={{ display: "flex", alignItems: "center" }}>
              {t("shopsUi.orderSettings.allocationMode")}
              <HelpTip label={t("shopsUi.orderSettings.allocationMode")} title={t("help.tips.allocationMode")} />
            </FormLabel>
            <RadioGroup value={allocationMode} onChange={(e) => setAllocationMode(e.target.value as typeof allocationMode)}>
              <FormControlLabel value="auto" control={<Radio />} label={t("shopsUi.orderSettings.allocationAuto")} />
              <FormControlLabel value="manual" control={<Radio />} label={t("shopsUi.orderSettings.allocationManual")} />
              <FormControlLabel value="none" control={<Radio />} label={t("shopsUi.orderSettings.allocationNone")} />
            </RadioGroup>
          </FormControl>
        </Grid>
      </FormPaper>

      {/* Order Limits */}
      <FormPaper title={t("shopsUi.orderSettings.limitsTitle")} subtitle={t("shopsUi.orderSettings.limitsSubtitle")}>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={<Switch checked={minOrderSizeEnabled} onChange={(e) => setMinOrderSizeEnabled(e.target.checked)} disabled={saving} />}
            label={t("shopsUi.orderSettings.minSize")}
          />
          <TextField
            fullWidth type="number" size="small"
            inputProps={{ "aria-label": t("shopsUi.orderSettings.minSizeAria") }}
            value={minOrderSize}
            onChange={(e) => setMinOrderSize(e.target.value)}
            disabled={saving || !minOrderSizeEnabled}
            InputProps={{ endAdornment: <InputAdornment position="end">{t("shopsUi.orderSettings.itemsUnit")}</InputAdornment> }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={<Switch checked={maxOrderSizeEnabled} onChange={(e) => setMaxOrderSizeEnabled(e.target.checked)} disabled={saving} />}
            label={t("shopsUi.orderSettings.maxSize")}
          />
          <TextField
            fullWidth type="number" size="small"
            inputProps={{ "aria-label": t("shopsUi.orderSettings.maxSizeAria") }}
            value={maxOrderSize}
            onChange={(e) => setMaxOrderSize(e.target.value)}
            disabled={saving || !maxOrderSizeEnabled}
            InputProps={{ endAdornment: <InputAdornment position="end">{t("shopsUi.orderSettings.itemsUnit")}</InputAdornment> }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={<Switch checked={minOrderValueEnabled} onChange={(e) => setMinOrderValueEnabled(e.target.checked)} disabled={saving} />}
            label={t("shopsUi.orderSettings.minValue")}
          />
          <TextField
            fullWidth type="number" size="small"
            inputProps={{ "aria-label": t("shopsUi.orderSettings.minValueAria") }}
            value={minOrderValue}
            onChange={(e) => setMinOrderValue(e.target.value)}
            disabled={saving || !minOrderValueEnabled}
            InputProps={{ endAdornment: <InputAdornment position="end">aUEC</InputAdornment> }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={<Switch checked={maxOrderValueEnabled} onChange={(e) => setMaxOrderValueEnabled(e.target.checked)} disabled={saving} />}
            label={t("shopsUi.orderSettings.maxValue")}
          />
          <TextField
            fullWidth type="number" size="small"
            inputProps={{ "aria-label": t("shopsUi.orderSettings.maxValueAria") }}
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
            {t("shopsUi.orderSettings.save")}
          </LoadingButton>
        </Grid>
      </FormPaper>
    </>
  )
}

function ShopTransferSection({ shop }: { shop: ShopResponse }) {
  const { t } = useTranslation()
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

  // Only the owner may give a shop away (the API refuses manage_market
  // members): for an org shop, that is the org's owner role.
  const orgSpectrumId = shop.owner_contractor_spectrum_id
  const { data: owningOrg } = useGetContractorBySpectrumIDQuery(orgSpectrumId ?? "", {
    skip: !orgSpectrumId,
  })
  const membership = orgs.find((c) => c.spectrum_id === orgSpectrumId)
  const canTransfer = orgSpectrumId
    ? !!owningOrg?.owner_role && !!membership?.roles.includes(owningOrg.owner_role)
    : true

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
        message: t("shopsUi.transfer.transferred"),
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

  const targetOrgName = orgs.find(
    (o) => o.spectrum_id === contractorSpectrumId,
  )?.name
  const confirmKey =
    targetType === "user"
      ? "shopsUi.transfer.confirmBodyUser"
      : targetOrgName
        ? "shopsUi.transfer.confirmBodyOrg"
        : "shopsUi.transfer.confirmBodySelectedOrg"

  if (!canTransfer) return null

  return (
    <FormPaper
      title={t("settingsManageContractors.transfer_ownership")}
      subtitle={t("shopsUi.transfer.subtitle")}
    >
      <Grid item xs={12}>
        <TextField
          select
          fullWidth
          size="small"
          label={t("shopsUi.transfer.transferTo")}
          value={targetType}
          onChange={(e) => {
            setTargetType(e.target.value as "user" | "contractor")
            setContractorSpectrumId("")
          }}
          color="secondary"
        >
          <MenuItem value="user">{t("shopsUi.transfer.myAccount")}</MenuItem>
          <MenuItem value="contractor" disabled={orgs.length === 0}>
            {t("shopsUi.transfer.anOrganization")}
          </MenuItem>
        </TextField>
      </Grid>

      {targetType === "contractor" && (
        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            size="small"
            label={t("shops.mine.organization")}
            value={contractorSpectrumId}
            onChange={(e) => setContractorSpectrumId(e.target.value)}
            color="secondary"
            helperText={t("shopsUi.transfer.orgHelper")}
          >
            <MenuItem value="">{t("shopsUi.form.selectOrganization")}</MenuItem>
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
          {t("settingsManageContractors.transfer_ownership")}
        </Button>
      </Grid>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>{t("shopsUi.transfer.confirmTitle")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Trans
              i18nKey={confirmKey}
              values={{ shop: shop.name, org: targetOrgName }}
              components={{ strong: <strong /> }}
            />
          </DialogContentText>
          <DialogContentText sx={{ mt: 2 }}>
            {t("shopsUi.transfer.confirmWarning")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={isLoading}>
            {t("common.cancel")}
          </Button>
          <LoadingButton
            variant="contained"
            color="warning"
            loading={isLoading}
            onClick={handleConfirm}
          >
            {t("shopsUi.transfer.confirm")}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </FormPaper>
  )
}

export function ShopSettings() {
  const { shop } = useShopRouteContext()
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  // Tags are stored in English; only their display label is translated.
  const tagLabel = (tag: string) =>
    t(`shopsUi.tags.${tag.toLowerCase()}`, { defaultValue: tag })
  const languageLabel = (code: string) =>
    t(`languages.${code}`, { defaultValue: code })

  // Redirect if user doesn't have manage_market permission
  if (!shop.permissions?.manage_market) {
    return <Navigate to={SHOP_PATHS.listings(shop.slug)} replace />
  }
  const [updateShop, { isLoading }] = useUpdateShopMutation()
  const issueAlert = useAlertHook()

  const [name, setName] = useState(shop.name)
  const [slug, setSlug] = useState(shop.slug)
  const [slugConflict, setSlugConflict] = useState<
    ShopSlugAvailabilityResponse | undefined
  >(undefined)
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

  const handleImageUpload = async (original: File, kind: "logo" | "banner") => {
    try {
      const file = await resizeImageFile(
        original,
        kind === "logo" ? AVATAR_RESIZE : BANNER_RESIZE,
      )
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

  const discordErrorReason = shopDiscordChannelError(
    officialServerId,
    discordThreadChannelId,
  )
  const discordError = discordErrorReason
    ? t(`shopsUi.discord.${discordErrorReason}`)
    : null

  const handleSave = async () => {
    if (discordError) {
      issueAlert({ message: discordError, severity: "error" })
      return
    }
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

      issueAlert({ message: t("shopsUi.settings.saved"), severity: "success" })
    } catch (err) {
      // Taken or reserved: the slug field shows why, with free suggestions.
      setSlugConflict(shopSlugConflictFromError(err))
      issueAlert(err as { status: number; data: { message?: string } })
    }
  }

  return (
    <StandardPageLayout
      title={t("shopsUi.settings.title")}
      headerTitle={
        <Typography variant="h4" fontWeight="bold" color="text.secondary">
          {t("shopsUi.settings.title")}
        </Typography>
      }
      sidebarOpen={true}
      maxWidth="lg"
    >
      <Grid item xs={12}>
        <Grid container spacing={theme.layoutSpacing.layout}>
          {/* General */}
          <FormPaper
            title={t("shopsUi.form.general")}
            subtitle={t("shopsUi.settings.generalSubtitle")}
          >
            <Grid item xs={12}>
              <TextField
                label={t("shopsUi.form.shopName")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                size="small"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ShopSlugField
                value={slug}
                onChange={(value) => setSlug(value.trim().toLowerCase())}
                shopId={shop.shop_id}
                currentSlug={shop.slug}
                conflict={slugConflict}
                urlPrefix="sc-market.space/shops/"
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t("shopsUi.form.description")}
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
            title={t("orgAbout.appearanceTitle")}
            subtitle={t("shopsUi.settings.appearanceSubtitle")}
          >
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t("orgAbout.logo")}
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
                  {t("orgAbout.uploadLogo")}
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
                {t("orgAbout.banner")}
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
                  {t("shopsUi.settings.uploadBanner")}
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
            title={t("shopsUi.settings.categoriesTitle")}
            subtitle={t("shopsUi.settings.categoriesSubtitle")}
          >
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={AVAILABLE_TAGS.slice()}
                getOptionLabel={tagLabel}
                value={tags}
                onChange={(_e, newValue) => setTags(newValue)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...rest } = getTagProps({ index })
                    return (
                      <Chip
                        key={key}
                        label={tagLabel(option)}
                        size="small"
                        {...rest}
                      />
                    )
                  })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("shops.mine.tags")}
                    placeholder={t("shopsUi.form.addTag")}
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={AVAILABLE_LANGUAGES.slice()}
                getOptionLabel={languageLabel}
                value={supportedLanguages}
                onChange={(_e, newValue) => setSupportedLanguages(newValue)}
                renderTags={(value, getTagProps) =>
                  value.map((code, index) => {
                    const { key, ...rest } = getTagProps({ index })
                    return (
                      <Chip
                        key={key}
                        label={languageLabel(code)}
                        size="small"
                        {...rest}
                      />
                    )
                  })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("settings.languages.label")}
                    placeholder={t("shopsUi.form.addLanguage")}
                    size="small"
                  />
                )}
              />
            </Grid>
          </FormPaper>

          {/* Orders */}
          <FormPaper
            title={t("shopsUi.form.orders")}
            subtitle={t("shopsUi.settings.ordersSubtitle")}
          >
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={acceptsCustomOrders}
                    onChange={(e) => setAcceptsCustomOrders(e.target.checked)}
                  />
                }
                label={t("shopsUi.form.acceptCustomOrders")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t("shopsUi.settings.marketOrderTemplate")}
                value={marketOrderTemplate}
                onChange={(e) => setMarketOrderTemplate(e.target.value)}
                fullWidth
                size="small"
                multiline
                minRows={4}
                helperText={t("shopsUi.settings.marketOrderTemplateHelper")}
              />
            </Grid>
          </FormPaper>

          {/* Discord */}
          <FormPaper
            title={t("footer.discord")}
            subtitle={t("shopsUi.settings.discordSubtitle")}
          >
            <Grid item xs={12}>
              <HelpLink guide="connectDiscordBot" />
            </Grid>
            <Grid item xs={12}>
              <LinkedDiscordServers
                owner={{ shop: shop.shop_id }}
                src="shop_settings"
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 1 }}>
                {shop.is_org_owned
                  ? t("shopsUi.settings.discordInfoOrg")
                  : t("shopsUi.settings.discordInfoPersonal")}
              </Alert>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label={t("shopsUi.settings.discordServerId")}
                value={officialServerId}
                onChange={(e) => setOfficialServerId(e.target.value)}
                fullWidth
                size="small"
                placeholder={t("shopsUi.settings.discordIdPlaceholder")}
                helperText={t("shopsUi.settings.discordServerIdHelper")}
                error={!!discordError}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <HelpTip label={t("shopsUi.settings.discordServerId")} title={t("help.tips.discordServerId")} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label={t("shopsUi.settings.threadChannelId")}
                value={discordThreadChannelId}
                onChange={(e) => setDiscordThreadChannelId(e.target.value)}
                fullWidth
                size="small"
                placeholder={t("shopsUi.settings.discordIdPlaceholder")}
                helperText={
                  discordError ?? t("shopsUi.settings.threadChannelHelper")
                }
                error={!!discordError}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <HelpTip label={t("shopsUi.settings.threadChannelId")} title={t("help.tips.threadChannelId")} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </FormPaper>

          {/* Order Settings */}
          <ShopOrderSettingsSection shopId={shop.shop_id} />

          {/* Webhooks */}
          <ShopWebhookSection shopId={shop.shop_id} />

          {/* Blocklist */}
          <ShopBlocklistSection shopId={shop.shop_id} />

          {/* Branded storefront: enquiry and directory setting */}
          <ShopStorefrontSection shop={shop} />

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
              {t("orgAbout.saveChanges")}
            </LoadingButton>
          </Grid>
        </Grid>
      </Grid>
    </StandardPageLayout>
  )
}
