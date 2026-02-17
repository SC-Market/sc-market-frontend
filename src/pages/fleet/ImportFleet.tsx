import React from "react"
import { Button, Grid, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"
import { Navigate } from "react-router-dom"
import { FormPageLayout } from "../../components/layout/FormPageLayout"
import { usePageImportFleet } from "../../features/fleet"

export function ImportFleet() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const {
    selectedFile,
    setSelectedFile,
    onFileUpload,
    isSuccess,
    isLoading,
  } = usePageImportFleet()

  return (
    <>
      {isSuccess && <Navigate to={"/myfleet"} />}
      <FormPageLayout
        title={t("fleet.importFleet")}
        formTitle={t("fleet.importFleet")}
        sidebarOpen={true}
        maxWidth="lg"
      >
        <Grid container spacing={theme.layoutSpacing.layout}>
          <Grid item xs={12} lg={4}>
            <Typography
              variant="h6"
              align="left"
              color="text.secondary"
              sx={{ fontWeight: "bold" }}
            >
              {t("ships.import.title")}
            </Typography>
          </Grid>
          <Grid item xs={12} lg={8} container spacing={theme.layoutSpacing.layout}>
            <Grid item container spacing={theme.layoutSpacing.layout} justifyContent="right">
              <Grid item xs={12} lg={12} display="flex" justifyContent="flex-end">
                <Typography variant="h6" align="right" sx={{ marginRight: 2 }}>
                  {selectedFile?.name}
                </Typography>
                <Button variant="outlined" component="label" color="secondary">
                  {t("ships.import.upload")}
                  <input
                    type="file"
                    hidden
                    accept=".json"
                    onChange={(event) => {
                      const file = (event.target.files || [])[0]
                      setSelectedFile(file || null)
                    }}
                    aria-label={t(
                      "accessibility.selectFleetFile",
                      "Select fleet file to import",
                    )}
                    aria-describedby="file-upload-help"
                  />
                </Button>
                <div id="file-upload-help" className="sr-only">
                  {t(
                    "accessibility.fileUploadHelp",
                    "Select a JSON file containing fleet data to import",
                  )}
                </div>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={onFileUpload}
                  disabled={!selectedFile || isLoading}
                  aria-label={t("accessibility.importFleet", "Import fleet")}
                  aria-describedby="import-fleet-help"
                >
                  {t("ships.import.submit")}
                  <span id="import-fleet-help" className="sr-only">
                    {t(
                      "accessibility.importFleetHelp",
                      "Import the selected fleet file",
                    )}
                  </span>
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </FormPageLayout>
    </>
  )
}
