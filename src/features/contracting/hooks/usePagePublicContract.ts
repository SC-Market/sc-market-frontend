import { useGetPublicContractQuery } from "../../../store/public_contracts"

export interface UsePagePublicContractResult {
  data:
    | {
        contract: ReturnType<typeof useGetPublicContractQuery>["data"]
      }
    | undefined
  isLoading: boolean
  isFetching: boolean
  error: unknown
  refetch: () => void
}

/**
 * Page hook for ViewPublicContract page
 * Composes public contract queries
 */
export function usePagePublicContract(
  contractId: string,
): UsePagePublicContractResult {
  const contractQuery = useGetPublicContractQuery(contractId)

  return {
    data: contractQuery.data
      ? {
          contract: contractQuery.data,
        }
      : undefined,
    isLoading: contractQuery.isLoading,
    isFetching: contractQuery.isFetching,
    error: contractQuery.error,
    refetch: () => {
      contractQuery.refetch()
    },
  }
}
