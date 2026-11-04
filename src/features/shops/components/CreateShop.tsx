import React, { useState, useMemo } from "react"
import {
  Autocomplete,
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  FormControlLabel,
  Link as MuiLink,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material"
import LoadingButton from "@mui/lab/LoadingButton"
import { StorefrontRounded } from "@mui/icons-material"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { type ShopSlugAvailabilityResponse } from "../../../store/api/v2/market"
import { ShopSlugField, SHOP_SLUG_MIN_LENGTH } from "./ShopSlugField"
import { shopSlugConflictFromError } from "../shopSlugConflict"
import { useGetUserProfileQuery } from "../../profile/api/profileApi"
import { useGetContractorBySpectrumIDQuery } from "../../contractor/api/contractorApi"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { PATHS, SHOP_PATHS } from "../../../routes/paths"
import { usePageReady } from "../../../components/metadata/PageReady"
import { useCreateShop } from "../hooks/useShopActions"

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

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 45)
}

export function CreateShop() {
  usePageReady(false)
  const { t } = useTranslation()
  // Tags are stored in English; only their display label is translated.
  const tagLabel = (tag: string) =>
    t(`shopsUi.tags.${tag.toLowerCase()}`, { defaultValue: tag })
  const languageLabel = (code: string) =>
    t(`languages.${code}`, { defaultValue: code })
  const navigate = useNavigate()
  const { create: createShop, isLoading } = useCreateShop()
  const { data: profile } = useGetUserProfileQuery()
  const issueAlert = useAlertHook()

  const [name, setName] = useState("")
  const [slugOverride, setSlugOverride] = useState<string | null>(null)
  const [description, setDescription] = useState("")
  const [ownerType, setOwnerType] = useState<"personal" | "organization">(
    "personal",
  )
  // The picker works with Spectrum IDs (that's what the profile lists); the
  // API wants the org's contractor_id, so look the org up.
  const [orgSpectrumId, setOrgSpectrumId] = useState("")
  const isOrgShop = ownerType === "organization" && !!orgSpectrumId
  const { data: selectedOrg, isFetching: isOrgLoading } =
    useGetContractorBySpectrumIDQuery(orgSpectrumId, { skip: !isOrgShop })
  const [tags, setTags] = useState<string[]>([])
  const [supportedLanguages, setSupportedLanguages] = useState<string[]>([])
  const [acceptsCustomOrders, setAcceptsCustomOrders] = useState(false)
  const [slugConflict, setSlugConflict] = useState<
    ShopSlugAvailabilityResponse | undefined
  >(undefined)

  const autoSlug = useMemo(() => generateSlug(name), [name])
  const slug = slugOverride ?? autoSlug

  const handleSlugChange = (value: string) => {
    const cleaned = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 45)
    setSlugOverride(cleaned)
  }

  const handleSubmit = async () => {
    if (!name.trim()) return
    // The slug field shows why a too-short slug can't be used.
    if (slug.length < SHOP_SLUG_MIN_LENGTH) return
    if (ownerType === "organization" && !selectedOrg) {
      issueAlert({
        severity: "error",
        message: t("shopsUi.create.selectOrgError"),
      })
      return
    }

    const result = await createShop({
      name: name.trim(),
      slug: slug,
      description: description.trim() || undefined,
      contractor_id: isOrgShop ? selectedOrg!.contractor_id : undefined,
      tags,
      supported_languages: supportedLanguages,
      accepts_custom_orders: acceptsCustomOrders,
    })
    if (result.ok) {
      navigate(SHOP_PATHS.settings(result.slug))
    } else {
      // Taken or reserved: the slug field shows why, with free suggestions.
      setSlugConflict(shopSlugConflictFromError(result.error))
    }
  }

  const orgs = profile?.contractors ?? []

  return (
    <Container maxWidth="md" sx={{ pt: 12, pb: 6 }}>
      <MuiLink
        component={Link}
        to={PATHS.dashboardShops}
        underline="hover"
        sx={{ mb: 2, display: "inline-block" }}
      >
        {t("shopsUi.create.backToMyShops")}
      </MuiLink>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            {t("shops.mine.create")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            {t("shopsUi.create.intro")}
          </Typography>

          <Stack spacing={4}>
            {/* General */}
            <Box>
              <Typography variant="h6" gutterBottom>
                {t("shopsUi.form.general")}
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label={t("shopsUi.form.shopName")}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    // Reset slug override when name changes so auto-generation kicks in
                    if (slugOverride !== null && !slugOverride) {
                      setSlugOverride(null)
                    }
                  }}
                  fullWidth
                  required
                  placeholder={t("shopsUi.create.namePlaceholder")}
                />
                <ShopSlugField
                  value={slug}
                  onChange={handleSlugChange}
                  onFocus={() => {
                    if (slugOverride === null) {
                      setSlugOverride(autoSlug)
                    }
                  }}
                  contractorId={
                    isOrgShop ? selectedOrg?.contractor_id : undefined
                  }
                  conflict={slugConflict}
                  urlPrefix="sc-market.space/shops/"
                />
                <TextField
                  label={t("shopsUi.form.description")}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                  multiline
                  minRows={3}
                  placeholder={t("shopsUi.create.descriptionPlaceholder")}
                />
              </Stack>
            </Box>

            {/* Ownership */}
            <Box>
              <Typography variant="h6" gutterBottom>
                {t("shopsUi.create.ownership")}
              </Typography>
              <RadioGroup
                value={ownerType}
                onChange={(e) =>
                  setOwnerType(e.target.value as "personal" | "organization")
                }
              >
                <FormControlLabel
                  value="personal"
                  control={<Radio />}
                  label={t("shopsUi.create.personalShop")}
                />
                <FormControlLabel
                  value="organization"
                  control={<Radio />}
                  label={t("shopsUi.create.organizationShop")}
                  disabled={orgs.length === 0}
                />
              </RadioGroup>
              {ownerType === "organization" && orgs.length > 0 && (
                <TextField
                  select
                  label={t("shops.mine.organization")}
                  value={orgSpectrumId}
                  onChange={(e) => setOrgSpectrumId(e.target.value)}
                  fullWidth
                  sx={{ mt: 2 }}
                  SelectProps={{ native: true }}
                >
                  <option value="">
                    {t("shopsUi.form.selectOrganization")}
                  </option>
                  {orgs.map((org) => (
                    <option key={org.spectrum_id} value={org.spectrum_id}>
                      {org.name}
                    </option>
                  ))}
                </TextField>
              )}
            </Box>

            {/* Categories & Languages */}
            <Box>
              <Typography variant="h6" gutterBottom>
                {t("shopsUi.create.categoriesLanguages")}
              </Typography>
              <Stack spacing={2}>
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
                    />
                  )}
                />
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
                    />
                  )}
                />
              </Stack>
            </Box>

            {/* Orders */}
            <Box>
              <Typography variant="h6" gutterBottom>
                {t("shopsUi.form.orders")}
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={acceptsCustomOrders}
                    onChange={(e) => setAcceptsCustomOrders(e.target.checked)}
                  />
                }
                label={t("shopsUi.form.acceptCustomOrders")}
              />
            </Box>

            {/* Submit */}
            <Box>
              <LoadingButton
                variant="contained"
                loading={isLoading}
                startIcon={<StorefrontRounded />}
                onClick={handleSubmit}
                disabled={
                  !name.trim() ||
                  (ownerType === "organization" &&
                    (!selectedOrg || isOrgLoading))
                }
                size="large"
              >
                {t("shops.mine.create")}
              </LoadingButton>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  )
}
