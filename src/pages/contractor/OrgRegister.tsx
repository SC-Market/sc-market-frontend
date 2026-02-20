import React, { useState } from "react"
import { AuthenticateContractor } from "../../views/authentication/AuthenticateContractor"
import { Grid, Tab, Tabs } from "@mui/material"
import { CreateRounded, HowToRegRounded } from "@mui/icons-material"
import { a11yProps, TabPanel } from "../../components/tabs/Tabs"
import { CreateNewContractor } from "../../views/authentication/CreateNewContractor"
import { useTranslation } from "react-i18next"
import { StandardPageLayout } from "../../components/layout/StandardPageLayout"

export function OrgRegister() {
  const { t } = useTranslation()
  const [page, setPage] = useState(0)

  return (
    <StandardPageLayout
      title={t("org.registerOrgTitle")}
      headerTitle={t("org.registerOrgTitle")}
      sidebarOpen={true}
      maxWidth="md"
    >
      <Grid item xs={12}>
        <Tabs
          value={page}
          onChange={(_, newPage) => setPage(newPage)}
          aria-label={t("ui.aria.orgInfoArea")}
          variant="scrollable"
        >
          <Tab
            label={t("org.existingRsiOrg")}
            icon={<HowToRegRounded />}
            {...a11yProps(0)}
          />

          <Tab
            label={t("org.newContractor")}
            icon={<CreateRounded />}
            {...a11yProps(1)}
          />
        </Tabs>
      </Grid>
      <Grid item xs={12}>
        <TabPanel value={page} index={0}>
          <AuthenticateContractor />
        </TabPanel>
        <TabPanel value={page} index={1}>
          <CreateNewContractor />
        </TabPanel>
      </Grid>
    </StandardPageLayout>
  )
}
