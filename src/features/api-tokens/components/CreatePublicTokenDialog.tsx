import { useState } from "react"
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { ContentCopyRounded as ContentCopyIcon } from "@mui/icons-material"
import { useTranslation } from "react-i18next"
import { ResponsiveDialog } from "../../../components/dialog/ResponsiveDialog"
import {
  type PublicApiTokenOptions,
  type PublicTokenPreset,
} from "../../../store/api/v2/market"
import { useCreatePublicApiToken } from "../hooks/usePublicApiTokenActions"

export const EXPIRY_CHOICES = [30, 90, 180, 365]

/** i18n key part of a scope ("orders:write" -> "orders_write"). */
export function scopeKey(scope: string): string {
  return scope.replace(/[^a-z_]/gi, "_")
}

export function CreatePublicTokenDialog({
  open,
  options,
  onClose,
}: {
  open: boolean
  options: PublicApiTokenOptions
  onClose: () => void
}) {
  const { t } = useTranslation()
  const { create: createToken, isLoading } = useCreatePublicApiToken()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [preset, setPreset] = useState<PublicTokenPreset | "">("")
  const [orgs, setOrgs] = useState<string[]>([])
  const [days, setDays] = useState(options.default_lifetime_days)
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const choices = [
    ...new Set([...EXPIRY_CHOICES, options.default_lifetime_days]),
  ]
    .filter((d) => d <= options.max_lifetime_days)
    .sort((a, b) => a - b)

  const reset = () => {
    setName("")
    setDescription("")
    setPreset("")
    setOrgs([])
    setDays(options.default_lifetime_days)
    setError(null)
    setCreated(null)
    setCopied(false)
  }

  const close = () => {
    reset()
    onClose()
  }

  const submit = async () => {
    if (!preset) return
    setError(null)
    const result = await createToken({
      name: name.trim(),
      description: description.trim() || null,
      preset,
      org_spectrum_ids: orgs,
      expires_in_days: days,
    })
    if ("token" in result) setCreated(result.token)
    else setError(result.error)
  }

  const copy = async () => {
    if (!created) return
    await navigator.clipboard.writeText(created)
    setCopied(true)
  }

  if (created) {
    return (
      <ResponsiveDialog
        open={open}
        onClose={close}
        title={t("settings.publicApi.created.title")}
        actions={
          <>
            <Button startIcon={<ContentCopyIcon />} onClick={copy}>
              {copied
                ? t("settings.publicApi.created.copied")
                : t("settings.publicApi.created.copy")}
            </Button>
            <Button variant="contained" onClick={close}>
              {t("settings.publicApi.created.done")}
            </Button>
          </>
        }
      >
        <Alert severity="warning" sx={{ mb: 2 }}>
          {t("settings.publicApi.created.warning")}
        </Alert>
        <TextField
          value={created}
          fullWidth
          InputProps={{ readOnly: true, sx: { fontFamily: "monospace" } }}
          onFocus={(e) => e.target.select()}
        />
      </ResponsiveDialog>
    )
  }

  const valid = name.trim().length > 0 && name.trim().length <= 100 && !!preset

  return (
    <ResponsiveDialog
      open={open}
      onClose={close}
      disableClose={isLoading}
      mobile="fullScreen"
      title={t("settings.publicApi.dialog.title")}
      actions={
        <>
          <Button onClick={close}>{t("settings.publicApi.cancel")}</Button>
          <Button
            variant="contained"
            onClick={submit}
            disabled={!valid || isLoading}
          >
            {isLoading
              ? t("settings.publicApi.dialog.creating")
              : t("settings.publicApi.dialog.create")}
          </Button>
        </>
      }
    >
      <Stack spacing={3} sx={{ mt: 1 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label={t("settings.publicApi.dialog.name")}
          helperText={t("settings.publicApi.dialog.nameHelp")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          inputProps={{ maxLength: 100 }}
          required
          fullWidth
        />
        <TextField
          label={t("settings.publicApi.dialog.description")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          inputProps={{ maxLength: 500 }}
          multiline
          minRows={2}
          fullWidth
        />

        <FormControl>
          <FormLabel>{t("settings.publicApi.dialog.preset")}</FormLabel>
          <RadioGroup
            value={preset}
            onChange={(e) => {
              const next = options.presets.find((p) => p.id === e.target.value)
              if (next) setPreset(next.id)
            }}
          >
            {options.presets.map((p) => (
              <FormControlLabel
                key={p.id}
                value={p.id}
                control={<Radio />}
                label={
                  <Box py={0.5}>
                    <Typography color="text.secondary">
                      {t(`settings.publicApi.presets.${p.id}.name`)}
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      {t(`settings.publicApi.presets.${p.id}.description`)}
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                      {p.scopes.map((scope) => (
                        <Chip
                          key={scope}
                          size="small"
                          variant="outlined"
                          label={t(
                            `settings.publicApi.scopes.${scopeKey(scope)}`,
                          )}
                        />
                      ))}
                    </Box>
                  </Box>
                }
              />
            ))}
          </RadioGroup>
        </FormControl>

        <FormControl>
          <FormLabel>{t("settings.publicApi.dialog.orgs")}</FormLabel>
          <Typography variant="body2" color="text.primary" mb={1}>
            {t("settings.publicApi.dialog.orgsHelp")}
          </Typography>
          {options.orgs.length === 0 ? (
            <Typography variant="body2" color="text.primary">
              {t("settings.publicApi.dialog.noOrgs")}
            </Typography>
          ) : (
            <FormGroup>
              {options.orgs.map((org) => (
                <FormControlLabel
                  key={org.contractor_id}
                  control={
                    <Checkbox
                      checked={orgs.includes(org.spectrum_id)}
                      onChange={(e) =>
                        setOrgs((prev) =>
                          e.target.checked
                            ? [...prev, org.spectrum_id]
                            : prev.filter((id) => id !== org.spectrum_id),
                        )
                      }
                    />
                  }
                  label={org.name}
                />
              ))}
            </FormGroup>
          )}
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="public-token-expiry">
            {t("settings.publicApi.dialog.expiry")}
          </InputLabel>
          <Select
            labelId="public-token-expiry"
            label={t("settings.publicApi.dialog.expiry")}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            {choices.map((d) => (
              <MenuItem key={d} value={d}>
                {t("settings.publicApi.dialog.daysOption", { days: d })}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </ResponsiveDialog>
  )
}
