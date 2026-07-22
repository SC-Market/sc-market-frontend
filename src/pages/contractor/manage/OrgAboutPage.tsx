import React, { useState } from "react"
import {
  Autocomplete,
  AutocompleteRenderInputParams,
  Avatar,
  Box,
  Button,
  Chip,
  Grid,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import LoadingButton from "@mui/lab/LoadingButton"
import {
  AddAPhotoRounded,
  ImageRounded,
  SaveRounded,
} from "@mui/icons-material"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { useTranslation } from "react-i18next"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { FormPaper } from "../../../components/paper/FormPaper"
import { MarkdownEditor } from "../../../components/markdown/Markdown.lazy"
import { useCurrentOrg } from "../../../hooks/login/CurrentOrg"
import { useOrgDetailEdit } from "../../../features/contractor/hooks/useOrgDetailEdit"
import {
  contractorKindIcons,
  contractorKindIconsKeys,
} from "../../../views/contractor/ContractorList"
import type {
  Contractor,
  ContractorKindIconKey,
} from "../../../features/contractor/domain/types"

function OrgAboutSkeleton() {
  const theme = useTheme<ExtendedTheme>()
  return (
    <Grid container spacing={theme.layoutSpacing.layout}>
      <Grid item xs={12}>
        <Skeleton variant={"rectangular"} width={"100%"} height={400} />
      </Grid>
    </Grid>
  )
}

function OrgAboutForm(props: { contractor: Contractor }) {
  const { contractor } = props
  const theme = useTheme<ExtendedTheme>()
  const { t } = useTranslation()

  const {
    newName,
    setNewName,
    newDesc,
    setNewDesc,
    newTags,
    setNewTags,
    showAvatarButton,
    setShowAvatarButton,
    setAvatarFileInputRef,
    setBannerFileInputRef,
    isUploadingAvatar,
    isUploadingBanner,
    submitUpdate,
    handleAvatarUpload,
    handleBannerUpload,
  } = useOrgDetailEdit(contractor)

  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await submitUpdate({
        name: newName,
        description: newDesc,
        tags: newTags,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Grid container spacing={theme.layoutSpacing.layout}>
      {/* General */}
      <FormPaper
        title={t("orgAbout.generalTitle", "General")}
        subtitle={t("orgAbout.generalSubtitle", "Basic organization information")}
      >
        <Grid item xs={12}>
          <TextField
            label={t("orgAbout.orgName", "Organization Name")}
            value={newName}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setNewName(event.target.value)
            }
            fullWidth
            size="small"
            required
          />
        </Grid>
        <Grid item xs={12}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            gutterBottom
          >
            {t("orgAbout.description", "Description")}
          </Typography>
          <MarkdownEditor
            value={newDesc}
            onChange={(value: string) => setNewDesc(value)}
          />
        </Grid>
      </FormPaper>

      {/* Categories & Tags */}
      <FormPaper
        title={t("orgAbout.tagsTitle", "Categories & Tags")}
        subtitle={t(
          "orgAbout.tagsSubtitle",
          "Help members and customers find your organization",
        )}
      >
        <Grid item xs={12}>
          <Autocomplete
            fullWidth
            multiple
            filterSelectedOptions
            value={newTags}
            onChange={(_event: React.SyntheticEvent, newValue) => {
              setNewTags((newValue as ContractorKindIconKey[]) || [])
            }}
            options={contractorKindIconsKeys}
            renderInput={(params: AutocompleteRenderInputParams) => (
              <TextField
                {...params}
                variant="outlined"
                size="small"
                label={t("orgDetailEdit.org_tags")}
                placeholder={t("orgDetailEdit.mining")}
                fullWidth
                SelectProps={{
                  IconComponent: KeyboardArrowDownRoundedIcon,
                }}
              />
            )}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => {
                const { key, ...rest } = getTagProps({ index })
                return (
                  <Chip
                    key={key}
                    color={"primary"}
                    label={option}
                    size="small"
                    sx={{ textTransform: "capitalize" }}
                    variant={"outlined"}
                    icon={contractorKindIcons[option]}
                    {...rest}
                  />
                )
              })
            }
          />
        </Grid>
      </FormPaper>

      {/* Appearance */}
      <FormPaper
        title={t("orgAbout.appearanceTitle", "Appearance")}
        subtitle={t(
          "orgAbout.appearanceSubtitle",
          "Logo and banner for your organization",
        )}
      >
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {t("orgAbout.logo", "Logo")}
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              position={"relative"}
              onMouseEnter={() => setShowAvatarButton(true)}
              onMouseLeave={() => setShowAvatarButton(false)}
            >
              <Avatar
                src={contractor?.avatar || undefined}
                variant="rounded"
                sx={{
                  width: 64,
                  height: 64,
                  opacity: showAvatarButton || isUploadingAvatar ? 0.5 : 1,
                  transition: "0.3s",
                }}
              >
                <ImageRounded />
              </Avatar>
            </Box>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleAvatarUpload}
              ref={(input) => setAvatarFileInputRef(input)}
              style={{ display: "none" }}
              id="org-avatar-upload-input"
              disabled={isUploadingAvatar}
            />
            <Button
              component="label"
              htmlFor="org-avatar-upload-input"
              variant="outlined"
              size="small"
              color="secondary"
              disabled={isUploadingAvatar}
              startIcon={
                isUploadingAvatar ? <SaveRounded /> : <AddAPhotoRounded />
              }
            >
              {t("orgAbout.uploadLogo", "Upload Logo")}
            </Button>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {t("orgDetailEdit.avatar_too_large", "Avatar must be less than 1MB")}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {t("orgAbout.banner", "Banner")}
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 128,
                height: 64,
                borderRadius: 1,
                bgcolor: "background.default",
                backgroundImage: contractor?.banner
                  ? `url(${contractor.banner})`
                  : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              {!contractor?.banner && <ImageRounded color="disabled" />}
            </Box>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleBannerUpload}
              ref={(input) => setBannerFileInputRef(input)}
              style={{ display: "none" }}
              id="org-banner-upload-input"
              disabled={isUploadingBanner}
            />
            <Button
              component="label"
              htmlFor="org-banner-upload-input"
              variant="outlined"
              size="small"
              color="secondary"
              disabled={isUploadingBanner}
              startIcon={
                isUploadingBanner ? <SaveRounded /> : <AddAPhotoRounded />
              }
            >
              {t("orgDetailEdit.set_banner", "Set new banner")}
            </Button>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {t("orgDetailEdit.banner_too_large", "Banner must be less than 2.5MB")}
          </Typography>
        </Grid>
      </FormPaper>

      {/* Save */}
      <Grid item xs={12} container justifyContent="flex-end">
        <LoadingButton
          variant="contained"
          color="secondary"
          loading={saving}
          startIcon={<SaveRounded />}
          onClick={handleSave}
          disabled={!newName.trim()}
        >
          {t("orgAbout.saveChanges", "Save Changes")}
        </LoadingButton>
      </Grid>
    </Grid>
  )
}

export function OrgAboutPage() {
  const [contractor] = useCurrentOrg()

  return contractor ? (
    <OrgAboutForm contractor={contractor} />
  ) : (
    <OrgAboutSkeleton />
  )
}
