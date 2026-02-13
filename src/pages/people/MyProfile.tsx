import { ContainerGrid } from "../../components/layout/ContainerGrid"
import React from "react"
import { Navigate } from "react-router-dom"
import { ProfileSkeleton } from "../../features/profile/components/ProfileSkeleton"
import { ViewProfile } from "../../features/profile/components/ViewProfile"
import {
  useGetUserByUsernameQuery,
  useGetUserProfileQuery,
} from "../../store/profile"
import { Page } from "../../components/metadata/Page"
import { useTheme } from "@mui/material/styles"
import { useTranslation } from "react-i18next"

export function MyProfile() {
  const {
    data: profile,
    error,
    isLoading,
    isFetching,
  } = useGetUserProfileQuery()
  const {
    data: user,
    isLoading: isLoadingUser,
    isFetching: isFetchingUser,
  } = useGetUserByUsernameQuery(profile?.username ?? "", {
    skip: !profile?.username,
  })
  const theme = useTheme()
  const { t } = useTranslation()

  return (
    <Page title={t("viewProfile.myProfile")}>
      {error && <Navigate to={"/"} />}
      {isLoading || isFetching || isLoadingUser || isFetchingUser ? (
        <ContainerGrid
          sidebarOpen={true}
          maxWidth={"xxl"}
          sx={{ paddingTop: theme.spacing(4) }}
        >
          <ProfileSkeleton />
        </ContainerGrid>
      ) : user ? (
        <ViewProfile profile={user} />
      ) : null}
    </Page>
  )
}
