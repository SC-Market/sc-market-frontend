import React, { useState } from "react"
import {
  Autocomplete,
  AutocompleteRenderInputParams,
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Collapse,
  Fab,
  Grid,
  IconButton,
  Link,
  Paper,
  Rating,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material"
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded"
import CreateIcon from "@mui/icons-material/CreateRounded"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import {
  ContractorKindIconKey,
  contractorKindIcons,
  contractorKindIconsKeys,
} from "./ContractorList"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded"
import { Contractor } from "../../datatypes/Contractor"
import {
  AddAPhotoRounded,
  EditRounded,
  SaveRounded,
  StarRounded,
} from "@mui/icons-material"
import {
  useContractorUploadAvatarMutation,
  useContractorUploadBannerMutation,
  useUpdateContractorMutation,
} from "../../store/contractor"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import {
  MarkdownEditor,
  MarkdownRender,
} from "../../components/markdown/Markdown.lazy"
import { external_resource_regex } from "../../features/profile"
import { ListingSellerRating } from "../../components/rating/ListingRating"
import { useTranslation } from "react-i18next"

export function OrgDetailEdit() {
  const [contractor] = useCurrentOrg()

  return (
    <React.Fragment>
      {contractor ? (
        <OrgDetailEditForm contractor={contractor} />
      ) : (
        <OrgDetailEditSkeleton />
      )}
    </React.Fragment>
  )
}

export function OrgDetailEditSkeleton() {
  return (
    <Grid item xs={12} lg={8}>
      <Skeleton variant={"rectangular"} width={"100%"} height={400} />
    </Grid>
  )
}

export function OrgDetailEditForm(props: { contractor: Contractor }) {
  const theme = useTheme<ExtendedTheme>()
  const { contractor } = props
  const { t } = useTranslation()
  const issueAlert = useAlertHook()

  const [editingName, setEditingName] = useState(false)
  const [editingDesc, setEditingDesc] = useState(false)
  const [editingTags, setEditingTags] = useState(false)

  const [newName, setNewName] = useState(contractor?.name || "")
  const [newDesc, setNewDesc] = useState(contractor?.description || "")
  const [newTags, setNewTags] = useState(contractor?.fields || [])

  const [showAvatarButton, setShowAvatarButton] = useState(false)
  const [avatarFileInputRef, setAvatarFileInputRef] =
    useState<HTMLInputElement | null>(null)
  const [bannerFileInputRef, setBannerFileInputRef] =
    useState<HTMLInputElement | null>(null)

  const [
    updateContractor, // This is the mutation trigger
    { isSuccess }, // This is the destructured mutation result
  ] = useUpdateContractorMutation()

  const [uploadAvatar, { isLoading: isUploadingAvatar }] =
    useContractorUploadAvatarMutation()

  const [uploadBanner, { isLoading: isUploadingBanner }] =
    useContractorUploadBannerMutation()

  async function submitUpdate(data: {
    description?: string
    tags?: string[]
    site_url?: string
    name?: string
  }) {
    const res: { data?: any; error?: any } = await updateContractor({
      contractor: contractor.spectrum_id,
      body: data,
    })

    if (res?.data && !res?.error) {
      issueAlert({
        message: t("orgDetailEdit.submitted"),
        severity: "success",
      })
    } else {
      issueAlert({
        message: t("orgDetailEdit.failed_submit", {
          reason: res.error?.error || res.error?.data?.error || res.error || "",
        }),
        severity: "error",
      })
    }
    return false
  }

  function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size (1MB limit for avatars)
    if (file.size > 1 * 1000 * 1000) {
      issueAlert({
        message: t("orgDetailEdit.avatar_too_large", {
          defaultValue: "Avatar must be less than 1MB",
        }),
        severity: "error",
      })
      return
    }

    uploadAvatar({
      contractor: contractor.spectrum_id,
      file,
    })
      .unwrap()
      .then(() => {
        issueAlert({
          message: t("orgDetailEdit.avatar_uploaded", {
            defaultValue: "Avatar uploaded successfully",
          }),
          severity: "success",
        })
      })
      .catch(issueAlert)
      .finally(() => {
        // Reset file input
        if (avatarFileInputRef) {
          avatarFileInputRef.value = ""
        }
      })
  }

  function handleBannerUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size (2.5MB limit for banners)
    if (file.size > 2.5 * 1000 * 1000) {
      issueAlert({
        message: t("orgDetailEdit.banner_too_large", {
          defaultValue: "Banner must be less than 2.5MB",
        }),
        severity: "error",
      })
      return
    }

    uploadBanner({
      contractor: contractor.spectrum_id,
      file,
    })
      .unwrap()
      .then(() => {
        issueAlert({
          message: t("orgDetailEdit.banner_uploaded", {
            defaultValue: "Banner uploaded successfully",
          }),
          severity: "success",
        })
      })
      .catch(issueAlert)
      .finally(() => {
        // Reset file input
        if (bannerFileInputRef) {
          bannerFileInputRef.value = ""
        }
      })
  }

  return (
    <React.Fragment>
      <Grid item xs={12} lg={12}>
        <Card
          sx={{
            borderRadius: (theme) => theme.spacing(theme.borderRadius.image),
            padding: { xs: 1, sm: 1.5 }, // Further reduced padding
          }}
        >
          <CardHeader
            sx={{
              width: "100%",
              padding: { xs: 1, sm: 1.5 },
              "& .MuiCardHeader-content": {
                paddingRight: { xs: 0.5, sm: 1 },
              },
            }}
            avatar={
              <Box
                position={"relative"}
                onMouseEnter={() => setShowAvatarButton(true)}
                onMouseLeave={() => setShowAvatarButton(false)}
              >
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleAvatarUpload}
                  ref={(input) => setAvatarFileInputRef(input)}
                  style={{ display: "none" }}
                  id="org-avatar-upload-input"
                  disabled={isUploadingAvatar}
                />
                <label htmlFor="org-avatar-upload-input">
                  <IconButton
                    component="span"
                    disabled={isUploadingAvatar}
                    sx={{
                      opacity: showAvatarButton ? 1 : 0,
                      position: "absolute",
                      zIndex: 50,
                      transition: "0.3s",
                      color: theme.palette.background.light,
                      top: theme.spacing(4),
                      left: theme.spacing(4),
                      backgroundColor: theme.palette.background.overlay,
                      "&:hover": {
                        backgroundColor: theme.palette.background.overlayDark,
                      },
                    }}
                  >
                    {isUploadingAvatar ? <SaveRounded /> : <AddAPhotoRounded />}
                  </IconButton>
                </label>
                <Avatar
                  src={contractor?.avatar}
                  aria-label={t("contractors.contractor")}
                  variant={"rounded"}
                  sx={{
                    maxHeight: theme.spacing(12),
                    maxWidth: theme.spacing(12),
                    opacity: showAvatarButton || isUploadingAvatar ? 0.5 : 1,
                    // maxWidth:'100%',
                    // maxHeight:'100%',
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "0.5s",
                  }}
                />
              </Box>
            }
            title={
              editingName ? (
                <Grid
                  container
                  spacing={theme.layoutSpacing.compact}
                  alignItems={"center"}
                  sx={{ marginBottom: 1 }}
                >
                  <Grid item xs={12} lg={10}>
                    <TextField
                      fullWidth
                      multiline
                      value={newName}
                      onChange={(event: any) => {
                        setNewName(event.target.value)
                      }}
                      aria-label={t(
                        "accessibility.orgNameInput",
                        "Enter organization name",
                      )}
                      aria-describedby="org-name-help"
                      aria-required="true"
                    />
                    <div id="org-name-help" className="sr-only">
                      {t(
                        "accessibility.orgNameHelp",
                        "Enter the name for your organization",
                      )}
                    </div>
                  </Grid>
                  <Grid item xs={12} lg={1}>
                    <Button
                      variant={"contained"}
                      color={"primary"}
                      onClick={async () => {
                        if (editingName && newName) {
                          await submitUpdate({ name: newName })
                        }
                        setEditingName((v) => !v)
                      }}
                      aria-label={t(
                        "accessibility.saveOrgName",
                        "Save organization name",
                      )}
                      aria-describedby="save-org-name-help"
                    >
                      {t("orgDetailEdit.save")}
                      <span id="save-org-name-help" className="sr-only">
                        {t(
                          "accessibility.saveOrgNameHelp",
                          "Save the new organization name",
                        )}
                      </span>
                    </Button>
                  </Grid>
                </Grid>
              ) : (
                <Link onClick={() => setEditingName(true)}>
                  <Typography
                    color={"text.secondary"}
                    variant={"subtitle1"}
                    fontWeight={"bold"}
                    display={"inline"}
                  >
                    {newName}
                    <IconButton>
                      <CreateIcon />
                    </IconButton>
                  </Typography>
                </Link>
              )
            }
            subheader={
              <Box>
                <Grid
                  container
                  alignItems={"center"}
                  spacing={theme.layoutSpacing.compact}
                >
                  <Grid item>
                    <PeopleAltRoundedIcon />
                  </Grid>
                  <Grid item>
                    <Typography
                      sx={{ marginLeft: 1 }}
                      color={"text.primary"}
                      fontWeight={"bold"}
                    >
                      {contractor?.size}
                    </Typography>
                  </Grid>
                </Grid>

                <Grid
                  container
                  alignItems={"center"}
                  spacing={theme.layoutSpacing.compact}
                >
                  {/*<Grid item>*/}
                  {/*    <StarRateRoundedIcon style={{color: theme.palette.text.primary}}/>*/}
                  {/*</Grid>*/}
                  <Grid item>
                    <Typography
                      sx={{ marginLeft: 1 }}
                      color={"text.primary"}
                      fontWeight={"bold"}
                    >
                      <ListingSellerRating contractor={contractor} />
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            }
            // action={
            //     <Button color={'secondary'} variant={'outlined'}>
            //         Contact
            //     </Button>
            // }
          />
          {editingTags ? (
            <CardContent
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                padding: { xs: 1, sm: 1.5 },
              }}
            >
              <Autocomplete
                fullWidth
                multiple
                filterSelectedOptions
                value={newTags}
                onChange={(event: any, newValue) => {
                  setNewTags(newValue || [])
                }}
                options={contractorKindIconsKeys}
                defaultValue={
                  [
                    ...(contractor?.fields as ContractorKindIconKey[]),
                  ] /* I don't know why it needs this dumb thing, but the types error without */
                }
                renderInput={(params: AutocompleteRenderInputParams) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label={t("orgDetailEdit.org_tags")}
                    placeholder={t("orgDetailEdit.mining")}
                    fullWidth
                    SelectProps={{
                      IconComponent: KeyboardArrowDownRoundedIcon,
                    }}
                    aria-label={t(
                      "accessibility.orgTagsInput",
                      "Select organization tags",
                    )}
                    aria-describedby="org-tags-help"
                  />
                )}
                renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => (
                    // eslint-disable-next-line react/jsx-key
                    <Chip
                      color={"primary"}
                      label={option}
                      sx={{ marginRight: 1, textTransform: "capitalize" }}
                      variant={"outlined"}
                      icon={contractorKindIcons[option]}
                      {...getTagProps({ index })}
                    />
                  ))
                }
                // getOptionLabel={option => <span style={{textTransform: 'capitalize'}}>{option}</span>}
              />
              <Button
                sx={{ marginLeft: 2 }}
                variant={"contained"}
                onClick={async () => {
                  if (editingTags && newTags) {
                    await submitUpdate({ tags: newTags })
                  }
                  setEditingTags((v) => !v)
                }}
                aria-label={t(
                  "accessibility.saveOrgTags",
                  "Save organization tags",
                )}
                aria-describedby="save-org-tags-help"
              >
                {t("orgDetailEdit.save")}
                <span id="save-org-tags-help" className="sr-only">
                  {t(
                    "accessibility.saveOrgTagsHelp",
                    "Save the new organization tags",
                  )}
                </span>
              </Button>
            </CardContent>
          ) : (
            <CardActions
              sx={{ overflow: "scroll", padding: { xs: 1, sm: 1.5 } }}
            >
              {contractor.fields.length ? (
                contractor?.fields.map((option, index) => (
                  <Chip
                    color={"primary"}
                    label={option}
                    sx={{ marginRight: 1, textTransform: "capitalize" }}
                    variant={"outlined"}
                    icon={contractorKindIcons[option]}
                    key={index}
                  />
                ))
              ) : (
                <Typography>{t("orgDetailEdit.no_tags")}</Typography>
              )}
              <IconButton
                sx={{
                  // position: 'absolute',
                  zIndex: 50,
                  transition: "0.3s",
                  color: theme.palette.background.light,
                  // top: 20,
                  // left: 20
                }}
                onClick={() => setEditingTags(true)}
              >
                <EditRounded />
              </IconButton>
            </CardActions>
          )}
          <CardContent sx={{ padding: { xs: 1, sm: 1.5 } }}>
            {editingDesc ? (
              <>
                <MarkdownEditor
                  value={newDesc}
                  onChange={(value: string) => {
                    setNewDesc(value)
                  }}
                />
                <Box
                  display={"flex"}
                  justifyContent={"flex-end"}
                  sx={{ marginTop: 2, marginBottom: 2 }}
                >
                  <Button
                    variant={"contained"}
                    onClick={async () => {
                      if (editingDesc && newDesc) {
                        await submitUpdate({ description: newDesc })
                      }
                      setEditingDesc((v) => !v)
                    }}
                    aria-label={t(
                      "accessibility.saveOrgDescription",
                      "Save organization description",
                    )}
                    aria-describedby="save-org-description-help"
                  >
                    {t("orgDetailEdit.save")}
                    <span id="save-org-description-help" className="sr-only">
                      {t(
                        "accessibility.saveOrgDescriptionHelp",
                        "Save the new organization description",
                      )}
                    </span>
                  </Button>
                </Box>
              </>
            ) : (
              <Grid container spacing={theme.layoutSpacing.layout}>
                <Grid item xs={1}>
                  <IconButton
                    onClick={() => {
                      setNewDesc(contractor.description)
                      setEditingDesc(true)
                    }}
                  >
                    <CreateIcon />
                  </IconButton>
                </Grid>
                <Grid item xs={11}>
                  <MarkdownRender text={contractor.description} />
                </Grid>
              </Grid>
            )}

            <Paper
              sx={{
                height: 350,
                background: `url(${props.contractor.banner})`,
                backgroundSize: "cover",
                borderRadius: (theme) =>
                  theme.spacing(theme.borderRadius.image),
                position: "relative",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  display: "flex",
                }}
              >
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleBannerUpload}
                  ref={(input) => setBannerFileInputRef(input)}
                  style={{ display: "none" }}
                  id="org-banner-upload-input"
                  disabled={isUploadingBanner}
                />
                <label htmlFor="org-banner-upload-input">
                  <Fab
                    component="span"
                    disabled={isUploadingBanner}
                    color="secondary"
                    aria-label={t("orgDetailEdit.set_banner")}
                    sx={{
                      transition: "0.3s",
                    }}
                  >
                    {isUploadingBanner ? <SaveRounded /> : <AddAPhotoRounded />}
                  </Fab>
                </label>
              </Box>
            </Paper>
          </CardContent>
        </Card>
      </Grid>
    </React.Fragment>
  )
}
