import React, { useState } from "react"
import { Section } from "../../components/paper/Section"
import { useImportShipFile } from "../../store/ships"
import { AlertInterface } from "../../datatypes/Alert"
import { Navigate } from "react-router-dom"
import { useAlertHook } from "../../hooks/alert/AlertHook"
import { useTranslation } from "react-i18next"
import { useTheme } from "@mui/material/styles"
import { ExtendedTheme } from "../../hooks/styles/Theme"

import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Fade from '@mui/material/Fade';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MaterialLink from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import CreateRounded from '@mui/icons-material/CreateRounded';
import PersonRounded from '@mui/icons-material/PersonRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import ZoomInRounded from '@mui/icons-material/ZoomInRounded';

export function ImportFleetForm() {
  const { t } = useTranslation()
  const theme = useTheme<ExtendedTheme>()
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)

  const [
    uploadFleetFile, // This is the mutation trigger
    { isSuccess }, // This is the destructured mutation result
  ] = useImportShipFile()

  const onFileUpload = async () => {
    const content = await selectedFile?.text()
    const res: { data?: any; error?: any } = await uploadFleetFile(
      JSON.parse(content || "[]"),
    )

    if (res?.data && !res?.error) {
      issueAlert({
        message: t("ships.import.submitted"),
        severity: "success",
      })
    } else {
      issueAlert({
        message: t("ships.import.failed", {
          error: res.error?.error || res.error?.data?.error || res.error || "",
        }),
        severity: "error",
      })
    }
  }

  const issueAlert = useAlertHook()

  return (
    <>
      {isSuccess && <Navigate to={"/myfleet"} />}
      <Section xs={12}>
        <Grid item xs={12} lg={4}>
          <Typography
            variant={"h6"}
            align={"left"}
            color={"text.secondary"}
            sx={{ fontWeight: "bold" }}
          >
            {t("ships.import.title")}
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          lg={8}
          container
          spacing={theme.layoutSpacing.layout}
        >
          <Grid
            item
            container
            spacing={theme.layoutSpacing.layout}
            justifyContent={"right"}
          >
            <Grid
              item
              xs={12}
              lg={12}
              display={"flex"}
              justifyContent={"flex-end"}
            >
              <Typography
                variant={"h6"}
                align={"right"}
                sx={{ marginRight: 2 }}
              >
                {selectedFile?.name}
              </Typography>
              <Button variant="outlined" component="label" color={"secondary"}>
                {t("ships.import.upload")}
                <input
                  type="file"
                  hidden
                  accept={".json"}
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
                color={"primary"}
                onClick={onFileUpload}
                disabled={!selectedFile}
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
      </Section>
    </>
  )
}
