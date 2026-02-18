import { useGetContractorsQuery } from "../../../store/contractor"
import type { ContractorSearchState } from "../../../hooks/contractor/ContractorSearch"

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
 * Parameters for contractors query.
 */
export interface ContractorsQueryParams extends ContractorSearchState {
  pageSize: number
  index: number
}

/**
 * Page hook for Contractors page.
 * Encapsulates all data fetching logic for the contractors list page.
 *
 * @param params - Query parameters including pagination and search filters
 * @returns Page data with loading states, errors, and refetch function
 *
 * Requirements: 5.1, 5.2, 5.3, 5.5
 */
export function usePageContractors(
  params: ContractorsQueryParams,
): UsePageResult<any> {
  const { language_codes, ...restParams } = params

  const contractors = useGetContractorsQuery({
    ...restParams,
    language_codes:
      language_codes && language_codes.length > 0
        ? language_codes.join(",")
        : undefined,
  })

  return {
    data: contractors.data,
    isLoading: contractors.isLoading,
    isFetching: contractors.isFetching,
    error: contractors.error,
    refetch: () => {
      contractors.refetch()
    },
  }
}
