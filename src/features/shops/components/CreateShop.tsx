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
import { useCreateShopMutation } from "../../../store/api/v2/market"
import { useGetUserProfileQuery } from "../../profile/api/profileApi"
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

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 45)
}

export function CreateShop() {
  const navigate = useNavigate()
  const [createShop, { isLoading }] = useCreateShopMutation()
  const { data: profile } = useGetUserProfileQuery()
  const issueAlert = useAlertHook()

  const [name, setName] = useState("")
  const [slugOverride, setSlugOverride] = useState<string | null>(null)
  const [description, setDescription] = useState("")
  const [ownerType, setOwnerType] = useState<"personal" | "organization">(
    "personal",
  )
  const [contractorId, setContractorId] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [supportedLanguages, setSupportedLanguages] = useState<string[]>([])
  const [acceptsCustomOrders, setAcceptsCustomOrders] = useState(false)

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
    try {
      const result = await createShop({
        createShopRequest: {
          name: name.trim(),
          slug: slug || undefined,
          description: description.trim() || undefined,
          contractor_id:
            ownerType === "organization" && contractorId
              ? contractorId
              : undefined,
        },
      }).unwrap()

      issueAlert({ message: "Shop created successfully!", severity: "success" })
      navigate(`/shop/${result.slug}/settings`)
    } catch (err) {
      issueAlert(err as { status: number; data: { message?: string } })
    }
  }

  const orgs = profile?.contractors ?? []

  return (
    <Container maxWidth="md" sx={{ pt: 12, pb: 6 }}>
      <MuiLink
        component={Link}
        to="/dashboard/shops"
        underline="hover"
        sx={{ mb: 2, display: "inline-block" }}
      >
        &larr; Back to My Shops
      </MuiLink>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Create Shop
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Set up your storefront on SC Market. You can refine your settings
            after creation.
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
                  onChange={(e) => {
                    setName(e.target.value)
                    // Reset slug override when name changes so auto-generation kicks in
                    if (slugOverride !== null && !slugOverride) {
                      setSlugOverride(null)
                    }
                  }}
                  fullWidth
                  required
                  placeholder="My Awesome Shop"
                />
                <TextField
                  label="Slug"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  onFocus={() => {
                    if (slugOverride === null) {
                      setSlugOverride(autoSlug)
                    }
                  }}
                  fullWidth
                  helperText={
                    slug
                      ? `Your shop URL: sc-market.space/shops/${slug}`
                      : "URL-friendly identifier (auto-generated from name)"
                  }
                />
                <TextField
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                  multiline
                  minRows={3}
                  placeholder="Tell buyers what your shop is about..."
                />
              </Stack>
            </Box>

            {/* Ownership */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Ownership
              </Typography>
              <RadioGroup
                value={ownerType}
                onChange={(e) =>
                  setOwnerType(
                    e.target.value as "personal" | "organization",
                  )
                }
              >
                <FormControlLabel
                  value="personal"
                  control={<Radio />}
                  label="Personal shop"
                />
                <FormControlLabel
                  value="organization"
                  control={<Radio />}
                  label="Organization shop"
                  disabled={orgs.length === 0}
                />
              </RadioGroup>
              {ownerType === "organization" && orgs.length > 0 && (
                <TextField
                  select
                  label="Organization"
                  value={contractorId}
                  onChange={(e) => setContractorId(e.target.value)}
                  fullWidth
                  sx={{ mt: 2 }}
                  SelectProps={{ native: true }}
                >
                  <option value="">Select an organization...</option>
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
                    <TextField
                      {...params}
                      label="Tags"
                      placeholder="Add tag"
                    />
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
              <FormControlLabel
                control={
                  <Switch
                    checked={acceptsCustomOrders}
                    onChange={(e) => setAcceptsCustomOrders(e.target.checked)}
                  />
                }
                label="Accept custom orders"
              />
            </Box>

            {/* Submit */}
            <Box>
              <LoadingButton
                variant="contained"
                loading={isLoading}
                startIcon={<StorefrontRounded />}
                onClick={handleSubmit}
                disabled={!name.trim()}
                size="large"
              >
                Create Shop
              </LoadingButton>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  )
}
