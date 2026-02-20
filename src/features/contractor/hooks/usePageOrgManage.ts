import { useCurrentOrg } from "../../../hooks/login/CurrentOrg"
import { useGetUserProfileQuery } from "../../../store/profile"

/**
 * Page hook interface for consistent data fetching patterns.
 */
export interface UsePageResult<T> {
  data: T | undefined
  isLoading: boolean
  isFetching: boolean
  error: unknown
  refetch: () => void
}

/**
 * Page data structure for org manage page.
 */
export interface OrgManagePageData {
  contractor: any
  profile: any
}

/**
 * Page hook for OrgManage page.
 * Encapsulates all data fetching logic for the organization management page.
 *
 * @returns Page data with loading states, errors, and refetch function
 *
 * Requirements: 5.1, 5.2, 5.3, 5.5
 */
export function usePageOrgManage(): UsePageResult<OrgManagePageData> {
  const [contractor] = useCurrentOrg()
  const profile = useGetUserProfileQuery()

  return {
    data:
      contractor && profile.data
        ? {
            contractor,
            profile: profile.data,
          }
        : undefined,
    isLoading: profile.isLoading,
    isFetching: profile.isFetching,
    error: profile.error,
    refetch: () => {
      profile.refetch()
    },
  }
}
