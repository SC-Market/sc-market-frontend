import {
  useGetUserByUsernameQuery,
  useGetUserProfileQuery,
} from "../../../store/profile"

/**
 * Page data for my profile page
 */
export interface MyProfilePageData {
  profile: ReturnType<typeof useGetUserProfileQuery>["data"]
  user: ReturnType<typeof useGetUserByUsernameQuery>["data"]
}

/**
 * Standard page hook result interface
 */
export interface UsePageResult<T> {
  data: T | undefined
  isLoading: boolean
  isFetching: boolean
  error: unknown
  refetch: () => void
}

/**
 * Page hook for my profile page
 *
 * Encapsulates data fetching for viewing the current user's own profile.
 * Composes profile query and user query to get complete profile data.
 *
 * @returns Page hook result with my profile data
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */
export function usePageMyProfile(): UsePageResult<MyProfilePageData> {
  const profile = useGetUserProfileQuery()
  const user = useGetUserByUsernameQuery(profile.data?.username ?? "", {
    skip: !profile.data?.username,
  })

  return {
    data:
      profile.data && user.data
        ? {
            profile: profile.data,
            user: user.data,
          }
        : undefined,
    isLoading: profile.isLoading || user.isLoading,
    isFetching: profile.isFetching || user.isFetching,
    error: profile.error || user.error,
    refetch: () => {
      profile.refetch()
      user.refetch()
    },
  }
}
