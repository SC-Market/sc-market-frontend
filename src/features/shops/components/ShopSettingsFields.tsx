import { useTranslation } from "react-i18next"
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { ImageAvatar } from "../../../components/avatar/ImageAvatar"
import { useTheme } from "@mui/material/styles"
import { type ShopSettingsDraft } from "../domain/shopSettingsForm"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { FormPaper } from "../../../components/paper/FormPaper"
import { ImageRounded } from "@mui/icons-material"

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

/** Logo and banner pickers; the upload itself is the form's. */
export function ShopAppearanceFields({
  draft,
  isUploading,
  handleImageUpload,
}: {
  draft: Pick<ShopSettingsDraft, "logoUrl" | "bannerUrl">
  isUploading: boolean
  handleImageUpload: (file: File, kind: "logo" | "banner") => void
}) {
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()
  return (
    <FormPaper
      title={t("orgAbout.appearanceTitle")}
      subtitle={t("shopsUi.settings.appearanceSubtitle")}
    >
      <Grid item xs={12} sm={6}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {t("orgAbout.logo")}
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <ImageAvatar
            alt=""
            src={draft.logoUrl || undefined}
            variant="rounded"
            sx={{ width: 64, height: 64 }}
          >
            <ImageRounded />
          </ImageAvatar>
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
              backgroundImage: draft.bannerUrl
                ? `url(${draft.bannerUrl})`
                : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            {!draft.bannerUrl && <ImageRounded color="disabled" />}
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
  )
}

/** Shop tags and supported languages. */
export function ShopTagFields({
  draft,
  edit,
}: {
  draft: Pick<ShopSettingsDraft, "tags" | "supportedLanguages">
  edit: (field: "tags" | "supportedLanguages", value: string[]) => void
}) {
  const { t } = useTranslation()
  // Tags are stored in English; only their display label is translated.
  const tagLabel = (tag: string) =>
    t(`shopsUi.tags.${tag.toLowerCase()}`, { defaultValue: tag })
  const languageLabel = (code: string) =>
    t(`languages.${code}`, { defaultValue: code })
  return (
    <FormPaper
      title={t("shopsUi.settings.categoriesTitle")}
      subtitle={t("shopsUi.settings.categoriesSubtitle")}
    >
      <Grid item xs={12}>
        <Autocomplete
          multiple
          options={AVAILABLE_TAGS.slice()}
          getOptionLabel={tagLabel}
          value={draft.tags}
          onChange={(_e, newValue) => edit("tags", newValue)}
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
          value={draft.supportedLanguages}
          onChange={(_e, newValue) => edit("supportedLanguages", newValue)}
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
  )
}
