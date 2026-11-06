import { useState } from "react"
import { Navigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  Alert,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material"
import { LabeledSwitch } from "../../../components/buttons/LabeledSwitch"
import { useTheme } from "@mui/material/styles"
import LoadingButton from "@mui/lab/LoadingButton"
import { useShopRouteContext } from "../../../components/router/ShopContextFromRoute"
import {
  useSaveShopSettings,
  useUploadShopImage,
} from "../hooks/useShopSettingsActions"
import { canOpenShopSettings } from "../domain/shopPermissions"
import {
  savedSettingsDraft,
  settingsDraftToUpdateRequest,
  shopToSettingsDraft,
  type ShopSettingsDraft,
} from "../domain/shopSettingsForm"
import { HelpLink } from "../../help/components/HelpLink"
import { HelpTip } from "../../help/components/HelpTip"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { FormPaper } from "../../../components/paper/FormPaper"
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout"
import {
  resizeImageFile,
  AVATAR_RESIZE,
  BANNER_RESIZE,
} from "../../../util/imageResize"
import { ShopBlocklistSection } from "./ShopBlocklist"
import { ShopStorefrontSection } from "./ShopStorefrontSection"
import { SHOP_PATHS } from "../../../routes/paths"
import type {
  ShopResponse,
  ShopSlugAvailabilityResponse,
} from "../../../store/api/v2/market"
import { ShopSlugField } from "./ShopSlugField"
import { shopSlugConflictFromError } from "../shopSlugConflict"
import { shopDiscordChannelError } from "../utils/discordChannel"
import { LinkedDiscordServers } from "../../discord-install/LinkedDiscordServers"
import { ShopWebhookSection } from "./ShopWebhookSection"
import { ShopOrderSettingsSection } from "./ShopOrderSettingsSection"
import { ShopTransferSection } from "./ShopTransferSection"
import { ShopAppearanceFields, ShopTagFields } from "./ShopSettingsFields"

export function ShopSettings() {
  const { shop } = useShopRouteContext()

  if (!canOpenShopSettings(shop)) {
    return <Navigate to={SHOP_PATHS.listings(shop.slug)} replace />
  }
  // Keyed by shop: the form's draft is made once per shop, so a refetch of
  // the same shop never wipes what is being typed.
  return <ShopSettingsForm key={shop.shop_id} shop={shop} />
}

function ShopSettingsForm({ shop }: { shop: ShopResponse }) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()

  const { save: saveShop, isLoading } = useSaveShopSettings(shop.shop_id)
  const issueAlert = useAlertHook()
  const { upload: uploadImage, isLoading: isUploading } = useUploadShopImage()

  const [base, setBase] = useState(() => shopToSettingsDraft(shop))
  const [draft, setDraft] = useState(base)
  const [slugConflict, setSlugConflict] = useState<
    ShopSlugAvailabilityResponse | undefined
  >(undefined)
  const edit = <K extends keyof ShopSettingsDraft>(
    field: K,
    value: ShopSettingsDraft[K],
  ) => setDraft((d) => ({ ...d, [field]: value }))

  const handleImageUpload = async (original: File, kind: "logo" | "banner") => {
    let file: File
    try {
      file = await resizeImageFile(
        original,
        kind === "logo" ? AVATAR_RESIZE : BANNER_RESIZE,
      )
    } catch (err) {
      issueAlert(err as { status: number; data: { message?: string } })
      return
    }
    const result = await uploadImage(file)
    if (!result) return
    setDraft((d) =>
      kind === "logo"
        ? { ...d, logo: result.resource_id, logoUrl: result.url }
        : { ...d, banner: result.resource_id, bannerUrl: result.url },
    )
  }

  const discordErrorReason = shopDiscordChannelError(
    draft.officialServerId,
    draft.discordThreadChannelId,
  )
  const discordError = discordErrorReason
    ? t(`shopsUi.discord.${discordErrorReason}`)
    : null

  const handleSave = async () => {
    if (discordError) {
      issueAlert({ message: discordError, severity: "error" })
      return
    }
    const saving = draft
    const result = await saveShop(settingsDraftToUpdateRequest(saving, base))
    if (!result.ok) {
      // Taken or reserved: the slug field shows why, with free suggestions.
      setSlugConflict(shopSlugConflictFromError(result.error))
      return
    }
    setBase(savedSettingsDraft(saving))
    // The uploads are saved; keep any edit made while the save was running.
    setDraft((d) => ({
      ...d,
      logo: d.logo === saving.logo ? null : d.logo,
      banner: d.banner === saving.banner ? null : d.banner,
    }))
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
                value={draft.name}
                onChange={(e) => edit("name", e.target.value)}
                fullWidth
                size="small"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ShopSlugField
                value={draft.slug}
                onChange={(value) => edit("slug", value.trim().toLowerCase())}
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
                value={draft.description}
                onChange={(e) => edit("description", e.target.value)}
                fullWidth
                size="small"
                multiline
                minRows={3}
              />
            </Grid>
          </FormPaper>

          <ShopAppearanceFields
            draft={draft}
            isUploading={isUploading}
            handleImageUpload={handleImageUpload}
          />

          <ShopTagFields draft={draft} edit={edit} />

          {/* Orders */}
          <FormPaper
            title={t("shopsUi.form.orders")}
            subtitle={t("shopsUi.settings.ordersSubtitle")}
          >
            <Grid item xs={12}>
              <LabeledSwitch
                checked={draft.acceptsCustomOrders}
                onChange={(checked) => edit("acceptsCustomOrders", checked)}
                label={t("shopsUi.form.acceptCustomOrders")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t("shopsUi.settings.marketOrderTemplate")}
                value={draft.marketOrderTemplate}
                onChange={(e) => edit("marketOrderTemplate", e.target.value)}
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
                value={draft.officialServerId}
                onChange={(e) => edit("officialServerId", e.target.value)}
                fullWidth
                size="small"
                placeholder={t("shopsUi.settings.discordIdPlaceholder")}
                helperText={t("shopsUi.settings.discordServerIdHelper")}
                error={!!discordError}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <HelpTip
                        label={t("shopsUi.settings.discordServerId")}
                        title={t("help.tips.discordServerId")}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label={t("shopsUi.settings.threadChannelId")}
                value={draft.discordThreadChannelId}
                onChange={(e) => edit("discordThreadChannelId", e.target.value)}
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
                      <HelpTip
                        label={t("shopsUi.settings.threadChannelId")}
                        title={t("help.tips.threadChannelId")}
                      />
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
              loading={isLoading}
              onClick={handleSave}
              disabled={!draft.name.trim()}
            >
              {t("orgAbout.saveChanges")}
            </LoadingButton>
          </Grid>
        </Grid>
      </Grid>
    </StandardPageLayout>
  )
}
