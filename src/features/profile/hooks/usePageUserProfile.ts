import { useGetUserByUsernameQuery } from "../../../store/profile"

/**
 * Page data for user profile page
 */
export interface UserProfilePageData {
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
 * Page hook for user profile page
 *
 * Encapsulates data fetching for viewing a user's profile by username.
 * Returns standard page hook interface with user data, loading states, and error handling.
 *
 * @param username - Username of the user to fetch profile for
 * @returns Page hook result with user profile data
 *
 * Requirements: 5.1, 5.2, 5.3, 5.5
 */
export function usePageUserProfile(
  username: string,
): UsePageResult<UserProfilePageData> {
  const user = useGetUserByUsernameQuery(username, {
    skip: !username,
  })

  return {
    data: user.data
      ? {
          user: user.data,
        }
      : undefined,
    isLoading: user.isLoading,
    isFetching: user.isFetching,
    error: user.error,
    refetch: () => {
      user.refetch()
    },
  }
}
