import React from "react"
import { Grid, TextField, Typography, FormGroup, FormControlLabel, Switch } from "@mui/material"
import { Section } from "../../../../components/paper/Section"
import { MarkdownEditor } from "../../../../components/markdown/Markdown.lazy"
import { SelectPhotosArea } from "../../../../components/modal/SelectPhotosArea"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../../../hooks/styles/Theme"
import { useServiceFormContext } from "./ServiceFormContext"

export function ServiceDetailsSection({ isEditing }: { isEditing: boolean }) {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const { state, setState, uploadedFiles, handleFileUpload, removePendingFile, issueAlert } = useServiceFormContext()

  return (
    <Section xs={12}>
      <Grid item xs={12} lg={4}>
        <Typography variant="h6" align="left" color="text.secondary" sx={{ fontWeight: "bold" }}>
          {t("CreateServiceForm.serviceDetails")}
        </Typography>
      </Grid>
      <Grid item xs={12} lg={8} container spacing={theme.layoutSpacing.layout}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={t("CreateServiceForm.serviceName") + "*"}
            id="service-name"
            value={state.service_name}
            onChange={(e: React.ChangeEvent<{ value: string }>) => setState({ ...state, service_name: e.target.value })}
            color="secondary"
            aria-required="true"
            inputProps={{ maxLength: 100 }}
          />
        </Grid>
        <Grid item xs={12}>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  onChange={(e) => setState({ ...state, status: e.target.checked ? "active" : "inactive" })}
                  checked={state.status === "active"}
                />
              }
              label={state.status === "active" ? t("CreateServiceForm.serviceActive") : t("CreateServiceForm.serviceInactive")}
            />
          </FormGroup>
        </Grid>
        <Grid item xs={12}>
          <MarkdownEditor
            value={state.service_description}
            variant="vertical"
            TextFieldProps={{
              label: t("CreateServiceForm.serviceDescription"),
              helperText: t("CreateServiceForm.serviceDescriptionHelper"),
            }}
            onChange={(value) => setState({ ...state, service_description: value })}
          />
        </Grid>
        <Grid item xs={12}>
          <SelectPhotosArea
            photos={state.photos}
            setPhotos={(photos) => setState((s) => ({ ...s, photos }))}
            onFileUpload={handleFileUpload}
            showUploadButton={true}
            pendingFiles={uploadedFiles}
            onRemovePendingFile={removePendingFile}
            onAlert={(severity, message) => issueAlert({ severity, message })}
          />
          {!isEditing && uploadedFiles.length > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: "italic" }}>
              {t("CreateServiceForm.photoUploadNote")}
            </Typography>
          )}
        </Grid>
      </Grid>
    </Section>
  )
}
