import React from "react"
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Fab,
  Grid,
  IconButton,
  Link,
  Paper,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material"
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded"
import CreateIcon from "@mui/icons-material/CreateRounded"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { useCurrentOrg } from "../../hooks/login/CurrentOrg"
import { Contractor } from "../../features/contractor/domain/types"
import { AddAPhotoRounded, SaveRounded } from "@mui/icons-material"
import {
  MarkdownEditor,
  MarkdownRender,
} from "../../components/markdown/Markdown.lazy"
import { ListingSellerRating } from "../../components/rating/ListingRating"
import { useTranslation } from "react-i18next"
import { useOrgDetailEdit } from "../../features/contractor/hooks/useOrgDetailEdit"
import { OrgTagsEditor } from "./OrgTagsEditor"

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

  const {
    editingName,
    setEditingName,
    editingDesc,
    setEditingDesc,
    editingTags,
    setEditingTags,
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
                    aria-label={t("ui.aria.changeAvatar")}
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
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>,
                      ) => {
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
                    <IconButton
                      aria-label={t("orgDetailEdit.editName", "Edit name")}
                    >
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
            //     <Button color="neutral" variant={'outlined'}>
            //         Contact
            //     </Button>
            // }
          />
          <OrgTagsEditor
            contractor={contractor}
            editingTags={editingTags}
            setEditingTags={setEditingTags}
            newTags={newTags}
            setNewTags={setNewTags}
            submitUpdate={submitUpdate}
          />
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
                    aria-label={t(
                      "orgDetailEdit.editDescription",
                      "Edit description",
                    )}
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
                    color="primary"
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
