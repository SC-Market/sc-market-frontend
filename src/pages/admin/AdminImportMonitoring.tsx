import React from "react"
import { Page } from "../../components/metadata/Page"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { useTranslation } from "react-i18next"
import { AdminImportMonitoringView } from "../../views/admin/AdminImportMonitoringView"

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

export function AdminImportMonitoring() {
  const { t } = useTranslation()

  return (
    <Page title={t("admin.importMonitoring.title", "Import Job Monitoring")}>
      <ContainerGrid maxWidth={"xl"} sidebarOpen={true}>
        <AdminImportMonitoringView />
      </ContainerGrid>
    </Page>
  )
}
