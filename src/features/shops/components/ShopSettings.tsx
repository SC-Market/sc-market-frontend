import React, { useEffect, useState } from "react"
import {
  Autocomplete,
  Box,
  Chip,
  Container,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import { SaveRounded } from "@mui/icons-material"
import { useShopRouteContext } from "../../../components/router/ShopContextFromRoute"
import { useUpdateShopMutation } from "../../../store/api/v2/market"
import { useAlertHook } from "../../../hooks/alert/AlertHook"

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
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Shop Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Manage settings for <strong>{shop.name}</strong>.
        </Typography>

        <Stack spacing={4}>
          {/* General */}
          <Box>
            <Typography variant="h6" gutterBottom>
              General
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Shop Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                fullWidth
                helperText="URL-friendly identifier (e.g. my-shop)"
              />
              <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                multiline
                minRows={3}
              />
            </Stack>
          </Box>

          {/* Categories & Languages */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Categories & Languages
            </Typography>
            <Stack spacing={2}>
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
                  <TextField {...params} label="Tags" placeholder="Add tag" />
                )}
              />
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
                  />
                )}
              />
            </Stack>
          </Box>

          {/* Orders */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Orders
            </Typography>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={acceptsCustomOrders}
                    onChange={(e) => setAcceptsCustomOrders(e.target.checked)}
                  />
                }
                label="Accept custom orders"
              />
              <TextField
                label="Market Order Template"
                value={marketOrderTemplate}
                onChange={(e) => setMarketOrderTemplate(e.target.value)}
                fullWidth
                multiline
                minRows={4}
                helperText="Template shown to buyers when placing a custom order"
              />
            </Stack>
          </Box>

          {/* Save */}
          <Box>
            <LoadingButton
              variant="contained"
              loading={isLoading}
              startIcon={<SaveRounded />}
              onClick={handleSave}
              disabled={!name.trim()}
            >
              Save Settings
            </LoadingButton>
          </Box>
        </Stack>
      </Box>
    </Container>
  )
}
