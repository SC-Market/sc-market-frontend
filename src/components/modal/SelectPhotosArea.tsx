import { Stack } from "@mui/system"
import {
  Avatar,
  Box,
  ButtonBase,
  Fab,
  Paper,
  Button,
  Typography,
  useTheme,
  Modal,
  TextField,
  Grid,
  CircularProgress,
  useMediaQuery,
} from "@mui/material"
import {
  AddAPhotoRounded,
  CloseRounded,
  CloudUploadRounded,
} from "@mui/icons-material"
import React, { useState, useRef, useCallback, Suspense } from "react"
import { useTranslation } from "react-i18next"

// Lazy load heavy modal components
const ImageSearch = React.lazy(() =>
  import("../../features/market/components/ImageSearch").then((module) => ({
    default: module.ImageSearch,
  })),
)
import { ContainerGrid } from "../layout/ContainerGrid"
import { Section } from "../paper/Section"
import { external_resource_regex } from "../../features/profile"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { BottomSheet } from "../mobile/BottomSheet"

export function PhotoEntry(props: { url: string; onClose: () => void }) {
  const theme = useTheme<ExtendedTheme>()
  return (
    <Paper
      sx={{
        width: 96,
        height: 96,
        bgcolor: theme.palette.background.imageOverlay,
        position: "relative",
      }}
    >
      <Fab
        size={"small"}
        sx={{
          transform: "scale(0.6)",
          position: "absolute",
          top: -4,
          right: -4,
        }}
        onClick={props.onClose}
      >
        <CloseRounded />
      </Fab>
      <Avatar
        src={props.url}
        sx={{ borderRadius: 0, width: "100%", height: "100%" }}
      />
    </Paper>
  )
}

export function PendingPhotoEntry(props: { file: File; onClose: () => void }) {
  const theme = useTheme<ExtendedTheme>()
  const [previewUrl, setPreviewUrl] = useState<string>("")

  React.useEffect(() => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreviewUrl(e.target.result as string)
      }
    }
    reader.readAsDataURL(props.file)
  }, [props.file])

  return (
    <Paper
      sx={{
        width: 96,
        height: 96,
        bgcolor: theme.palette.background.imageOverlay,
        position: "relative",
      }}
    >
      <Fab
        size={"small"}
        sx={{
          transform: "scale(0.6)",
          position: "absolute",
          top: -4,
          right: -4,
        }}
        onClick={props.onClose}
      >
        <CloseRounded />
      </Fab>
      <Avatar
        src={previewUrl}
        sx={{ borderRadius: 0, width: "100%", height: "100%" }}
      />
    </Paper>
  )
}

