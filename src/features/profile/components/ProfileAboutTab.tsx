import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Box,
  Button,
  Chip,
  Container,
  Fab,
  Grid,
  Modal,
  Paper,
  Typography,
  useMediaQuery,
} from "@mui/material"
import { EditRounded } from "@mui/icons-material"
import { useTheme } from "@mui/material/styles"
import { User } from "../../../datatypes/User"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { MarkdownEditor, MarkdownRender } from "../../../components/markdown/Markdown"
import { UserContractorList } from "../../../components/list/UserContractorList"
import { BottomSheet } from "../../../components/mobile/BottomSheet"

export function ProfileAboutTab(props: {
  profile: User
  submitUpdate: (data: { about?: string; display_name?: string }) => Promise<unknown>
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
          <UserContractorList
            contractors={profile?.contractors || []}
          />
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
