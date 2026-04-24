import {
  useGetUserProfileQuery,
  useGetAuthenticatorIdentifier,
} from "../../profile/api/profileApi"

export interface UsePageAuthenticateRSIResult {
  profile: ReturnType<typeof useGetUserProfileQuery>
  identifier: ReturnType<typeof useGetAuthenticatorIdentifier>
  isAuthenticated: boolean
  isRSIConfirmed: boolean
}

export function usePageAuthenticateRSI(): UsePageAuthenticateRSIResult {
  const profile = useGetUserProfileQuery()
  const identifier = useGetAuthenticatorIdentifier()

  return {
    profile,
    identifier,
    isAuthenticated: !!profile.data,
    isRSIConfirmed: !!profile.data?.rsi_confirmed,
  }
}
