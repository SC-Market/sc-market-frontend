import { ContainerGrid } from "../../components/layout/ContainerGrid"
import React from "react"
import { Navigate, useParams } from "react-router-dom"
import { ProfileSkeleton, ViewProfile } from "../../views/people/ViewProfile"
import { useGetUserByUsernameQuery } from "../../store/profile"
import { Page } from "../../components/metadata/Page"
import { useTranslation } from "react-i18next"

export function Profile() {
  const { t } = useTranslation()
  const { username } = useParams<{ username: string }>()
  // const myProfile = useGetUserProfileQuery()

  const user = useGetUserByUsernameQuery(username!)

  return (
    <Page
      title={
        user.data?.display_name
          ? `${user.data?.display_name} - ${t("profile.viewUserProfile")}`
          : null
      }
    >
      {/*{myProfile?.data?.username && myProfile?.data?.username === username ? <Navigate to={'/profile'}/> : null}*/}
      {user.error ? <Navigate to={"/404"} /> : null}
      {!user.isLoading && !user.error ? (
        <ViewProfile profile={user.data!} />
      ) : (
        <ContainerGrid sidebarOpen={true} maxWidth={"lg"}>
          <ProfileSkeleton />
        </ContainerGrid>
      )}
    </Page>
  )
}
