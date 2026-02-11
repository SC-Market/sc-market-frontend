import React from "react"
import { Page } from "../../components/metadata/Page"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { useTranslation } from "react-i18next"
import { AdminAlertsView } from "../../views/admin/AdminAlertsView"

import { SxProps } from '@mui/material/SxProps';
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Breakpoint from '@mui/material/Breakpoint';

export function AdminAlerts() {
  const { t } = useTranslation()

  return (
    <Page title={t("admin.alerts", "Admin Alerts")}>
      <ContainerGrid maxWidth={"xl"} sidebarOpen={true}>
        <AdminAlertsView />
      </ContainerGrid>
    </Page>
  )
}
