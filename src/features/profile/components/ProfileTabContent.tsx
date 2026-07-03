import React from "react"
import { Link } from "react-router-dom"
import { Alert, Container, Grid, useTheme } from "@mui/material"
import { TabPanel } from "../../../components/tabs/Tabs"
import { Section } from "../../../components/paper/Section"
import { UserReviews } from "../../../views/contractor/OrgReviews"
import { ProfileStoreView } from "./ProfileStoreView"
import { ProfileAboutTab } from "./ProfileAboutTab"
import { User } from "../../../datatypes/User"
import { ExtendedTheme } from "../../../hooks/styles/Theme"
import { useGetShopsByOwnerQuery } from "../../../store/api/v2/market"
import { useTranslation } from "react-i18next"

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
    <Container maxWidth="xl" sx={{ pt: 3 }}>
      <TabPanel value={currentTab} index={0} preload>
        <ProfileStoreView user={profile.username} />
      </TabPanel>
      <TabPanel index={currentTab} value={1} preload>
        <ProfileAboutTab
          profile={profile}
          submitUpdate={submitUpdate}
          isMyProfile={isMyProfile}
        />
      </TabPanel>
      <TabPanel index={currentTab} value={2} preload>
        <UserShopRedirect username={profile.username} />
      </TabPanel>
      <TabPanel index={currentTab} value={3} preload>
        <Grid container spacing={theme.layoutSpacing.layout}>
          <Section xs={12} lg={8} disablePadding>
            <UserReviews user={profile} />
          </Section>
        </Grid>
      </TabPanel>
    </Container>
  )
}

function UserShopRedirect({ username }: { username: string }) {
  const { t } = useTranslation()
  const { data: shops } = useGetShopsByOwnerQuery({ username })
  const shop = shops?.[0]

  if (shop) {
    return (
      <Alert severity="info" action={
        <Link to={`/shops/${shop.slug}`} style={{ color: "inherit" }}>
          {t("common.viewShop", "View Shop")}
        </Link>
      }>
        {t("profile.customOrdersMovedToShop", "Custom orders are now placed through shops.")}
      </Alert>
    )
  }

  return (
    <Alert severity="info">
      {t("profile.customOrdersMovedToShop", "Custom orders are now placed through shops.")}
    </Alert>
  )
}