export function SelectPhotosArea(props: {
  setPhotos: (photos: string[]) => void
  photos: string[]
  onFileUpload?: (files: File[]) => void
  showUploadButton?: boolean
  pendingFiles?: File[]
  onRemovePendingFile?: (file: File) => void
  onAlert?: (severity: "warning" | "error", message: string) => void
}) {
  const {
    photos,
    setPhotos,
    onFileUpload,
    showUploadButton = true,
    pendingFiles = [],
    onRemovePendingFile,
    onAlert,
  } = props
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const [photoOpen, setPhotoOpen] = useState(false)
  const [urlModalOpen, setUrlModalOpen] = useState(false)
  const [urlInput, setUrlInput] = useState("")

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (files) {
        console.log(`[SelectPhotosArea] File upload initiated:`, {
          file_count: files.length,
          files: Array.from(files).map((f) => ({
            name: f.name,
            size: f.size,
            type: f.type,
          })),
        })

        const fileArray = Array.from(files)
        const maxSize = 2 * 1024 * 1024 // 2MB in bytes
        const validFiles = fileArray.filter((file) => file.size <= maxSize)
        const oversizedFiles = fileArray.filter((file) => file.size > maxSize)

        if (oversizedFiles.length > 0) {
          console.warn(`[SelectPhotosArea] Files too large, skipping:`, {
            count: oversizedFiles.length,
            files: oversizedFiles.map((f) => ({ name: f.name, size: f.size })),
          })

          // Show warning for oversized files
          if (onAlert) {
            if (oversizedFiles.length === 1) {
              onAlert("warning", t("SelectPhotosArea.fileTooLarge"))
            } else {
              onAlert("warning", t("SelectPhotosArea.someFilesTooLarge"))
            }
          }
        }

        if (validFiles.length > 0 && onFileUpload) {
          onFileUpload(validFiles)
        }
      }
      // Reset the input value so the same file can be selected again
      event.target.value = ""
    },
    [onFileUpload, t, onAlert],
  )

  const handleDragOver = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      event.stopPropagation()
      if (!isDragOver) {
        console.log(`[SelectPhotosArea] Drag over started`)
        setIsDragOver(true)
      }
    },
    [isDragOver],
  )

  const handleDragLeave = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      event.stopPropagation()
      if (isDragOver) {
        console.log(`[SelectPhotosArea] Drag over ended`)
        setIsDragOver(false)
      }
    },
    [isDragOver],
  )

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      event.stopPropagation()
      setIsDragOver(false)

      const files = Array.from(event.dataTransfer.files)
      const imageFiles = files.filter((file) => file.type.startsWith("image/"))
      const maxSize = 2 * 1024 * 1024 // 2MB in bytes
      const validImageFiles = imageFiles.filter((file) => file.size <= maxSize)
      const oversizedImageFiles = imageFiles.filter(
        (file) => file.size > maxSize,
      )

      if (oversizedImageFiles.length > 0) {
        console.warn(`[SelectPhotosArea] Image files too large, skipping:`, {
          count: oversizedImageFiles.length,
          files: oversizedImageFiles.map((f) => ({
            name: f.name,
            size: f.size,
          })),
        })

        // Show warning for oversized files
        if (onAlert) {
          if (oversizedImageFiles.length === 1) {
            onAlert("warning", t("SelectPhotosArea.fileTooLarge"))
          } else {
            onAlert("warning", t("SelectPhotosArea.someFilesTooLarge"))
          }
        }
      }

      if (validImageFiles.length > 0) {
        console.log(`[SelectPhotosArea] Drag and drop file upload:`, {
          file_count: validImageFiles.length,
          files: validImageFiles.map((f) => ({
            name: f.name,
            size: f.size,
            type: f.type,
          })),
        })

        if (onFileUpload) {
          onFileUpload(validImageFiles)
        }
      } else if (files.length > 0) {
        console.warn(`[SelectPhotosArea] Non-image files dropped, ignoring:`, {
          file_count: files.length,
          files: files.map((f) => ({
            name: f.name,
            size: f.size,
            type: f.type,
          })),
        })
      }
    },
    [onFileUpload, onAlert, t],
  )

  const handleRemovePendingFile = (file: File) => {
    console.log(`[SelectPhotosArea] Removing pending file:`, {
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
    })
    if (onRemovePendingFile) {
      onRemovePendingFile(file)
    }
  }

  const handleRemovePhoto = (photo: string) => {
    console.log(`[SelectPhotosArea] Removing existing photo:`, {
      photo_url: photo,
    })
    setPhotos(photos.filter((p) => p !== photo))
  }

  return (
    <>
      <Stack
        direction={"row"}
        flexWrap={"wrap"}
        justifyContent={"left"}
        sx={{
          "& > *": {
            margin: 0.5,
          },
          border: isDragOver
            ? `2px dashed ${theme.palette.primary.main}`
            : "2px dashed transparent",
          borderRadius: theme.spacing(theme.borderRadius.topLevel),
          padding: isDragOver ? 1 : 0,
          backgroundColor: isDragOver
            ? `${theme.palette.primary.main}08`
            : "transparent",
          transition: "all 0.2s ease-in-out",
          minHeight: 120,
          position: "relative",
          transform: isDragOver ? "scale(1.02)" : "scale(1)",
          boxShadow: isDragOver
            ? `0 4px 20px ${theme.palette.primary.main}26`
            : "none",
          "&::before": isDragOver
            ? {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: `${theme.palette.primary.main}04`,
                borderRadius: theme.spacing(theme.borderRadius.topLevel),
                zIndex: -1,
              }
            : {},
          "@keyframes pulse": {
            "0%": {
              transform: "scale(1)",
              opacity: 1,
            },
            "50%": {
              transform: "scale(1.05)",
              opacity: 0.8,
            },
            "100%": {
              transform: "scale(1)",
              opacity: 1,
            },
          },
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label={t("SelectPhotosArea.dragAndDropArea")}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            fileInputRef.current?.click()
          }
        }}
      >
        {/* Image search button - temporarily hidden */}
        {/* <Paper sx={{ width: 96, height: 96, bgcolor: "#00000099" }}>
          <ButtonBase
            sx={{ width: "100%", height: "100%" }}
            onClick={() => {
              setPhotoOpen(true)
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <AddAPhotoRounded />
              <Typography
                variant="caption"
                sx={{ fontSize: "0.7rem", mt: 0.5 }}
              >
                {t("SelectPhotosArea.imageSearch")}
              </Typography>
            </Box>
          </ButtonBase>
        </Paper> */}

        {/* URL input button for external image URLs */}
        <Paper
          sx={{
            width: 96,
            height: 96,
            bgcolor: theme.palette.background.imageOverlay,
          }}
        >
          <ButtonBase
            sx={{ width: "100%", height: "100%" }}
            onClick={() => {
              setUrlModalOpen(true)
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <AddAPhotoRounded />
              <Typography
                variant="caption"
                sx={{ fontSize: "0.7rem", mt: 0.5 }}
              >
                {t("SelectPhotosArea.addUrl", "Add URL")}
              </Typography>
            </Box>
          </ButtonBase>
        </Paper>

        {showUploadButton && onFileUpload && (
          <Paper
            sx={{
              width: 96,
              height: 96,
              bgcolor: theme.palette.background.imageOverlay,
            }}
          >
            <ButtonBase
              sx={{ width: "100%", height: "100%" }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                }}
              >
                <CloudUploadRounded />
                <Typography
                  variant="caption"
                  sx={{ fontSize: "0.7rem", mt: 0.5 }}
                >
                  {t("SelectPhotosArea.upload")}
                </Typography>
              </Box>
            </ButtonBase>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              multiple
              accept="image/*"
              onChange={handleFileUpload}
            />
          </Paper>
        )}

        {/* Display pending files */}
        {pendingFiles.map((file, index) => (
          <PendingPhotoEntry
            file={file}
            key={`pending-${index}`}
            onClose={() => handleRemovePendingFile(file)}
          />
        ))}

        {/* Display searched images */}
        {photos.map((url, index) => (
          <PhotoEntry
            url={url}
            key={`searched-${index}`}
            onClose={() => handleRemovePhoto(url)}
          />
        ))}

        {/* Drag and drop indicator */}
        {isDragOver && (
          <Paper
            sx={{
              width: 96,
              height: 96,
              bgcolor: `${theme.palette.primary.main}26`,
              border: `2px dashed ${theme.palette.primary.main}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          >
            <CloudUploadRounded
              sx={{ color: theme.palette.primary.main, fontSize: 32 }}
            />
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.7rem",
                mt: 0.5,
                color: theme.palette.primary.main,
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              {t("SelectPhotosArea.dropHere")}
            </Typography>
          </Paper>
        )}
      </Stack>

      {/* Drag and drop hint */}
      {onFileUpload && (
        <Typography
          variant="caption"
          sx={{
            display: "block",
            textAlign: "center",
            mt: 1,
            color: theme.palette.text.secondary,
            fontSize: "0.7rem",
            fontStyle: "italic",
          }}
        >
          {t("SelectPhotosArea.dragAndDropHint")}
        </Typography>
      )}

      {/* URL Input Modal */}
      {isMobile ? (
        <BottomSheet
          open={urlModalOpen}
          onClose={() => setUrlModalOpen(false)}
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
                    "Enter a direct URL to an image (from Imgur, RSI, or starcitizen.tools)",
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
                    setUrlModalOpen(false)
                    setUrlInput("")
                  }}
                >
                  {t("ui.dialog.selectImage.buttons.cancel", "Cancel")}
                </Button>
                <Button
                  color={"primary"}
                  variant={"contained"}
                  disabled={
                    !urlInput || !urlInput.match(external_resource_regex)
                  }
                  onClick={() => {
                    if (urlInput && urlInput.trim()) {
                      setPhotos([...photos, urlInput.trim()])
                      setUrlModalOpen(false)
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
        <Modal open={urlModalOpen} onClose={() => setUrlModalOpen(false)}>
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
                      "Enter a direct URL to an image (from Imgur, RSI, or starcitizen.tools)",
                    )}
                    onChange={(event: React.ChangeEvent<{ value: string }>) => {
                      setUrlInput(event.target.value)
                    }}
                    value={urlInput}
                    error={
                      !!urlInput && !urlInput.match(external_resource_regex)
                    }
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}
                >
                  <Button
                    color={"error"}
                    variant={"contained"}
                    onClick={() => {
                      setUrlModalOpen(false)
                      setUrlInput("")
                    }}
                  >
                    {t("ui.dialog.selectImage.buttons.cancel", "Cancel")}
                  </Button>
                  <Button
                    color={"primary"}
                    variant={"contained"}
                    disabled={
                      !urlInput || !urlInput.match(external_resource_regex)
                    }
                    onClick={() => {
                      if (urlInput && urlInput.trim()) {
                        setPhotos([...photos, urlInput.trim()])
                        setUrlModalOpen(false)
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
      )}

      {/* ImageSearch component - lazy loaded */}
      {photoOpen && (
        <Suspense fallback={<CircularProgress />}>
          <ImageSearch
            open={photoOpen}
            setOpen={setPhotoOpen}
            callback={(arg) => {
              if (arg) {
                setPhotos([...photos, arg])
              }
            }}
          />
        </Suspense>
      )}
    </>
  )
}
