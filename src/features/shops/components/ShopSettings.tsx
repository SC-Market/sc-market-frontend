import React, { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import {
  Autocomplete,
  Chip,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import LoadingButton from "@mui/lab/LoadingButton"
import { SaveRounded } from "@mui/icons-material"
import { useShopRouteContext } from "../../../components/router/ShopContextFromRoute"
import { useUpdateShopMutation } from "../../../store/api/v2/market"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { FormPaper } from "../../../components/paper/FormPaper"
import { StandardPageLayout } from "../../../components/layout/StandardPageLayout"

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
