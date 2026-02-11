import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { useTheme, ThemeProvider, createTheme } from "@mui/material/styles";
import { User } from "../../../datatypes/User"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import {
  MarkdownEditor,
  MarkdownRender,
} from "../../../components/markdown/Markdown"
import { UserContractorList } from "../../../components/list/UserContractorList"
import { BottomSheet } from "../../../components/mobile/BottomSheet"

import Alert from '@mui/material/Alert';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from '@mui/material/Snackbar';
import useMediaQuery from '@mui/material/useMediaQuery';
import { responsiveFontSizes } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Fab from '@mui/material/Fab';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Modal from '@mui/material/Modal';
import CarRentalRounded from '@mui/icons-material/CarRentalRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import LocalHospitalRounded from '@mui/icons-material/LocalHospitalRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import DeleteRounded from '@mui/icons-material/DeleteRounded';
import MarkEmailReadRounded from '@mui/icons-material/MarkEmailReadRounded';
import MarkEmailUnreadRounded from '@mui/icons-material/MarkEmailUnreadRounded';
import ShareRounded from '@mui/icons-material/ShareRounded';
import AddAPhotoRounded from '@mui/icons-material/AddAPhotoRounded';
import SaveRounded from '@mui/icons-material/SaveRounded';
import EditRounded from '@mui/icons-material/EditRounded';

export function ProfileAboutTab(props: {
  profile: User
  submitUpdate: (data: {
    about?: string
    display_name?: string
  }) => Promise<unknown>
  isMyProfile: boolean
}) {
  const { profile, submitUpdate, isMyProfile } = props
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [descriptionEditOpen, setDescriptionEditOpen] = useState(false)
  const [newDescription, setNewDescription] = useState("")

  return (
    <Container maxWidth={"xl"} disableGutters>
      <Grid
        container
        spacing={theme.layoutSpacing.layout}
        justifyContent={"center"}
      >
        <Grid item xs={12} lg={4}>
          <UserContractorList contractors={profile?.contractors || []} />
        </Grid>
        <Grid item xs={12} lg={8}>
          <Paper
            sx={{
              padding: 2,
              paddingTop: 1,
              position: "relative",
              maxHeight: 400,
              overflowY: "auto",
            }}
          >
            <Typography sx={{ width: "100%" }}>
              {isMobile ? (
                <BottomSheet
                  open={descriptionEditOpen}
                  onClose={() => setDescriptionEditOpen(false)}
                  title={t("viewProfile.editDescription", "Edit Description")}
                  maxHeight="90vh"
                  fullHeight
                >
                  <MarkdownEditor
                    sx={{ width: "100%" }}
                    onChange={(value: string) => {
                      setNewDescription(value)
                    }}
                    value={newDescription}
                    BarItems={
                      <Button
                        variant={"contained"}
                        onClick={async () => {
                          await submitUpdate({ about: newDescription })
                          setDescriptionEditOpen(false)
                        }}
                      >
                        {t("ui.buttons.save")}
                      </Button>
                    }
                  />
                </BottomSheet>
              ) : (
                <Modal
                  open={descriptionEditOpen}
                  onClose={() => setDescriptionEditOpen(false)}
                >
                  <Container
                    maxWidth={"lg"}
                    sx={{
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <MarkdownEditor
                      sx={{ width: "100%" }}
                      onChange={(value: string) => {
                        setNewDescription(value)
                      }}
                      value={newDescription}
                      BarItems={
                        <Button
                          variant={"contained"}
                          onClick={async () => {
                            await submitUpdate({ about: newDescription })
                            setDescriptionEditOpen(false)
                          }}
                        >
                          {t("ui.buttons.save")}
                        </Button>
                      }
                    />
                  </Container>
                </Modal>
              )}
              <MarkdownRender
                text={
                  profile.profile_description ||
                  t("viewProfile.no_user_description")
                }
              />
            </Typography>
            {profile.languages && profile.languages.length > 0 && (
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  gap: 0.5,
                  flexWrap: "wrap",
                }}
              >
                {profile.languages.map((lang) => (
                  <Chip
                    key={lang.code}
                    label={`${lang.name} (${t(`languages.${lang.code}`, lang.name)})`}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            )}
            {isMyProfile && (
              <Fab
                color={"primary"}
                size={"small"}
                sx={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                }}
                onClick={() => {
                  setDescriptionEditOpen(true)
                  setNewDescription(profile.profile_description ?? "")
                }}
              >
                <EditRounded />
              </Fab>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}
