import { useGetContractorBySpectrumIDQuery } from "../../../store/contractor"
import type { Contractor } from "../../../datatypes/Contractor"

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
 * Page data structure for org page.
 */
export interface OrgPageData {
  contractor: Contractor
}

/**
 * Page hook for ViewOrg page.
 * Encapsulates all data fetching logic for the organization detail page.
 * 
 * @param spectrumId - Organization spectrum ID
 * @returns Page data with loading states, errors, and refetch function
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.5
 */
export function usePageOrg(
  spectrumId: string,
): UsePageResult<OrgPageData> {
  const contractor = useGetContractorBySpectrumIDQuery(spectrumId)

  return {
    data: contractor.data
      ? {
          contractor: contractor.data,
        }
      : undefined,
    isLoading: contractor.isLoading,
    isFetching: contractor.isFetching,
    error: contractor.error,
    refetch: () => {
      contractor.refetch()
    },
  }
}
