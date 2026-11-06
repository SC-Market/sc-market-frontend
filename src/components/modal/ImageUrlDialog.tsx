import React, { useState } from "react"
import { Box, Button, Grid, Modal, TextField } from "@mui/material"
import { useTranslation } from "react-i18next"
import { useIsMobile } from "../../hooks/layout/useBreakpoint"
import { external_resource_regex } from "../../features/profile"
import { ContainerGrid } from "../layout/ContainerGrid"
import { Section } from "../paper/Section"
import { BottomSheet } from "../mobile/BottomSheet"

/** "Add Image URL": a bottom sheet on mobile, a modal on desktop. */
export function ImageUrlDialog({
  open,
  onClose,
  onAdd,
}: {
  open: boolean
  onClose: () => void
  onAdd: (url: string) => void
}) {
  const { t } = useTranslation()
  const isMobile = useIsMobile()
  const [urlInput, setUrlInput] = useState("")
  return isMobile ? (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={t("SelectPhotosArea.urlModalTitle", "Add Image URL")}
      maxHeight="90vh"
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ marginBottom: 2 }}>
            <TextField
              variant={"outlined"}
              label={t("SelectPhotosArea.imageUrl", "Image URL")}
              fullWidth
              focused
              helperText={t(
                "SelectPhotosArea.imageUrlHelp",
                "Paste a direct image link (i.imgur.com, robertsspaceindustries.com, starcitizen.tools, or cstone.space)",
              )}
              onChange={(event: React.ChangeEvent<{ value: string }>) => {
                setUrlInput(event.target.value)
              }}
              value={urlInput}
              error={!!urlInput && !urlInput.match(external_resource_regex)}
            />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button
              color={"error"}
              variant={"contained"}
              onClick={() => {
                onClose()
                setUrlInput("")
              }}
            >
              {t("ui.dialog.selectImage.buttons.cancel", "Cancel")}
            </Button>
            <Button
              color={"primary"}
              variant={"contained"}
              disabled={!urlInput || !urlInput.match(external_resource_regex)}
              onClick={() => {
                if (urlInput && urlInput.trim()) {
                  onAdd(urlInput.trim())
                  onClose()
                  setUrlInput("")
                }
              }}
            >
              {t("ui.dialog.selectImage.buttons.saveAndClose", "Add URL")}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </BottomSheet>
  ) : (
    <Modal open={open} onClose={onClose}>
      <ContainerGrid sidebarOpen={false} maxWidth={"sm"} noFooter>
        <Section
          title={t("SelectPhotosArea.urlModalTitle", "Add Image URL")}
          xs={12}
          onClick={(event: React.MouseEvent) => {
            event.preventDefault()
            event.stopPropagation()
            return false
          }}
        >
          <Grid item xs={12}>
            <Box sx={{ marginBottom: 2 }}>
              <TextField
                variant={"outlined"}
                label={t("SelectPhotosArea.imageUrl", "Image URL")}
                fullWidth
                focused
                helperText={t(
                  "SelectPhotosArea.imageUrlHelp",
                  "Paste a direct image link (i.imgur.com, robertsspaceindustries.com, starcitizen.tools, or cstone.space)",
                )}
                onChange={(event: React.ChangeEvent<{ value: string }>) => {
                  setUrlInput(event.target.value)
                }}
                value={urlInput}
                error={!!urlInput && !urlInput.match(external_resource_regex)}
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <Button
                color={"error"}
                variant={"contained"}
                onClick={() => {
                  onClose()
                  setUrlInput("")
                }}
              >
                {t("ui.dialog.selectImage.buttons.cancel", "Cancel")}
              </Button>
              <Button
                color={"primary"}
                variant={"contained"}
                disabled={!urlInput || !urlInput.match(external_resource_regex)}
                onClick={() => {
                  if (urlInput && urlInput.trim()) {
                    onAdd(urlInput.trim())
                    onClose()
                    setUrlInput("")
                  }
                }}
              >
                {t("ui.dialog.selectImage.buttons.saveAndClose", "Add URL")}
              </Button>
            </Box>
          </Grid>
        </Section>
      </ContainerGrid>
    </Modal>
  )
}
