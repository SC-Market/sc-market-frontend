import React from "react"
import { Grid, useTheme } from "@mui/material"
import { TabPanel } from "../../../components/tabs/Tabs"
import { Section } from "../../../components/paper/Section"
import { CreateOrderForm } from "../../../views/orders/CreateOrderForm"
import { UserReviews } from "../../../views/contractor/OrgReviews"
import { ProfileStoreView } from "./ProfileStoreView"
import { ProfileServicesView } from "./ProfileServicesView"
import { ProfileAboutTab } from "./ProfileAboutTab"
import { User } from "../../../datatypes/User"
import { ExtendedTheme } from "../../../hooks/styles/Theme"

interface ProfileTabContentProps {
  currentTab: number
  profile: User
  isMyProfile: boolean
  submitUpdate: (data: {
    about?: string
    display_name?: string
  }) => Promise<boolean>
}

export function ProfileTabContent({
  currentTab,
  profile,
  isMyProfile,
  submitUpdate,
}: ProfileTabContentProps) {
  const theme = useTheme<ExtendedTheme>()

  return (
    <>
      <TabPanel value={currentTab} index={0}>
        <ProfileStoreView user={profile.username} />
      </TabPanel>
      <TabPanel index={currentTab} value={1}>
        <ProfileServicesView user={profile.username} />
      </TabPanel>
      <TabPanel index={currentTab} value={2}>
        <ProfileAboutTab
          profile={profile}
          submitUpdate={submitUpdate}
          isMyProfile={isMyProfile}
        />
      </TabPanel>
      <TabPanel index={currentTab} value={3}>
        <Grid container spacing={theme.layoutSpacing.layout}>
          <CreateOrderForm assigned_to={profile.username} />
        </Grid>
      </TabPanel>
      <TabPanel index={currentTab} value={4}>
        <Grid container spacing={theme.layoutSpacing.layout}>
          <Section xs={12} lg={8} disablePadding>
            <UserReviews user={profile} />
          </Section>
        </Grid>
      </TabPanel>
    </>
  )
}
