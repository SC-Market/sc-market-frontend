import React from "react"
import { Page } from "../../components/metadata/Page"
import { ContainerGrid } from "../../components/layout/ContainerGrid"
import { useTranslation } from "react-i18next"
import { AdminNotificationTestView } from "../../views/admin/AdminNotificationTestView"

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';

export function AdminNotificationTest() {
  const { t } = useTranslation()

  return (
    <Page title={t("admin.notificationTest", "Notification Test")}>
      <ContainerGrid maxWidth={"xl"} sidebarOpen={true}>
        <AdminNotificationTestView />
      </ContainerGrid>
    </Page>
  )
}
