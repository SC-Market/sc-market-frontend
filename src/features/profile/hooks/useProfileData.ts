import { useMemo } from "react"
import { useGetUserProfileQuery } from "../../../store/profile"
import { User } from "../../../datatypes/User"

export function useProfileData(profile: User) {
  const { data: myProfile } = useGetUserProfileQuery()
  
  const isMyProfile = useMemo(
    () => myProfile?.username === profile.username,
    [myProfile?.username, profile.username],
  )

  const tabPaths = useMemo(
    () => [
      `/user/${profile.username}`,
      `/user/${profile.username}/services`,
      `/user/${profile.username}/about`,
      `/user/${profile.username}/order`,
      `/user/${profile.username}/reviews`,
    ],
    [profile.username],
  )

  return { isMyProfile, tabPaths, myProfile }
}
